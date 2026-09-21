from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.database import (
    Base,
    engine,
    ensure_schema_compatibility
)
from app.database import base

from app.api.routers import (
    auth,
    users,
    addresses,
    newsletter,
    cards,
    orders,
    payments,
    admin
)


# ============================================================
# CREATE DATABASE TABLES
# ============================================================

Base.metadata.create_all(
    bind=engine
)
ensure_schema_compatibility()


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="MEDIKART API",
    description=(
        "FastAPI backend for MEDIKART "
        "online medicine and healthcare application"
    ),
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]
)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():

    return {
        "message": "MEDIKART FastAPI Backend is running",
        "status": "success",
        "docs": "/docs"
    }


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
def health():

    return {
        "status": "healthy"
    }


# ============================================================
# ROUTERS
# ============================================================

app.include_router(auth.router)

app.include_router(users.router)

app.include_router(addresses.router)

app.include_router(newsletter.router)

app.include_router(cards.router)

app.include_router(orders.router)

app.include_router(payments.router)

app.include_router(admin.router)