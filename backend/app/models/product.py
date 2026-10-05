from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)

from sqlalchemy.orm import relationship

from app.database.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(255),
        nullable=False,
        index=True
    )

    description = Column(
        Text,
        nullable=True
    )

    price = Column(
        Float,
        nullable=False
    )

    discount_price = Column(
        Float,
        nullable=True
    )

    category_id = Column(
        Integer,
        ForeignKey("categories.id"),
        nullable=True
    )

    stock = Column(
        Integer,
        default=0,
        nullable=False
    )

    image = Column(
        String(500),
        nullable=True
    )

    rating = Column(
        Float,
        default=0
    )

    is_active = Column(
        Boolean,
        default=True,
        nullable=False
    )

    is_featured = Column(
        Boolean,
        default=False,
        nullable=False
    )

    is_trending = Column(
        Boolean,
        default=False,
        nullable=False
    )

    is_flash_sale = Column(
        Boolean,
        default=False,
        nullable=False
    )

    flash_sale_start = Column(
        DateTime,
        nullable=True
    )

    flash_sale_end = Column(
        DateTime,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    category = relationship(
        "Category",
        back_populates="products"
    )