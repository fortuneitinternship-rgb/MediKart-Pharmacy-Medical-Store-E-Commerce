from datetime import datetime

from pydantic import BaseModel, Field


class OrderItemCreate(BaseModel):
    product_id: int
    product_name: str
    quantity: int = Field(gt=0)
    price: float = Field(ge=0)


class OrderCreate(BaseModel):
    address_id: int
    items: list[OrderItemCreate]

    payment_method: str = "COD"

    delivery_type: str = "Normal"

    discount: float = Field(
        default=0,
        ge=0
    )


class OrderItemResponse(BaseModel):
    product_id: int
    product_name: str
    quantity: int
    price: float

    model_config = {
        "from_attributes": True
    }


class OrderResponse(BaseModel):
    id: int
    order_id: str
    subtotal: float
    discount: float
    delivery_fee: float
    total_amount: float
    payment_method: str
    payment_status: str
    status: str
    delivery_type: str
    tracking_id: str | None
    created_at: datetime
    items: list[OrderItemResponse]

    model_config = {
        "from_attributes": True
    }