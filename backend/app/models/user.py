from datetime import datetime
from sqlalchemy import Boolean, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.database import Base


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column( Integer, primary_key=True, index=True )
    name: Mapped[str] = mapped_column( String(100), nullable=False )
    email: Mapped[str] = mapped_column( String(255), unique=True, index=True, nullable=False )
    phone: Mapped[str | None] = mapped_column( String(20), nullable=True )
    hashed_password: Mapped[str] = mapped_column( String(255), nullable=False )
    
    is_active: Mapped[bool] = mapped_column( Boolean, default=True )
    is_verified: Mapped[bool] = mapped_column( Boolean, default=False )
    
    otp: Mapped[str | None] = mapped_column( String(10), nullable=True )
    otp_expires_at: Mapped[datetime | None] = mapped_column( DateTime, nullable=True )
    created_at: Mapped[datetime] = mapped_column( DateTime, default=datetime.utcnow )
    
    addresses = relationship( "Address", back_populates="user", cascade="all, delete-orphan" )
    cards = relationship( "Card", back_populates="user", cascade="all, delete-orphan" )
    orders = relationship( "Order", back_populates="user", cascade="all, delete-orphan" )