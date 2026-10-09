from typing import List, Optional

from pydantic import BaseModel


class OrderItemCreate(BaseModel):
    product_id: int
    product_name: str
    quantity: int
    price: float
    total: float
    image: Optional[str] = None


class OrderCreate(BaseModel):
    user_id: Optional[int] = None

    customer_name: str
    phone: str

    address: str
    city: str
    state: str
    pincode: str

    payment_method: str

    delivery_type: str
    delivery_distance: str
    delivery_time: Optional[str] = None

    delivery_charge: float = 0
    product_amount: float = 0
    discount: float = 0
    platform_fee: float = 0
    total_amount: float = 0

    items: List[OrderItemCreate]


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    quantity: int
    price: float
    total: float
    image: Optional[str] = None

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: int
    order_id: str

    user_id: Optional[int] = None

    customer_name: str
    phone: str

    address: str
    city: str
    state: str
    pincode: str

    payment_method: str

    delivery_type: str
    delivery_distance: str
    delivery_time: Optional[str] = None

    delivery_charge: float
    product_amount: float
    discount: float
    platform_fee: float
    total_amount: float

    status: str

    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True