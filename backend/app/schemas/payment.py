from pydantic import BaseModel
from typing import Literal


class PaymentCreate(BaseModel):
    order_id: str
    method: Literal["COD", "CARD", "NETBANKING"]


class PaymentResponse(BaseModel):
    transaction_id: str | None
    amount: float
    method: str
    status: str

    model_config = {"from_attributes": True}
