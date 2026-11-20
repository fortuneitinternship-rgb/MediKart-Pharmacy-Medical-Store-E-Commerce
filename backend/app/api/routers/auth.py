from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.api.routers.forgot_password import router as forgot_password_router
from app.api.routers.login import router as login_router
from app.api.routers.register import router as register_router
from app.models.user import User
from app.schemas.user import UserResponse

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

router.include_router(register_router)
router.include_router(login_router)
router.include_router(forgot_password_router)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    return {"message": "Logout successful", "user_id": current_user.id}
