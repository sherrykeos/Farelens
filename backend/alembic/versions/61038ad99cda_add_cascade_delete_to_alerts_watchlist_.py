"""add cascade delete to alerts watchlist fk

Revision ID: 61038ad99cda
Revises: a84dc779131e
Create Date: 2026-06-27 12:06:21.046670

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '61038ad99cda'
down_revision: Union[str, Sequence[str], None] = 'a84dc779131e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Deleting a watchlist with existing alert history previously failed
    # with a ForeignKeyViolation (Postgres default is RESTRICT) — alerts
    # are meaningless without the watchlist they belonged to, so cascade.
    op.drop_constraint("alerts_watchlist_id_fkey", "alerts", type_="foreignkey")
    op.create_foreign_key(
        "alerts_watchlist_id_fkey", "alerts", "watchlists",
        ["watchlist_id"], ["id"], ondelete="CASCADE",
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint("alerts_watchlist_id_fkey", "alerts", type_="foreignkey")
    op.create_foreign_key(
        "alerts_watchlist_id_fkey", "alerts", "watchlists",
        ["watchlist_id"], ["id"],
    )
