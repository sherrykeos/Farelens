from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.analytics import AirlineComparisonRow, AnomalyPoint, CalendarDay, CheapestDateResponse
from app.schemas.predict import Airline, City, FlightClass, Stops
from app.services import analytics

router = APIRouter(prefix="/prices", tags=["prices"])


@router.get("/calendar", response_model=list[CalendarDay])
def fare_calendar(
    source_city: City,
    destination_city: City,
    flight_class: FlightClass = FlightClass.Economy,
    airline: Airline | None = None,
    stops: Stops | None = None,
    db: Session = Depends(get_db),
) -> list[CalendarDay]:
    if source_city == destination_city:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "source_city and destination_city must differ")
    return analytics.get_fare_calendar(
        db, source_city.value, destination_city.value, flight_class.value,
        airline.value if airline else None, stops.value if stops else None,
    )


@router.get("/cheapest-date", response_model=CheapestDateResponse)
def cheapest_date(
    source_city: City,
    destination_city: City,
    flight_class: FlightClass = FlightClass.Economy,
    date_from: date | None = None,
    date_to: date | None = None,
    airline: Airline | None = None,
    stops: Stops | None = None,
    db: Session = Depends(get_db),
) -> CheapestDateResponse:
    if source_city == destination_city:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "source_city and destination_city must differ")
    result = analytics.get_cheapest_date(
        db, source_city.value, destination_city.value, flight_class.value, date_from, date_to,
        airline.value if airline else None, stops.value if stops else None,
    )
    if result is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No price data for this route yet")
    return result


@router.get("/airline-comparison", response_model=list[AirlineComparisonRow])
def airline_comparison(
    source_city: City,
    destination_city: City,
    travel_date: date,
    flight_class: FlightClass = FlightClass.Economy,
    stops: Stops | None = None,
    db: Session = Depends(get_db),
) -> list[AirlineComparisonRow]:
    if source_city == destination_city:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "source_city and destination_city must differ")
    return analytics.get_airline_comparison(
        db, source_city.value, destination_city.value, flight_class.value,
        travel_date, stops.value if stops else None,
    )


@router.get("/anomalies", response_model=list[AnomalyPoint])
def anomalies(
    source_city: City,
    destination_city: City,
    flight_class: FlightClass = FlightClass.Economy,
    airline: Airline | None = None,
    stops: Stops | None = None,
    db: Session = Depends(get_db),
) -> list[AnomalyPoint]:
    if source_city == destination_city:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "source_city and destination_city must differ")
    return analytics.detect_anomalies(
        db, source_city.value, destination_city.value, flight_class.value,
        airline.value if airline else None, stops.value if stops else None,
    )
