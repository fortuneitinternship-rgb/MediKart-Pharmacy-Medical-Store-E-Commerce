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
            if len(self.PAYMENT_WEBHOOK_SECRET) < 32:
                raise ValueError(
                    "Production requires a PAYMENT_WEBHOOK_SECRET with at least 32 characters."
                )
            if self.DATABASE_URL.startswith("sqlite"):
                raise ValueError("Production requires a persistent MySQL or PostgreSQL DATABASE_URL.")
            if not self.FRONTEND_ORIGINS.strip() or "*" in self.FRONTEND_ORIGINS:
                raise ValueError(
                    "Production FRONTEND_ORIGINS must list explicit trusted origins."
                )
        return self


settings = Settings()