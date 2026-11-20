from datetime import datetime, timezone
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class CouponBase(BaseModel):
    code: str = Field(min_length=3, max_length=50, pattern=r"^[A-Za-z0-9_-]+$")
    discount_type: Literal["percent", "fixed"]
    discount_value: float = Field(gt=0)
    minimum_order_amount: float = Field(default=0, ge=0)
    maximum_discount: float | None = Field(default=None, gt=0)
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    usage_limit: int | None = Field(default=None, gt=0)
    is_active: bool = True

    @field_validator("code")
    @classmethod
    def normalize_code(cls, value: str) -> str:
        return value.strip().upper()

    @model_validator(mode="after")
    def validate_coupon_rules(self):
        if self.discount_type == "percent" and self.discount_value > 100:
            raise ValueError("Percentage discounts cannot exceed 100.")
        if (
            self.starts_at is not None
            and self.ends_at is not None
            and _as_utc(self.starts_at) >= _as_utc(self.ends_at)
        ):
            raise ValueError("Coupon end time must be after its start time.")
        return self


def _as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


class CouponCreate(CouponBase):
    pass


class CouponUpdate(BaseModel):
    code: str | None = Field(
        default=None,
        min_length=3,
        max_length=50,
        pattern=r"^[A-Za-z0-9_-]+$",
    )
    discount_type: Literal["percent", "fixed"] | None = None
    discount_value: float | None = Field(default=None, gt=0)
    minimum_order_amount: float | None = Field(default=None, ge=0)
    maximum_discount: float | None = Field(default=None, gt=0)
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    usage_limit: int | None = Field(default=None, gt=0)
    is_active: bool | None = None

    @field_validator("code")
    @classmethod
    def normalize_code(cls, value: str | None) -> str | None:
        return value.strip().upper() if value is not None else None


class CouponResponse(CouponBase):
    id: int
    usage_count: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CouponValidationRequest(BaseModel):
    code: str = Field(min_length=3, max_length=50)
    order_amount: float = Field(gt=0)


class CouponValidationResponse(BaseModel):
    code: str
    discount_type: Literal["percent", "fixed"]
    discount_amount: float
    order_amount: float
    total_after_discount: float
