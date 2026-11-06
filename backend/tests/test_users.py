import os
import tempfile
from datetime import date, datetime
from pathlib import Path

import pytest
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.engine import URL

_test_directory = tempfile.TemporaryDirectory()
os.environ["DATABASE_URL"] = URL.create(
    "sqlite", database=os.path.join(_test_directory.name, "users-tests.db")
).render_as_string(hide_password=False)
os.environ["SECRET_KEY"] = "test-profile-secret"

from fastapi.testclient import TestClient

from app.api.routers import login as login_router
from app.core.security import create_access_token
from app.core.config import settings
from app.database.database import (
    BACKEND_DIR,
    Base,
    SessionLocal,
    create_database_engine,
    engine,
)
from app.main import app
from app.models.address import Address
from app.models.cart_item import CartItem
from app.models.category import Category
from app.models.coupon import Coupon
from app.models.opt import EmailOTP
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.return_request import ReturnRequest
from app.models.submission import (
    ContactMessage,
    HealthRecord,
    OrderFeedback,
    Prescription,
    ProductReview,
)
from app.models.newsletter import Newsletter
from app.models.wishlist import Wishlist
from app.models.user import User
from app.scripts.seed_product_catalog import (
    ensure_catalog_schema,
    is_placeholder_image,
    seed_catalog,
)


@pytest.fixture
def users():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        first = User(
            name="First User",
            email="first@example.com",
            hashed_password="private-hash-one",
        )
        second = User(
            name="Second User",
            email="second@example.com",
            phone="+14155550100",
            hashed_password="private-hash-two",
        )
        db.add_all([first, second])
        db.commit()
        db.refresh(first)
        db.refresh(second)
        return {
            "first_id": first.id,
            "second_id": second.id,
            "first_token": create_access_token({"sub": str(first.id)}),
        }


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client
    engine.dispose()


def auth(token):
    return {"Authorization": f"Bearer {token}"}


def test_get_profile_requires_authentication(client, users):
    assert client.get("/api/users/me").status_code == 401


def test_relative_sqlite_url_resolves_from_backend_directory():
    test_engine = create_database_engine("sqlite:///relative-database-test.db")
    try:
        assert Path(test_engine.url.database) == (
            BACKEND_DIR / "relative-database-test.db"
        ).resolve()
    finally:
        test_engine.dispose()


def test_in_memory_sqlite_url_is_not_resolved_to_a_file():
    test_engine = create_database_engine("sqlite://")
    try:
        assert test_engine.url.database is None
    finally:
        test_engine.dispose()


def test_get_profile_returns_safe_fields_only(client, users):
    response = client.get("/api/users/me", headers=auth(users["first_token"]))
    assert response.status_code == 200
    assert set(response.json()) == {
        "id", "full_name", "email", "phone", "address", "profile_image",
        "is_active", "created_at", "updated_at",
    }
    assert "hashed_password" not in response.json()
    assert response.json()["full_name"] == "First User"


def test_missing_user_returns_404(client, users):
    token = create_access_token({"sub": "999999"})
    response = client.get("/api/users/me", headers=auth(token))
    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"


def test_update_persists_editable_fields(client, users):
    response = client.put(
        "/api/users/me",
        headers=auth(users["first_token"]),
        json={
            "full_name": "Updated First",
            "email": "updated@example.com",
            "phone": "4155550101",
            "address": "Updated delivery details",
            "profile_image": "https://example.com/profile.png",
        },
    )
    assert response.status_code == 200
    assert response.json()["full_name"] == "Updated First"
    assert response.json()["email"] == "updated@example.com"
    assert response.json()["phone"] == "4155550101"
    assert response.json()["address"] == "Updated delivery details"
    with SessionLocal() as db:
        stored = db.get(User, users["first_id"])
        assert stored.name == "Updated First"
        assert stored.email == "updated@example.com"
        assert stored.phone == "4155550101"
        assert stored.address == "Updated delivery details"
        assert stored.profile_image == "https://example.com/profile.png"


@pytest.mark.parametrize("full_name", ["", "A", "x" * 101])
def test_invalid_full_name_returns_422(client, users, full_name):
    response = client.put(
        "/api/users/me",
        headers=auth(users["first_token"]),
        json={"full_name": full_name},
    )
    assert response.status_code == 422


@pytest.mark.parametrize("phone", ["letters", "12345", "12345678901234567890"])
def test_invalid_phone_returns_422(client, users, phone):
    response = client.put(
        "/api/users/me",
        headers=auth(users["first_token"]),
        json={"phone": phone},
    )
    assert response.status_code == 422


def test_newsletter_subscription_persists(client, users):
    response = client.post(
        "/api/newsletter/subscribe",
        json={"email": " Newsletter@Example.com "},
    )

    assert response.status_code == 200
    assert response.json() == {
        "message": "Successfully subscribed to newsletter",
        "email": "newsletter@example.com",
    }
    with SessionLocal() as db:
        subscriber = db.query(Newsletter).filter(
            Newsletter.email == "newsletter@example.com"
        ).one()
        assert subscriber.is_active


def test_duplicate_phone_returns_409(client, users):
    response = client.put(
        "/api/users/me",
        headers=auth(users["first_token"]),
        json={"phone": "+1 (415) 555-0100"},
    )
    assert response.status_code == 409


@pytest.mark.parametrize(
    "payload",
    [{"password": "changed"}, {"is_admin": True}],
)
def test_sensitive_fields_are_rejected(client, users, payload):
    response = client.put(
        "/api/users/me", headers=auth(users["first_token"]), json=payload
    )
    assert response.status_code == 422


def test_user_cannot_select_or_edit_another_user(client, users):
    response = client.put(
        "/api/users/me",
        headers=auth(users["first_token"]),
        json={"user_id": users["second_id"], "full_name": "Changed"},
    )
    assert response.status_code == 422
    with SessionLocal() as db:
        assert db.get(User, users["second_id"]).name == "Second User"


def test_register_persists_user_and_login_accepts_email_or_username(client, users):
    registration = client.post(
        "/api/auth/register",
        json={
            "username": "New User",
            "email": "New.User@example.com",
            "password": "secure-pass-123",
            "confirm_password": "secure-pass-123",
        },
    )

    assert registration.status_code == 201
    assert registration.json()["email"] == "new.user@example.com"

    with SessionLocal() as db:
        stored_user = db.query(User).filter_by(email="new.user@example.com").one()
        assert stored_user.name == "New User"
        assert stored_user.hashed_password != "secure-pass-123"

    for identifier in ("new.user@example.com", "New User"):
        response = client.post(
            "/api/auth/login",
            json={"email": identifier, "password": "secure-pass-123"},
        )
        assert response.status_code == 200
        assert response.json()["user"]["username"] == "New User"
        assert response.json()["access_token"]

        headers = auth(response.json()["access_token"])
        current_user = client.get("/api/auth/me", headers=headers)
        assert current_user.status_code == 200
        assert current_user.json()["email"] == "new.user@example.com"
        assert client.get("/api/cart", headers=headers).json() == {"items": []}

    with SessionLocal() as db:
        stored_user = db.query(User).filter_by(email="new.user@example.com").one()
        assert stored_user.last_login is not None


def test_cors_allows_create_react_fallback_port(client):
    response = client.options(
        "/api/auth/login",
        headers={
            "Origin": "http://localhost:3001",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:3001"


def test_cart_add_list_update_remove_and_clear_persist(client, users):
    with SessionLocal() as db:
        category = Category(name="Cart Test")
        db.add(category)
        db.flush()
        product = Product(
            name="Cart Test Product",
            price=100,
            stock=5,
            category=category,
        )
        db.add(product)
        db.commit()
        product_id = product.id

    headers = auth(users["first_token"])
    added = client.post(
        "/api/cart",
        headers=headers,
        json={"product_id": product_id, "quantity": 2},
    )
    assert added.status_code == 201
    cart_item_id = added.json()["id"]
    assert added.json()["product_id"] == product_id
    assert added.json()["name"] == "Cart Test Product"

    listed = client.get("/api/cart", headers=headers)
    assert listed.status_code == 200
    assert listed.json()["items"][0]["quantity"] == 2

    updated = client.put(
        f"/api/cart/{cart_item_id}",
        headers=headers,
        json={"quantity": 3},
    )
    assert updated.status_code == 200
    assert updated.json()["item"]["quantity"] == 3

    with SessionLocal() as db:
        stored = db.query(CartItem).filter_by(
            user_id=users["first_id"],
            product_id=product_id,
        ).one()
        assert stored.quantity == 3

    assert client.delete(
        f"/api/cart/{cart_item_id}",
        headers=headers,
    ).status_code == 200

    client.post(
        "/api/cart",
        headers=headers,
        json={"product_id": product_id, "quantity": 1},
    )
    cleared = client.delete("/api/cart", headers=headers)
    assert cleared.status_code == 200
    assert client.get("/api/cart", headers=headers).json() == {"items": []}


def test_cart_import_is_idempotent(client, users):
    with SessionLocal() as db:
        category = Category(name="Cart Import Test")
        db.add(category)
        db.flush()
        product = Product(
            name="Imported Cart Product",
            category=category,
            price=25,
            stock=20,
        )
        db.add(product)
        db.commit()
        product_id = product.id

    payload = {
        "migration_id": "cart-migration-123",
        "items": [{"product_id": product_id, "quantity": 2}],
    }
    headers = auth(users["first_token"])

    first_import = client.post(
        "/api/cart/import",
        headers=headers,
        json=payload,
    )
    second_import = client.post(
        "/api/cart/import",
        headers=headers,
        json=payload,
    )

    assert first_import.status_code == 200
    assert second_import.status_code == 200
    assert second_import.json()["message"] == "Cart import was already processed."
    assert client.get("/api/cart", headers=headers).json()["items"][0][
        "quantity"
    ] == 2


def test_wishlist_import_is_idempotent(client, users):
    with SessionLocal() as db:
        category = Category(name="Wishlist Import Test")
        db.add(category)
        db.flush()
        product = Product(
            name="Imported Wishlist Product",
            category=category,
            price=25,
            stock=20,
        )
        db.add(product)
        db.commit()
        product_id = product.id

    payload = {
        "migration_id": "wishlist-migration-123",
        "items": [{"product_id": product_id}],
    }
    headers = auth(users["first_token"])
    first_import = client.post(
        "/api/wishlist/import",
        headers=headers,
        json=payload,
    )
    second_import = client.post(
        "/api/wishlist/import",
        headers=headers,
        json=payload,
    )

    assert first_import.status_code == 200
    assert second_import.status_code == 200
    with SessionLocal() as db:
        assert db.query(Wishlist).filter_by(
            user_id=users["first_id"],
            product_id=product_id,
        ).count() == 1


def test_comparison_crud_is_user_scoped_and_limited(client, users):
    with SessionLocal() as db:
        category = Category(name="Comparison Test")
        db.add(category)
        db.flush()
        products = [
            Product(
                name=f"Comparison Product {index}",
                category=category,
                price=25 + index,
                stock=20,
            )
            for index in range(5)
        ]
        db.add_all(products)
        db.commit()
        product_ids = [product.id for product in products]

    headers = auth(users["first_token"])
    added = client.post(
        "/api/compare",
        headers=headers,
        json={"product_id": product_ids[0]},
    )
    duplicate = client.post(
        "/api/compare",
        headers=headers,
        json={"product_id": product_ids[0]},
    )
    assert added.status_code == 201
    assert duplicate.status_code == 201
    assert [item["id"] for item in client.get(
        "/api/compare", headers=headers
    ).json()] == [product_ids[0]]

    for product_id in product_ids[1:4]:
        assert client.post(
            "/api/compare",
            headers=headers,
            json={"product_id": product_id},
        ).status_code == 201

    over_limit = client.post(
        "/api/compare",
        headers=headers,
        json={"product_id": product_ids[4]},
    )
    assert over_limit.status_code == 409
    assert client.delete(
        f"/api/compare/{product_ids[0]}",
        headers=headers,
    ).status_code == 200
    assert client.delete("/api/compare", headers=headers).status_code == 200
    assert client.get("/api/compare", headers=headers).json() == []


def test_coupon_validation_and_checkout_discount(client, users):
    with SessionLocal() as db:
        admin = db.get(User, users["second_id"])
        admin.is_admin = True
        category = Category(name="Coupon Test")
        db.add(category)
        db.flush()
        product = Product(
            name="Coupon Checkout Product",
            category=category,
            price=200,
            discount_price=180,
            stock=20,
        )
        coupon = Coupon(
            code="SAVE20",
            discount_type="fixed",
            discount_value=20,
            minimum_order_amount=100,
            usage_limit=1,
        )
        db.add_all([product, coupon])
        db.commit()
        product_id = product.id
        coupon_id = coupon.id

    validation = client.post(
        "/api/coupons/validate",
        json={"code": "save20", "order_amount": 180},
    )
    assert validation.status_code == 200
    assert validation.json()["discount_amount"] == 20
    assert validation.json()["total_after_discount"] == 160

    order = client.post(
        "/api/checkout/orders",
        headers=auth(users["first_token"]),
        json={
            "items": [{"product_id": product_id, "quantity": 1}],
            "shipping_address": {
                "name": "First User",
                "phone": "4155550100",
                "address": "123 Test Street",
                "city": "Oakland",
                "state": "CA",
                "pincode": "094601",
            },
            "payment_method": "COD",
            "delivery_type": "normal",
            "coupon_code": "SAVE20",
            "remove_from_cart": False,
        },
    )
    assert order.status_code == 201
    assert order.json()["order"]["coupon_discount"] == 20
    assert order.json()["order"]["discount"] == 38
    with SessionLocal() as db:
        assert db.get(Coupon, coupon_id).usage_count == 1

    exhausted = client.post(
        "/api/coupons/validate",
        json={"code": "SAVE20", "order_amount": 180},
    )
    assert exhausted.status_code == 422


def test_checkout_payment_receipt_is_owned_and_cod_is_not_marked_paid(client, users):
    with SessionLocal() as db:
        category = Category(name="Payment Checkout")
        db.add(category)
        db.flush()
        product = Product(
            name="Payment Checkout Product",
            category=category,
            price=100,
            discount_price=100,
            stock=20,
        )
        db.add(product)
        db.commit()
        product_id = product.id

    order_response = client.post(
        "/api/checkout/orders",
        headers=auth(users["first_token"]),
        json={
            "items": [{"product_id": product_id, "quantity": 1}],
            "shipping_address": {
                "name": "First User",
                "phone": "4155550100",
                "address": "123 Test Street",
                "city": "Oakland",
                "state": "CA",
                "pincode": "094601",
            },
            "payment_method": "COD",
            "delivery_type": "normal",
            "remove_from_cart": False,
        },
    )
    assert order_response.status_code == 201
    order_id = order_response.json()["order"]["order_id"]

    receipt = client.post(
        "/api/payments/process",
        headers=auth(users["first_token"]),
        json={"order_id": order_id, "method": "COD"},
    )
    assert receipt.status_code == 200
    assert receipt.json()["status"] == "Pending"
    assert receipt.json()["transaction_id"] is None
    assert receipt.json()["amount"] == 100

    saved_receipt = client.get(
        f"/api/payments/order/{order_id}",
        headers=auth(users["first_token"]),
    )
    assert saved_receipt.status_code == 200
    assert saved_receipt.json() == receipt.json()

    unauthorized_receipt = client.get(
        f"/api/payments/order/{order_id}",
        headers=auth(create_access_token({"sub": str(users["second_id"])})),
    )
    assert unauthorized_receipt.status_code == 404

    mismatched_method = client.post(
        "/api/payments/process",
        headers=auth(users["first_token"]),
        json={"order_id": order_id, "method": "CARD"},
    )
    assert mismatched_method.status_code == 409


def test_card_payment_receipt_returns_simulated_transaction(client, users):
    with SessionLocal() as db:
        category = Category(name="Card Payment")
        db.add(category)
        db.flush()
        product = Product(
            name="Card Payment Product",
            category=category,
            price=100,
            discount_price=100,
            stock=20,
        )
        db.add(product)
        db.commit()
        product_id = product.id

    order_response = client.post(
        "/api/checkout/orders",
        headers=auth(users["first_token"]),
        json={
            "items": [{"product_id": product_id, "quantity": 1}],
            "shipping_address": {
                "name": "First User",
                "phone": "4155550100",
                "address": "123 Test Street",
                "city": "Oakland",
                "state": "CA",
                "pincode": "094601",
            },
            "payment_method": "CARD",
            "delivery_type": "normal",
            "remove_from_cart": False,
        },
    )
    order_id = order_response.json()["order"]["order_id"]
    receipt = client.post(
        "/api/payments/process",
        headers=auth(users["first_token"]),
        json={"order_id": order_id, "method": "CARD"},
    )

    assert receipt.status_code == 200
    assert receipt.json()["status"] == "Simulated"
    assert receipt.json()["transaction_id"].startswith("TXN-")
    assert receipt.json()["amount"] == 100


def test_admin_can_create_update_list_and_deactivate_coupons(client, users):
    with SessionLocal() as db:
        db.get(User, users["second_id"]).is_admin = True
        db.commit()
    headers = auth(create_access_token({"sub": str(users["second_id"])}))

    created = client.post(
        "/api/coupons",
        headers=headers,
        json={
            "code": "spring10",
            "discount_type": "percent",
            "discount_value": 10,
            "minimum_order_amount": 50,
        },
    )
    assert created.status_code == 201
    coupon_id = created.json()["id"]
    assert created.json()["code"] == "SPRING10"

    updated = client.put(
        f"/api/coupons/{coupon_id}",
        headers=headers,
        json={"discount_value": 15},
    )
    assert updated.status_code == 200
    assert updated.json()["discount_value"] == 15
    assert len(client.get("/api/coupons/admin", headers=headers).json()) == 1

    deactivated = client.delete(
        f"/api/coupons/{coupon_id}",
        headers=headers,
    )
    assert deactivated.status_code == 204
    assert client.get("/api/coupons").json() == []


def test_return_request_lifecycle_is_owned_and_admin_managed(client, users):
    with SessionLocal() as db:
        db.get(User, users["second_id"]).is_admin = True
        order = Order(
            order_id="MK-RETURN-001",
            user_id=users["first_id"],
            customer_name="First User",
            phone="4155550100",
            address="123 Test Street",
            city="Oakland",
            state="CA",
            pincode="94601",
            payment_method="COD",
            delivery_type="normal",
            delivery_distance="short",
            total_amount=50,
            status="Delivered",
        )
        db.add(order)
        db.commit()
        order_id = order.order_id

    created = client.post(
        "/api/returns",
        headers=auth(users["first_token"]),
        json={"order_id": order_id, "reason": "The package was damaged."},
    )
    assert created.status_code == 201
    request_id = created.json()["id"]
    assert created.json()["status"] == "Requested"
    assert client.get(
        "/api/returns",
        headers=auth(create_access_token({"sub": str(users["second_id"])})),
    ).json() == []

    admin_headers = auth(create_access_token({"sub": str(users["second_id"])}))
    approved = client.patch(
        f"/api/returns/admin/{request_id}",
        headers=admin_headers,
        json={"status": "Approved", "admin_note": "Return approved."},
    )
    assert approved.status_code == 200
    refunded = client.patch(
        f"/api/returns/admin/{request_id}",
        headers=admin_headers,
        json={"status": "Refunded", "admin_note": "Refund processed."},
    )
    assert refunded.status_code == 200
    assert refunded.json()["status"] == "Refunded"

    with SessionLocal() as db:
        assert db.query(ReturnRequest).filter_by(
            id=request_id,
            user_id=users["first_id"],
        ).one().status == "Refunded"


def test_admin_dashboard_and_sales_report_are_available(client, users):
    with SessionLocal() as db:
        admin = db.get(User, users["second_id"])
        admin.is_admin = True
        order = Order(
            order_id="MK-REPORT-001",
            user_id=users["first_id"],
            customer_name="First User",
            phone="4155550100",
            address="123 Test Street",
            city="Oakland",
            state="CA",
            pincode="94601",
            payment_method="COD",
            delivery_type="normal",
            delivery_distance="short",
            total_amount=115,
            status="Delivered",
            created_at=datetime.combine(date.today(), datetime.min.time()),
        )
        db.add(order)
        db.commit()

    headers = auth(create_access_token({"sub": str(users["second_id"])}))
    dashboard = client.get("/api/admin/dashboard", headers=headers)
    assert dashboard.status_code == 200
    assert dashboard.json()["metrics"]["orders_count"] == 1
    assert dashboard.json()["metrics"]["gross_sales"] == 115

    report = client.get(
        "/api/admin/reports/sales",
        headers=headers,
        params={
            "start_date": date.today().isoformat(),
            "end_date": date.today().isoformat(),
        },
    )
    assert report.status_code == 200
    assert report.json()["orders_count"] == 1
    assert report.json()["daily"][0]["sales"] == 115


def test_admin_order_management_lists_and_transitions_orders(client, users):
    with SessionLocal() as db:
        db.get(User, users["second_id"]).is_admin = True
        order = Order(
            order_id="MK-ADMIN-001",
            user_id=users["first_id"],
            customer_name="First User",
            phone="4155550100",
            address="123 Test Street",
            city="Oakland",
            state="CA",
            pincode="94601",
            payment_method="COD",
            delivery_type="normal",
            delivery_distance="short",
            total_amount=50,
            status="Order Confirmed",
        )
        db.add(order)
        db.commit()

    headers = auth(create_access_token({"sub": str(users["second_id"])}))
    listed = client.get("/api/admin/orders", headers=headers)
    assert listed.status_code == 200
    assert listed.json()[0]["order_id"] == "MK-ADMIN-001"

    processing = client.patch(
        "/api/admin/orders/MK-ADMIN-001/status",
        headers=headers,
        json={"status": "Processing"},
    )
    assert processing.status_code == 200
    shipped = client.patch(
        "/api/admin/orders/MK-ADMIN-001/status",
        headers=headers,
        json={"status": "Shipped"},
    )
    assert shipped.status_code == 200
    invalid = client.patch(
        "/api/admin/orders/MK-ADMIN-001/status",
        headers=headers,
        json={"status": "Cancelled"},
    )
    assert invalid.status_code == 409


def test_admin_product_image_upload_validates_and_persists_file(
    client, users, tmp_path, monkeypatch
):
    monkeypatch.setattr(settings, "UPLOAD_DIR", tmp_path)
    with SessionLocal() as db:
        admin = db.get(User, users["second_id"])
        admin.is_admin = True
        category = Category(name="Product Upload Test")
        db.add(category)
        db.flush()
        product = Product(
            name="Image Upload Product",
            category=category,
            price=25,
            stock=20,
        )
        db.add(product)
        db.commit()
        product_id = product.id

    image_bytes = b"\x89PNG\r\n\x1a\n" + b"test-image-data"
    response = client.post(
        f"/api/uploads/products/{product_id}",
        headers=auth(create_access_token({"sub": str(users["second_id"])})),
        files={"file": ("product.png", image_bytes, "image/png")},
    )
    assert response.status_code == 201
    image_url = response.json()["image_url"]
    assert image_url.startswith("/uploads/products/")
    assert (tmp_path / "products" / image_url.rsplit("/", 1)[-1]).read_bytes() == image_bytes

    with SessionLocal() as db:
        assert db.get(Product, product_id).image == image_url

    rejected = client.post(
        f"/api/uploads/products/{product_id}",
        headers=auth(create_access_token({"sub": str(users["second_id"])})),
        files={"file": ("script.png", b"<script>", "image/png")},
    )
    assert rejected.status_code == 415


def test_checkout_saves_address_and_order_then_clears_cart(client, users):
    with SessionLocal() as db:
        category = Category(name="Checkout Test")
        db.add(category)
        db.flush()
        product = Product(
            name="Checkout Test Product",
            price=100,
            stock=5,
            image="checkout-test.png",
            category=category,
        )
        other_product = Product(
            name="Unordered Cart Product",
            price=50,
            stock=5,
            category=category,
        )
        db.add(product)
        db.add(other_product)
        db.commit()
        product_id = product.id
        other_product_id = other_product.id

    headers = auth(users["first_token"])
    added = client.post(
        "/api/cart",
        headers=headers,
        json={"product_id": product_id, "quantity": 2},
    )
    assert added.status_code == 201
    other_added = client.post(
        "/api/cart",
        headers=headers,
        json={"product_id": other_product_id, "quantity": 1},
    )
    assert other_added.status_code == 201

    address = {
        "name": "First User",
        "phone": "4155550101",
        "address": "123 Example Street",
        "city": "San Francisco",
        "state": "California",
        "pincode": "941051",
    }
    saved_address = client.post(
        "/api/checkout/address",
        headers=headers,
        json=address,
    )
    assert saved_address.status_code == 200, saved_address.json()
    with SessionLocal() as db:
        stored_address = db.get(Address, saved_address.json()["address"]["id"])
        assert stored_address.user_id == users["first_id"]
        assert stored_address.address_line1 == address["address"]

    response = client.post(
        "/api/checkout/orders",
        headers=headers,
        json={
            "items": [{"product_id": product_id, "quantity": 2}],
            "shipping_address": address,
            "payment_method": "COD",
            "delivery_type": "normal",
            "delivery_distance": "short",
        },
    )
    assert response.status_code == 201, response.json()
    order_id = response.json()["order"]["id"]
    assert response.json()["order"]["total_amount"] == 190

    with SessionLocal() as db:
        order = db.get(Order, order_id)
        order_item = db.query(OrderItem).filter_by(order_id=order_id).one()
        assert order.user_id == users["first_id"]
        assert order.customer_name == address["name"]
        assert order_item.product_id == product_id
        assert order_item.product_name == "Checkout Test Product"
        assert order_item.quantity == 2
        assert order_item.total == 200
        remaining_cart = db.query(CartItem).filter_by(
            user_id=users["first_id"]
        ).all()
        assert len(remaining_cart) == 1
        assert remaining_cart[0].product_id == other_product_id


def test_checkout_address_rejects_values_that_exceed_database_columns(client, users):
    headers = auth(users["first_token"])
    valid_address = {
        "name": "First User",
        "phone": "4155550101",
        "address": "123 Example Street",
        "city": "San Francisco",
        "state": "California",
        "pincode": "941051",
    }

    for field, value in (
        ("address", "A" * 256),
        ("city", "C" * 101),
        ("state", "S" * 101),
    ):
        response = client.post(
            "/api/checkout/address",
            headers=headers,
            json={**valid_address, field: value},
        )
        assert response.status_code == 422, response.json()


def test_cors_headers_are_present_on_internal_login_errors(users, monkeypatch):
    def fail_password_verification(*_args):
        raise RuntimeError("Simulated login failure")

    monkeypatch.setattr(login_router, "verify_password", fail_password_verification)

    with TestClient(app, raise_server_exceptions=False) as test_client:
        response = test_client.post(
            "/api/auth/login",
            headers={"Origin": "http://localhost:3000"},
            json={"email": "first@example.com", "password": "password123"},
        )
    engine.dispose()

    assert response.status_code == 500
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"


def test_address_create_update_and_delete_persist(client, users):
    headers = auth(users["first_token"])
    address_data = {
        "full_name": "First User",
        "phone": "4155550101",
        "address_line1": "123 Example Street",
        "city": "San Francisco",
        "state": "California",
        "pincode": "941051",
    }

    created = client.post(
        "/api/addresses",
        headers=headers,
        json=address_data,
    )
    assert created.status_code == 200
    address_id = created.json()["id"]

    with SessionLocal() as db:
        stored = db.get(Address, address_id)
        assert stored is not None
        assert stored.user_id == users["first_id"]
        assert stored.country == "India"

    updated = client.put(
        f"/api/addresses/{address_id}",
        headers=headers,
        json={"city": "Oakland"},
    )
    assert updated.status_code == 200
    assert updated.json()["city"] == "Oakland"

    assert client.get("/api/addresses", headers=headers).json()[0]["city"] == "Oakland"
    assert client.delete(f"/api/addresses/{address_id}", headers=headers).status_code == 200
    with SessionLocal() as db:
        assert db.get(Address, address_id) is None


def test_address_cannot_be_read_or_changed_by_another_user(client, users):
    created = client.post(
        "/api/addresses",
        headers=auth(users["first_token"]),
        json={
            "full_name": "First User",
            "phone": "4155550101",
            "address_line1": "123 Example Street",
            "city": "San Francisco",
            "state": "California",
            "pincode": "94105",
        },
    )
    address_id = created.json()["id"]
    other_token = create_access_token({"sub": str(users["second_id"])})

    response = client.put(
        f"/api/addresses/{address_id}",
        headers=auth(other_token),
        json={"city": "Oakland"},
    )
    assert response.status_code == 404
    assert client.delete(
        f"/api/addresses/{address_id}",
        headers=auth(other_token),
    ).status_code == 404


def test_forgot_password_otp_is_hashed_and_reset_consumes_it(
    client, users, monkeypatch
):
    from app.services import otp as otp_service

    sent = {}
    monkeypatch.setattr(otp_service.settings, "SMTP_EMAIL", "sender@example.com")
    monkeypatch.setattr(otp_service.settings, "SMTP_PASSWORD", "test-app-password")
    monkeypatch.setattr(
        otp_service,
        "send_otp_email",
        lambda recipient, otp: sent.update(recipient=recipient, otp=otp),
    )

    sent_response = client.post(
        "/api/auth/forgot-password",
        json={"email": "first@example.com"},
    )
    assert sent_response.status_code == 200
    assert len(sent["otp"]) == 6

    with SessionLocal() as db:
        record = db.query(EmailOTP).filter_by(email="first@example.com").one()
        assert record.otp_hash != sent["otp"]
        assert record.attempts == 0
        assert not record.is_used

    verified = client.post(
        "/api/auth/verify-otp",
        json={"email": "first@example.com", "otp": sent["otp"]},
    )
    assert verified.status_code == 200
    reset = client.post(
        "/api/auth/reset-password",
        json={
            "email": "first@example.com",
            "otp": sent["otp"],
            "new_password": "a-new-secure-password",
        },
    )
    assert reset.status_code == 200

    with SessionLocal() as db:
        user = db.get(User, users["first_id"])
        record = db.query(EmailOTP).filter_by(email="first@example.com").one()
        assert user.hashed_password != "a-new-secure-password"
        assert record.is_used

    assert client.post(
        "/api/auth/reset-password",
        json={
            "email": "first@example.com",
            "otp": sent["otp"],
            "new_password": "another-secure-password",
        },
    ).status_code == 400


def test_email_delivery_failure_returns_service_unavailable(
    client, users, monkeypatch
):
    from app.services import otp as otp_service
    from app.services.email import EmailDeliveryError

    monkeypatch.setattr(otp_service.settings, "SMTP_EMAIL", "sender@example.com")
    monkeypatch.setattr(otp_service.settings, "SMTP_PASSWORD", "test-app-password")

    def fail_delivery(*_args):
        raise EmailDeliveryError("SMTP authentication failed")

    monkeypatch.setattr(otp_service, "send_otp_email", fail_delivery)
    response = client.post(
        "/api/auth/forgot-password",
        json={"email": "first@example.com"},
    )
    assert response.status_code == 503
    assert "could not be delivered" in response.json()["detail"]

    with SessionLocal() as db:
        record = db.query(EmailOTP).filter_by(email="first@example.com").one()
        assert record.is_used


def test_catalog_seed_is_repeatable_and_shop_api_returns_product_details(
    client, users
):
    catalog = [
        {
            "name": "Catalog Seed Product",
            "brand": "MediKart",
            "category": "Catalog Test",
            "description": "Catalog description",
            "price": 120,
            "discount_price": 99,
            "stock": 100,
            "image": "/catalog/medicines/catalog-seed.png",
            "rating": 4.5,
            "reviews": 12,
            "pack_size": "10 tablets",
            "expiry": "24 Months",
            "delivery": "2-3 Business Days",
            "return_policy": "7 Days Return Eligible",
        }
    ]

    with SessionLocal() as db:
        first_sync = seed_catalog(db, catalog)
        second_sync = seed_catalog(db, catalog)

    assert first_sync == {"inserted": 1, "updated": 0}
    assert second_sync == {"inserted": 0, "updated": 0}

    response = client.get("/api/products")
    assert response.status_code == 200
    product = next(
        item
        for item in response.json()
        if item["name"] == "Catalog Seed Product"
    )
    assert product["brand"] == "MediKart"
    assert product["pack_size"] == "10 tablets"
    assert product["discount_price"] == 99
    assert product["reviews"] == 12


@pytest.mark.parametrize(
    "image_path",
    [
        "/catalog/products/product1.png",
        "product12.webp",
        r"C:\uploads\product3.jpg",
        "/catalog/medicines/mediction2.png",
    ],
)
def test_catalog_placeholder_images_are_detected(image_path):
    assert is_placeholder_image(image_path)


def test_catalog_seed_replaces_generic_image_but_preserves_custom_image(users):
    with SessionLocal() as db:
        category = Category(name="Catalog Image Test")
        db.add(category)
        db.flush()
        generic = Product(
            name="Generic Image Product",
            category=category,
            price=10,
            stock=10,
            image="/catalog/products/product1.png",
        )
        custom = Product(
            name="Custom Image Product",
            category=category,
            price=10,
            stock=10,
            image="/uploads/custom-image.png",
        )
        db.add_all([generic, custom])
        db.commit()

        result = seed_catalog(
            db,
            [
                {
                    "name": "Generic Image Product",
                    "category": "Catalog Image Test",
                    "price": 10,
                    "image": "/catalog/medicines/generic-image-product.png",
                },
                {
                    "name": "Custom Image Product",
                    "category": "Catalog Image Test",
                    "price": 10,
                    "image": "/catalog/medicines/custom-image-product.png",
                },
            ],
        )
        db.refresh(generic)
        db.refresh(custom)

    assert result == {"inserted": 0, "updated": 1}
    assert generic.image == "/catalog/medicines/generic-image-product.png"
    assert custom.image == "/uploads/custom-image.png"


def test_catalog_sync_adds_product_details_to_an_existing_schema():
    legacy_engine = create_engine("sqlite:///:memory:")
    with legacy_engine.begin() as connection:
        connection.execute(
            text(
                "CREATE TABLE categories "
                "(id INTEGER PRIMARY KEY, name VARCHAR(100) NOT NULL UNIQUE)"
            )
        )
        connection.execute(
            text(
                "CREATE TABLE products ("
                "id INTEGER PRIMARY KEY, name VARCHAR(255) NOT NULL, "
                "description TEXT, price FLOAT NOT NULL, discount_price FLOAT, "
                "category_id INTEGER, stock INTEGER NOT NULL DEFAULT 0, "
                "image VARCHAR(500), rating FLOAT, "
                "is_active BOOLEAN NOT NULL DEFAULT 1, "
                "is_featured BOOLEAN NOT NULL DEFAULT 0, "
                "is_trending BOOLEAN NOT NULL DEFAULT 0, "
                "is_flash_sale BOOLEAN NOT NULL DEFAULT 0, "
                "flash_sale_start DATETIME, flash_sale_end DATETIME, "
                "created_at DATETIME, updated_at DATETIME)"
            )
        )

    ensure_catalog_schema(legacy_engine)

    columns = {
        column["name"]
        for column in inspect(legacy_engine).get_columns("products")
    }
    assert {
        "brand",
        "reviews",
        "pack_size",
        "expiry",
        "delivery",
        "return_policy",
    }.issubset(columns)
    legacy_engine.dispose()


def test_catalog_sync_does_not_duplicate_a_product_with_formatted_strength(
    users,
):
    with SessionLocal() as db:
        category = Category(name="Medicine Match Test")
        db.add(category)
        db.flush()
        db.add(
            Product(
                name="Cetirizine 10 mg",
                category=category,
                price=52,
                stock=20,
            )
        )
        db.commit()

        result = seed_catalog(
            db,
            [
                {
                    "name": "Cetirizine 10mg",
                    "brand": "Cipla",
                    "category": "Medicine Match Test",
                    "price": 52,
                    "discount_price": 42,
                    "stock": 100,
                    "image": "/catalog/medicines/cetirizine.png",
                    "rating": 4.5,
                    "reviews": 10,
                    "pack_size": "10 Tablets",
                }
            ],
        )
        products_in_category = (
            db.query(Product)
            .filter(Product.category_id == category.id)
            .all()
        )

    assert result == {"inserted": 0, "updated": 1}
    assert len(products_in_category) == 1
    assert products_in_category[0].image == "/catalog/medicines/cetirizine.png"
    assert products_in_category[0].discount_price == 42


def test_cors_allows_frontend_preflight(client):
    response = client.options(
        "/api/auth/register",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type,authorization",
        },
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"


def test_admin_product_create_update_and_delete(client, users):
    with SessionLocal() as db:
        admin = db.get(User, users["second_id"])
        admin.is_admin = True
        db.commit()

    admin_token = create_access_token({"sub": str(users["second_id"])})
    headers = auth(admin_token)
    product_data = {
        "name": "Database Product",
        "category": "Test Category",
        "price": 14.5,
        "stock": 8,
        "rating": 4.5,
    }

    assert client.post("/api/products", json=product_data).status_code == 401
    created = client.post("/api/products", headers=headers, json=product_data)
    assert created.status_code == 201
    assert created.json()["category"] == "Test Category"
    product_id = created.json()["id"]

    listed = client.get("/api/products")
    assert listed.status_code == 200
    assert any(item["id"] == product_id for item in listed.json())

    updated = client.put(
        f"/api/products/{product_id}",
        headers=headers,
        json={"price": 18, "stock": 6},
    )
    assert updated.status_code == 200
    assert updated.json()["price"] == 18
    with SessionLocal() as db:
        stored = db.get(Product, product_id)
        assert stored.price == 18
        assert stored.stock == 6

    deleted = client.delete(f"/api/products/{product_id}", headers=headers)
    assert deleted.status_code == 200
    with SessionLocal() as db:
        assert db.get(Product, product_id) is None


def test_order_create_list_and_cancel_persist(client, users):
    headers = auth(users["first_token"])
    address = client.post(
        "/api/addresses",
        headers=headers,
        json={
            "full_name": "First User",
            "phone": "4155550101",
            "address_line1": "123 Example Street",
            "city": "San Francisco",
            "state": "California",
            "pincode": "94105",
        },
    ).json()

    response = client.post(
        "/api/orders",
        headers=headers,
        json={
            "address_id": address["id"],
            "items": [{
                "product_id": 10,
                "product_name": "Test Medicine",
                "quantity": 2,
                "price": 100,
            }],
            "payment_method": "COD",
            "delivery_type": "normal",
        },
    )
    assert response.status_code == 200
    order_id = response.json()["order_id"]
    assert response.json()["delivery_address"]["id"] == address["id"]

    listed = client.get("/api/orders", headers=headers)
    assert listed.status_code == 200
    assert listed.json()[0]["order_id"] == order_id
    assert listed.json()[0]["items"][0]["product_name"] == "Test Medicine"

    missing_reason = client.patch(
        f"/api/orders/{order_id}/cancel",
        headers=headers,
    )
    assert missing_reason.status_code == 422

    cancelled = client.patch(
        f"/api/orders/{order_id}/cancel",
        headers=headers,
        json={"reason": "Found a better price elsewhere"},
    )
    assert cancelled.status_code == 200
    assert cancelled.json()["cancellation_reason"] == (
        "Found a better price elsewhere"
    )
    assert cancelled.json()["cancelled_at"]
    with SessionLocal() as db:
        stored = db.query(Order).filter_by(order_id=order_id).one()
        assert stored.status == "Cancelled"
        assert stored.cancellation_reason == "Found a better price elsewhere"
        assert stored.cancelled_at is not None


def test_contact_and_review_submissions_persist(client):
    message = client.post(
        "/api/contact/messages",
        json={
            "name": "Test Customer",
            "email": "customer@example.com",
            "phone": "9876543210",
            "message": "Please contact me about my order.",
        },
    )
    assert message.status_code == 201

    review = client.post(
        "/api/reviews",
        json={
            "name": "Test Customer",
            "product": "Test Medicine",
            "rating": 5,
            "review": "The product was delivered as expected.",
        },
    )
    assert review.status_code == 201
    assert client.get("/api/reviews").json()[0]["id"] == review.json()["id"]

    with SessionLocal() as db:
        assert db.query(ContactMessage).one().email == "customer@example.com"
        assert db.query(ProductReview).one().rating == 5


def test_health_records_and_prescriptions_are_user_owned(client, users):
    headers = auth(users["first_token"])
    record = client.post(
        "/api/health-records",
        headers=headers,
        json={
            "title": "Blood Test",
            "hospital": "Test Clinic",
            "doctor": "Dr Test",
            "record_date": "2026-10-01",
            "status": "Completed",
        },
    )
    assert record.status_code == 201
    assert client.get("/api/health-records", headers=headers).json()[0]["id"] == (
        record.json()["id"]
    )

    upload = client.post(
        "/api/prescriptions",
        headers=headers,
        files={"file": ("test.pdf", b"%PDF-1.7 test", "application/pdf")},
    )
    assert upload.status_code == 201
    assert upload.json()["filename"] == "test.pdf"

    with SessionLocal() as db:
        stored_record = db.get(HealthRecord, record.json()["id"])
        stored_prescription = db.get(Prescription, upload.json()["id"])
        assert stored_record.user_id == users["first_id"]
        assert stored_prescription.content == b"%PDF-1.7 test"

    other_user_token = create_access_token({"sub": str(users["second_id"])})
    assert client.get(
        "/api/health-records",
        headers=auth(other_user_token),
    ).json() == []


def test_order_feedback_requires_owned_order_and_persists(client, users):
    headers = auth(users["first_token"])
    address = client.post(
        "/api/addresses",
        headers=headers,
        json={
            "full_name": "First User",
            "phone": "4155550101",
            "address_line1": "123 Example Street",
            "city": "San Francisco",
            "state": "California",
            "pincode": "94105",
        },
    ).json()
    order = client.post(
        "/api/orders",
        headers=headers,
        json={
            "address_id": address["id"],
            "items": [{
                "product_id": 10,
                "product_name": "Test Medicine",
                "quantity": 1,
                "price": 100,
            }],
        },
    ).json()

    response = client.post(
        "/api/feedback",
        headers=headers,
        json={
            "order_id": order["order_id"],
            "rating": 5,
            "feedback": "Excellent service",
        },
    )
    assert response.status_code == 201

    with SessionLocal() as db:
        feedback = db.query(OrderFeedback).one()
        assert feedback.user_id == users["first_id"]
        assert feedback.order_id == order["order_id"]
