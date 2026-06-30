from datetime import date, datetime, timezone

from sqlalchemy import Date, DateTime, Float, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Alert(Base):
    """A triggered price-drop alert for a watchlist.

    `channel`/`sent_at` exist now so adding real email delivery later
    (Brevo, per the workflow plan) is just filling in `sent_at` after a
    successful send — no schema change needed when that's wired in.
    """

    __tablename__ = "alerts"
    __table_args__ = (
        UniqueConstraint("watchlist_id", "travel_date", name="uq_alert_watchlist_date"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    watchlist_id: Mapped[int] = mapped_column(ForeignKey("watchlists.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    travel_date: Mapped[date] = mapped_column(Date, nullable=False)
    price_at_trigger: Mapped[float] = mapped_column(Float, nullable=False)
    target_price: Mapped[float] = mapped_column(Float, nullable=False)
    channel: Mapped[str] = mapped_column(String(20), default="in_app", nullable=False)
    sent_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )

    watchlist = relationship("Watchlist")
    user = relationship("User")
