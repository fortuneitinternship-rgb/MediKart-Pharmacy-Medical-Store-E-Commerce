from pydantic import BaseModel, Field


class CardCreate(BaseModel):
    card_holder_name: str
    card_number: str = Field(min_length=13, max_length=19)
    expiry_month: int = Field(ge=1, le=12)
    expiry_year: int = Field(ge=2024)
    cvv: str = Field(min_length=3, max_length=4)
    card_type: str = "Visa"


class CardResponse(BaseModel):
    id: int
    card_holder_name: str
    last4: str
    expiry_month: int
    expiry_year: int
    card_type: str

    model_config = {"from_attributes": True}
