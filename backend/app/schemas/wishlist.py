from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class WishlistCreate(BaseModel):
    product_id: int = Field(gt=0)


class WishlistProductResponse(BaseModel):
    id: int
    product_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
