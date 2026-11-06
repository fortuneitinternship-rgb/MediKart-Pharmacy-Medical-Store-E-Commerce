
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

# Register models before creating database tables.
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
    checkout
)
from app.api.routers.otp import router as otp_router


# ============================================================
# CREATE APPLICATION
# ============================================================

app = FastAPI(
    title="MEDIKART API",
    description=(
        "FastAPI backend for the MediKart "
        "medicine and healthcare application"
    ),
    version="1.0.0",
)
logger = logging.getLogger("medikart.api")


@app.exception_handler(RequestValidationError)
async def request_validation_error_handler(
    request: Request,
    error: RequestValidationError,
):
    return JSONResponse(
        status_code=422,
        content={"detail": jsonable_encoder(error.errors())},
    )


@app.exception_handler(SQLAlchemyError)
async def database_error_handler(request: Request, error: SQLAlchemyError):
    logger.exception("Database request failed: %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "A database error prevented the request from completing."},
    )


@app.exception_handler(Exception)
async def unexpected_error_handler(request: Request, error: Exception):
    logger.exception("Unhandled API error: %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected server error occurred."},
    )


# ============================================================
# CORS CONFIGURATION
# ============================================================

frontend_origins = [
    origin.strip()
    for origin in settings.FRONTEND_ORIGINS.split(",")
    if origin.strip()
]

# ============================================================
# DATABASE INITIALIZATION
# ============================================================

@app.on_event("startup")
def initialize_database():
    # Keep existing address data while upgrading legacy column names.
    upgrade_legacy_address_schema(engine)
    # Create missing tables registered with SQLAlchemy.
    Base.metadata.create_all(bind=engine)
    upgrade_application_schema(engine)
    settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# REGISTER ROUTERS
# ============================================================

app.include_router(auth.router)
app.include_router(otp_router)
app.include_router(addresses.router)
app.include_router(blog.router)
app.include_router(careers.router)
app.include_router(newsletter.router)
app.include_router(cart.router)
app.include_router(compare.router)
app.include_router(coupons.router)
app.include_router(contact.router)
app.include_router(reviews.router)
app.include_router(returns.router)
app.include_router(reports.router)
app.include_router(uploads.router)
app.include_router(wishlist.router)
app.include_router(orders.router)
app.include_router(payments.router)
app.include_router(admin.router)
app.include_router(products.router)
app.include_router(users.router)
app.include_router(submissions.router)
app.include_router(checkout.router)
app.mount(
    "/uploads",
    StaticFiles(directory=settings.UPLOAD_DIR, check_dir=False),
    name="uploads",
)


# ============================================================
# ROOT ENDPOINT
# ============================================================

@app.get("/", tags=["Health"])
def root():
    return {
        "message": "MEDIKART FastAPI Backend is running",
        "status": "success",
        "docs": "/docs",
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health", tags=["Health"])
def health():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except SQLAlchemyError as error:
        raise HTTPException(
            status_code=503,
            detail="Database is unavailable",
        ) from error

    return {
        "status": "healthy",
        "message": "MEDIKART API and database are working correctly",
    }


# Keep CORS outside FastAPI so it also decorates unhandled 500 responses.
app = CORSMiddleware(
    app=app,
    allow_origins=frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
