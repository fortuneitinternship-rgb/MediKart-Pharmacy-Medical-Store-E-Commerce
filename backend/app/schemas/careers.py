from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class JobListingResponse(BaseModel):
    id: int
    title: str
    location: str
    type: str
    experience: str
    description: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class JobListingCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    location: str = Field(min_length=1, max_length=150)
    type: str = Field(min_length=1, max_length=100)
    experience: str = Field(min_length=1, max_length=100)
    description: str | None = None
    is_active: bool = True

    model_config = ConfigDict(extra="forbid")
