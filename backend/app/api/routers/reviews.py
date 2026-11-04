from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.submission import ProductReview
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
    db: Session = Depends(get_db),
):
    review = ProductReview(
        name=data.name.strip(),
        product=data.product.strip(),
        rating=data.rating,
        review=data.review.strip(),
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review
