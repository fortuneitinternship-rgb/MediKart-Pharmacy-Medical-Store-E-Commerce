import os
import tempfile

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
from app.database.database import Base, SessionLocal, engine
from app.main import app
from app.models.address import Address
from app.models.cart_item import CartItem
from app.models.category import Category
from app.models.opt import EmailOTP
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.submission import (
    ContactMessage,
    HealthRecord,
    OrderFeedback,
    Prescription,
    ProductReview,
)
from app.models.newsletter import Newsletter
from app.models.user import User
from app.scripts.seed_product_catalog import ensure_catalog_schema, seed_catalog


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
