from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.database.database import get_db
from app.models.user import User
from app.schemas.auth import RegisterRequest
from app.schemas.user import UserResponse

router = APIRouter()


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    email = data.email.lower().strip()
    username = data.username.strip()

    if db.query(User).filter(User.email == email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered",
        )

    if db.query(User).filter(User.name == username).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username is already registered",
        )

    user = User(
        name=username,
        email=email,
        hashed_password=hash_password(data.password),
        is_active=True,
        is_verified=False,
        is_admin=False,
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    return user
