from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.database import Base

class Card(Base):
    __tablename__ = "card"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    card_holder_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    last4: Mapped[str] = mapped_column(
        String(4),
        nullable=False
    )

    expiry_month: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    expiry_year: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    card_type: Mapped[str] = mapped_column(
        String(30),
        default="Visa"
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    user = relationship(
        "User",
        back_populates="card"
    )