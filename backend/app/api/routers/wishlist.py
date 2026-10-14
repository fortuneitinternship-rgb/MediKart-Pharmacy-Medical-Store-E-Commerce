from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.wishlist import Wishlist
from app.models.product import Product
from app.schemas.wishlist import ( WishlistCreate )
# Adjust this import if get_current_user lives elsewhere
# in your existing authentication code.
from app.api.deps import get_current_user

router = APIRouter(
    prefix="/api/wishlist",
    tags=["Wishlist"],
)


@router.get("/")
def get_wishlist(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    items = (
        db.query(Wishlist)
        .filter(Wishlist.user_id == current_user.id)
        .order_by(Wishlist.created_at.desc())
        .all()
    )

    result = []

    for item in items:
        product = (
            db.query(Product)
            .filter(Product.id == item.product_id)
            .first()
        )

        if product is None:
            continue

        result.append({
            "id": item.id,
            "product_id": item.product_id,
            "created_at": item.created_at,
            "product": {
                "id": product.id,
                "name": getattr(product, "name", None),
                "price": getattr(product, "price", None),
                "image": getattr(product, "image", None),
            },
        })

    return {"items": result}


@router.post("/", status_code=status.HTTP_201_CREATED)
def add_to_wishlist(
    payload: WishlistCreate,
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
            detail="Product not found",
        )

    existing = (
        db.query(Wishlist)
        .filter(
            Wishlist.user_id == current_user.id,
            Wishlist.product_id == payload.product_id,
        )
        .first()
    )

    if existing:
        return {
            "message": "Product is already in your wishlist",
            "id": existing.id,
            "product_id": existing.product_id,
        }

    item = Wishlist(
        user_id=current_user.id,
        product_id=payload.product_id,
    )

    db.add(item)

    try:
        db.commit()
        db.refresh(item)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to add product to wishlist",
        )

    return {
        "message": "Product added to wishlist",
        "id": item.id,
        "product_id": item.product_id,
    }


@router.delete("/{product_id}")
def remove_from_wishlist(
    product_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    item = (
        db.query(Wishlist)
        .filter(
            Wishlist.user_id == current_user.id,
            Wishlist.product_id == product_id,
        )
        .first()
    )

    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found in your wishlist",
        )

    db.delete(item)
    db.commit()

    return {
        "message": "Product removed from wishlist",
        "product_id": product_id,
    }
