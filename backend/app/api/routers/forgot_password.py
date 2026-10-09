from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.database.database import get_db
from app.schemas.auth import (
    ForgotPasswordRequest,
    ResetPasswordRequest,
)
from app.services.otp import send_email_otp, verify_email_otp

router = APIRouter()


@router.post("/forgot-password")
def forgot_password(
    data: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    send_email_otp(data.email, db)
    return {
        "message": "OTP sent successfully"
    }


@router.post("/reset-password")
def reset_password(
    data: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    user = verify_email_otp(data.email, data.otp, db, consume=True)
    user.hashed_password = hash_password(data.new_password)
    db.commit()

    return {"message": "Password reset successfully"}
