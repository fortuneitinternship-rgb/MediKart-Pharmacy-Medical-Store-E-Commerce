from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_admin, get_current_user
from app.database.database import get_db
from app.models.order import Order
from app.models.return_request import ReturnRequest
from app.models.user import User
from app.schemas.return_request import (
    ReturnRequestCreate,
    ReturnRequestResponse,
    ReturnRequestUpdate,
)

router = APIRouter(prefix="/api/returns", tags=["Returns and Refunds"])


def serialize_return_request(item: ReturnRequest) -> dict:
    return {
        "id": item.id,
        "order_id": item.order.order_id,
        "reason": item.reason,
        "status": item.status,
        "admin_note": item.admin_note,
        "created_at": item.created_at,
        "updated_at": item.updated_at,
    }


@router.get("", response_model=list[ReturnRequestResponse])
def list_return_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    items = (
        db.query(ReturnRequest)
        .options(joinedload(ReturnRequest.order))
        .filter(ReturnRequest.user_id == current_user.id)
        .order_by(ReturnRequest.created_at.desc())
        .all()
    )
    return [serialize_return_request(item) for item in items]


@router.post(
    "",
    response_model=ReturnRequestResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_return_request(
    payload: ReturnRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = (
        db.query(Order)
        .filter(
            Order.order_id == payload.order_id,
            Order.user_id == current_user.id,
        )
        .first()
    )
    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found.",
        )
    if (order.status or "").casefold() not in {"delivered", "completed"}:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Only delivered orders can be returned.",
        )

    existing = (
        db.query(ReturnRequest)
        .filter(ReturnRequest.order_record_id == order.id)
        .first()
    )
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A return request already exists for this order.",
        )

    request = ReturnRequest(
        order_record_id=order.id,
        user_id=current_user.id,
        reason=payload.reason.strip(),
    )
    db.add(request)
    db.commit()
    db.refresh(request)
    return serialize_return_request(request)


@router.get("/admin", response_model=list[ReturnRequestResponse])
def list_all_return_requests(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    items = (
        db.query(ReturnRequest)
        .options(joinedload(ReturnRequest.order))
        .order_by(ReturnRequest.created_at.desc())
        .all()
    )
    return [serialize_return_request(item) for item in items]


@router.patch(
    "/admin/{request_id}",
    response_model=ReturnRequestResponse,
)
def update_return_request(
    request_id: int,
    payload: ReturnRequestUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    request = (
        db.query(ReturnRequest)
        .options(joinedload(ReturnRequest.order))
        .filter(ReturnRequest.id == request_id)
        .first()
    )
    if request is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Return request not found.",
        )

    allowed_transitions = {
        "Requested": {"Approved", "Rejected"},
        "Approved": {"Refunded"},
        "Rejected": set(),
        "Refunded": set(),
    }
    if (
        payload.status != request.status
        and payload.status not in allowed_transitions.get(request.status, set())
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot move a {request.status} return to {payload.status}.",
        )

    request.status = payload.status
    request.admin_note = payload.admin_note
    db.commit()
    db.refresh(request)
    return serialize_return_request(request)
