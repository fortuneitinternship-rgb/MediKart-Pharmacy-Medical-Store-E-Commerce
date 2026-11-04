from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class ReturnRequestCreate(BaseModel):
    order_id: str = Field(min_length=1, max_length=50)
    reason: str = Field(min_length=5, max_length=2000)


class ReturnRequestUpdate(BaseModel):
    status: Literal["Approved", "Rejected", "Refunded"]
    admin_note: str | None = Field(default=None, max_length=2000)


class ReturnRequestResponse(BaseModel):
    id: int
    order_id: str
    reason: str
    status: str
    admin_note: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
