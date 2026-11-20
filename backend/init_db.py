"""
One-command database setup for MediKart.

    python init_db.py

What it does (safe to run again and again):
  1. Creates the MySQL database if it does not exist (utf8mb4).
  2. Creates all tables.
  3. Loads the 200+ product catalog (data/product_catalog.json).
  4. Creates a default admin account if none exists.
"""
import sys

from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL, make_url
from sqlalchemy.exc import OperationalError

from app.core.config import settings


def ensure_mysql_database() -> None:
    url = make_url(settings.DATABASE_URL)
    if url.get_backend_name() != "mysql":
        print(f"[1/4] Database backend is '{url.get_backend_name()}' - no database to create.")
        return

    db_name = url.database
    server_url = URL.create(
        drivername=url.drivername,
        username=url.username,
        password=url.password,
        host=url.host,
        port=url.port,
        query=url.query,
    )  # same server, but without a database name
    engine = create_engine(server_url)
    try:
        with engine.connect() as conn:
            conn.execute(
                text(
                    f"CREATE DATABASE IF NOT EXISTS `{db_name}` "
                    "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
                )
            )
            conn.commit()
    except OperationalError as exc:
        print("\nERROR: could not connect to MySQL.")
        print(f"  Tried: {server_url.render_as_string(hide_password=True)}")
        print("  - Is the MySQL service running?")
        print("  - Is the username/password in backend/.env correct (DATABASE_URL)?")
        print(f"\n  Details: {exc.orig}")
        sys.exit(1)
    finally:
        engine.dispose()
    print(f"[1/4] MySQL database '{db_name}' is ready.")


def create_tables() -> None:
    from app.database.database import Base, engine
    import app.database.base  # noqa: F401  (registers all models)

    from app.database.migrations import sync_missing_columns

    Base.metadata.create_all(bind=engine)
    added = sync_missing_columns(engine)
    if added:
        print(f"      Added missing columns to old tables: {', '.join(added)}")
    print("[2/4] Tables are ready.")


def seed_products() -> None:
    from app.scripts.seed_product_catalog import CATALOG_FILE, seed_catalog
    from app.database.database import SessionLocal
    import json

    catalog = json.loads(CATALOG_FILE.read_text(encoding="utf-8"))
    with SessionLocal() as db:
        result = seed_catalog(db, catalog)
    print(f"[3/4] Product catalog loaded: {result}")


def create_admin() -> None:
    from app.core.security import hash_password
    from app.database.database import SessionLocal
    from app.models.user import User

    email = "admin@medikart.com"
    password = "Admin@12345"
    with SessionLocal() as db:
        if db.query(User).filter(User.is_admin.is_(True)).first():
            print("[4/4] An admin account already exists - skipped.")
            return
        db.add(
            User(
                name="admin",
                email=email,
                hashed_password=hash_password(password),
                is_active=True,
                is_verified=True,
                is_admin=True,
            )
        )
        db.commit()
    print(f"[4/4] Admin created -> login: {email}  password: {password}")


if __name__ == "__main__":
    ensure_mysql_database()
    create_tables()
    seed_products()
    create_admin()
    print("\nDone. Start the API with:  uvicorn app.main:app --reload")
