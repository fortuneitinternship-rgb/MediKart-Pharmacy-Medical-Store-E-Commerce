from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import ValidationError
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.database.database import get_db
from app.models.coupon import Coupon
from app.models.user import User
from app.schemas.coupon import (
    CouponBase,
    CouponCreate,
    CouponResponse,
    CouponUpdate,
    CouponValidationRequest,
    CouponValidationResponse,
)
from app.services.coupons import calculate_coupon_discount

router = APIRouter(prefix="/api/coupons", tags=["Coupons"])


def get_coupon_or_404(db: Session, coupon_id: int) -> Coupon:
    coupon = db.get(Coupon, coupon_id)
    if coupon is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coupon not found.",
        )
    return coupon


@router.get("", response_model=list[CouponResponse])
def list_active_coupons(db: Session = Depends(get_db)):
    return (
        db.query(Coupon)
        .filter(Coupon.is_active.is_(True))
        .order_by(Coupon.created_at.desc())
        .all()
    )


@router.get("/admin", response_model=list[CouponResponse])
def list_all_coupons(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return db.query(Coupon).order_by(Coupon.created_at.desc()).all()


@router.post(
    "/validate",
    response_model=CouponValidationResponse,
)
def validate_coupon(
    payload: CouponValidationRequest,
    db: Session = Depends(get_db),
):
    coupon = (
        db.query(Coupon)
        .filter(Coupon.code == payload.code.strip().upper())
        .first()
    )
    if coupon is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coupon not found.",
        )

    order_amount = Decimal(str(payload.order_amount))
    try:
        discount = calculate_coupon_discount(coupon, order_amount)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error),
        ) from error

    return CouponValidationResponse(
        code=coupon.code,
        discount_type=coupon.discount_type,
        discount_amount=float(discount),
        order_amount=float(order_amount),
        total_after_discount=float(order_amount - discount),
    )


@router.post(
    "",
    response_model=CouponResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_coupon(
    payload: CouponCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    coupon = Coupon(**payload.model_dump())
    db.add(coupon)
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A coupon with this code already exists.",
        ) from error
    db.refresh(coupon)
    return coupon


@router.put("/{coupon_id}", response_model=CouponResponse)
def update_coupon(
    coupon_id: int,
    payload: CouponUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    coupon = get_coupon_or_404(db, coupon_id)
    updates = payload.model_dump(exclude_unset=True)
    candidate = {
        field: getattr(coupon, field)
        for field in CouponBase.model_fields
    }
    candidate.update(updates)
    try:
        validated = CouponBase.model_validate(candidate)
    except ValidationError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error),
        ) from error

    for field, value in validated.model_dump().items():
        setattr(coupon, field, value)
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A coupon with this code already exists.",
        ) from error
    db.refresh(coupon)
    return coupon


@router.delete("/{coupon_id}", status_code=status.HTTP_204_NO_CONTENT)
def deactivate_coupon(
    coupon_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    coupon = get_coupon_or_404(db, coupon_id)
    coupon.is_active = False
    db.commit()
