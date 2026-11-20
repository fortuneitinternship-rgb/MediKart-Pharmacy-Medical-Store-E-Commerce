from pydantic import BaseModel, ConfigDict, Field, model_validator


class AddressCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    phone: str = Field(min_length=10, max_length=15)
    address_line1: str = Field(min_length=3, max_length=255)
    address_line2: str | None = None
    city: str = Field(min_length=2, max_length=100)
    state: str = Field(min_length=2, max_length=100)
    pincode: str = Field(min_length=4, max_length=10)
    country: str = "India"
    landmark: str | None = None
    address_type: str = "Home"
    is_default: bool = False


class AddressUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=100)
    phone: str | None = Field(default=None, min_length=10, max_length=15)
    address_line1: str | None = Field(default=None, min_length=3, max_length=255)
    address_line2: str | None = None
    city: str | None = None
    state: str | None = None
    pincode: str | None = None
    country: str | None = None
    landmark: str | None = None
    address_type: str | None = None
    is_default: bool | None = None

    model_config = ConfigDict(extra="forbid")

    @model_validator(mode="after")
    def validate_update(self):
        if not self.model_fields_set:
            raise ValueError("At least one address field is required")
        required_fields = {
            "full_name",
            "phone",
            "address_line1",
            "city",
            "state",
            "pincode",
            "country",
            "address_type",
            "is_default",
        }
        if any(
            getattr(self, field) is None
            for field in self.model_fields_set & required_fields
        ):
            raise ValueError("Required address fields cannot be null")
        return self


class AddressResponse(AddressCreate):
    id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)
