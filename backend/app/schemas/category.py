from pydantic import BaseModel, ConfigDict, Field, field_validator


class CategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: str | None = None
    image: str | None = Field(default=None, max_length=500)

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Category name cannot be empty.")
        return value


class CategoryUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    description: str | None = None
    image: str | None = Field(default=None, max_length=500)
    is_active: bool | None = None

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value: str | None) -> str | None:
        if value is None:
            raise ValueError("Category name cannot be empty.")
        value = value.strip()
        if not value:
            raise ValueError("Category name cannot be empty.")
        return value


class CategoryResponse(BaseModel):
    id: int
    name: str
    description: str | None
    image: str | None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)
