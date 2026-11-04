from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.wishlist import Wishlist
from app.models.product import Product
from app.models.shopping_list_import import ShoppingListImport
from app.schemas.wishlist import ( WishlistCreate )
# Adjust this import if get_current_user lives elsewhere
# in your existing authentication code.
from app.api.deps import get_current_user

router = APIRouter(
    prefix="/api/wishlist",
    tags=["Wishlist"],
)


class WishlistImportItem(BaseModel):
    product_id: int = Field(gt=0)


class WishlistImportRequest(BaseModel):
    migration_id: str = Field(min_length=8, max_length=64)
    items: list[WishlistImportItem] = Field(min_length=1, max_length=100)


@router.post("/import")
def import_local_wishlist(
    payload: WishlistImportRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    existing_import = (
        db.query(ShoppingListImport)
        .filter(
            ShoppingListImport.user_id == current_user.id,
            ShoppingListImport.list_type == "wishlist",
            ShoppingListImport.migration_id == payload.migration_id,
        )
        .first()
    )
    if existing_import:
        return {"message": "Wishlist import was already processed."}

    product_ids = {item.product_id for item in payload.items}
    products = (
        db.query(Product)
        .filter(Product.id.in_(product_ids))
        .all()
    )
    existing_product_ids = {
        item.product_id
        for item in db.query(Wishlist)
        .filter(
            Wishlist.user_id == current_user.id,
            Wishlist.product_id.in_(product_ids),
        )
        .all()
    }
    products_by_id = {product.id: product for product in products}
    missing_product_ids = product_ids.difference(products_by_id)
    if missing_product_ids:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Products not found: {sorted(missing_product_ids)}.",
        )

    for product_id in product_ids - existing_product_ids:
        db.add(
            Wishlist(
                user_id=current_user.id,
                product_id=product_id,
            )
        )

    db.add(
        ShoppingListImport(
            user_id=current_user.id,
            list_type="wishlist",
            migration_id=payload.migration_id,
        )
    )
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        existing_import = (
            db.query(ShoppingListImport)
            .filter(
                ShoppingListImport.user_id == current_user.id,
                ShoppingListImport.list_type == "wishlist",
                ShoppingListImport.migration_id == payload.migration_id,
            )
            .first()
        )
        if existing_import is None:
            raise
        return {"message": "Wishlist import was already processed."}
    return {"message": "Wishlist imported successfully."}


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
