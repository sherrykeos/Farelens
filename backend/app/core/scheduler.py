"""Runs generate_price_history and check_price_alerts on recurring
intervals inside the FastAPI process itself (APScheduler's
BackgroundScheduler), so both stay fresh without a separate cron host.

generate_price_history wipes and rebuilds the whole table anchored to
"today" at the moment it runs (see app/jobs/generate_price_history.py) —
real calendar days passing without a re-run is exactly what caused the
fare calendar's date range to drift out of sync with the date picker's
"today+1..today+60" assumption. Running it daily (plus once on startup)
keeps the data window from going stale again.

Trade-off, stated plainly: this only runs while the backend process is
alive. A host that sleeps the process on inactivity (e.g. a free-tier
deploy target) won't run missed checks during sleep. A GitHub Actions
cron (or any external scheduler) would run independently of the app
process, but needs the repo pushed to GitHub with DB/Brevo secrets
configured. This is the simpler option for local/dev use right now.
"""
import logging
from datetime import datetime, timedelta, timezone

from apscheduler.schedulers.background import BackgroundScheduler

from app.core.config import settings
from app.jobs.check_price_alerts import check_alerts
from app.jobs.generate_price_history import generate as generate_price_history

logger = logging.getLogger("app")

_scheduler: BackgroundScheduler | None = None


def _run_generate_price_history_job() -> None:
    try:
        count = generate_price_history()
        logger.info("Scheduled price_history refresh: %d row(s) regenerated.", count)
    except Exception:
        logger.exception("Scheduled price_history refresh failed")


def _run_check_alerts_job() -> None:
    try:
        created = check_alerts()
        logger.info("Scheduled price-alert check: %d new alert(s) created.", created)
    except Exception:
        logger.exception("Scheduled price-alert check failed")


def start_scheduler() -> None:
    global _scheduler
    if settings.alert_check_interval_hours <= 0:
        logger.info("Alert scheduler disabled (alert_check_interval_hours <= 0).")
        return

    now = datetime.now(timezone.utc)
    _scheduler = BackgroundScheduler(timezone="UTC")
    _scheduler.add_job(
        _run_generate_price_history_job,
        "interval",
        hours=24,
        id="generate_price_history",
        next_run_time=now,  # also run once immediately on startup
    )
    _scheduler.add_job(
        _run_check_alerts_job,
        "interval",
        hours=settings.alert_check_interval_hours,
        id="check_price_alerts",
        # Offset past generate_price_history's ~30s runtime so the first
        # alert check on startup runs against freshly regenerated data,
        # not yesterday's table contents.
        next_run_time=now + timedelta(seconds=45),
    )
    _scheduler.start()
    logger.info(
        "Schedulers started: price_history refresh every 24h, alert check every %s hour(s).",
        settings.alert_check_interval_hours,
    )


def shutdown_scheduler() -> None:
    if _scheduler is not None:
        _scheduler.shutdown(wait=False)
