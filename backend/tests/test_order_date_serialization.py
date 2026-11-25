from datetime import datetime, timezone

from app.schemas.order import OrderResponse


def test_order_response_exposes_created_at_for_order_tracking():
    created_at = datetime(2026, 11, 10, 10, 0, tzinfo=timezone.utc)

    order = OrderResponse(
        id=1,
        order_id="MKTEST001",
        customer_name="Test Customer",
        phone="9999999999",
        address="Test Road",
        city="Hyderabad",
        state="Telangana",
        pincode="500001",
        payment_method="COD",
        delivery_type="normal",
        delivery_distance="short",
        delivery_charge=0,
        product_amount=100,
        discount=0,
        platform_fee=0,
        total_amount=100,
        status="Order Confirmed",
        created_at=created_at,
        items=[],
    )

    response = order.model_dump(mode="json")

    assert response["created_at"] is not None
    assert response["created_at"].startswith("2026-11-10T10:00:00")
