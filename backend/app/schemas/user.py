from datetime import datetime

from pydantic import BaseModel, EmailStr


# ============================================================
# USER RESPONSE
# ============================================================

class UserResponse(BaseModel):

    id: int

    name: str

    email: EmailStr

    phone: str | None

    is_active: bool

    is_verified: bool

    is_admin: bool

    created_at: datetime

    model_config = {
        "from_attributes": True
    }


# ============================================================
# UPDATE PROFILE
# ============================================================

class UserUpdateRequest(BaseModel):

    name: str | None = None

    phone: str | None = None