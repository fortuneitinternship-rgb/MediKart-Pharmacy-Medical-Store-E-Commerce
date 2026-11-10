
from sqlalchemy import (
    Boolean,
    Column,
    Integer,
    String,
    Float,
    Text,
    DateTime,
    ForeignKey,
    text,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.database import Base


class Order(Base):
    __tablename__ = "orders"

    # Primary key
    id = Column(Integer, primary_key=True, index=True)

    # Unique order number
    order_id = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )

    # User relationship - guest orders are allowed
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Customer details
    customer_name = Column(String(100), nullable=False)
    phone = Column(String(15), nullable=False)
    address = Column(Text, nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    pincode = Column(String(10), nullable=False)

    # Payment details
    payment_method = Column(
        String(30),
        nullable=False,
    )

    payment_status = Column(
        String(50),
        nullable=False,
        default="Pending",
        server_default="Pending",
    )

    # Delivery details
    delivery_type = Column(
        String(30),
        nullable=False,
    )

    delivery_distance = Column(
        String(30),
        nullable=False,
    )

    delivery_time = Column(
        String(50),
        nullable=True,
    )

    # Order price details
    delivery_charge = Column(
        Float,
        default=0,
        server_default="0",
        nullable=False,
    )

    product_amount = Column(
        Float,
        default=0,
        server_default="0",
        nullable=False,
    )

    discount = Column(
        Float,
        default=0,
        server_default="0",
        nullable=False,
    )

    tax_amount = Column(
        Float,
        default=0,
        server_default="0",
        nullable=False,
    )

    platform_fee = Column(
        Float,
        default=0,
        server_default="0",
        nullable=False,
    )

    total_amount = Column(
        Float,
        default=0,
        server_default="0",
        nullable=False,
    )

    # Order status
    status = Column(
        String(50),
        nullable=False,
        default="Order Confirmed",
        server_default="Order Confirmed",
    )

    # Stock reservation
    stock_reserved = Column(
        Boolean,
        nullable=False,
        default=False,
        server_default=text("0"),
    )

    # Order creation date
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # User relationship
    user = relationship(
        "User",
        back_populates="orders",
    )

    # Payment relationship
    payment = relationship(
        "Payment",
        back_populates="order",
        uselist=False,
    )
