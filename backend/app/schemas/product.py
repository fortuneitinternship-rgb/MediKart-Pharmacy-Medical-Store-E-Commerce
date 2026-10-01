from pydantic import BaseModel, Field


class ProductCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    category: str = Field(min_length=1, max_length=100)
    description: str = ""
    price: float = Field(ge=0)
    rating: float = Field(default=0, ge=0, le=5)
    image: str | None = Field(default=None, max_length=1000)
    stock: int = Field(default=0, ge=0)


class ProductUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    category: str | None = Field(default=None, min_length=1, max_length=100)
    description: str | None = None
    price: float | None = Field(default=None, ge=0)
    rating: float | None = Field(default=None, ge=0, le=5)
    image: str | None = Field(default=None, max_length=1000)
    stock: int | None = Field(default=None, ge=0)


class ProductResponse(ProductCreate):
    id: int

    model_config = {"from_attributes": True}