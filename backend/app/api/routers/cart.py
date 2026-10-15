from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session, joinedload

# IMPORTANT:
# Replace this import with the actual module where get_db is defined.
from app.database.database import get_db

from app.models.cart_item import CartItem
from app.models.product import Product
from app.models.user import User
from app.api.deps import get_current_user


router = APIRouter(prefix="/cart", tags=["Cart"])


class CartCreate(BaseModel):
    product_id: int
    quantity: int = Field(default=1, ge=1)


class CartUpdate(BaseModel):
    quantity: int = Field(ge=1)


def serialize_cart_item(item: CartItem):
    product = item.product

    if product is None:
        return {
            "id": item.id,
            "cart_item_id": item.id,
            "product_id": item.product_id,
            "quantity": item.quantity,
            "name": "",
            "title": "",
            "price": 0.0,
            "discountedPrice": 0.0,
            "category": None,
            "image": None,
        }

    price = float(getattr(product, "price", 0) or 0)
    discounted_price = getattr(product, "discounted_price", None)

    return {
        "id": item.id,
        "cart_item_id": item.id,
        "product_id": item.product_id,
        "quantity": item.quantity,
        "name": getattr(product, "name", "") or "",
        "title": getattr(product, "title", "") or "",
        "price": price,
        "discountedPrice": (
            float(discounted_price)
            if discounted_price is not None
            else price
        ),
        "category": getattr(product, "category", None),
        "image": getattr(product, "image", None),
    }


def get_user_cart(db: Session, user_id: int):
    return (
        db.query(CartItem)
        .options(joinedload(CartItem.product))
        .filter(CartItem.user_id == user_id)
        .all()
    )


@router.get("/")
def get_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items = get_user_cart(db, current_user.id)

    return {
        "items": [serialize_cart_item(item) for item in items]
    }


@router.post("/", status_code=status.HTTP_201_CREATED)
def add_to_cart(
    payload: CartCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product = (
        db.query(Product)
        .filter(Product.id == payload.product_id)
        .first()
    )

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    item = (
        db.query(CartItem)
        .filter(
            CartItem.user_id == current_user.id,
            CartItem.product_id == payload.product_id,
        )
        .first()
    )

    if item is not None:
        item.quantity += payload.quantity
    else:
        item = CartItem(
            user_id=current_user.id,
            product_id=payload.product_id,
            quantity=payload.quantity,
        )
        db.add(item)

    db.commit()
    db.refresh(item)

    item = (
        db.query(CartItem)
        .options(joinedload(CartItem.product))
        .filter(CartItem.id == item.id)
        .first()
    )

    return serialize_cart_item(item)


@router.patch("/{item_id}")
def update_cart_item(
    item_id: int,
    payload: CartUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = (
        db.query(CartItem)
        .filter(
            CartItem.id == item_id,
            CartItem.user_id == current_user.id,
        )
        .first()
    )

    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found",
        )

    item.quantity = payload.quantity
    db.commit()
    db.refresh(item)

    item = (
        db.query(CartItem)
        .options(joinedload(CartItem.product))
        .filter(CartItem.id == item_id)
        .first()
    )

    return serialize_cart_item(item)


@router.delete("/{item_id}")
def remove_cart_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = (
        db.query(CartItem)
        .filter(
            CartItem.id == item_id,
            CartItem.user_id == current_user.id,
        )
        .first()
    )

    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found",
        )

    db.delete(item)
    db.commit()

    return {"message": "Product removed from cart successfully"}


@router.delete("/")
def clear_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db.query(CartItem).filter(
        CartItem.user_id == current_user.id
    ).delete(synchronize_session=False)

    db.commit()

    return {"message": "Cart cleared successfully"}
