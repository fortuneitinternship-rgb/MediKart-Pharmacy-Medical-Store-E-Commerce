
# backend/app/main.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings
from app.database.database import Base, engine

# Register models before creating database tables.
import app.database.base  # noqa: F401

# Import API routers.
from app.api.routers import (
    admin,
    addresses,
    auth,
    cart,
    newsletter,
    orders,
    payments,
    products,
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


# ============================================================
# CORS CONFIGURATION
# ============================================================

frontend_origins = [
    origin.strip()
    for origin in settings.FRONTEND_ORIGINS.split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# DATABASE INITIALIZATION
# ============================================================

@app.on_event("startup")
def initialize_database():
    # Create missing tables registered with SQLAlchemy.
    Base.metadata.create_all(bind=engine)


# ============================================================
# REGISTER ROUTERS
# ============================================================

app.include_router(auth.router)
app.include_router(otp_router)
app.include_router(addresses.router)
app.include_router(newsletter.router)
app.include_router(cart.router)
app.include_router(wishlist.router)
app.include_router(orders.router)
app.include_router(payments.router)
app.include_router(admin.router)
app.include_router(products.router)
app.include_router(users.router)
app.include_router(submissions.router)
app.include_router(checkout.router)


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
    """Check API and database connectivity; useful for diagnosing DB issues."""
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except SQLAlchemyError as exc:
        # Keep credentials/connection URL out of the response.
        raise HTTPException(
            status_code=503,
            detail="API is running, but the database connection failed. Check backend/.env DATABASE_URL and database availability.",
        ) from exc
    return {
        "status": "healthy",
        "database": "connected",
        "message": "MEDIKART API and database are working correctly",
        "docs": "/docs",
    }
