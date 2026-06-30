from datetime import date, datetime

from pydantic import BaseModel


class AlertResponse(BaseModel):
    id: int
    watchlist_id: int
    source_city: str
    destination_city: str
    flight_class: str
    travel_date: date
    price_at_trigger: float
    target_price: float
    channel: str
    created_at: datetime

    model_config = {"from_attributes": True}
