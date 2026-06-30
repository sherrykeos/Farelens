"""Compare every watchlist's target price against price_history and create
an Alert row wherever a real, current estimate is at or below target.

Intended to run on a schedule (GitHub Actions cron in production, per the
workflow plan) right after generate_price_history.py refreshes the prices.
Sends via Brevo when BREVO_API_KEY is configured (app/core/email.py);
otherwise the alert is still created as an in-app record (`sent_at=None`)
so the feature stays fully testable without Brevo set up.

One email per WATCHLIST per run, not one per matching date — a loose
target price can legitimately match dozens of the 49 calendar days, and
sending a separate email per date would mean dozens of emails for a
single watchlist in one run. All new matching dates for a watchlist are
batched into one digest email instead.

Run from backend/:
    venv\\Scripts\\python.exe -m app.jobs.check_price_alerts
"""
import logging
from datetime import datetime, timezone

from app.core.database import SessionLocal
from app.core.email import render_branded_email, send_email
from app.models.alert import Alert
from app.models.user import User
from app.models.watchlist import Watchlist
from app.services.analytics import _cheapest_per_date, _route_query

logger = logging.getLogger("app")


def check_alerts() -> int:
    db = SessionLocal()
    created = 0
    try:
        watchlists = db.query(Watchlist).all()
        for watchlist in watchlists:
            # price_history stores every (airline, stops) combination per
            # date, not just the cheapest — collapse to ONE row per date
            # (the same helper the Fare Calendar uses) before comparing
            # against the target. Querying PriceHistory directly here used
            # to return multiple rows for the same date, which both
            # double-counted matches and crashed on the (watchlist_id,
            # travel_date) unique constraint when more than one of that
            # date's rows happened to be at or below the target.
            rows = _route_query(
                db, watchlist.source_city, watchlist.destination_city, watchlist.flight_class
            ).all()
            cheapest_by_date = _cheapest_per_date(rows)
            matches = [row for row in cheapest_by_date.values() if row.price <= watchlist.target_price]

            new_alerts = []
            for match in matches:
                exists = (
                    db.query(Alert)
                    .filter(Alert.watchlist_id == watchlist.id, Alert.travel_date == match.travel_date)
                    .first()
                )
                if exists:
                    continue  # already alerted for this watchlist+date

                alert = Alert(
                    watchlist_id=watchlist.id,
                    user_id=watchlist.user_id,
                    travel_date=match.travel_date,
                    price_at_trigger=match.price,
                    target_price=watchlist.target_price,
                )
                db.add(alert)
                new_alerts.append((alert, match))
                created += 1

            if not new_alerts:
                continue

            user = db.query(User).filter(User.id == watchlist.user_id).first()
            if user is not None:
                sent = _send_digest_email(user.email, watchlist, new_alerts)
                if sent:
                    now = datetime.now(timezone.utc)
                    for alert, _match in new_alerts:
                        alert.channel = "email"
                        alert.sent_at = now

            logger.info(
                "Price alert digest: watchlist %s (%s->%s), %d new matching date(s), target %.2f",
                watchlist.id, watchlist.source_city, watchlist.destination_city,
                len(new_alerts), watchlist.target_price,
            )
        db.commit()
        return created
    finally:
        db.close()


def _send_digest_email(email: str, watchlist: Watchlist, new_alerts: list) -> bool:
    sorted_alerts = sorted(new_alerts, key=lambda pair: pair[1].travel_date)
    rows = "".join(
        f"<div style='margin:4px 0;'>{match.travel_date} — "
        f"<strong>₹{match.price:,.0f}</strong> ({match.airline})</div>"
        for _alert, match in sorted_alerts
    )
    return send_email(
        email,
        f"AirlineML Price Alert: {watchlist.source_city} → {watchlist.destination_city} dropped below target",
        render_branded_email(
            heading=f"{watchlist.source_city} → {watchlist.destination_city} dropped below your target",
            body_lines=[
                f"Your target for {watchlist.flight_class} was "
                f"₹{watchlist.target_price:,.0f}. We found {len(sorted_alerts)} "
                f"matching date{'s' if len(sorted_alerts) != 1 else ''}:",
                rows,
            ],
            footnote="You're receiving this because you added this route to your AirlineML watchlist.",
        ),
    )


if __name__ == "__main__":
    count = check_alerts()
    print(f"Created {count} new alert(s).")
