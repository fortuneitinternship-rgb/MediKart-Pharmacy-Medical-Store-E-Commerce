
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)

    order_id = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Saved delivery address. Nullable for older orders.
    address_id = Column(
        Integer,
        ForeignKey("addresses.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Customer and delivery details
    customer_name = Column(String(100), nullable=False)
    phone = Column(String(15), nullable=False)
    address = Column(Text, nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    pincode = Column(String(10), nullable=False)

    # Payment details
    payment_method = Column(String(30), nullable=False)

    payment_status = Column(
        String(50),
        nullable=False,
        default="Pending",
        server_default="Pending",
    )

    # Delivery details
    delivery_type = Column(String(30), nullable=False)
    delivery_distance = Column(String(30), nullable=False)
    delivery_time = Column(String(50), nullable=True)

    # Pricing
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

    # Cancellation details
    cancellation_reason = Column(Text, nullable=True)
    cancelled_at = Column(DateTime(timezone=True), nullable=True)

    # Stock reservation
    stock_reserved = Column(
        Boolean,
        nullable=False,
        default=False,
        server_default=text("0"),
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    user = relationship(
        "User",
        back_populates="orders",
    )

    payment = relationship(
        "Payment",
        back_populates="order",
        uselist=False,
    )

    delivery_address = relationship(
        "Address",
        foreign_keys=[address_id],
    )
