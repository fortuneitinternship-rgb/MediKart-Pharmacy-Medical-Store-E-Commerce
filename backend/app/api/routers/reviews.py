from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.database import get_db
from app.models.product import Product
from app.models.submission import ProductReview
from app.models.user import User
from app.schemas.submission import ProductReviewCreate, ProductReviewResponse

router = APIRouter(prefix="/api/reviews", tags=["Product Reviews"])


@router.get("", response_model=list[ProductReviewResponse])
def get_reviews(db: Session = Depends(get_db)):
    return (
        db.query(ProductReview)
        .order_by(ProductReview.created_at.desc())
        .all()
    )


@router.post(
    "",
    response_model=ProductReviewResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_review(
    data: ProductReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    product_name = data.product.strip()
    product = (
        db.query(Product)
        .filter(Product.name == product_name, Product.is_active.is_(True))
        .first()
    )
    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="An active product with this name was not found.",
        )

    review = ProductReview(
        name=current_user.name,
        product=product_name,
        rating=data.rating,
        review=data.review.strip(),
        user_id=current_user.id,
    )
    db.add(review)
    db.flush()
    aggregates = (
        db.query(
            ProductReview.rating,
        )
        .filter(ProductReview.product == product_name)
        .all()
    )
    product.rating = sum(row.rating for row in aggregates) / len(aggregates)
    product.reviews = len(aggregates)
    db.commit()
    db.refresh(review)
    return review
