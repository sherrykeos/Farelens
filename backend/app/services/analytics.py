import statistics
from datetime import date

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.price_history import PriceHistory
from app.models.saved_search import SavedSearch
from app.models.watchlist import Watchlist
from app.schemas.analytics import (
    AirlineComparisonRow,
    AnomalyPoint,
    CalendarDay,
    CheapestDateResponse,
    MarketAnalytics,
    PopularRoute,
)
from app.services.prediction import get_prediction_service

# Modified Z-score (Iglewicz & Hoaglin), based on median + MAD rather than
# mean + std. A plain mean/std Z-score suffers from the "masking effect" on
# small samples: a single huge spike inflates the std it's measured against,
# which can push its own score back under the threshold. Median/MAD is
# robust to that because the outlier barely moves the median.
ANOMALY_ZSCORE_THRESHOLD = 3.5
ANOMALY_HIGH_SEVERITY_ZSCORE = 7.0
MODIFIED_ZSCORE_CONSTANT = 0.6745
# Rolling window, not the whole series: fares naturally trend down as a
# travel date gets further out, and comparing every point to the GLOBAL
# median flags that entire trend as "anomalous". A local window compares
# each day only to its nearby neighbors, so a real trend stays invisible
# and only sharp local spikes (like a real fare shock) stand out.
ROLLING_WINDOW_SIZE = 7


def _route_query(
    db: Session, source_city: str, destination_city: str, flight_class: str,
    airline: str | None = None, stops: str | None = None,
):
    """Unordered base query — callers apply their own .order_by(), since
    SQLAlchemy appends rather than replaces order_by clauses (a prior bug
    here had get_cheapest_date silently sorting by date before price).

    price_history stores every (airline, stops) combination, not just the
    cheapest — when airline/stops aren't given, _cheapest_per_date()
    collapses the unfiltered rows down to one "best available" row per
    date, the same way Google Flights' calendar shows the best fare across
    every carrier unless you've filtered to one.
    """
    query = db.query(PriceHistory).filter(
        PriceHistory.source_city == source_city,
        PriceHistory.destination_city == destination_city,
        PriceHistory.flight_class == flight_class,
    )
    if airline:
        query = query.filter(PriceHistory.airline == airline)
    if stops:
        query = query.filter(PriceHistory.stops == stops)
    return query


def _cheapest_per_date(rows: list[PriceHistory]) -> dict[date, PriceHistory]:
    best: dict[date, PriceHistory] = {}
    for row in rows:
        current = best.get(row.travel_date)
        if current is None or row.price < current.price:
            best[row.travel_date] = row
    return best


def _cheapest_per_airline(rows: list[PriceHistory]) -> dict[str, PriceHistory]:
    best: dict[str, PriceHistory] = {}
    for row in rows:
        current = best.get(row.airline)
        if current is None or row.price < current.price:
            best[row.airline] = row
    return best


def _confidence_margin() -> float:
    """Same MAE-based margin /predict uses, so a calendar day's range means
    the same thing as a fresh prediction's range."""
    return get_prediction_service().mae


def detect_anomalies(
    db: Session, source_city: str, destination_city: str, flight_class: str,
    airline: str | None = None, stops: str | None = None,
) -> list[AnomalyPoint]:
    rows = _route_query(db, source_city, destination_city, flight_class, airline, stops).all()
    best = _cheapest_per_date(rows)
    if len(best) < 5:
        return []  # not enough data to compute a meaningful baseline

    ordered = sorted(best.items())  # [(date, row), ...]
    prices = [row.price for _, row in ordered]
    n = len(prices)
    half_window = ROLLING_WINDOW_SIZE // 2

    anomalies = []
    for i, (travel_date, row) in enumerate(ordered):
        lo, hi = max(0, i - half_window), min(n, i + half_window + 1)
        window = prices[lo:hi]
        local_median = statistics.median(window)
        local_mad = statistics.median([abs(p - local_median) for p in window]) or 1.0

        modified_zscore = MODIFIED_ZSCORE_CONSTANT * (row.price - local_median) / local_mad
        if abs(modified_zscore) >= ANOMALY_ZSCORE_THRESHOLD:
            anomalies.append(AnomalyPoint(
                travel_date=travel_date,
                price=row.price,
                expected_price=round(local_median, 2),
                deviation_score=round(modified_zscore, 2),
                severity="high" if abs(modified_zscore) >= ANOMALY_HIGH_SEVERITY_ZSCORE else "moderate",
                airline=row.airline,
                stops=row.stops,
            ))
    return anomalies


def get_fare_calendar(
    db: Session, source_city: str, destination_city: str, flight_class: str,
    airline: str | None = None, stops: str | None = None,
) -> list[CalendarDay]:
    rows = _route_query(db, source_city, destination_city, flight_class, airline, stops).all()
    best = _cheapest_per_date(rows)
    anomaly_dates = {
        a.travel_date for a in detect_anomalies(db, source_city, destination_city, flight_class, airline, stops)
    }
    margin = _confidence_margin()
    return [
        CalendarDay(
            travel_date=travel_date,
            price=row.price,
            confidence_low=round(max(row.price - margin, 0), 2),
            confidence_high=round(row.price + margin, 2),
            is_anomaly=travel_date in anomaly_dates,
            airline=row.airline,
            stops=row.stops,
            duration=row.duration,
        )
        for travel_date, row in sorted(best.items())
    ]


def get_cheapest_date(
    db: Session, source_city: str, destination_city: str, flight_class: str,
    date_from: date | None = None, date_to: date | None = None,
    airline: str | None = None, stops: str | None = None,
) -> CheapestDateResponse | None:
    query = _route_query(db, source_city, destination_city, flight_class, airline, stops)
    if date_from:
        query = query.filter(PriceHistory.travel_date >= date_from)
    if date_to:
        query = query.filter(PriceHistory.travel_date <= date_to)
    best = _cheapest_per_date(query.all())
    if not best:
        return None
    best_date = min(best, key=lambda d: best[d].price)
    row = best[best_date]
    margin = _confidence_margin()
    return CheapestDateResponse(
        travel_date=row.travel_date,
        price=row.price,
        confidence_low=round(max(row.price - margin, 0), 2),
        confidence_high=round(row.price + margin, 2),
        airline=row.airline,
        stops=row.stops,
        duration=row.duration,
    )


def get_airline_comparison(
    db: Session, source_city: str, destination_city: str, flight_class: str,
    travel_date: date, stops: str | None = None,
) -> list[AirlineComparisonRow]:
    """One row per airline for a single exact date — lets a user compare
    every carrier's predicted fare side by side, instead of only ever
    seeing whichever one happens to be cheapest (which the calendar and
    cheapest-date views collapse to). airline is intentionally NOT passed
    to _route_query here; that's the whole point of this endpoint."""
    rows = _route_query(db, source_city, destination_city, flight_class, airline=None, stops=stops).filter(
        PriceHistory.travel_date == travel_date
    ).all()
    cheapest_by_airline = _cheapest_per_airline(rows)
    margin = _confidence_margin()
    return sorted(
        (
            AirlineComparisonRow(
                airline=row.airline,
                price=row.price,
                confidence_low=round(max(row.price - margin, 0), 2),
                confidence_high=round(row.price + margin, 2),
                stops=row.stops,
                duration=row.duration,
            )
            for row in cheapest_by_airline.values()
        ),
        key=lambda r: r.price,
    )


def get_popular_routes(db: Session, limit: int = 10) -> list[PopularRoute]:
    """Real popularity signal: how many users have saved or watchlisted each
    route — actual user behavior, not a synthetic number."""
    watchlist_counts = (
        db.query(
            Watchlist.source_city, Watchlist.destination_city, func.count().label("cnt")
        )
        .group_by(Watchlist.source_city, Watchlist.destination_city)
        .all()
    )
    search_counts = (
        db.query(
            SavedSearch.source_city, SavedSearch.destination_city, func.count().label("cnt")
        )
        .group_by(SavedSearch.source_city, SavedSearch.destination_city)
        .all()
    )

    combined: dict[tuple[str, str], int] = {}
    for source_city, destination_city, cnt in [*watchlist_counts, *search_counts]:
        key = (source_city, destination_city)
        combined[key] = combined.get(key, 0) + cnt

    ranked = sorted(combined.items(), key=lambda kv: kv[1], reverse=True)[:limit]
    return [
        PopularRoute(source_city=src, destination_city=dst, interest_count=cnt)
        for (src, dst), cnt in ranked
    ]


def get_market_analytics(db: Session) -> MarketAnalytics:
    """Aggregates are computed over the CHEAPEST fare per (route, class,
    date) — i.e. the same "best available" series the fare calendar shows
    — not the raw table, which also contains expensive multi-stop options
    that would otherwise inflate the averages.

    Pushed into SQL (GROUP BY + MIN/AVG) instead of fetching all ~65k rows
    over the network and aggregating in Python — the previous version held
    a DB connection open for several seconds per call transferring the full
    table, which under concurrent requests exhausted the connection pool
    and made every other endpoint (calendar, login, etc.) queue up behind
    it. This does the same computation server-side in one query.
    """
    cheapest_per_group = (
        db.query(
            PriceHistory.source_city,
            PriceHistory.destination_city,
            PriceHistory.flight_class,
            PriceHistory.travel_date,
            func.min(PriceHistory.price).label("price"),
        )
        .group_by(
            PriceHistory.source_city, PriceHistory.destination_city,
            PriceHistory.flight_class, PriceHistory.travel_date,
        )
        .subquery()
    )

    total_rows = db.query(func.count()).select_from(PriceHistory).scalar()

    avg_by_class = {
        flight_class: round(avg_price, 2)
        for flight_class, avg_price in (
            db.query(cheapest_per_group.c.flight_class, func.avg(cheapest_per_group.c.price))
            .group_by(cheapest_per_group.c.flight_class)
            .all()
        )
    }

    route_avgs = (
        db.query(
            cheapest_per_group.c.source_city,
            cheapest_per_group.c.destination_city,
            func.avg(cheapest_per_group.c.price).label("avg_price"),
        )
        .group_by(cheapest_per_group.c.source_city, cheapest_per_group.c.destination_city)
        .order_by("avg_price")
        .all()
    )
    cheapest = [
        {"source_city": src, "destination_city": dst, "avg_price": round(avg, 2)}
        for src, dst, avg in route_avgs[:5]
    ]
    most_expensive = [
        {"source_city": src, "destination_city": dst, "avg_price": round(avg, 2)}
        for src, dst, avg in route_avgs[-5:][::-1]
    ]

    return MarketAnalytics(
        popular_routes=get_popular_routes(db, limit=5),
        avg_price_by_class=avg_by_class,
        cheapest_routes=cheapest,
        most_expensive_routes=most_expensive,
        data_points=total_rows,
    )
