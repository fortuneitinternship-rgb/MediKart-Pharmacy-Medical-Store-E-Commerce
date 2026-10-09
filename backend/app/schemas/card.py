from datetime import date

from pydantic import BaseModel, Field, field_validator, model_validator


class CardCreate(BaseModel):
    card_holder_name: str
    card_number: str = Field(min_length=13, max_length=19)
    expiry_month: int = Field(ge=1, le=12)
    expiry_year: int = Field(ge=2024)
    cvv: str = Field(min_length=3, max_length=4, pattern=r"^\d+$")
    card_type: str = "Visa"

    @field_validator("card_number")
    @classmethod
    def validate_card_number(cls, value: str) -> str:
        digits = "".join(character for character in value if character.isdigit())
        if len(digits) != len(value) or not 13 <= len(digits) <= 19:
            raise ValueError("Card number must contain 13 to 19 digits")
        return digits

    @model_validator(mode="after")
    def validate_expiry(self):
        today = date.today()
        if (self.expiry_year, self.expiry_month) < (today.year, today.month):
            raise ValueError("Card expiry date must be in the future")
        return self


class CardResponse(BaseModel):
    id: int
    card_holder_name: str
    last4: str
    expiry_month: int
    expiry_year: int
    card_type: str

    model_config = {"from_attributes": True}
