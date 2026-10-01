from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.database import get_db
from app.models.user import User
from app.schemas.users import UserProfileResponse, UserProfileUpdate

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/me", response_model=UserProfileResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserProfileResponse)
def update_profile(
    data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    values = data.model_dump(exclude_unset=True)
    if "phone" in values and values["phone"] is not None:
        duplicate = db.query(User.id).filter(
            User.phone == values["phone"],
            User.id != current_user.id,
        ).first()
        if duplicate:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Phone number is already in use",
            )

    for field, value in values.items():
        setattr(current_user, "name" if field == "full_name" else field, value)
    current_user.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)

    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        if "phone" in values:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Phone number is already in use",
            ) from error
        raise
    db.refresh(current_user)
    return current_user
