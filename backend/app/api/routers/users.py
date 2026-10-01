from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdateRequest

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserResponse)
def update_profile(
    data: UserUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if data.username is not None:
        username = data.username.strip()
        if not username:
            raise HTTPException(status_code=400, detail="Username cannot be empty")

        existing = db.query(User).filter(
            User.name == username,
            User.id != current_user.id,
        ).first()

        if existing:
            raise HTTPException(
                status_code=409,
                detail="Username is already registered",
            )

        current_user.name = username

    if data.phone is not None:
        current_user.phone = data.phone

    db.commit()
    db.refresh(current_user)
    return current_user
