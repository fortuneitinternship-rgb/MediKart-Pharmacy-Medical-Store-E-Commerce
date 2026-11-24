"""Category management API (BE-012).

Public:  GET  /api/categories, GET /api/categories/{id}
Admin:   POST /api/categories, PUT /api/categories/{id}, DELETE /api/categories/{id}

The same routes are also mounted at /api/products/categories so older
clients keep working (see app/main.py).
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.database.database import get_db
from app.models.category import Category
from app.models.user import User
from app.schemas.category import (
    CategoryCreate,
    CategoryResponse,
    CategoryUpdate,
)

router = APIRouter(tags=["Categories"])


def _get_category_or_404(db: Session, category_id: int) -> Category:
    category = db.query(Category).filter(Category.id == category_id).first()
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found.")
    return category


@router.get("", response_model=list[CategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    """List all active categories (A-Z)."""
    return (
        db.query(Category)
        .filter(Category.is_active.is_(True))
        .order_by(Category.name)
        .all()
    )


@router.post(
    "",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_category(
    data: CategoryCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    category = Category(**data.model_dump())
    db.add(category)
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A category with this name already exists.",
        ) from error
    db.refresh(category)
    return category


@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(category_id: int, db: Session = Depends(get_db)):
    category = _get_category_or_404(db, category_id)
    if not category.is_active:
        raise HTTPException(status_code=404, detail="Category not found.")
    return category


@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    data: CategoryUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    category = _get_category_or_404(db, category_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(category, field, value)
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A category with this name already exists.",
        ) from error
    db.refresh(category)
    return category


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def deactivate_category(
    category_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Soft-delete: products keep their category, it just stops being listed."""
    category = _get_category_or_404(db, category_id)
    category.is_active = False
    db.commit()
