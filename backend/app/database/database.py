from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings


# ============================================================
# DATABASE ENGINE
# ============================================================

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=280,
    echo=False,
)


# ============================================================
# DATABASE SESSION
# ============================================================

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


# ============================================================
# BASE MODEL
# ============================================================

Base = declarative_base()


# ============================================================
# DATABASE DEPENDENCY
# ============================================================

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# ============================================================
# DATABASE SCHEMA COMPATIBILITY
# ============================================================

def ensure_schema_compatibility():

    inspector = inspect(engine)

    if "users" not in inspector.get_table_names():
        return

    columns = {
        column["name"]
        for column in inspector.get_columns("users")
    }

    with engine.begin() as connection:

        if "is_admin" not in columns:
            connection.execute(
                text(
                    "ALTER TABLE users "
                    "ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT 0"
                )
            )

        if "otp" not in columns:
            connection.execute(
                text(
                    "ALTER TABLE users "
                    "ADD COLUMN otp VARCHAR(6) NULL"
                )
            )

        if "otp_expires_at" not in columns:
            connection.execute(
                text(
                    "ALTER TABLE users "
                    "ADD COLUMN otp_expires_at DATETIME NULL"
                )
            )