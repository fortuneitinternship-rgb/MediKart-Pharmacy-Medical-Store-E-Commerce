from pydantic import BaseModel


class ComparisonRequest(BaseModel):
    product_id: int