import hashlib
import hmac
import time
import uuid
from decimal import Decimal, ROUND_HALF_UP
from typing import Literal

from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from pydantic import BaseModel, Field, field_validator
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.database.database import get_db
from app.models.order import Order
from app.models.payment import Payment
from app.models.payment_webhook_event import PaymentWebhookEvent
from app.models.user import User
from app.schemas.payment import PaymentCreate, PaymentResponse

router = APIRouter(prefix="/api/payments", tags=["Payments"])


class PaymentWebhookPayload(BaseModel):
    event_id: str = Field(min_length=8, max_length=100)
    order_id: str = Field(min_length=1, max_length=50)
    transaction_id: str = Field(min_length=1, max_length=100)
    amount: Decimal = Field(ge=0)
    method: Literal["CARD", "NETBANKING"]
    status: Literal["succeeded", "failed"]

    @field_validator("amount")
    @classmethod
    def validate_amount_precision(cls, amount: Decimal) -> Decimal:
        if not amount.is_finite() or amount.as_tuple().exponent < -2:
            raise ValueError("Payment amount must have no more than two decimal places.")
        return amount


@router.post("/process", response_model=PaymentResponse)
def process_payment(
    data: PaymentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(
        Order.order_id == data.order_id,
        Order.user_id == current_user.id,
    ).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if data.method != order.payment_method:
        raise HTTPException(
            status_code=409,
            detail="Payment method must match the method selected for this order.",
        )

    payment = db.query(Payment).filter(
        Payment.order_id == order.id
    ).first()

    if not payment:
        payment = Payment(
            order_id=order.id,
            amount=order.total_amount,
            method=data.method,
        )
        db.add(payment)
    payment.method = data.method
    payment.amount = order.total_amount
    if data.method == "COD":
        payment.transaction_id = None
        payment.status = "Pending"
    else:
        if not payment.transaction_id:
            payment.transaction_id = "TXN-" + uuid.uuid4().hex[:12].upper()
        payment.status = "Simulated"

    db.commit()
    db.refresh(payment)
    return payment


@router.post("/webhook")
async def verify_payment_webhook(
    payload: PaymentWebhookPayload,
    request: Request,
    x_payment_timestamp: str = Header(alias="X-Payment-Timestamp"),
    x_payment_signature: str = Header(alias="X-Payment-Signature"),
    db: Session = Depends(get_db),
):
    secret = settings.PAYMENT_WEBHOOK_SECRET
    if not secret:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Payment webhook verification is not configured.",
        )

    try:
        timestamp = int(x_payment_timestamp)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid payment webhook timestamp.",
        ) from error

    if abs(int(time.time()) - timestamp) > settings.PAYMENT_WEBHOOK_TOLERANCE_SECONDS:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Payment webhook signature has expired.",
        )

    signed_payload = str(timestamp).encode() + b"." + await request.body()
    expected_signature = hmac.new(
        secret.encode(),
        signed_payload,
        hashlib.sha256,
    ).hexdigest()
    if not hmac.compare_digest(expected_signature, x_payment_signature):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid payment webhook signature.",
        )

    if db.get(PaymentWebhookEvent, payload.event_id) is not None:
        return {"received": True, "duplicate": True}

    order = db.query(Order).filter(Order.order_id == payload.order_id).first()
    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found.",
        )
    if order.payment_method != payload.method:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Payment method does not match the order.",
        )

    expected_amount = Decimal(str(order.total_amount or 0)).quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP,
    )
    received_amount = payload.amount.quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP,
    )
    if received_amount != expected_amount:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Payment amount does not match the order total.",
        )

    payment = (
        db.query(Payment)
        .filter(Payment.order_id == order.id)
        .with_for_update()
        .first()
    )
    if payment is not None and payment.transaction_id not in (
        None,
        payload.transaction_id,
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A different transaction is already recorded for this order.",
        )
    if payment is not None and payment.status == "Paid" and payload.status != "succeeded":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A completed payment cannot be changed to failed.",
        )
    if payment is None:
        payment = Payment(
            order_id=order.id,
            amount=float(expected_amount),
            method=payload.method,
        )
        db.add(payment)
        db.flush()

    payment.transaction_id = payload.transaction_id
    payment.amount = float(expected_amount)
    payment.method = payload.method
    payment.status = "Paid" if payload.status == "succeeded" else "Failed"
    db.add(
        PaymentWebhookEvent(
            event_id=payload.event_id,
            payment_id=payment.id,
            event_status=payload.status,
        )
    )
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        if db.get(PaymentWebhookEvent, payload.event_id) is not None:
            return {"received": True, "duplicate": True}
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Payment transaction was already processed.",
        ) from error

    return {
        "received": True,
        "duplicate": False,
        "order_id": order.order_id,
        "transaction_id": payment.transaction_id,
        "status": payment.status,
    }


@router.get("/order/{order_id}", response_model=PaymentResponse)
def get_payment(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(
        Order.order_id == order_id,
        Order.user_id == current_user.id,
    ).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    payment = db.query(Payment).filter(
        Payment.order_id == order.id
    ).first()

    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    return payment
