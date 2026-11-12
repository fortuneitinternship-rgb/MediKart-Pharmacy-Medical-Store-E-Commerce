from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user
from app.database.database import get_db
from app.models.comparison import Comparison
from app.models.product import Product
from app.models.user import User
from app.schemas.comparison import ComparisonRequest
from app.api.routers.products import product_response

router = APIRouter(prefix="/api/compare", tags=["Product Comparison"])
MAX_COMPARISON_PRODUCTS = 4


@router.get("")
@router.get("/")
def get_comparison(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entries = (
        db.query(Comparison)
        .join(Product, Comparison.product_id == Product.id)
        .options(joinedload(Comparison.product).joinedload(Product.category))
        .filter(Comparison.user_id == current_user.id)
        .order_by(Comparison.created_at.asc())
        .all()
    )
    return [product_response(entry.product) for entry in entries]


@router.post("", status_code=status.HTTP_201_CREATED)
@router.post("/", status_code=status.HTTP_201_CREATED)
def add_to_comparison(
    payload: ComparisonRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    product = (
        db.query(Product)
        .filter(
            Product.id == payload.product_id,
            Product.is_active.is_(True),
        )
        .first()
    )
    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )

    existing = (
        db.query(Comparison)
        .filter(
            Comparison.user_id == current_user.id,
            Comparison.product_id == product.id,
        )
        .first()
    )
    if existing is None:
        item_count = (
            db.query(Comparison)
            .filter(Comparison.user_id == current_user.id)
            .count()
        )
        if item_count >= MAX_COMPARISON_PRODUCTS:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"You can compare up to {MAX_COMPARISON_PRODUCTS} products.",
            )
        db.add(
            Comparison(
                user_id=current_user.id,
                product_id=product.id,
            )
        )
        db.commit()

    return product_response(product)


@router.delete("/{product_id}")
def remove_from_comparison(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entry = (
        db.query(Comparison)
        .filter(
            Comparison.user_id == current_user.id,
            Comparison.product_id == product_id,
        )
        .first()
    )
    if entry is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found in comparison.",
        )

    db.delete(entry)
    db.commit()
    return {"message": "Product removed from comparison."}


@router.delete("")
@router.delete("/")
def clear_comparison(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db.query(Comparison).filter(
        Comparison.user_id == current_user.id
    ).delete(synchronize_session=False)
    db.commit()
    return {"message": "Comparison list cleared."}
