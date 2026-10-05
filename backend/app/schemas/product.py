from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class CategoryResponse(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(
        from_attributes=True
    )


class ProductResponse(BaseModel):
    id: int
    name: str

    description: Optional[str] = None

    price: float
    discount_price: Optional[float] = None
    discount_percentage: float = 0

    category: Optional[CategoryResponse] = None

    stock: int
    image: Optional[str] = None
    rating: float

    is_active: bool
    is_featured: bool
    is_trending: bool
    is_flash_sale: bool

    flash_sale_start: Optional[datetime] = None
    flash_sale_end: Optional[datetime] = None

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )