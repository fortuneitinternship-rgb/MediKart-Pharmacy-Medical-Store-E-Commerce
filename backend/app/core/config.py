from pathlib import Path
from typing import Literal

from pydantic import AliasChoices, Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


DEFAULT_DATABASE_PATH = Path(__file__).resolve().parents[2] / "medikart.db"


class Settings(BaseSettings):
    APP_ENV: Literal["development", "production"] = "development"

    DATABASE_URL: str = f"sqlite:///{DEFAULT_DATABASE_PATH.as_posix()}"

    UPLOAD_DIR: Path = Path(__file__).resolve().parents[2] / "uploads"

    SECRET_KEY: str = "change-this-secret-key-before-deploying"
    PAYMENT_WEBHOOK_SECRET: str = ""
    PAYMENT_WEBHOOK_TOLERANCE_SECONDS: int = Field(default=300, ge=1, le=3600)
    PAYMENT_MODE: Literal["razorpay", "simulator"] = "simulator"
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    RAZORPAY_WEBHOOK_SECRET: str = ""
    GST_RATE_PERCENT: float = Field(default=0, ge=0, le=100)
    FREE_DELIVERY_THRESHOLD: float = Field(default=499, ge=0)
    STANDARD_DELIVERY_CHARGE: float = Field(default=10, ge=0)
    EXPRESS_DELIVERY_MINIMUM: float = Field(default=299, ge=0)
    EXPRESS_DELIVERY_CHARGE: float = Field(default=49, ge=0)
    SAME_DAY_DELIVERY_MINIMUM: float = Field(default=999, ge=0)
    SAME_DAY_DELIVERY_CHARGE: float = Field(default=99, ge=0)

    ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    SMTP_HOST: str = Field(
        default="smtp.gmail.com",
        validation_alias=AliasChoices("SMTP_HOST", "SMTP_SERVER"),
    )

    SMTP_PORT: int = 587

    SMTP_EMAIL: str = ""

    SMTP_PASSWORD: str = ""

    FRONTEND_ORIGINS: str = (
        "http://localhost:3000,http://127.0.0.1:3000,"
        "http://localhost:5173,http://127.0.0.1:5173"
    )

    OTP_EXPIRE_MINUTES: int = 5
    OTP_MAX_ATTEMPTS: int = 3
    OTP_RESEND_COOLDOWN_SECONDS: int = 60
    
    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[2] / ".env",
        extra="ignore"
    )

    @model_validator(mode="after")
    def validate_production_configuration(self):
        if self.APP_ENV == "production":
            if (
                len(self.SECRET_KEY) < 32
                or self.SECRET_KEY == "change-this-secret-key-before-deploying"
            ):
                raise ValueError(
                    "Production requires a SECRET_KEY with at least 32 characters."
                )
            if self.PAYMENT_MODE != "razorpay":
                raise ValueError("Production requires PAYMENT_MODE=razorpay.")
            if (
                not self.RAZORPAY_KEY_ID
                or "replace" in self.RAZORPAY_KEY_ID.lower()
                or len(self.RAZORPAY_KEY_SECRET) < 16
                or "replace" in self.RAZORPAY_KEY_SECRET.lower()
            ):
                raise ValueError("Production requires Razorpay API credentials.")
            if (
                len(self.RAZORPAY_WEBHOOK_SECRET) < 16
                or "replace" in self.RAZORPAY_WEBHOOK_SECRET.lower()
            ):
                raise ValueError("Production requires a Razorpay webhook secret.")
            if self.DATABASE_URL.startswith("sqlite"):
                raise ValueError("Production requires a persistent MySQL or PostgreSQL DATABASE_URL.")
            if not self.FRONTEND_ORIGINS.strip() or "*" in self.FRONTEND_ORIGINS:
                raise ValueError(
                    "Production FRONTEND_ORIGINS must list explicit trusted origins."
                )
        return self


settings = Settings()