from datetime import date, datetime

from pydantic import BaseModel, EmailStr, Field


class ContactMessageCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(min_length=7, max_length=30)
    message: str = Field(min_length=1, max_length=5000)


class ProductReviewCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    product: str = Field(min_length=1, max_length=255)
    rating: int = Field(ge=1, le=5)
    review: str = Field(min_length=1, max_length=5000)


class ProductReviewResponse(ProductReviewCreate):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class OrderFeedbackCreate(BaseModel):
    order_id: str = Field(min_length=1, max_length=50)
    rating: int = Field(ge=1, le=5)
    feedback: str = Field(default="", max_length=500)


class HealthRecordCreate(BaseModel):
    title: str = Field(min_length=1, max_length=150)
    hospital: str = Field(min_length=1, max_length=150)
    doctor: str = Field(min_length=1, max_length=150)
    record_date: date
    status: str = Field(default="Completed", max_length=50)


class HealthRecordResponse(HealthRecordCreate):
    id: int

    model_config = {"from_attributes": True}


class PrescriptionResponse(BaseModel):
    id: int
    filename: str
    content_type: str
    created_at: datetime

    model_config = {"from_attributes": True}
