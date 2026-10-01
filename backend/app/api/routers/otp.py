from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy.orm import Session

from app.core.security import create_access_token
from app.database.database import get_db
from app.schemas.auth import VerifyOTPRequest
from app.schemas.user import SendOTPRequest
from app.services.otp import send_email_otp, verify_email_otp

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/send-otp")
def send_otp(
    request: SendOTPRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    send_email_otp(request.email, db, background_tasks)
    return {"message": "OTP sent successfully"}


@router.post("/resend-otp")
def resend_otp(
    request: SendOTPRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    send_email_otp(request.email, db, background_tasks)
    return {"message": "OTP resent successfully"}


@router.post("/verify-otp")
def verify_otp(
    request: VerifyOTPRequest,
    db: Session = Depends(get_db),
):
    user = verify_email_otp(request.email, request.otp, db)
    return {
        "message": "OTP verified successfully",
        "access_token": create_access_token({"sub": str(user.id)}),
        "token_type": "bearer",
    }