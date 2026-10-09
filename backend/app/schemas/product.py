from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


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

    category: Optional[str] = None

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


class ProductCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    category: str = Field(min_length=1, max_length=100)
    description: str | None = None
    price: float = Field(ge=0)
    discount_price: float | None = Field(default=None, ge=0)
    stock: int = Field(default=0, ge=0)
    image: str | None = Field(default=None, max_length=500)
    rating: float = Field(default=0, ge=0, le=5)
    is_active: bool = True
    is_featured: bool = False
    is_trending: bool = False
    is_flash_sale: bool = False
    flash_sale_start: datetime | None = None
    flash_sale_end: datetime | None = None

    model_config = ConfigDict(extra="forbid")


class ProductUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    category: str | None = Field(default=None, min_length=1, max_length=100)
    description: str | None = None
    price: float | None = Field(default=None, ge=0)
    discount_price: float | None = Field(default=None, ge=0)
    stock: int | None = Field(default=None, ge=0)
    image: str | None = Field(default=None, max_length=500)
    rating: float | None = Field(default=None, ge=0, le=5)
    is_active: bool | None = None
    is_featured: bool | None = None
    is_trending: bool | None = None
    is_flash_sale: bool | None = None
    flash_sale_start: datetime | None = None
    flash_sale_end: datetime | None = None

    model_config = ConfigDict(extra="forbid")