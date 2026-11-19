
from pathlib import Path
import logging

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine, make_url
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings

logger = logging.getLogger(__name__)

# Database configuration
DATABASE_URL = settings.DATABASE_URL
BACKEND_DIR = Path(__file__).resolve().parents[2]


def create_database_engine(database_url: str) -> Engine:
    """
    Create a SQLAlchemy engine for SQLite or MySQL.
    """

    if not database_url:
        raise ValueError(
            "DATABASE_URL is missing. Please configure it in backend/.env"
        )

    url = make_url(database_url)
    backend = url.get_backend_name()

    connect_args = {}

    # SQLite configuration
    if backend == "sqlite":
        connect_args["check_same_thread"] = False

        database_path = url.database

        if (
            database_path
            and database_path != ":memory:"
            and not database_path.startswith("file:")
            and not Path(database_path).is_absolute()
        ):
            database_path = str(
                (BACKEND_DIR / database_path).resolve()
            )

            Path(database_path).parent.mkdir(
                parents=True,
                exist_ok=True,
            )

            url = url.set(database=database_path)

    # MySQL configuration
    elif backend == "mysql":
        if url.drivername == "mysql":
            # Use PyMySQL when the URL does not specify a driver.
            url = url.set(drivername="mysql+pymysql")

        connect_args["connect_timeout"] = 10

    else:
        raise ValueError(
            f"Unsupported database backend: {backend}"
        )

    engine = create_engine(
        url,
        connect_args=connect_args,
        pool_pre_ping=True,
        pool_recycle=280,
        echo=False,
    )

    logger.info(
        "Database engine configured. Backend: %s",
        engine.url.get_backend_name(),
    )

    return engine


# Create database engine
engine = create_database_engine(DATABASE_URL)

# Database session
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# Declarative model base
Base = declarative_base()


# FastAPI database dependency
def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()
