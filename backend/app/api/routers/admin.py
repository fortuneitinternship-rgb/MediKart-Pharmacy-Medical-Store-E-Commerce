from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.database.database import get_db
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.user import User

router = APIRouter(prefix="/api/admin", tags=["Admin"])


class AdminOrderStatusUpdate(BaseModel):
    status: Literal["Processing", "Shipped", "Delivered", "Cancelled"]


def serialize_admin_order(db: Session, order: Order):
    items = (
        db.query(OrderItem)
        .filter(OrderItem.order_id == order.id)
        .all()
    )
    return {
        "id": order.id,
        "order_id": order.order_id,
        "user_id": order.user_id,
        "customer_name": order.customer_name,
        "phone": order.phone,
        "address": order.address,
        "city": order.city,
        "state": order.state,
        "pincode": order.pincode,
        "payment_method": order.payment_method,
        "delivery_type": order.delivery_type,
        "delivery_distance": order.delivery_distance,
        "delivery_time": order.delivery_time,
        "delivery_charge": order.delivery_charge,
        "product_amount": order.product_amount,
        "discount": order.discount,
        "tax_amount": order.tax_amount,
        "platform_fee": order.platform_fee,
        "total_amount": order.total_amount,
        "status": order.status,
        "created_at": order.created_at,
        "items": [
            {
                "id": item.id,
                "product_id": item.product_id,
                "product_name": item.product_name,
                "quantity": item.quantity,
                "price": item.price,
                "total": item.total,
                "image": item.image,
            }
            for item in items
        ],
    }


@router.get("/orders")
def list_admin_orders(
    order_status: str | None = Query(default=None, max_length=50),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    query = db.query(Order)
    if order_status:
        query = query.filter(Order.status == order_status)
    orders = (
        query.order_by(Order.created_at.desc(), Order.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return [serialize_admin_order(db, order) for order in orders]


@router.patch("/orders/{order_id}/status")
def update_admin_order_status(
    order_id: str,
    payload: AdminOrderStatusUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(Order.order_id == order_id).first()
    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found.",
        )

    allowed_transitions = {
        "Order Confirmed": {"Processing", "Cancelled"},
        "Pending": {"Processing", "Cancelled"},
        "Processing": {"Shipped", "Cancelled"},
        "Shipped": {"Delivered"},
        "Delivered": set(),
        "Cancelled": set(),
    }
    if (
        payload.status != order.status
        and payload.status not in allowed_transitions.get(order.status, set())
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot move an order from {order.status} to {payload.status}.",
        )

    was_cancelled = order.status == "Cancelled"
    order.status = payload.status
    if payload.status == "Cancelled" and not was_cancelled and order.stock_reserved:
        items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
        for item in items:
            product = (
                db.query(Product)
                .filter(Product.id == item.product_id)
                .with_for_update()
                .first()
            )
            if product is not None:
                product.stock += item.quantity
        order.stock_reserved = False
    db.commit()
    db.refresh(order)
    return serialize_admin_order(db, order)


@router.get("/dashboard")
def admin_dashboard(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    order_count = db.query(func.count(Order.id)).scalar() or 0
    revenue = (
        db.query(func.coalesce(func.sum(Order.total_amount), 0))
        .filter(Order.status.notin_(["Cancelled", "Refunded"]))
        .scalar()
        or 0
    )
    product_count = (
        db.query(func.count(Product.id))
        .filter(Product.is_active.is_(True))
        .scalar()
        or 0
    )
    low_stock_count = (
        db.query(func.count(Product.id))
        .filter(Product.is_active.is_(True), Product.stock <= 10)
        .scalar()
        or 0
    )
    user_count = db.query(func.count(User.id)).scalar() or 0
    return {
        "message": "Welcome to MEDIKART Admin Dashboard",
        "admin_id": current_admin.id,
        "admin_email": current_admin.email,
        "metrics": {
            "orders_count": order_count,
            "gross_sales": round(float(revenue), 2),
            "active_products": product_count,
            "low_stock_products": low_stock_count,
            "users_count": user_count,
        },
    }
