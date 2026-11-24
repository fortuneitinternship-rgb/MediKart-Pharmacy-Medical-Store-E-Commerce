import re
from typing import Literal

from pydantic import BaseModel, Field, field_validator, model_validator

PaymentMethod = Literal["COD", "CARD", "NETBANKING", "UPI"]

# name@bank  (example: rahul.k@okhdfcbank, 9876543210@paytm)
UPI_ID_PATTERN = re.compile(r"^[A-Za-z0-9._-]{2,64}@[A-Za-z][A-Za-z0-9]{1,31}$")


class PaymentCreate(BaseModel):
    order_id: str
    method: PaymentMethod
    upi_id: str | None = Field(default=None, max_length=100)

    @field_validator("upi_id", mode="before")
    @classmethod
    def strip_upi_id(cls, value):
        if isinstance(value, str):
            value = value.strip()
            return value or None
        return value

    @model_validator(mode="after")
    def validate_upi_id(self):
        if self.method == "UPI":
            if not self.upi_id or not UPI_ID_PATTERN.match(self.upi_id):
                raise ValueError(
                    "Enter a valid UPI ID, for example name@bank."
                )
        else:
            self.upi_id = None
        return self


class PaymentResponse(BaseModel):
    transaction_id: str | None
    amount: float
    method: str
    status: str

    model_config = {"from_attributes": True}
