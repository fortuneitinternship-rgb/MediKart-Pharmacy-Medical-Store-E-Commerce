
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings
from app.database.database import Base, engine
from app.database.migrations import upgrade_legacy_address_schema

# Import all models so SQLAlchemy registers their tables.
import app.database.base  # noqa: F401

# Import API routers.
from app.api.routers import (
    admin,
    addresses,
    auth,
    blog,
    careers,
    cart,
    compare,
    coupons,
    contact,
    newsletter,
    orders,
    payments,
    products,
    reports,
    returns,
    reviews,
    uploads,
    submissions,
    users,
    wishlist,
    checkout,
)
from app.api.routers.otp import router as otp_router


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("medikart.api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting MediKart API...")
    logger.info("Starting MediKart database initialization...")

    try:
        # Ensure the uploads directory exists.
        settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

        # Upgrade old address column names without deleting existing data.
        upgrade_legacy_address_schema(engine)

        # Create tables that do not already exist.
        # Note: create_all does not add missing columns to existing tables.
        Base.metadata.create_all(bind=engine)

        # Verify the database connection.
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        logger.info("MediKart database initialized successfully.")

    except Exception:
        logger.exception("MediKart database initialization failed.")
        raise

    logger.info("MediKart API startup completed.")

    yield

    logger.info("Shutting down MediKart API...")
    engine.dispose()


api = FastAPI(
    title="MEDIKART API",
    description=(
        "FastAPI backend for the MediKart "
        "medicine and healthcare application"
    ),
    version="1.0.0",
    lifespan=lifespan,
)


# CORS configuration.
frontend_origins = [
    origin.strip()
    for origin in settings.FRONTEND_ORIGINS.split(",")
    if origin.strip()
]

api.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register routers.
api.include_router(auth.router)
api.include_router(otp_router)
api.include_router(addresses.router)
api.include_router(blog.router)
api.include_router(careers.router)
api.include_router(newsletter.router)
api.include_router(cart.router)
api.include_router(compare.router)
api.include_router(coupons.router)
api.include_router(contact.router)
api.include_router(reviews.router)
api.include_router(returns.router)
api.include_router(reports.router)
api.include_router(uploads.router)
api.include_router(wishlist.router)
api.include_router(orders.router)
api.include_router(payments.router)
api.include_router(admin.router)
api.include_router(products.router)
api.include_router(users.router)
api.include_router(submissions.router)
api.include_router(checkout.router)


# Serve uploaded product and other media files.
api.mount(
    "/uploads",
    StaticFiles(
        directory=str(settings.UPLOAD_DIR),
        check_dir=False,
    ),
    name="uploads",
)


@api.get("/", tags=["Health"])
def root():
    return {
        "message": "MEDIKART FastAPI Backend is running",
        "status": "success",
        "docs": "/docs",
    }


@api.get("/health", tags=["Health"])
def health():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "message": "MEDIKART API and database are working correctly",
        }

    except SQLAlchemyError as error:
        logger.exception("Database health check failed.")
        raise HTTPException(
            status_code=503,
            detail="Database is unavailable",
        ) from error


@api.get("/health/api", tags=["Health"])
def api_health():
    return {
        "status": "success",
        "message": "MediKart API is running",
    }


# Keep this name because your Dockerfile and run command use app.main:app.
app = api
