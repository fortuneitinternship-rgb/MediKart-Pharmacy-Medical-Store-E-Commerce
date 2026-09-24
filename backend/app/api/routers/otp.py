import random
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.schemas.user import SendOTPRequest, VerifyOTPRequest
from app.services.email import send_otp_email


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/send-otp")
def send_otp(
    request: SendOTPRequest,
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.email == request.email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Email is not registered"
        )

    otp = str(random.randint(100000, 999999))

    user.otp = otp
    user.otp_expires_at = (
        datetime.utcnow() + timedelta(minutes=5)
    )

    db.commit()

    try:
        send_otp_email(
            receiver_email=user.email,
            otp=otp
        )
    except Exception as e:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Failed to send OTP email: {str(e)}"
        )

    return {
        "message": "OTP sent successfully"
    }


@router.post("/verify-otp")
def verify_otp(
    request: VerifyOTPRequest,
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.email == request.email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if not user.otp:
        raise HTTPException(
            status_code=400,
            detail="No OTP found. Please request a new OTP."
        )

    if user.otp != request.otp:
        raise HTTPException(
            status_code=400,
            detail="Invalid OTP"
        )

    if not user.otp_expires_at:
        raise HTTPException(
            status_code=400,
            detail="OTP has expired"
        )

    if datetime.utcnow() > user.otp_expires_at:
        user.otp = None
        user.otp_expires_at = None
        db.commit()

        raise HTTPException(
            status_code=400,
            detail="OTP has expired"
        )

    # OTP is valid
    user.otp = None
    user.otp_expires_at = None

    db.commit()

    return {
        "message": "OTP verified successfully"
    }