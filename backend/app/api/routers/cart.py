from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.cart import CartItem
from app.models.user import User
from app.api.dependencies import get_current_user

router = APIRouter(prefix="/api/cart", tags=["Cart"])


@router.delete("/{cart_item_id}", status_code=status.HTTP_200_OK)
def delete_cart_item(
    cart_item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cart_item = (
        db.query(CartItem)
        .filter(
            CartItem.id == cart_item_id,
            CartItem.user_id == current_user.id,
        )
        .first()
    )

    if cart_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found.",
        )

    db.delete(cart_item)
    db.commit()

    return {
        "message": "Product removed from cart successfully.",
        "cart_item_id": cart_item_id,
    }
