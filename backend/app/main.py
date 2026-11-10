
# backend/app/main.py

import logging

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings
from app.database.database import Base, engine
from app.database.migrations import (
    upgrade_application_schema,
    upgrade_legacy_address_schema,
)

# Register all SQLAlchemy models before create_all().
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


# ============================================================
# LOGGING
# ============================================================

logging.basicConfig(level=logging.INFO)

logger = logging.getLogger("medikart.api")


# ============================================================
# CREATE FASTAPI APPLICATION
# ============================================================

api = FastAPI(
    title="MEDIKART API",
    description=(
        "FastAPI backend for the MediKart "
        "medicine and healthcare application"
    ),
    version="1.0.0",
)


# ============================================================
# EXCEPTION HANDLERS
# ============================================================

@api.exception_handler(RequestValidationError)
async def request_validation_error_handler(
    request: Request,
    error: RequestValidationError,
):
    logger.warning(
        "Validation error: %s %s",
        request.method,
        request.url.path,
    )

    return JSONResponse(
        status_code=422,
        content={
            "detail": jsonable_encoder(error.errors())
        },
    )


@api.exception_handler(SQLAlchemyError)
async def database_error_handler(
    request: Request,
    error: SQLAlchemyError,
):
    logger.exception(
        "Database error: %s %s",
        request.method,
        request.url.path,
    )

    return JSONResponse(
        status_code=500,
        content={
            "detail": "A database error prevented the request from completing."
        },
    )


@api.exception_handler(Exception)
async def unexpected_error_handler(
    request: Request,
    error: Exception,
):
    logger.exception(
        "Unexpected API error: %s %s",
        request.method,
        request.url.path,
    )

    return JSONResponse(
        status_code=500,
        content={
            "detail": "An unexpected server error occurred."
        },
    )


# ============================================================
# DATABASE INITIALIZATION
# ============================================================

@api.on_event("startup")
def initialize_database():

    logger.info("Starting MediKart database initialization...")

    try:
        # Upgrade existing legacy address columns.
        upgrade_legacy_address_schema(engine)

        # Create missing registered database tables.
        Base.metadata.create_all(bind=engine)

        # Apply application schema upgrades.
        upgrade_application_schema(engine)

        # Create uploads directory.
        settings.UPLOAD_DIR.mkdir(
            parents=True,
            exist_ok=True,
        )

        # Verify database connectivity.
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        logger.info("MediKart database initialized successfully.")

    except Exception:
        logger.exception("MediKart database initialization failed.")
        raise


# ============================================================
# REGISTER API ROUTERS
# ============================================================

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


# ============================================================
# STATIC UPLOAD FILES
# ============================================================

api.mount(
    "/uploads",
    StaticFiles(
        directory=str(settings.UPLOAD_DIR),
        check_dir=False,
    ),
    name="uploads",
)


# ============================================================
# ROOT ENDPOINT
# ============================================================

@api.get("/", tags=["Health"])
def root():

    return {
        "message": "MEDIKART FastAPI Backend is running",
        "status": "success",
        "docs": "/docs",
        "health": "/health",
    }


# ============================================================
# DATABASE HEALTH CHECK
# ============================================================

@api.get("/health", tags=["Health"])
def health():

    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "message": "MEDIKART API and database are working correctly",
            "database": "connected",
        }

    except SQLAlchemyError as error:

        logger.exception("Database health check failed.")

        raise HTTPException(
            status_code=503,
            detail="Database is unavailable",
        ) from error


# ============================================================
# API HEALTH CHECK (WITHOUT DATABASE)
# ============================================================

@api.get("/health/api", tags=["Health"])
def api_health():

    return {
        "status": "success",
        "message": "MediKart API is running",
    }


# ============================================================
# CORS CONFIGURATION
# ============================================================

frontend_origins = [
    origin.strip().rstrip("/")
    for origin in settings.FRONTEND_ORIGINS.split(",")
    if origin.strip()
]

# Keep CORS outside FastAPI so CORS headers are also added
# to unhandled server-error responses.
app = CORSMiddleware(
    app=api,
    allow_origins=frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
