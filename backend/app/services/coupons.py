from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP

from app.models.coupon import Coupon


CENT = Decimal("0.01")


def _as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def calculate_coupon_discount(
    coupon: Coupon,
    order_amount: Decimal,
    now: datetime | None = None,
) -> Decimal:
    current_time = now or datetime.now(timezone.utc)
    if not coupon.is_active:
        raise ValueError("This coupon is inactive.")
    if coupon.starts_at and _as_utc(current_time) < _as_utc(coupon.starts_at):
        raise ValueError("This coupon is not active yet.")
    if coupon.ends_at and _as_utc(current_time) > _as_utc(coupon.ends_at):
        raise ValueError("This coupon has expired.")
    if (
        coupon.usage_limit is not None
        and coupon.usage_count >= coupon.usage_limit
    ):
        raise ValueError("This coupon has reached its usage limit.")

    minimum_amount = Decimal(str(coupon.minimum_order_amount))
    if order_amount < minimum_amount:
        raise ValueError(
            f"Minimum order amount for this coupon is {minimum_amount:.2f}."
        )

    value = Decimal(str(coupon.discount_value))
    if coupon.discount_type == "percent":
        discount = order_amount * value / Decimal("100")
    else:
        discount = value
    if coupon.maximum_discount is not None:
        discount = min(discount, Decimal(str(coupon.maximum_discount)))

    return min(order_amount, discount).quantize(CENT, rounding=ROUND_HALF_UP)
