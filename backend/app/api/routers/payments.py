import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.database import get_db
from app.models.order import Order
from app.models.payment import Payment
from app.models.user import User
from app.schemas.payment import PaymentCreate, PaymentResponse

router = APIRouter(prefix="/api/payments", tags=["Payments"])


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

    payment.transaction_id = "TXN-" + uuid.uuid4().hex[:12].upper()
    payment.method = data.method
    payment.amount = order.total_amount
    payment.status = "Success"
    order.payment_status = "Paid"

    db.commit()
    db.refresh(payment)
    return payment


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
