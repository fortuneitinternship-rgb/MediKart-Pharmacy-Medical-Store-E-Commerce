from typing import List, Literal

from pydantic import BaseModel, Field


class CheckoutItem(BaseModel):
    product_id: int = Field(gt=0)
    quantity: int = Field(ge=1)


class ShippingAddress(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    phone: str = Field(pattern=r"^\d{10}$")
    address: str = Field(min_length=1, max_length=500)
    city: str = Field(min_length=1, max_length=100)
    state: str = Field(min_length=1, max_length=100)
    pincode: str = Field(pattern=r"^\d{6}$")


class CheckoutCreate(BaseModel):
    items: List[CheckoutItem] = Field(min_length=1)
    shipping_address: ShippingAddress

    payment_method: Literal[
        "CARD",
        "NETBANKING",
        "COD",
    ]

    delivery_type: Literal[
        "standard",
        "express",
        "today",
    ]

    delivery_distance: str = Field(
        default="standard",
        max_length=100,
    )


class CheckoutResponse(BaseModel):
    message: str
    order_id: int
    status: str
