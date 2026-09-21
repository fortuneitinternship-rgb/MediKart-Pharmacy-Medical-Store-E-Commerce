from datetime import datetime, timedelta, timezone
import random

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.database.database import get_db
from app.models.user import User
from app.schemas.auth import (
    ForgotPasswordRequest,
    ResetPasswordRequest,
    VerifyOTPRequest,
)


router = APIRouter()


def _find_user(email: str, db: Session) -> User | None:
    return (
        db.query(User)
        .filter(User.email == email.lower().strip())
        .first()
    )


def _validate_otp(data, user: User):
    if not user.otp or user.otp != data.otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP",
        )

    if (
        not user.otp_expires_at
        or datetime.utcnow() > user.otp_expires_at
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP expired",
        )


@router.post("/forgot-password")
def forgot_password(
    data: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    user = _find_user(data.email, db)

    if user:
        user.otp = str(random.randint(100000, 999999))
        user.otp_expires_at = (
            datetime.now(timezone.utc)
            + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)
        ).replace(tzinfo=None)
        db.commit()
        print(f"[MEDIKART OTP] {user.email}: {user.otp}")

    return {
        "message": (
            "If the email is registered, an OTP has been sent."
        )
    }


@router.post("/verify-otp")
def verify_otp(
    data: VerifyOTPRequest,
    db: Session = Depends(get_db),
):
    user = _find_user(data.email, db)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP",
        )

    _validate_otp(data, user)

    return {"message": "OTP verified successfully"}


@router.post("/reset-password")
def reset_password(
    data: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    user = _find_user(data.email, db)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid password reset request",
        )

    _validate_otp(data, user)
    user.hashed_password = hash_password(data.new_password)
    user.otp = None
    user.otp_expires_at = None
    db.commit()

    return {"message": "Password reset successfully"}
