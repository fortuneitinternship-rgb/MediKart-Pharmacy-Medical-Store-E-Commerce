import pytest
from pydantic import ValidationError

from app.core.config import Settings


def test_production_settings_require_strong_secrets_and_database():
    with pytest.raises(ValidationError):
        Settings(
            APP_ENV="production",
            DATABASE_URL="sqlite:///./medikart.db",
            SECRET_KEY="short",
            PAYMENT_WEBHOOK_SECRET="also-short",
            FRONTEND_ORIGINS="https://shop.example.com",
        )


def test_production_settings_accept_explicit_secrets_and_trusted_origin():
    settings = Settings(
        APP_ENV="production",
        DATABASE_URL="mysql+pymysql://user:password@db/medikart",
        SECRET_KEY="application-secret-with-at-least-32-characters",
        PAYMENT_MODE="razorpay",
        RAZORPAY_KEY_ID="rzp_live_test_key",
        RAZORPAY_KEY_SECRET="razorpay-secret-with-at-least-32-characters",
        RAZORPAY_WEBHOOK_SECRET="razorpay-webhook-secret-with-at-least-32-characters",
        FRONTEND_ORIGINS="https://shop.example.com",
    )

    assert settings.APP_ENV == "production"
