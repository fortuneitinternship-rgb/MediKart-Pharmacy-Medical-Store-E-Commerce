from sqlalchemy import (
    Column,
    Integer,
    ForeignKey,
    DateTime,
    UniqueConstraint,
)

from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.database.database import Base


class Comparison(Base):
    __tablename__ = "comparisons"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    product_id = Column(
        Integer,
        ForeignKey("products.id"),
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    product = relationship("Product")

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "product_id",
            name="uq_comparison_user_product"
        ),
    )