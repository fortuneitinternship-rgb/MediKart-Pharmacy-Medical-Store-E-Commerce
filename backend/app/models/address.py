from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database.database import Base


class Address(Base):
    __tablename__ = "addresses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    full_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    address_line1 = Column(String(255), nullable=False)
    address_line2 = Column(String(255), nullable=True)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    pincode = Column(String(10), nullable=False)
    country = Column(String(100), default="India", nullable=False)
    landmark = Column(String(255), nullable=True)
    address_type = Column(String(50), default="Home", nullable=True)
    is_default = Column(Boolean, default=False, nullable=False)

    user = relationship("User", back_populates="addresses")
