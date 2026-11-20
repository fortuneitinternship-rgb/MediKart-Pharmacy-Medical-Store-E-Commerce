
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings
from app.database.database import Base, engine
from app.database.migrations import (
    sync_missing_columns,
    upgrade_legacy_address_schema,
)

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


# --------------------------------------------------
# LOGGING
# --------------------------------------------------

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("medikart.api")


# --------------------------------------------------
# APPLICATION LIFESPAN
# --------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):

    logger.info("Starting MediKart API...")
    logger.info("Starting MediKart database initialization...")

    try:
        # Ensure uploads directory exists.
        settings.UPLOAD_DIR.mkdir(
            parents=True,
            exist_ok=True,
        )

        # Upgrade legacy address schema.
        upgrade_legacy_address_schema(engine)

        # Create missing database tables.
        Base.metadata.create_all(bind=engine)

        # Add columns missing from tables created by an older schema.
        added_columns = sync_missing_columns(engine)
        if added_columns:
            logger.info("Added missing database columns: %s", added_columns)

        # Verify database connection.
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        logger.info(
            "MediKart database initialized successfully."
        )

    except Exception:
        logger.exception(
            "MediKart database initialization failed."
        )
        raise

    logger.info("MediKart API startup completed.")

    yield

    logger.info("Shutting down MediKart API...")
    engine.dispose()


# --------------------------------------------------
# FASTAPI APPLICATION
# --------------------------------------------------

api = FastAPI(
    title="MEDIKART API",
    description=(
        "FastAPI backend for the MediKart "
        "medicine and healthcare application"
    ),
    version="1.0.0",
    lifespan=lifespan,
)


# --------------------------------------------------
# CORS CONFIGURATION
# --------------------------------------------------

# Read origins from environment/settings.
frontend_origins = [
    origin.strip().rstrip("/")
    for origin in settings.FRONTEND_ORIGINS.split(",")
    if origin.strip()
]

# Default React development origins.
default_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Combine configured and default origins.
allowed_origins = list(
    dict.fromkeys(frontend_origins + default_origins)
)

# Allow React development servers on other localhost ports.
allowed_origin_regex = (
    r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$"
)

logger.info(
    "Allowed CORS origins: %s",
    allowed_origins,
)

api.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=allowed_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,
)


# --------------------------------------------------
# REGISTER API ROUTERS
# --------------------------------------------------

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


# --------------------------------------------------
# STATIC FILES
# --------------------------------------------------

api.mount(
    "/uploads",
    StaticFiles(
        directory=str(settings.UPLOAD_DIR),
        check_dir=False,
    ),
    name="uploads",
)


# --------------------------------------------------
# ROOT ENDPOINT
# --------------------------------------------------

@api.get("/", tags=["Health"])
def root():

    return {
        "message": "MEDIKART FastAPI Backend is running",
        "status": "success",
        "docs": "/docs",
    }


# --------------------------------------------------
# DATABASE HEALTH CHECK
# --------------------------------------------------

@api.get("/health", tags=["Health"])
def health():

    try:

        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "message": (
                "MEDIKART API and database "
                "are working correctly"
            ),
        }

    except SQLAlchemyError as error:

        logger.exception(
            "Database health check failed."
        )

        raise HTTPException(
            status_code=503,
            detail="Database is unavailable",
        ) from error


# --------------------------------------------------
# API HEALTH CHECK
# --------------------------------------------------

@api.get("/health/api", tags=["Health"])
def api_health():

    return {
        "status": "success",
        "message": "MediKart API is running",
    }


# --------------------------------------------------
# CORS WRAPPER
# --------------------------------------------------

# Keep this as the outermost application middleware.
# It ensures CORS headers are applied to responses
# generated by the inner FastAPI application,
# including unhandled 500 error responses.

app = CORSMiddleware(
    app=api,
    allow_origins=allowed_origins,
    allow_origin_regex=allowed_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,
)
