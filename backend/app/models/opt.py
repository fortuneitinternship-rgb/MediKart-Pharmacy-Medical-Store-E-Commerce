from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from app.database.database import Base


class EmailOTP(Base):
    __tablename__ = "email_otps"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String(255), nullable=False, index=True)

    otp = Column(String(6), nullable=False)

    expires_at = Column(DateTime, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)