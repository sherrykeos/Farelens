"""add name and avatar_url to users

Revision ID: de925e22c64f
Revises: 61038ad99cda
Create Date: 2026-06-27 17:40:45.972940

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'de925e22c64f'
down_revision: Union[str, Sequence[str], None] = '61038ad99cda'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("users", sa.Column("name", sa.String(length=100), nullable=True))
    op.add_column("users", sa.Column("avatar_url", sa.String(length=500), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("users", "avatar_url")
    op.drop_column("users", "name")
