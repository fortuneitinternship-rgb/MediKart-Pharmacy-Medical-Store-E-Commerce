
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.cart_item import CartItem
from app.models.product import Product
from app.api.deps import get_current_user

router = APIRouter(prefix="/api/cart", tags=["Cart"])


class CartQuantityUpdate(BaseModel):
    quantity: int = Field(ge=1)


class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(default=1, ge=1)


def get_product_data(db: Session, product_id):
    """Return product display fields without exposing an ORM object."""
    product = db.query(Product).filter(Product.id == product_id).first()

    if product is None:
        return {
            "name": "Product",
            "price": 0,
            "discounted_price": 0,
            "image": "",
            "category": "",
        }

    price = getattr(product, "price", 0) or 0
    discounted_price = (
        getattr(product, "discounted_price", None)
        or getattr(product, "discount_price", None)
        or price
    )

    image = (
        getattr(product, "image_url", None)
        or getattr(product, "image", None)
        or ""
    )

    category = getattr(product, "category", "") or ""
    if not isinstance(category, str):
        category = getattr(category, "name", "") or ""

    return {
        "name": getattr(product, "name", "Product") or "Product",
        "price": float(price),
        "discounted_price": float(discounted_price),
        "image": image,
        "category": category,
    }


def serialize_cart_item(db: Session, item: CartItem):
    product_data = get_product_data(db, item.product_id)

    return {
        "id": item.id,
        "product_id": item.product_id,
        "quantity": item.quantity,
        "name": product_data["name"],
        "price": product_data["price"],
        "discounted_price": product_data["discounted_price"],
        "image": product_data["image"],
        "category": product_data["category"],
    }


@router.get("")
@router.get("/")
def get_cart(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    items = (
        db.query(CartItem)
        .filter(CartItem.user_id == current_user.id)
        .all()
    )

    return {"items": [serialize_cart_item(db, item) for item in items]}


@router.post("", status_code=status.HTTP_201_CREATED)
@router.post("/", status_code=status.HTTP_201_CREATED)
def add_cart_item(
    payload: CartItemCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    product = (
        db.query(Product)
        .filter(Product.id == payload.product_id)
        .first()
    )

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )

    # If this product is already in the user's cart, increase its quantity.
    existing_item = (
        db.query(CartItem)
        .filter(
            CartItem.user_id == current_user.id,
            CartItem.product_id == payload.product_id,
        )
        .first()
    )

    if existing_item:
        existing_item.quantity += payload.quantity
        db.commit()
        db.refresh(existing_item)
        return serialize_cart_item(db, existing_item)

    item = CartItem(
        user_id=current_user.id,
        product_id=payload.product_id,
        quantity=payload.quantity,
    )

    db.add(item)
    db.commit()
    db.refresh(item)

    return serialize_cart_item(db, item)


@router.put("/{cart_item_id}")
def update_cart_item(
    cart_item_id: int,
    payload: CartQuantityUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    item = (
        db.query(CartItem)
        .filter(
            CartItem.id == cart_item_id,
            CartItem.user_id == current_user.id,
        )
        .first()
    )

    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found.",
        )

    item.quantity = payload.quantity
    db.commit()
    db.refresh(item)

    return {
        "message": "Cart quantity updated successfully.",
        "item": serialize_cart_item(db, item),
    }


@router.delete("/{cart_item_id}")
def delete_cart_item(
    cart_item_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    item = (
        db.query(CartItem)
        .filter(
            CartItem.id == cart_item_id,
            CartItem.user_id == current_user.id,
        )
        .first()
    )

    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found.",
        )

    db.delete(item)
    db.commit()

    return {"message": "Product removed from cart successfully."}
