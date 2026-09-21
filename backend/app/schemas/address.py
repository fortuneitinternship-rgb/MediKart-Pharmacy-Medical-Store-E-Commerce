from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class AddressBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., min_length=10, max_length=15)

    address_line1: str = Field(..., min_length=3, max_length=255)
    address_line2: Optional[str] = Field(
        default=None,
        max_length=255
    )

    city: str = Field(..., min_length=2, max_length=100)
    state: str = Field(..., min_length=2, max_length=100)
    pincode: str = Field(..., min_length=4, max_length=10)

    country: str = Field(
        default="India",
        max_length=100
    )

    landmark: Optional[str] = Field(
        default=None,
        max_length=255
    )

    address_type: Optional[str] = Field(
        default="Home",
        max_length=50
    )

    is_default: bool = False


class AddressCreate(AddressBase):
    pass


class AddressUpdate(BaseModel):
    full_name: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=100
    )

    phone: Optional[str] = Field(
        default=None,
        min_length=10,
        max_length=15
    )

    address_line1: Optional[str] = Field(
        default=None,
        min_length=3,
        max_length=255
    )

    address_line2: Optional[str] = Field(
        default=None,
        max_length=255
    )

    city: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=100
    )

    state: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=100
    )

    pincode: Optional[str] = Field(
        default=None,
        min_length=4,
        max_length=10
    )

    country: Optional[str] = Field(
        default=None,
        max_length=100
    )

    landmark: Optional[str] = Field(
        default=None,
        max_length=255
    )

    address_type: Optional[str] = Field(
        default=None,
        max_length=50
    )

    is_default: Optional[bool] = None


class AddressResponse(AddressBase):
    id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)