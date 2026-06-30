from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.alert import Alert
from app.models.user import User
from app.schemas.alert import AlertResponse

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("", response_model=list[AlertResponse])
def list_alerts(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> list[AlertResponse]:
    alerts = (
        db.query(Alert)
        .filter(Alert.user_id == current_user.id)
        .order_by(Alert.created_at.desc())
        .all()
    )
    # Alert doesn't store the route itself (only watchlist_id) — join through
    # the relationship here so the frontend gets a render-ready shape in one
    # call instead of having to fetch watchlists separately and join client-side.
    return [
        AlertResponse(
            id=alert.id,
            watchlist_id=alert.watchlist_id,
            source_city=alert.watchlist.source_city,
            destination_city=alert.watchlist.destination_city,
            flight_class=alert.watchlist.flight_class,
            travel_date=alert.travel_date,
            price_at_trigger=alert.price_at_trigger,
            target_price=alert.target_price,
            channel=alert.channel,
            created_at=alert.created_at,
        )
        for alert in alerts
    ]
