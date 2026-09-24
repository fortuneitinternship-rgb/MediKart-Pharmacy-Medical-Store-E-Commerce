from fastapi import APIRouter, Depends

from app.api.deps import get_current_admin
from app.models.user import User

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/dashboard")
def admin_dashboard(current_admin: User = Depends(get_current_admin)):
    return {
        "message": "Welcome to MEDIKART Admin Dashboard",
        "admin_id": current_admin.id,
        "admin_email": current_admin.email,
    }
