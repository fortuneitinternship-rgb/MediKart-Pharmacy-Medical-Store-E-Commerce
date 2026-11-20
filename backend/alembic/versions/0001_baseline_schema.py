"""baseline schema

Revision ID: 0001_baseline
Revises:
Create Date: 2026-11-20

Creates every MediKart table from the SQLAlchemy models.
It is safe to run on an empty database AND on a database that the
FastAPI app already created (existing tables are skipped, nothing is dropped).
"""
from typing import Sequence, Union

from alembic import op

# Importing this module registers every model on Base.metadata.
import app.database.base  # noqa: F401
from app.database.database import Base

revision: str = "0001_baseline"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    Base.metadata.create_all(bind=op.get_bind(), checkfirst=True)


def downgrade() -> None:
    # Intentionally a no-op: never drop customer/order data automatically.
    pass
