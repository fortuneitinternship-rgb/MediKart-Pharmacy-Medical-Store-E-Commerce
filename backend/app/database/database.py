"""Single SQLAlchemy engine/session factory used by every API route.

Set DATABASE_URL in backend/.env. SQLite is the zero-configuration default;
MySQL and PostgreSQL URLs are also supported when their drivers are installed.
"""
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings

DATABASE_URL = settings.DATABASE_URL.strip()
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is empty. Set it in backend/.env")

connect_args = {}
engine_options = {"pool_pre_ping": True, "echo": False}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False
    # Make SQLite's parent folder if a file path is configured.
    if DATABASE_URL.startswith("sqlite:///") and not DATABASE_URL.startswith("sqlite:////"):
        raw_path = DATABASE_URL.removeprefix("sqlite:///").split("?", 1)[0]
        if raw_path and raw_path != ":memory:":
            Path(raw_path).expanduser().parent.mkdir(parents=True, exist_ok=True)
    engine_options["connect_args"] = connect_args
else:
    engine_options.update(pool_recycle=280, pool_size=5, max_overflow=10)

engine = create_engine(DATABASE_URL, **engine_options)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()


def get_db():
    """Yield one request-scoped DB session and always close it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
