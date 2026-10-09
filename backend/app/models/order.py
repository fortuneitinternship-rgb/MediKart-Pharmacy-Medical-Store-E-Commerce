from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from sqlalchemy.sql import func

from app.database.database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)

    order_id = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True
    )

    user_id = Column(
        Integer,
        nullable=True,
        index=True
    )

    customer_name = Column(
        String(100),
        nullable=False
    )

    phone = Column(
        String(15),
        nullable=False
    )

    address = Column(
        Text,
        nullable=False
    )

    city = Column(
        String(100),
        nullable=False
    )

    state = Column(
        String(100),
        nullable=False
    )

    pincode = Column(
        String(10),
        nullable=False
    )

    payment_method = Column(
        String(30),
        nullable=False
    )

    delivery_type = Column(
        String(30),
        nullable=False
    )

    delivery_distance = Column(
        String(30),
        nullable=False
    )

    delivery_time = Column(
        String(50),
        nullable=True
    )

    delivery_charge = Column(
        Float,
        default=0
    )

    product_amount = Column(
        Float,
        default=0
    )

    discount = Column(
        Float,
        default=0
    )

    platform_fee = Column(
        Float,
        default=0
    )

    total_amount = Column(
        Float,
        default=0
    )

    status = Column(
        String(50),
        default="Order Confirmed"
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )