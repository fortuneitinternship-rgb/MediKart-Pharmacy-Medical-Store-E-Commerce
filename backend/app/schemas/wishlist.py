from pydantic import BaseModel


class WishlistRequest(BaseModel):
    product_id: int