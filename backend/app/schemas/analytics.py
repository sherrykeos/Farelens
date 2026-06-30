from datetime import date

from pydantic import BaseModel


class CalendarDay(BaseModel):
    travel_date: date
    price: float
    confidence_low: float
    confidence_high: float
    is_anomaly: bool
    airline: str
    stops: str
    duration: float


class CheapestDateResponse(BaseModel):
    travel_date: date
    price: float
    confidence_low: float
    confidence_high: float
    airline: str
    stops: str
    duration: float


class AirlineComparisonRow(BaseModel):
    airline: str
    price: float
    confidence_low: float
    confidence_high: float
    stops: str
    duration: float


class PopularRoute(BaseModel):
    source_city: str
    destination_city: str
    interest_count: int  # real count of watchlists + saved_searches for this route


class MarketAnalytics(BaseModel):
    popular_routes: list[PopularRoute]
    avg_price_by_class: dict[str, float]
    cheapest_routes: list[dict]
    most_expensive_routes: list[dict]
    data_points: int


class AnomalyPoint(BaseModel):
    travel_date: date
    price: float
    expected_price: float
    deviation_score: float
    severity: str  # "moderate" | "high"
    airline: str
    stops: str
