from datetime import date, timedelta

from app.core.database import SessionLocal
from app.jobs.check_price_alerts import check_alerts
from app.models.price_history import PriceHistory
from app.models.user import User
from app.models.watchlist import Watchlist


def _create_watchlist_directly(email: str, **kwargs) -> int:
    """Inserts a Watchlist straight into the DB, bypassing POST
    /watchlists. The API now triggers check_alerts() as a background
    task on creation (so users don't wait for the next periodic
    scheduler run) — tests that want to exercise check_alerts() in
    isolation need to create the watchlist without also triggering
    that background task, otherwise it consumes the alert before the
    test's own explicit check_alerts() call runs."""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        watchlist = Watchlist(user_id=user.id, **kwargs)
        db.add(watchlist)
        db.commit()
        db.refresh(watchlist)
        return watchlist.id
    finally:
        db.close()


def test_alerts_list_requires_auth(client):
    response = client.get("/api/v1/alerts")
    assert response.status_code == 401


def test_alerts_empty_when_no_watchlists(client, auth_headers):
    headers = auth_headers(email="alerts-empty@example.com")
    response = client.get("/api/v1/alerts", headers=headers)
    assert response.status_code == 200
    assert response.json() == []


def test_check_alerts_creates_alert_when_price_below_target(client, auth_headers, seed_price_history):
    headers = auth_headers(email="alerts-trigger@example.com")
    seed_price_history(prices=[5000, 5100, 4900, 5050, 4950, 5200, 15000])
    _create_watchlist_directly(
        "alerts-trigger@example.com",
        source_city="Delhi", destination_city="Mumbai", flight_class="Economy", target_price=5000,
    )

    created = check_alerts()
    assert created >= 1

    response = client.get("/api/v1/alerts", headers=headers)
    assert response.status_code == 200
    alerts = response.json()
    assert len(alerts) >= 1
    assert all(a["price_at_trigger"] <= 5000 for a in alerts)
    assert alerts[0]["source_city"] == "Delhi"
    assert alerts[0]["destination_city"] == "Mumbai"
    assert alerts[0]["flight_class"] == "Economy"


def test_check_alerts_collapses_multiple_rows_per_date_to_one_alert(client, auth_headers):
    """Regression test: price_history stores one row per (date, stops,
    airline) combination. Before this fix, check_price_alerts queried
    PriceHistory directly without collapsing to the cheapest row per
    date, so two rows on the same date (different airline/stops, both
    under target) created two Alert inserts for the same
    (watchlist_id, travel_date) in one run and crashed on the unique
    constraint. Exactly one alert must be created per date, regardless
    of how many (airline, stops) combinations matched."""
    headers = auth_headers(email="alerts-multirow@example.com")
    travel_date = date.today() + timedelta(days=10)

    # A route no other test in this file watches — check_alerts() runs over
    # ALL watchlists in the (session-scoped) test DB, so reusing a route
    # another test's leftover watchlist already targets would inflate the
    # alert count here for reasons unrelated to what this test checks.
    db = SessionLocal()
    try:
        db.add(PriceHistory(
            source_city="Hyderabad", destination_city="Bangalore", flight_class="Economy",
            travel_date=travel_date, price=4000, airline="Vistara", stops="zero",
        ))
        db.add(PriceHistory(
            source_city="Hyderabad", destination_city="Bangalore", flight_class="Economy",
            travel_date=travel_date, price=4500, airline="SpiceJet", stops="one",
        ))
        db.commit()
    finally:
        db.close()

    _create_watchlist_directly(
        "alerts-multirow@example.com",
        source_city="Hyderabad", destination_city="Bangalore", flight_class="Economy", target_price=5000,
    )

    created = check_alerts()  # must not raise IntegrityError
    assert created == 1

    response = client.get("/api/v1/alerts", headers=headers)
    alerts = response.json()
    assert len(alerts) == 1
    assert alerts[0]["price_at_trigger"] == 4000  # the cheaper of the two rows


def test_check_alerts_is_idempotent(auth_headers, seed_price_history):
    auth_headers(email="alerts-idempotent@example.com")
    seed_price_history(
        source_city="Chennai", destination_city="Hyderabad",
        prices=[5000, 5100, 4900, 5050, 4950, 5200, 15000],
    )
    _create_watchlist_directly(
        "alerts-idempotent@example.com",
        source_city="Chennai", destination_city="Hyderabad", flight_class="Economy", target_price=5000,
    )

    first_run = check_alerts()
    second_run = check_alerts()
    assert first_run >= 1
    assert second_run == 0


def test_create_watchlist_triggers_immediate_alert_check(client, auth_headers, seed_price_history):
    """The actual API path: POST /watchlists should trigger a check_alerts()
    background task so a watchlist that already matches an existing price
    gets alerted right away, instead of waiting for the next periodic
    scheduler run (up to ALERT_CHECK_INTERVAL_HOURS away)."""
    headers = auth_headers(email="alerts-immediate@example.com")
    seed_price_history(
        source_city="Mumbai", destination_city="Kolkata",
        prices=[3000, 3100, 2900, 3050, 2950, 3200, 9000],
    )

    client.post(
        "/api/v1/watchlists",
        json={"source_city": "Mumbai", "destination_city": "Kolkata", "flight_class": "Economy", "target_price": 5000},
        headers=headers,
    )

    response = client.get("/api/v1/alerts", headers=headers)
    alerts = response.json()
    assert len(alerts) >= 1
