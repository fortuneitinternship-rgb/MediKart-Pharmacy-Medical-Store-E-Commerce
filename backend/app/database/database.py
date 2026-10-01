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
    connect_args={"check_same_thread": False}
    if settings.DATABASE_URL.startswith("sqlite")
    else {},
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
    indexes = {index["name"] for index in inspector.get_indexes("users")}

    with engine.begin() as connection:

        if "is_admin" not in columns:
            connection.execute(
                text(
                    "ALTER TABLE users "
                    "ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE"
                )
            )

        if "otp_expires_at" in columns:
            connection.execute(text("ALTER TABLE users DROP COLUMN otp_expires_at"))

        if "otp" in columns:
            connection.execute(text("ALTER TABLE users DROP COLUMN otp"))

        if "profile_image" not in columns:
            connection.execute(
                text("ALTER TABLE users ADD COLUMN profile_image VARCHAR(2048) NULL")
            )

        if "updated_at" not in columns:
            default_clause = (
                " DEFAULT CURRENT_TIMESTAMP"
                if engine.dialect.name != "sqlite"
                else ""
            )
            connection.execute(
                text(
                    "ALTER TABLE users ADD COLUMN updated_at DATETIME NULL"
                    + default_clause
                )
            )
            connection.execute(
                text(
                    "UPDATE users SET updated_at = COALESCE(created_at, CURRENT_TIMESTAMP) "
                    "WHERE updated_at IS NULL"
                )
            )

        if "uq_users_phone" not in indexes:
            duplicate_phones = connection.execute(
                text(
                    "SELECT COUNT(*) FROM ("
                    "SELECT phone FROM users WHERE phone IS NOT NULL "
                    "GROUP BY phone HAVING COUNT(*) > 1"
                    ") duplicate_phones"
                )
            ).scalar_one()
            if duplicate_phones:
                raise RuntimeError(
                    "Cannot add unique phone index: duplicate phone numbers exist"
                )
            connection.execute(
                text("CREATE UNIQUE INDEX uq_users_phone ON users (phone)")
            )