from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routers.otp import router as otp_router
from app.api.routers import (admin,addresses,auth,newsletter,orders,payments,products,submissions,users,)
from app.database.database import (Base,engine,ensure_schema_compatibility,)
from app.database import base  # noqa: F401
from app.core.config import settings
from medikart.backend.app.api.routers import cart


# ============================================================
# DATABASE
# ============================================================

Base.metadata.create_all(bind=engine)

ensure_schema_compatibility()


# ============================================================
# FASTAPI APPLICATION
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
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in settings.FRONTEND_ORIGINS.split(",")
        if origin.strip()
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(otp_router)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "message": "MEDIKART FastAPI Backend is running",
        "status": "success",
        "docs": "/docs",
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():
    return { "status": "healthy" }

# ====================== Authentication ==============================

app.include_router(auth.router)             
app.include_router(addresses.router)        # Addresses
app.include_router(newsletter.router)       # NewsLetters
app.include_router(cart.router)            # Cards
app.include_router(orders.router)           # Orders
app.include_router(payments.router)         # Payments
app.include_router(admin.router)            # Admin
app.include_router(products.router)           # Products
app.include_router(users.router)              # Users
app.include_router(submissions.router)        # User submissions