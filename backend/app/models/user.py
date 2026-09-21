from datetime import datetime
from sqlalchemy import Boolean, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.database import Base

class User(Base):
    __tablename__ = "users"

    # ---------------------------------------------------------
    # Primary Key
    # ---------------------------------------------------------

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    # ---------------------------------------------------------
    # Basic User Information
    # ---------------------------------------------------------

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False
    )

    phone: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True
    )

    # ---------------------------------------------------------
    # Authentication
    # ---------------------------------------------------------

    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    # ---------------------------------------------------------
    # Account Status
    # ---------------------------------------------------------

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
    )

    is_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )

    # ---------------------------------------------------------
    # Authorization
    # ---------------------------------------------------------

    is_admin: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )

    # ---------------------------------------------------------
    # Password Reset OTP
    # ---------------------------------------------------------

    otp: Mapped[str | None] = mapped_column(
        String(6),
        nullable=True
    )

    otp_expires_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True
    )

    # ---------------------------------------------------------
    # Created Date
    # ---------------------------------------------------------

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    # ---------------------------------------------------------
    # Relationships
    # ---------------------------------------------------------

    addresses = relationship(
        "Address",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    cards = relationship(
        "Card",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    orders = relationship(
        "Order",
        back_populates="user",
        cascade="all, delete-orphan"
    )