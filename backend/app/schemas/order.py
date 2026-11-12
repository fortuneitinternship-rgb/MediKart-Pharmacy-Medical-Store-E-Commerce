
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.schemas.address import AddressResponse


class OrderItemCreate(BaseModel):
    product_id: int
    product_name: str = Field(min_length=1, max_length=255)
    quantity: int = Field(ge=1)
    price: float = Field(ge=0)
    total: Optional[float] = Field(default=None, ge=0)
    image: Optional[str] = None


class OrderCreate(BaseModel):
    # Preferred checkout method: use a saved address.
    address_id: Optional[int] = None

    # Legacy checkout fields are retained for compatibility.
    customer_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None

    payment_method: str = "COD"
    delivery_type: str = "normal"
    delivery_distance: str = "short"
    delivery_time: Optional[str] = None

    delivery_charge: float = Field(default=0, ge=0)
    product_amount: Optional[float] = Field(default=None, ge=0)
    discount: float = Field(default=0, ge=0)
    tax_amount: float = Field(default=0, ge=0)
    platform_fee: float = Field(default=0, ge=0)
    total_amount: Optional[float] = Field(default=None, ge=0)

    items: list[OrderItemCreate] = Field(min_length=1)

    @model_validator(mode="after")
    def validate_delivery_details(self):
        if self.address_id is None:
            required_values = {
                "customer_name": self.customer_name,
                "phone": self.phone,
                "address": self.address,
                "city": self.city,
                "state": self.state,
                "pincode": self.pincode,
            }

            missing = [
                field
                for field, value in required_values.items()
                if not value or not str(value).strip()
            ]

            if missing:
                raise ValueError(
                    "Provide address_id or all required delivery details."
                )

        return self


class OrderCancelRequest(BaseModel):
    reason: str = Field(min_length=3, max_length=1000)

    model_config = ConfigDict(extra="forbid")


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    quantity: int
    price: float
    total: float
    image: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class OrderResponse(BaseModel):
    id: int
    order_id: str
    user_id: Optional[int] = None
    address_id: Optional[int] = None

    customer_name: str
    phone: str
    address: str
    city: str
    state: str
    pincode: str

    delivery_address: Optional[AddressResponse] = None

    payment_method: str
    payment_status: str = "Pending"

    delivery_type: str
    delivery_distance: str
    delivery_time: Optional[str] = None

    delivery_charge: float
    product_amount: float
    discount: float
    tax_amount: float = 0
    platform_fee: float
    total_amount: float

    status: str

    cancellation_reason: Optional[str] = None
    cancelled_at: Optional[datetime] = None

    items: list[OrderItemResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)
