
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.database import get_db
from app.models.address import Address
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.user import User
from app.schemas.order import (
    OrderCancelRequest,
    OrderCreate,
    OrderResponse,
)


router = APIRouter(
    prefix="/api/orders",
    tags=["Orders"],
)


def round_money(value) -> float:
    return float(
        Decimal(str(value or 0)).quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )
    )


def generate_order_id() -> str:
    return "MK" + uuid.uuid4().hex[:12].upper()


def serialize_order(order: Order, db: Session) -> dict:
    items = (
        db.query(OrderItem)
        .filter(OrderItem.order_id == order.id)
        .all()
    )

    delivery_address = None

    if order.address_id is not None:
        delivery_address = db.get(Address, order.address_id)

    return {
        "id": order.id,
        "order_id": order.order_id,
        "user_id": order.user_id,
        "address_id": order.address_id,
        "customer_name": order.customer_name,
        "phone": order.phone,
        "address": order.address,
        "city": order.city,
        "state": order.state,
        "pincode": order.pincode,
        "delivery_address": delivery_address,
        "payment_method": order.payment_method,
        "payment_status": order.payment_status,
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
        "cancellation_reason": order.cancellation_reason,
        "cancelled_at": order.cancelled_at,
        "items": items,
    }


# ---------------------------------------------------------
# CREATE ORDER
# ---------------------------------------------------------

@router.post(
    "",
    response_model=OrderResponse,
    status_code=status.HTTP_200_OK,
)
@router.post(
    "/",
    response_model=OrderResponse,
    status_code=status.HTTP_200_OK,
    include_in_schema=False,
)
def create_order(
    order_data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        # Use the saved address only when it belongs to this user.
        saved_address = None

        if order_data.address_id is not None:
            saved_address = (
                db.query(Address)
                .filter(
                    Address.id == order_data.address_id,
                    Address.user_id == current_user.id,
                )
                .first()
            )

            if saved_address is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Delivery address not found.",
                )

            customer_name = saved_address.full_name
            phone = saved_address.phone

            address_parts = [
                saved_address.address_line1,
                saved_address.address_line2,
                saved_address.landmark,
            ]

            address_text = ", ".join(
                part.strip()
                for part in address_parts
                if part and part.strip()
            )

            city = saved_address.city
            state = saved_address.state
            pincode = saved_address.pincode

        else:
            customer_name = order_data.customer_name
            phone = order_data.phone
            address_text = order_data.address
            city = order_data.city
            state = order_data.state
            pincode = order_data.pincode

        # Calculate item totals and subtotal.
        subtotal = Decimal("0.00")
        prepared_items = []

        for item in order_data.items:
            item_total = (
                Decimal(str(item.price))
                * Decimal(str(item.quantity))
            ).quantize(
                Decimal("0.01"),
                rounding=ROUND_HALF_UP,
            )

            subtotal += item_total

            prepared_items.append({
                "product_id": item.product_id,
                "product_name": item.product_name,
                "quantity": item.quantity,
                "price": round_money(item.price),
                "total": float(item_total),
                "image": item.image,
            })

        subtotal = subtotal.quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )

        # Calculate the final amount.
        delivery_charge = Decimal(
            str(order_data.delivery_charge)
        )
        discount = Decimal(str(order_data.discount))
        tax_amount = Decimal(str(order_data.tax_amount))
        platform_fee = Decimal(str(order_data.platform_fee))

        total_amount = (
            subtotal
            + delivery_charge
            + tax_amount
            + platform_fee
            - discount
        )

        if total_amount < 0:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Order total cannot be negative.",
            )

        new_order = Order(
            order_id=generate_order_id(),
            user_id=current_user.id,
            address_id=saved_address.id if saved_address else None,
            customer_name=customer_name,
            phone=phone,
            address=address_text,
            city=city,
            state=state,
            pincode=pincode,
            payment_method=order_data.payment_method,
            payment_status="Pending",
            delivery_type=order_data.delivery_type,
            delivery_distance=order_data.delivery_distance,
            delivery_time=order_data.delivery_time,
            delivery_charge=round_money(delivery_charge),
            product_amount=float(subtotal),
            discount=round_money(discount),
            tax_amount=round_money(tax_amount),
            platform_fee=round_money(platform_fee),
            total_amount=round_money(total_amount),
            status="Order Confirmed",
            stock_reserved=False,
        )

        db.add(new_order)
        db.flush()

        for item_data in prepared_items:
            db.add(
                OrderItem(
                    order_id=new_order.id,
                    **item_data,
                )
            )

        db.commit()
        db.refresh(new_order)

        return serialize_order(new_order, db)

    except HTTPException:
        db.rollback()
        raise

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to create order.",
        ) from error


# ---------------------------------------------------------
# GET ALL ORDERS FOR CURRENT USER
# ---------------------------------------------------------

@router.get("/")
@router.get("", include_in_schema=False)
def get_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    orders = (
        db.query(Order)
        .filter(Order.user_id == current_user.id)
        .order_by(Order.id.desc())
        .all()
    )

    return [
        serialize_order(order, db)
        for order in orders
    ]


# ---------------------------------------------------------
# GET ORDER BY ORDER ID
# ---------------------------------------------------------

@router.get("/{order_id}")
def get_order(
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

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found.",
        )

    return serialize_order(order, db)


# ---------------------------------------------------------
# CANCEL ORDER
# ---------------------------------------------------------

@router.patch("/{order_id}/cancel")
def cancel_order(
    order_id: str,
    data: OrderCancelRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = (
        db.query(Order)
        .filter(
            Order.order_id == order_id,
            Order.user_id == current_user.id,
        )
        .with_for_update()
        .first()
    )

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found.",
        )

    current_status = (order.status or "").strip().lower()

    if current_status == "cancelled":
        return {
            "order_id": order.order_id,
            "status": order.status,
            "cancellation_reason": order.cancellation_reason,
            "cancelled_at": order.cancelled_at,
        }

    allowed_statuses = {
        "pending",
        "confirmed",
        "order confirmed",
    }

    if current_status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This order can no longer be cancelled.",
        )

    order.status = "Cancelled"
    order.cancellation_reason = data.reason.strip()
    order.cancelled_at = datetime.now(timezone.utc)

    # Restore reserved product stock if applicable.
    if order.stock_reserved:
        items = (
            db.query(OrderItem)
            .filter(OrderItem.order_id == order.id)
            .all()
        )

        for item in items:
            product = (
                db.query(Product)
                .filter(Product.id == item.product_id)
                .with_for_update()
                .first()
            )

            if product is not None:
                product.stock = (product.stock or 0) + item.quantity

        order.stock_reserved = False

    db.commit()
    db.refresh(order)

    return {
        "order_id": order.order_id,
        "status": order.status,
        "cancellation_reason": order.cancellation_reason,
        "cancelled_at": order.cancelled_at,
    }


# ---------------------------------------------------------
# TRACK ORDER
# ---------------------------------------------------------

@router.get("/{order_id}/track")
def track_order(
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

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found.",
        )

    return {
        "order_id": order.order_id,
        "status": order.status,
        "created_at": order.created_at,
        "delivery_type": order.delivery_type,
        "delivery_time": order.delivery_time,
    }
