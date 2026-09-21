from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.database import get_db
from app.models.user import User
from app.schemas.user import (
    UserResponse,
    UserUpdateRequest
)


router = APIRouter(
    prefix="/api/users",
    tags=["Users"]
)


# ============================================================
# GET MY PROFILE
# ============================================================

@router.get(
    "/me",
    response_model=UserResponse
)
def get_profile(
    current_user: User = Depends(get_current_user)
):

    return current_user


# ============================================================
# UPDATE MY PROFILE
# ============================================================

@router.put(
    "/me",
    response_model=UserResponse
)
def update_profile(
    data: UserUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if data.name is not None:

        current_user.name = data.name.strip()

    if data.phone is not None:

        current_user.phone = data.phone.strip()

    db.commit()

    db.refresh(current_user)

    return current_user