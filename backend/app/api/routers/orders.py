from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.database import get_db
from app.models.address import Address
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.payment import Payment
from app.models.user import User
from app.schemas.order import OrderCreate, OrderResponse

router = APIRouter(prefix="/api/orders", tags=["Orders"])


def generate_order_id():
    return "MK" + str(int(datetime.utcnow().timestamp() * 1000))[-10:]


def generate_tracking_id():
    return "TRK" + str(int(datetime.utcnow().timestamp() * 1000))[-9:]


@router.post("", response_model=OrderResponse)
def create_order(
    data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    address = db.query(Address).filter(
        Address.id == data.address_id,
        Address.user_id == current_user.id,
    ).first()

    if not address:
        raise HTTPException(status_code=404, detail="Delivery address not found")

    subtotal = sum(item.price * item.quantity for item in data.items)
    discount = min(data.discount, subtotal)

    delivery = data.delivery_type.lower()

    if subtotal >= 499:
        delivery_fee = 0
    else:
        delivery_fee = 10

    if delivery == "express":
        if subtotal < 299:
            raise HTTPException(
                status_code=400,
                detail="Express delivery requires minimum order of ₹299",
            )
        delivery_fee += 30

    elif delivery in {"today", "same-day", "same_day"}:
        if subtotal < 999:
            raise HTTPException(
                status_code=400,
                detail="Same-day delivery requires minimum order of ₹999",
            )
        delivery_fee += 50

    total = subtotal - discount + delivery_fee

    order = Order(
        order_id=generate_order_id(),
        user_id=current_user.id,
        address_id=address.id,
        subtotal=subtotal,
        discount=discount,
        delivery_fee=delivery_fee,
        total_amount=total,
        payment_method=data.payment_method,
        payment_status="Pending",
        status="Placed",
        delivery_type=data.delivery_type,
        tracking_id=generate_tracking_id(),
    )

    db.add(order)
    db.flush()

    for item in data.items:
        db.add(OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            product_name=item.product_name,
            quantity=item.quantity,
            price=item.price,
        ))

    db.add(Payment(
        order_id=order.id,
        amount=total,
        method=data.payment_method,
        status="Pending",
    ))

    db.commit()
    db.refresh(order)
    return order


@router.get("", response_model=list[OrderResponse])
def get_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Order).filter(
        Order.user_id == current_user.id
    ).order_by(Order.created_at.desc()).all()


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
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

    return order


@router.get("/{order_id}/track")
def track_order(
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

    return {
        "order_id": order.order_id,
        "tracking_id": order.tracking_id,
        "status": order.status,
        "delivery_type": order.delivery_type,
        "created_at": order.created_at,
    }


@router.patch("/{order_id}/cancel")
def cancel_order(
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

    if order.status in {"Delivered", "Cancelled"}:
        raise HTTPException(
            status_code=400,
            detail=f"Order cannot be cancelled because it is {order.status}",
        )

    order.status = "Cancelled"
    db.commit()

    return {
        "message": "Order cancelled successfully",
        "order_id": order.order_id,
        "status": order.status,
    }
