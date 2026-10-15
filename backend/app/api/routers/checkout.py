
from typing import List, Literal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.models.product import Product
from app.models.order import Order
from app.models.order_item import OrderItem

# IMPORTANT:
# Import get_db from the actual module used by your existing
# orders.py or products.py router. Do not guess this import.
from app.database.database import get_db


router = APIRouter(prefix="/checkout", tags=["Checkout"])


# -------------------------
# Request schemas
# -------------------------

class CheckoutItem(BaseModel):
    product_id: int = Field(gt=0)
    quantity: int = Field(ge=1, le=100)


class ShippingAddress(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    phone: str = Field(pattern=r"^\d{10}$")
    address: str = Field(min_length=1, max_length=500)
    city: str = Field(min_length=1, max_length=100)
    state: str = Field(min_length=1, max_length=100)
    pincode: str = Field(pattern=r"^\d{6}$")


class CheckoutCreate(BaseModel):
    items: List[CheckoutItem] = Field(min_length=1)
    shipping_address: ShippingAddress
    payment_method: Literal["CARD", "NETBANKING", "COD"]
    delivery_type: Literal["standard", "express", "today"]


# -------------------------
# Create an order
# -------------------------

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_checkout_order(
    payload: CheckoutCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        subtotal = 0.0
        validated_items = []

        # Verify every product using the database.
        for item in payload.items:
            product = (
                db.query(Product)
                .filter(Product.id == item.product_id)
                .first()
            )

            if product is None:
                raise HTTPException(
                    status_code=404,
                    detail=f"Product {item.product_id} was not found",
                )

            # Adjust these price fields to match your Product model.
            unit_price = getattr(product, "discounted_price", None)
            if unit_price is None:
                unit_price = getattr(product, "price", None)

            if unit_price is None:
                raise HTTPException(
                    status_code=500,
                    detail="Product price is not configured",
                )

            unit_price = float(unit_price)

            if unit_price < 0:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid product price",
                )

            line_total = unit_price * item.quantity
            subtotal += line_total

            validated_items.append({
                "product_id": product.id,
                "quantity": item.quantity,
                "price": unit_price,
            })

        # Calculate fees on the backend rather than trusting the client.
        discount = round(subtotal * 0.10, 2)
        delivery_fee = 0.0 if subtotal >= 499 else 10.0

        if payload.delivery_type == "express":
            delivery_fee += 49.0
        elif payload.delivery_type == "today":
            delivery_fee += 99.0

        total = round(subtotal - discount + delivery_fee, 2)

        # Adjust the fields below to match your Order model.
        order = Order(
            user_id=current_user.id,
            total_amount=total,
            status="pending",
            payment_method=payload.payment_method,
            shipping_address=payload.shipping_address.model_dump(),
        )

        db.add(order)
        db.flush()

        # Adjust field names to match your OrderItem model.
        for item in validated_items:
            order_item = OrderItem(
                order_id=order.id,
                product_id=item["product_id"],
                quantity=item["quantity"],
                price=item["price"],
            )
            db.add(order_item)

        db.commit()
        db.refresh(order)

        return {
            "message": "Order placed successfully",
            "order_id": order.id,
            "status": order.status,
            "subtotal": round(subtotal, 2),
            "discount": discount,
            "delivery_fee": round(delivery_fee, 2),
            "total_amount": total,
            "payment_method": payload.payment_method,
        }

    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to create order. Check the backend model fields and database logs.",
        )


# -------------------------
# Get the logged-in user's orders
# -------------------------

@router.get("/")
def get_checkout_orders(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    orders = (
        db.query(Order)
        .filter(Order.user_id == current_user.id)
        .order_by(Order.id.desc())
        .all()
    )

    return [
        {
            "order_id": order.id,
            "status": order.status,
            "total_amount": order.total_amount,
            "payment_method": order.payment_method,
        }
        for order in orders
    ]
