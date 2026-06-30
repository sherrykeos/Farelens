from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.analytics import MarketAnalytics, PopularRoute
from app.services import analytics

router = APIRouter(tags=["analytics"])


@router.get("/routes/popular", response_model=list[PopularRoute])
def popular_routes(limit: int = 10, db: Session = Depends(get_db)) -> list[PopularRoute]:
    return analytics.get_popular_routes(db, limit=limit)


@router.get("/analytics/market", response_model=MarketAnalytics)
def market_analytics(db: Session = Depends(get_db)) -> MarketAnalytics:
    return analytics.get_market_analytics(db)
