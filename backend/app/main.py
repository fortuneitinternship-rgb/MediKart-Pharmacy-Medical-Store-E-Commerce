from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routers.otp import router as otp_router

from app.api.routers import (
    admin,
    addresses,
    auth,
    cards,
    newsletter,
    orders,
    payments,
)
from app.database.database import Base, engine, ensure_schema_compatibility
from app.database import base  # noqa: F401


Base.metadata.create_all(bind=engine)
ensure_schema_compatibility()

app = FastAPI(
    title="MEDIKART API",
    description="FastAPI backend for the MediKart medicine and healthcare application",
    version="1.0.0",
)
app.include_router(otp_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "message": "MEDIKART FastAPI Backend is running",
        "status": "success",
        "docs": "/docs",
    }

@app.get("/health")
def health():
    return {"status": "healthy"}

app.include_router(auth.router)
app.include_router(addresses.router)
app.include_router(newsletter.router)
app.include_router(cards.router)
app.include_router(orders.router)
app.include_router(payments.router)
app.include_router(admin.router)
