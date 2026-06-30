"""Populate price_history with model-grounded fare estimates.

This is the honest stand-in for a live Amadeus price feed (see
V2_BLUEPRINT.md): instead of random numbers, it runs the REAL trained
XGBoost model across every route, class, date, stop-count, and airline,
and stores EVERY combination's predicted fare (not just the cheapest) —
that's what lets the API filter by airline/stops later and still answer
"what's the cheapest overall" by taking MIN(price) per date over whatever
subset matches the filters. Swapping this for a true live feed later
means writing a different populator that fills the same table — every
downstream feature (fare calendar, market analytics, anomaly detection)
is unaffected by where the rows came from.

Run from backend/:
    venv\\Scripts\\python.exe -m app.jobs.generate_price_history
"""
from datetime import date, datetime, timedelta, timezone

import pandas as pd

from app.core.database import SessionLocal
from app.ml.features import FEATURE_COLUMNS
from app.models.price_history import PriceHistory
from app.schemas.predict import Airline, City, FlightClass, Stops
from app.services.prediction import get_prediction_service

# Capped at 49, not a round number like 60 — the XGBoost model was only
# ever trained on days_left 1-49 (see app/schemas/predict.py's
# Field(le=49)); past that it can't extrapolate and just repeats the
# boundary leaf value. Generating data beyond day 49 would mean storing
# (and potentially alerting/aggregating on) numbers that look real but
# are actually a flatlined non-prediction.
DAYS_AHEAD = 49
ASSUMED_DEPARTURE_TIME = "Morning"
ASSUMED_ARRIVAL_TIME = "Afternoon"

CITIES = [c.value for c in City]
AIRLINES = [a.value for a in Airline]
CLASSES = [c.value for c in FlightClass]
STOPS = [s.value for s in Stops]

# A handful of deliberately injected price spikes so the anomaly-detection
# algorithm (Z-score over this table) has something real to find in a demo.
# Clearly labeled via `source="synthetic_shock"` — never presented as a real
# market event. Applied across all stops/airlines for that date so the
# spike is visible regardless of which filter is active.
SYNTHETIC_SHOCKS = [
    {"source_city": "Delhi", "destination_city": "Mumbai", "flight_class": "Economy", "days_from_today": 10, "multiplier": 2.2},
    {"source_city": "Bangalore", "destination_city": "Delhi", "flight_class": "Economy", "days_from_today": 25, "multiplier": 1.9},
    {"source_city": "Mumbai", "destination_city": "Kolkata", "flight_class": "Business", "days_from_today": 40, "multiplier": 1.7},
]


def _route_duration_hours(source_city: str, destination_city: str, stops: str) -> float:
    """Deterministic, plausible-looking duration per route+stops (no real
    per-route distance data available offline — documented simplification).
    More stops -> longer duration, matching real-world intuition."""
    seed = abs(hash((source_city, destination_city))) % 7
    base = 1.5 + seed * 0.5
    stop_penalty = {"zero": 0, "one": 1.5, "two_or_more": 3.0}[stops]
    return base + stop_penalty


def _build_candidate_rows() -> tuple[pd.DataFrame, list[dict]]:
    today = date.today()
    rows = []
    keys = []
    for source_city in CITIES:
        for destination_city in CITIES:
            if source_city == destination_city:
                continue
            for flight_class in CLASSES:
                for day_offset in range(1, DAYS_AHEAD + 1):
                    travel_date = today + timedelta(days=day_offset)
                    for stops in STOPS:
                        duration = _route_duration_hours(source_city, destination_city, stops)
                        for airline in AIRLINES:
                            rows.append({
                                "airline": airline,
                                "source_city": source_city,
                                "departure_time": ASSUMED_DEPARTURE_TIME,
                                "stops": stops,
                                "arrival_time": ASSUMED_ARRIVAL_TIME,
                                "destination_city": destination_city,
                                "class": flight_class,
                                "duration": duration,
                                "days_left": day_offset,
                            })
                            keys.append({
                                "source_city": source_city,
                                "destination_city": destination_city,
                                "flight_class": flight_class,
                                "travel_date": travel_date,
                                "stops": stops,
                                "airline": airline,
                                "duration": duration,
                            })
    return pd.DataFrame(rows)[FEATURE_COLUMNS], keys


def generate() -> int:
    service = get_prediction_service()
    df, keys = _build_candidate_rows()
    print(f"Scoring {len(df):,} (route, class, date, stops, airline) combinations...")

    encoded = service.pipeline.transform(df)
    predicted_prices = service.model.predict(encoded)

    results_df = pd.DataFrame(keys)
    results_df["price"] = predicted_prices
    print(f"Generated {len(results_df):,} price_history rows (full grid, not collapsed).")

    today = date.today()
    for shock in SYNTHETIC_SHOCKS:
        target_date = today + timedelta(days=shock["days_from_today"])
        mask = (
            (results_df["source_city"] == shock["source_city"])
            & (results_df["destination_city"] == shock["destination_city"])
            & (results_df["flight_class"] == shock["flight_class"])
            & (results_df["travel_date"] == target_date)
        )
        results_df.loc[mask, "price"] *= shock["multiplier"]

    db = SessionLocal()
    try:
        db.query(PriceHistory).delete()
        now = datetime.now(timezone.utc)
        shock_keys = {
            (s["source_city"], s["destination_city"], s["flight_class"], today + timedelta(days=s["days_from_today"]))
            for s in SYNTHETIC_SHOCKS
        }
        records = []
        for row in results_df.itertuples(index=False):
            key = (row.source_city, row.destination_city, row.flight_class, row.travel_date)
            records.append(PriceHistory(
                source_city=row.source_city,
                destination_city=row.destination_city,
                flight_class=row.flight_class,
                travel_date=row.travel_date,
                stops=row.stops,
                airline=row.airline,
                duration=round(float(row.duration), 2),
                price=round(float(row.price), 2),
                source="synthetic_shock" if key in shock_keys else "model_estimate",
                collected_at=now,
            ))
        db.bulk_save_objects(records)
        db.commit()
        print(f"Inserted {len(records):,} price_history rows ({len(SYNTHETIC_SHOCKS)} synthetic shocks).")
        return len(records)
    finally:
        db.close()


if __name__ == "__main__":
    generate()
