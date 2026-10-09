import hmac
import logging
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.opt import EmailOTP
from app.models.user import User
from app.services.email import EmailDeliveryError, send_otp_email

logger = logging.getLogger(__name__)


def _now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _hash_otp(email: str, otp: str) -> str:
    message = f"{email}:{otp}".encode("utf-8")
    return hmac.digest(settings.SECRET_KEY.encode("utf-8"), message, "sha256").hex()


def send_email_otp(
    email: str,
    db: Session,
) -> None:
    normalized_email = email.lower().strip()
    user = db.query(User).filter(User.email == normalized_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Email is not registered")

    if not settings.SMTP_HOST or not settings.SMTP_EMAIL or not settings.SMTP_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Email delivery is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_EMAIL, and SMTP_PASSWORD.",
        )

    now = _now()
    record = (
        db.query(EmailOTP)
        .filter(EmailOTP.email == normalized_email)
        .with_for_update()
        .first()
    )
    if record and record.created_at:
        elapsed = int((now - record.created_at).total_seconds())
        remaining = settings.OTP_RESEND_COOLDOWN_SECONDS - elapsed
        if remaining > 0:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Please wait {remaining} seconds before requesting another OTP.",
            )

    otp = f"{secrets.randbelow(900000) + 100000:06d}"
    if record is None:
        record = EmailOTP(email=normalized_email)
        db.add(record)

    record.otp_hash = _hash_otp(normalized_email, otp)
    record.expires_at = now + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)
    record.attempts = 0
    record.is_used = False
    record.created_at = now
    db.commit()

    try:
        send_otp_email(normalized_email, otp)
    except EmailDeliveryError as error:
        record.is_used = True
        record.created_at = now - timedelta(
            seconds=settings.OTP_RESEND_COOLDOWN_SECONDS
        )
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="OTP could not be delivered. Check the SMTP settings and try again.",
        ) from error


def verify_email_otp(
    email: str,
    otp: str,
    db: Session,
    *,
    consume: bool = False,
) -> User:
    normalized_email = email.lower().strip()
    record = (
        db.query(EmailOTP)
        .filter(EmailOTP.email == normalized_email)
        .with_for_update()
        .first()
    )
    if not record or record.is_used:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    if record.expires_at <= _now():
        record.is_used = True
        db.commit()
        raise HTTPException(status_code=400, detail="OTP expired. Request a new OTP.")

    if record.attempts >= settings.OTP_MAX_ATTEMPTS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many incorrect attempts. Request a new OTP.",
        )

    if not hmac.compare_digest(record.otp_hash, _hash_otp(normalized_email, otp)):
        record.attempts += 1
        attempts_exceeded = record.attempts >= settings.OTP_MAX_ATTEMPTS
        if attempts_exceeded:
            record.is_used = True
        db.commit()
        if attempts_exceeded:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many incorrect attempts. Request a new OTP.",
            )
        raise HTTPException(status_code=400, detail="Invalid OTP")

    user = db.query(User).filter(User.email == normalized_email).first()
    if not user:
        record.is_used = True
        db.commit()
        raise HTTPException(status_code=400, detail="Invalid OTP")

    user.is_verified = True
    if consume:
        record.is_used = True
    db.commit()
    return user
