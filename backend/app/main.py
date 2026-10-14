
# backend/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
    return {
        "status": "healthy",
        "message": "MEDIKART API is working correctly",
    }
