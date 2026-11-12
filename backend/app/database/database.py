
# backend/app/database/database.py

from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine, make_url
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings

DATABASE_URL = settings.DATABASE_URL
BACKEND_DIR = Path(__file__).resolve().parents[2]


def create_database_engine(database_url: str) -> Engine:
    url = make_url(database_url)
    connect_args = {}

    if url.get_backend_name() == "sqlite":
        connect_args["check_same_thread"] = False
        database_path = url.database

        if (
            database_path
            and database_path != ":memory:"
            and not database_path.startswith("file:")
            and not Path(database_path).is_absolute()
        ):
            database_path = str((BACKEND_DIR / database_path).resolve())
            Path(database_path).parent.mkdir(parents=True, exist_ok=True)
            url = url.set(database=database_path)

    return create_engine(
        url,
        connect_args=connect_args,
        pool_pre_ping=True,
        pool_recycle=280,
        echo=False,
    )


engine = create_database_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
