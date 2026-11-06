from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from typing import Any, Literal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, field_validator
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.database.database import get_db
from app.models.address import Address
from app.models.cart_item import CartItem
from app.models.coupon import Coupon
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.services.coupons import calculate_coupon_discount

router = APIRouter(
    prefix="/api/checkout",
    tags=["Checkout"],
)


@router.get("/config")
def get_checkout_config():
    return {
        "tax_rate_percent": settings.GST_RATE_PERCENT,
        "payment_mode": settings.PAYMENT_MODE,
        "razorpay_enabled": bool(
            settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET
        ),
        "free_delivery_threshold": settings.FREE_DELIVERY_THRESHOLD,
        "standard_delivery_charge": settings.STANDARD_DELIVERY_CHARGE,
        "express_delivery_minimum": settings.EXPRESS_DELIVERY_MINIMUM,
        "express_delivery_charge": settings.EXPRESS_DELIVERY_CHARGE,
        "same_day_delivery_minimum": settings.SAME_DAY_DELIVERY_MINIMUM,
        "same_day_delivery_charge": settings.SAME_DAY_DELIVERY_CHARGE,
    }


# -------------------- REQUEST SCHEMAS --------------------

class ShippingAddress(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    phone: str = Field(min_length=10, max_length=15, pattern=r"^\d{10}$")
    address: str = Field(min_length=3, max_length=255)
    city: str = Field(min_length=2, max_length=100)
    state: str = Field(min_length=2, max_length=100)
    pincode: str = Field(min_length=6, max_length=10, pattern=r"^\d{6}$")

    @field_validator(
        "name",
        "phone",
        "address",
        "city",
        "state",
        "pincode",
        mode="before",
    )
    @classmethod
    def strip_address_values(cls, value: Any) -> Any:
        return value.strip() if isinstance(value, str) else value


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
    coupon_code: str | None = Field(default=None, min_length=3, max_length=50)
    remove_from_cart: bool = True


# -------------------- HELPERS --------------------

def get_product_price(product: Product) -> Decimal:
    """Read the price from the existing Product model."""
    discounted = getattr(product, "discounted_price", None)

    if discounted is None:
        discounted = getattr(product, "discount_price", None)

    price = discounted if discounted is not None else getattr(
        product, "price", 0
    )

    try:
        amount = Decimal(str(price))
    except (ArithmeticError, TypeError, ValueError):
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


def money(value: Decimal) -> Decimal:
    return value.quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP,
    )


def product_to_dict(cart_item, product):
    price = get_product_price(product)

    return {
        "id": cart_item.id,
        "cart_item_id": cart_item.id,
        "product_id": product.id,
        "name": (
            getattr(product, "name", None)
            or getattr(product, "title", None)
            or "Healthcare Product"
        ),
        "title": getattr(product, "name", None),
        "brand": "",
        "category": (
            product.category.name if product.category else ""
        ),
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
    db: Session = Depends(get_db),
):
    address_data = payload.model_dump(
        exclude={"addressMode", "deliveryDistance"}
    )
    existing = (
        db.query(Address)
        .filter(
            Address.user_id == current_user.id,
            Address.full_name == address_data["name"],
            Address.phone == address_data["phone"],
            Address.address_line1 == address_data["address"],
            Address.city == address_data["city"],
            Address.state == address_data["state"],
            Address.pincode == address_data["pincode"],
        )
        .first()
    )

    if existing is None:
        existing = Address(
            user_id=current_user.id,
            full_name=address_data["name"],
            phone=address_data["phone"],
            address_line1=address_data["address"],
            city=address_data["city"],
            state=address_data["state"],
            pincode=address_data["pincode"],
        )
        db.add(existing)
        try:
            db.commit()
        except Exception:
            db.rollback()
            raise
        db.refresh(existing)

    return {
        "message": "Delivery address saved.",
        "address": {
            "id": existing.id,
            **address_data,
        },
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

    products = {}
    for product_id, quantity in quantities.items():
        product = (
            db.query(Product)
            .filter(Product.id == product_id)
            .with_for_update()
            .first()
        )

        if product is None:
            raise HTTPException(
                status_code=404,
                detail=f"Product {product_id} was not found.",
            )
        if not product.is_active:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"{product.name} is no longer available.",
            )
        if product.stock < quantity:
            unit_label = "unit" if product.stock == 1 else "units"
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    f"Only {product.stock} {unit_label} of "
                    f"{product.name} are in stock."
                ),
            )

        products[product_id] = product
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
    coupon_discount = Decimal("0.00")
    coupon = None
    if payload.coupon_code:
        coupon = (
            db.query(Coupon)
            .filter(Coupon.code == payload.coupon_code.strip().upper())
            .with_for_update()
            .first()
        )
        if coupon is None:
            raise HTTPException(
                status_code=404,
                detail="Coupon not found.",
            )
        try:
            coupon_discount = calculate_coupon_discount(coupon, subtotal)
        except ValueError as error:
            raise HTTPException(
                status_code=422,
                detail=str(error),
            ) from error
        discount = min(subtotal, discount + coupon_discount)
        discount = money(discount)

    if payload.delivery_type == "express":
        if subtotal < Decimal(str(settings.EXPRESS_DELIVERY_MINIMUM)):
            raise HTTPException(
                status_code=400,
                detail=(
                    "Express delivery requires an order of at least "
                    f"₹{settings.EXPRESS_DELIVERY_MINIMUM:g}."
                ),
            )
        delivery_charge = Decimal(str(settings.EXPRESS_DELIVERY_CHARGE))

    elif payload.delivery_type == "today":
        if subtotal < Decimal(str(settings.SAME_DAY_DELIVERY_MINIMUM)):
            raise HTTPException(
                status_code=400,
                detail=(
                    "Today delivery requires an order of at least "
                    f"₹{settings.SAME_DAY_DELIVERY_MINIMUM:g}."
                ),
            )
        delivery_charge = Decimal(str(settings.SAME_DAY_DELIVERY_CHARGE))

    else:
        delivery_charge = (
            Decimal("0.00")
            if subtotal >= Decimal(str(settings.FREE_DELIVERY_THRESHOLD))
            else Decimal(str(settings.STANDARD_DELIVERY_CHARGE))
        )

    taxable_amount = max(Decimal("0.00"), subtotal - discount)
    tax_amount = money(
        taxable_amount * Decimal(str(settings.GST_RATE_PERCENT)) / Decimal("100")
    )
    total = money(taxable_amount + tax_amount + delivery_charge)

    address = payload.shipping_address
    order_id = f"MK{datetime.now(timezone.utc):%Y%m%d%H%M%S%f}"
    order = Order(
        order_id=order_id,
        user_id=current_user.id,
        customer_name=address.name,
        phone=address.phone,
        address=address.address,
        city=address.city,
        state=address.state,
        pincode=address.pincode,
        payment_method=payload.payment_method,
        delivery_type=payload.delivery_type,
        delivery_distance=payload.delivery_distance,
        delivery_charge=float(delivery_charge),
        product_amount=float(subtotal),
        discount=float(discount),
        tax_amount=float(tax_amount),
        platform_fee=0,
        total_amount=float(total),
        status="Order Confirmed",
        stock_reserved=True,
    )

    try:
        db.add(order)
        db.flush()  # Obtain order.id before adding order items.

        for line in order_lines:
            product = products[line["product_id"]]
            product.stock -= line["quantity"]
            order_item = OrderItem(
                order_id=order.id,
                product_id=line["product_id"],
                product_name=product.name,
                quantity=line["quantity"],
                price=float(line["unit_price"]),
                total=float(line["line_total"]),
                image=product.image,
            )
            db.add(order_item)

        if coupon is not None:
            coupon.usage_count += 1

        if payload.remove_from_cart:
            # Cart checkout clears purchased products; Buy Now leaves the cart unchanged.
            (
                db.query(CartItem)
                .filter(
                    CartItem.user_id == current_user.id,
                    CartItem.product_id.in_(quantities.keys()),
                )
                .delete(synchronize_session=False)
            )

        db.commit()
        db.refresh(order)

    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Order conflicts with existing data.",
        ) from error
    except Exception:
        db.rollback()
        raise

    return {
        "message": "Order created successfully.",
        "order": {
            "id": order.id,
            "order_id": getattr(order, "order_id", None) or order.id,
            "total_amount": float(total),
            "status": getattr(order, "status", "Pending"),
            "payment_method": payload.payment_method,
            "items": [
                {
                    "product_id": line["product_id"],
                    "quantity": line["quantity"],
                    "price": float(line["unit_price"]),
                    "total": float(line["line_total"]),
                }
                for line in order_lines
            ],
            "subtotal": float(subtotal),
            "discount": float(discount),
            "coupon_discount": float(coupon_discount),
            "tax_amount": float(tax_amount),
            "tax_rate_percent": settings.GST_RATE_PERCENT,
            "delivery_charge": float(delivery_charge),
        },
    }