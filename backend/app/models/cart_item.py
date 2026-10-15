# app/models/cart_item.py

from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship

# Use the Base defined in your existing database configuration.
from app.database.database import Base


class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    product_id = Column(
        Integer,
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    quantity = Column(Integer, nullable=False, default=1)

    user = relationship("User")
    product = relationship("Product")