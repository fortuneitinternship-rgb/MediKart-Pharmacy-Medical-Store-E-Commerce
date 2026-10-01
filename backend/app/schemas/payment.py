from pydantic import BaseModel


class PaymentCreate(BaseModel):
    order_id: str
    method: str


class PaymentResponse(BaseModel):
    transaction_id: str | None
    amount: float
    method: str
    status: str

    model_config = {"from_attributes": True}
