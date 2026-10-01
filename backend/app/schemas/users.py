import re
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class UserProfileResponse(BaseModel):
    id: int
    full_name: str = Field(validation_alias="name")
    email: str
    phone: str | None
    profile_image: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserProfileUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=100)
    phone: str | None = Field(default=None, max_length=20)
    profile_image: str | None = Field(default=None, max_length=2048)

    model_config = ConfigDict(extra="forbid")

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, value: str | None) -> str | None:
        if value is None:
            raise ValueError("Full name cannot be empty")
        value = value.strip()
        if not 2 <= len(value) <= 100:
            raise ValueError("Full name must be between 2 and 100 characters")
        return value

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str | None) -> str | None:
        if value is None or not value.strip():
            return None
        value = value.strip()
        if re.fullmatch(r"\d{10}", value):
            return value
        if re.fullmatch(r"\+?[1-9][\d ().-]{6,18}\d", value):
            digits = re.sub(r"\D", "", value)
            if 8 <= len(digits) <= 15:
                return f"+{digits}" if value.startswith("+") else digits
        raise ValueError("Phone must be 10 digits or a valid international number")

    @model_validator(mode="after")
    def require_editable_field(self):
        if not self.model_fields_set:
            raise ValueError("At least one editable field is required")
        return self