from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database.database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String(50), unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    address_id = Column(Integer, ForeignKey("addresses.id"), nullable=False)
    subtotal = Column(Float, nullable=False, default=0)
    discount = Column(Float, nullable=False, default=0)
    delivery_fee = Column(Float, nullable=False, default=0)
    total_amount = Column(Float, nullable=False, default=0)

    payment_method = Column(String(50), nullable=False, default="COD")
    payment_status = Column(String(50), nullable=False, default="Pending")
    status = Column(String(50), nullable=False, default="Placed")
    delivery_type = Column(String(50), nullable=False, default="Normal")
    tracking_id = Column(String(50), unique=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="orders")
    delivery_address = relationship("Address")
    items = relationship(
        "OrderItem",
        back_populates="order",
        cascade="all, delete-orphan",
    )
    payment = relationship(
        "Payment",
        back_populates="order",
        uselist=False,
        cascade="all, delete-orphan",
    )
