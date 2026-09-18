from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.database import Base, engine
from app.database import base

from app.api.routers import (
    auth,
    users,
    addresses,
    newsletter,
    cards,
    orders,
    payments
)


# Create database tables.
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="MEDIKART API",
    description=(
        "FastAPI backend for MEDIKART "
        "online medicine and healthcare application"
    ),
    version="1.0.0"
)


# React frontend connection.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.get("/")
def root():
    return {
        "message": "MEDIKART FastAPI Backend is running",
        "status": "success",
        "docs": "/docs"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(addresses.router)
app.include_router(newsletter.router)
app.include_router(cards.router)
app.include_router(orders.router)
app.include_router(payments.router)