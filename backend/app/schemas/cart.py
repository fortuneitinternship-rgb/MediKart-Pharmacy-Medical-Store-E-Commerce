from pydantic import BaseModel, Field


class CartAddRequest(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)


class CartUpdateRequest(BaseModel):
    quantity: int = Field(gt=0)