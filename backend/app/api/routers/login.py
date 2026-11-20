from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.core.security import create_access_token, verify_password
from app.database.database import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    identifier = data.email.strip().lower()
    user = (
        db.query(User)
        .filter(
            or_(
                User.email == identifier,
                func.lower(User.name) == identifier,
            )
        )
        .first()
    )

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    user.last_login = datetime.now(timezone.utc).replace(tzinfo=None)
    db.commit()
    db.refresh(user)

    token = create_access_token({
        "sub": str(user.id),
        "email": user.email,
        "is_admin": user.is_admin,
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "phone": user.phone,
            "is_active": user.is_active,
            "is_verified": user.is_verified,
            "is_admin": user.is_admin,
            "created_at": user.created_at,
        },
    }
