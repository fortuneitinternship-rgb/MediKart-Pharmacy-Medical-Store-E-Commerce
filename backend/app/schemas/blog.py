from datetime import date

from pydantic import BaseModel, ConfigDict, Field


class BlogPostSummary(BaseModel):
    id: int
    slug: str
    title: str
    category: str
    date: date
    image: str | None = None
    description: str

    model_config = ConfigDict(from_attributes=True)


class BlogPostDetail(BlogPostSummary):
    content: str


class BlogPostCreate(BaseModel):
    slug: str = Field(min_length=1, max_length=255)
    title: str = Field(min_length=1, max_length=255)
    category: str = Field(min_length=1, max_length=100)
    date: date
    image: str | None = Field(default=None, max_length=500)
    description: str = Field(min_length=1)
    content: str = Field(min_length=1)
    is_published: bool = True

    model_config = ConfigDict(extra="forbid")
