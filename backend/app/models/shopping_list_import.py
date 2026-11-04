from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database.database import Base


class ShoppingListImport(Base):
    __tablename__ = "shopping_list_imports"
    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "list_type",
            "migration_id",
            name="uq_shopping_list_import",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    list_type: Mapped[str] = mapped_column(String(20), nullable=False)
    migration_id: Mapped[str] = mapped_column(String(64), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
