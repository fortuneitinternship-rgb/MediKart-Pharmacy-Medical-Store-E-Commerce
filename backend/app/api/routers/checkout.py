import json
from decimal import Decimal, ROUND_HALF_UP
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.api.routers.auth import get_current_user
from app.models.cart_item import CartItem
from app.models.product import Product
from app.models.order import Order, OrderItem


router = APIRouter(
    prefix="/api/checkout",
    tags=["Checkout"],
)


# -------------------- REQUEST SCHEMAS --------------------

class ShippingAddress(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    phone: str = Field(pattern=r"^\d{10}$")
    address: str = Field(min_length=1, max_length=500)
    city: str = Field(min_length=1, max_length=100)
    state: str = Field(min_length=1, max_length=100)
    pincode: str = Field(pattern=r"^\d{6}$")


class CheckoutAddressRequest(ShippingAddress):
    addressMode: str = "form"
    deliveryDistance: Literal["short", "medium", "long"] = "short"


class CheckoutItemRequest(BaseModel):
    product_id: int = Field(gt=0)
    quantity: int = Field(gt=0, le=100)


class CheckoutOrderRequest(BaseModel):
    items: list[CheckoutItemRequest] = Field(min_length=1)
    shipping_address: ShippingAddress
    payment_method: Literal["COD", "CARD", "NETBANKING"]
    delivery_type: Literal["normal", "express", "today"] = "normal"
    delivery_distance: Literal["short", "medium", "long"] = "short"


# -------------------- HELPERS --------------------

def get_product_price(product):
    """Read the price from the existing Product model."""
    discounted = getattr(product, "discounted_price", None)

    if discounted is None:
        discounted = getattr(product, "discount_price", None)

    price = discounted if discounted is not None else getattr(
        product, "price", 0
    )

    try:
        amount = Decimal(str(price))
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="A product has an invalid price.",
        )

    if not amount.is_finite() or amount < 0:
        raise HTTPException(
            status_code=500,
            detail="A product has an invalid price.",
        )

    return amount.quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP,
    )


def money(value):
    return value.quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP,
    )


def product_to_dict(cart_item, product):
    price = get_product_price(product)

    return {
        # Cart item ID and product ID are different identifiers.
        "id": product.id,
        "cart_item_id": cart_item.id,
        "product_id": product.id,
        "name": (
            getattr(product, "name", None)
            or getattr(product, "title", None)
            or "Healthcare Product"
        ),
        "title": getattr(product, "title", None),
        "brand": getattr(product, "brand", None),
        "category": getattr(product, "category", None),
        "price": float(price),
        "discountedPrice": float(price),
        "discounted_price": float(price),
        "image": (
            getattr(product, "image_url", None)
            or getattr(product, "image", None)
            or ""
        ),
        "quantity": cart_item.quantity,
    }


def get_owned_cart_item(db, user_id, cart_item_id):
    item = (
        db.query(CartItem)
        .filter(
            CartItem.id == cart_item_id,
            CartItem.user_id == user_id,
        )
        .first()
    )

    if item is None:
        raise HTTPException(
            status_code=404,
            detail="Cart item not found.",
        )

    return item


# -------------------- GET CART FOR CHECKOUT --------------------

@router.get("/cart")
def get_checkout_cart(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    cart_items = (
        db.query(CartItem)
        .filter(CartItem.user_id == current_user.id)
        .all()
    )

    results = []

    for cart_item in cart_items:
        product = (
            db.query(Product)
            .filter(Product.id == cart_item.product_id)
            .first()
        )

        if product is None:
            continue

        results.append(product_to_dict(cart_item, product))

    return {
        "items": results,
        "count": sum(item["quantity"] for item in results),
    }


# -------------------- SAVE / VALIDATE ADDRESS --------------------

@router.post("/address")
def save_checkout_address(
    payload: CheckoutAddressRequest,
    current_user=Depends(get_current_user),
):
    # This endpoint validates the address and returns it to React.
    # React also stores it in localStorage. This does not insert it
    # into a database addresses table.
    return {
        "message": "Delivery address validated.",
        "user_id": current_user.id,
        "address": payload.model_dump(),
    }


# -------------------- CREATE ORDER --------------------

@router.post("/orders", status_code=status.HTTP_201_CREATED)
def create_checkout_order(
    payload: CheckoutOrderRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # Combine duplicate product IDs to prevent duplicate lines.
    quantities = {}

    for item in payload.items:
        quantities[item.product_id] = (
            quantities.get(item.product_id, 0) + item.quantity
        )

    # Calculate prices using the database, not frontend totals.
    order_lines = []
    subtotal = Decimal("0.00")

    for product_id, quantity in quantities.items():
        product = (
            db.query(Product)
            .filter(Product.id == product_id)
            .first()
        )

        if product is None:
            raise HTTPException(
                status_code=404,
                detail=f"Product {product_id} was not found.",
            )

        unit_price = get_product_price(product)
        line_total = money(unit_price * quantity)
        subtotal += line_total

        order_lines.append({
            "product_id": product_id,
            "quantity": quantity,
            "unit_price": unit_price,
            "line_total": line_total,
        })

    subtotal = money(subtotal)

    # These are example checkout rules. Keep them consistent with
    # the pricing rules that your store intends to enforce.
    discount = money(subtotal * Decimal("0.10"))

    if payload.delivery_type == "express":
        if subtotal < Decimal("299"):
            raise HTTPException(
                status_code=400,
                detail="Express delivery requires an order of at least ₹299.",
            )
        delivery_charge = Decimal("49.00")

    elif payload.delivery_type == "today":
        if subtotal < Decimal("999"):
            raise HTTPException(
                status_code=400,
                detail="Today delivery requires an order of at least ₹999.",
            )
        delivery_charge = Decimal("99.00")

    else:
        delivery_charge = (
            Decimal("0.00")
            if subtotal >= Decimal("499")
            else Decimal("10.00")
        )

    total = money(subtotal - discount + delivery_charge)

    # IMPORTANT:
    # The following constructor fields must exist in your current
    # Order model. Adapt these names if your model differs.
    order = Order(
        user_id=current_user.id,
        total_amount=float(total),
        status="Pending",
        payment_method=payload.payment_method,
        shipping_address=json.dumps(
            payload.shipping_address.model_dump()
        ),
    )

    try:
        db.add(order)
        db.flush()  # Obtain order.id before adding order items.

        for line in order_lines:
            # These fields must match your existing OrderItem model.
            order_item = OrderItem(
                order_id=order.id,
                product_id=line["product_id"],
                quantity=line["quantity"],
                price=float(line["unit_price"]),
            )
            db.add(order_item)

        # Clear only the current user's cart, after creating order lines.
        (
            db.query(CartItem)
            .filter(CartItem.user_id == current_user.id)
            .delete(synchronize_session=False)
        )

        db.commit()
        db.refresh(order)

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=(
                "Could not save the order. Check that the Order and "
                "OrderItem fields match your database models."
            ),
        )

    return {
        "message": "Order created successfully.",
        "order": {
            "id": order.id,
            "order_id": getattr(order, "order_id", None) or order.id,
            "total_amount": float(total),
            "status": getattr(order, "status", "Pending"),
            "payment_method": payload.payment_method,
            "subtotal": float(subtotal),
            "discount": float(discount),
            "delivery_charge": float(delivery_charge),
        },
    }