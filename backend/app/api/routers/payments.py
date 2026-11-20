
import json
import hashlib
import hmac
import logging
import time
import uuid

from decimal import Decimal, ROUND_HALF_UP
from typing import Literal

import httpx

from fastapi import (
    APIRouter,
    Depends,
    Header,
    HTTPException,
    Request,
    status,
)

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

logger = logging.getLogger(__name__)


# ---------------------------------------------------------
# MONEY HELPER
# ---------------------------------------------------------

def money(value) -> Decimal:
    """
    Convert a value to Decimal and round it to two
    decimal places using standard currency rounding.
    """
    return Decimal(str(value)).quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP,
    )


# ---------------------------------------------------------
# REQUEST SCHEMAS
# ---------------------------------------------------------

class RazorpayOrderRequest(BaseModel):
    order_id: str = Field(min_length=1, max_length=50)


class RazorpayVerificationRequest(BaseModel):
    razorpay_order_id: str = Field(min_length=1, max_length=100)
    razorpay_payment_id: str = Field(min_length=1, max_length=100)
    razorpay_signature: str = Field(min_length=1, max_length=256)


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
        if (
            not amount.is_finite()
            or amount.as_tuple().exponent < -2
        ):
            raise ValueError(
                "Payment amount must have no more than two decimal places."
            )

        return amount


# ---------------------------------------------------------
# PAYMENT CONFIGURATION
# ---------------------------------------------------------

@router.get("/config")
def get_payment_config():
    return {
        "mode": settings.PAYMENT_MODE,
        "razorpay_enabled": bool(
            settings.RAZORPAY_KEY_ID
            and settings.RAZORPAY_KEY_SECRET
        ),
    }


# ---------------------------------------------------------
# PROCESS PAYMENT
# ---------------------------------------------------------

@router.post("/process", response_model=PaymentResponse)
def process_payment(
    data: PaymentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = (
        db.query(Order)
        .filter(
            Order.order_id == data.order_id,
            Order.user_id == current_user.id,
        )
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    if data.method != order.payment_method:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Payment method must match the method selected for this order.",
        )

    if (
        data.method != "COD"
        and settings.PAYMENT_MODE == "razorpay"
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Use Razorpay checkout to process this payment.",
        )

    payment = (
        db.query(Payment)
        .filter(Payment.order_id == order.id)
        .first()
    )

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
            payment.transaction_id = (
                "TXN-" + uuid.uuid4().hex[:12].upper()
            )

        payment.status = "Simulated"

    db.commit()
    db.refresh(payment)

    return payment


# ---------------------------------------------------------
# CREATE RAZORPAY ORDER
# ---------------------------------------------------------

@router.post("/razorpay/order")
def create_razorpay_order(
    payload: RazorpayOrderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    if (
        settings.PAYMENT_MODE != "razorpay"
        or not settings.RAZORPAY_KEY_ID
        or not settings.RAZORPAY_KEY_SECRET
    ):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Razorpay payments are not configured.",
        )

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

    if order.payment_method not in {"CARD", "NETBANKING"}:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This order is not configured for online payment.",
        )

    if order.status in {"Cancelled", "Refunded"}:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Payment cannot be started for a cancelled or refunded order.",
        )

    amount = int(
        money(
            Decimal(str(order.total_amount or 0))
        ) * Decimal("100")
    )

    if amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Payment amount must be greater than zero.",
        )

    payment = (
        db.query(Payment)
        .filter(Payment.order_id == order.id)
        .with_for_update()
        .first()
    )

    if payment is not None and payment.status == "Paid":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This order has already been paid.",
        )

    # Reuse an existing Razorpay order when possible.
    if (
        payment is not None
        and payment.provider_order_id
        and payment.status != "Failed"
    ):
        return {
            "key_id": settings.RAZORPAY_KEY_ID,
            "razorpay_order_id": payment.provider_order_id,
            "amount": amount,
            "currency": "INR",
            "order_id": order.order_id,
            "customer": {
                "name": order.customer_name,
                "email": current_user.email,
                "contact": order.phone,
            },
        }

    try:
        with httpx.Client(timeout=15.0) as client:
            response = client.post(
                "https://api.razorpay.com/v1/orders",
                auth=(
                    settings.RAZORPAY_KEY_ID,
                    settings.RAZORPAY_KEY_SECRET,
                ),
                json={
                    "amount": amount,
                    "currency": "INR",
                    "receipt": order.order_id,
                    "notes": {
                        "medikart_order_id": order.order_id
                    },
                },
            )

            response.raise_for_status()
            provider_order = response.json()

    except (httpx.HTTPError, ValueError) as error:

        logger.exception(
            "Unable to create Razorpay order for %s",
            order.order_id,
        )

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The payment provider could not create an order. Please retry.",
        ) from error

    provider_order_id = provider_order.get("id")

    if (
        not isinstance(provider_order_id, str)
        or not provider_order_id
    ):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The payment provider returned an invalid order response.",
        )

    if payment is None:
        payment = Payment(
            order_id=order.id,
            amount=float(order.total_amount),
            method=order.payment_method,
        )

        db.add(payment)

    payment.provider_order_id = provider_order_id
    payment.transaction_id = None
    payment.amount = float(order.total_amount)
    payment.method = order.payment_method
    payment.status = "Pending"

    db.commit()

    return {
        "key_id": settings.RAZORPAY_KEY_ID,
        "razorpay_order_id": provider_order_id,
        "amount": amount,
        "currency": "INR",
        "order_id": order.order_id,
        "customer": {
            "name": order.customer_name,
            "email": current_user.email,
            "contact": order.phone,
        },
    }


# ---------------------------------------------------------
# VERIFY RAZORPAY PAYMENT
# ---------------------------------------------------------

@router.post(
    "/razorpay/verify",
    response_model=PaymentResponse,
)
def verify_razorpay_payment(
    payload: RazorpayVerificationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    if settings.PAYMENT_MODE != "razorpay":
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Razorpay payments are not enabled.",
        )

    payment = (
        db.query(Payment)
        .join(Order, Payment.order_id == Order.id)
        .filter(
            Payment.provider_order_id == payload.razorpay_order_id,
            Order.user_id == current_user.id,
        )
        .with_for_update()
        .first()
    )

    if payment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment order not found.",
        )

    signed_data = (
        f"{payload.razorpay_order_id}|"
        f"{payload.razorpay_payment_id}"
    ).encode()

    expected_signature = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode(),
        signed_data,
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(
        expected_signature,
        payload.razorpay_signature,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Payment signature verification failed.",
        )

    try:
        with httpx.Client(timeout=15.0) as client:
            response = client.get(
                "https://api.razorpay.com/v1/payments/"
                f"{payload.razorpay_payment_id}",
                auth=(
                    settings.RAZORPAY_KEY_ID,
                    settings.RAZORPAY_KEY_SECRET,
                ),
            )

            response.raise_for_status()
            provider_payment = response.json()

    except (httpx.HTTPError, ValueError) as error:

        logger.exception(
            "Unable to verify Razorpay payment %s",
            payload.razorpay_payment_id,
        )

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The payment provider could not verify the payment. Please retry.",
        ) from error

    expected_amount = int(
        money(Decimal(str(payment.amount))) * Decimal("100")
    )

    if (
        provider_payment.get("order_id") != payment.provider_order_id
        or provider_payment.get("amount") != expected_amount
        or provider_payment.get("currency") != "INR"
        or provider_payment.get("status") != "captured"
        or provider_payment.get("method") not in {
            "card",
            "netbanking",
        }
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="The provider has not confirmed a captured payment for this order.",
        )

    if payment.transaction_id not in (
        None,
        payload.razorpay_payment_id,
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A different payment is already recorded for this order.",
        )

    payment.transaction_id = payload.razorpay_payment_id
    payment.method = provider_payment["method"].upper()
    payment.status = "Paid"

    db.commit()
    db.refresh(payment)

    return payment


# ---------------------------------------------------------
# RAZORPAY WEBHOOK
# ---------------------------------------------------------

@router.post("/razorpay/webhook")
async def razorpay_webhook(
    request: Request,
    x_razorpay_signature: str = Header(
        alias="X-Razorpay-Signature"
    ),
    x_razorpay_event_id: str = Header(
        alias="X-Razorpay-Event-Id"
    ),
    db: Session = Depends(get_db),
):

    if (
        settings.PAYMENT_MODE != "razorpay"
        or len(settings.RAZORPAY_WEBHOOK_SECRET) < 16
    ):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Razorpay webhook verification is not configured.",
        )

    raw_body = await request.body()

    expected_signature = hmac.new(
        settings.RAZORPAY_WEBHOOK_SECRET.encode(),
        raw_body,
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(
        expected_signature,
        x_razorpay_signature,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Razorpay webhook signature.",
        )

    try:
        event = json.loads(raw_body)

    except (UnicodeDecodeError, json.JSONDecodeError) as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Razorpay webhook payload.",
        ) from error

    event_type = event.get("event")

    if event_type not in {
        "payment.captured",
        "payment.failed",
    }:
        return {
            "received": True,
            "ignored": True,
        }

    event_key = f"razorpay:{x_razorpay_event_id}"

    if db.get(PaymentWebhookEvent, event_key) is not None:
        return {
            "received": True,
            "duplicate": True,
        }

    try:
        entity = event["payload"]["payment"]["entity"]

        provider_order_id = entity["order_id"]
        transaction_id = entity["id"]
        amount = int(entity["amount"])
        currency = entity["currency"]
        method = entity["method"]

    except (KeyError, TypeError, ValueError) as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Razorpay webhook is missing payment details.",
        ) from error

    payment = (
        db.query(Payment)
        .filter(
            Payment.provider_order_id == provider_order_id
        )
        .with_for_update()
        .first()
    )

    if payment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment order not found.",
        )

    expected_amount = int(
        money(Decimal(str(payment.amount))) * Decimal("100")
    )

    if (
        currency != "INR"
        or amount != expected_amount
        or method not in {"card", "netbanking"}
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Webhook amount or currency does not match the order.",
        )

    if (
        payment.status == "Paid"
        and event_type != "payment.captured"
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A completed payment cannot be changed to failed.",
        )

    payment.transaction_id = transaction_id
    payment.method = method.upper()

    payment.status = (
        "Paid"
        if event_type == "payment.captured"
        else "Failed"
    )

    db.add(
        PaymentWebhookEvent(
            event_id=event_key,
            payment_id=payment.id,
            event_status=event_type,
        )
    )

    try:
        db.commit()

    except IntegrityError as error:
        db.rollback()

        if db.get(PaymentWebhookEvent, event_key) is not None:
            return {
                "received": True,
                "duplicate": True,
            }

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Payment transaction was already processed.",
        ) from error

    return {
        "received": True,
        "duplicate": False,
    }


# ---------------------------------------------------------
# GENERIC PAYMENT WEBHOOK
# ---------------------------------------------------------

@router.post("/webhook")
async def verify_payment_webhook(
    payload: PaymentWebhookPayload,
    request: Request,
    x_payment_timestamp: str = Header(
        alias="X-Payment-Timestamp"
    ),
    x_payment_signature: str = Header(
        alias="X-Payment-Signature"
    ),
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

    if (
        abs(int(time.time()) - timestamp)
        > settings.PAYMENT_WEBHOOK_TOLERANCE_SECONDS
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Payment webhook signature has expired.",
        )

    signed_payload = (
        str(timestamp).encode()
        + b"."
        + await request.body()
    )

    expected_signature = hmac.new(
        secret.encode(),
        signed_payload,
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(
        expected_signature,
        x_payment_signature,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid payment webhook signature.",
        )

    if db.get(PaymentWebhookEvent, payload.event_id) is not None:
        return {
            "received": True,
            "duplicate": True,
        }

    order = (
        db.query(Order)
        .filter(Order.order_id == payload.order_id)
        .first()
    )

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

    expected_amount = money(order.total_amount or 0)
    received_amount = money(payload.amount)

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

    if (
        payment is not None
        and payment.transaction_id not in (
            None,
            payload.transaction_id,
        )
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A different transaction is already recorded for this order.",
        )

    if (
        payment is not None
        and payment.status == "Paid"
        and payload.status != "succeeded"
    ):
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

    payment.status = (
        "Paid"
        if payload.status == "succeeded"
        else "Failed"
    )

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
            return {
                "received": True,
                "duplicate": True,
            }

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


# ---------------------------------------------------------
# GET PAYMENT BY ORDER ID
# ---------------------------------------------------------

@router.get(
    "/order/{order_id}",
    response_model=PaymentResponse,
)
def get_payment(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    order = (
        db.query(Order)
        .filter(
            Order.order_id == order_id,
            Order.user_id == current_user.id,
        )
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    payment = (
        db.query(Payment)
        .filter(Payment.order_id == order.id)
        .first()
    )

    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found",
        )

    return payment
