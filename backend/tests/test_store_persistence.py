"""
End-to-end persistence checks for the cart, checkout, order and payment flow.

These tests guard the fix for "Product not found" and for data not being saved:
the product IDs used by the React app must be the database primary keys, and
every cart, order, and payment action must write rows to the database.
"""

import pytest
from fastapi.testclient import TestClient

from app.api.routers import payments as payments_router  # noqa: F401
from app.core.security import create_access_token
from app.database.database import Base, SessionLocal, engine
from app.main import app
from app.models.cart_item import CartItem
from app.models.category import Category
from app.models.order import Order
from app.models.payment import Payment
from app.models.product import Product
from app.models.user import User
from app.models.wishlist import Wishlist
from app.scripts.seed_product_catalog import seed_catalog


SHIPPING = {
    "name": "Test Customer",
    "phone": "4155550100",
    "address": "123 Test Street",
    "city": "Oakland",
    "state": "CA",
    "pincode": "094601",
}


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client
    engine.dispose()


@pytest.fixture
def user_token():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        user = User(
            name="Store Tester",
            email="store@example.com",
            hashed_password="not-used-in-these-tests",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return create_access_token({"sub": str(user.id)}), user.id


def auth(token):
    return {"Authorization": f"Bearer {token}"}


def catalog_item(product_id, name, category="Healthcare", price=100):
    return {
        "id": product_id,
        "name": name,
        "category": category,
        "price": price,
        "discount_price": None,
        "stock": 50,
        "image": f"/catalog/healthcare/{product_id}.png",
        "rating": 4.5,
        "reviews": 10,
    }


def test_catalog_ids_are_the_database_primary_keys(client, user_token):
    token, _ = user_token
    catalog = [
        catalog_item(253, "Cotton Roll"),
        catalog_item(350, "Dolo 650 Tablet", category="Medicines", price=35),
        catalog_item(260, "Digital Thermometer", price=299),
    ]
    with SessionLocal() as db:
        seed_catalog(db, catalog)

    # The frontend id 253 must be the database row 253, not a row numbered by insertion order.
    product = client.get("/api/products/253")
    assert product.status_code == 200
    assert product.json()["name"] == "Cotton Roll"

    added = client.post(
        "/api/cart",
        headers=auth(token),
        json={"product_id": 350, "quantity": 2},
    )
    assert added.status_code == 201
    assert added.json()["item"]["name"] == "Dolo 650 Tablet"

    with SessionLocal() as db:
        row = db.query(CartItem).filter(CartItem.product_id == 350).one()
        assert row.quantity == 2


def test_reusing_an_id_for_another_product_clears_stale_cart_and_wishlist(client, user_token):
    token, user_id = user_token
    with SessionLocal() as db:
        seed_catalog(db, [catalog_item(9001, "Old Product")])

    client.post("/api/cart", headers=auth(token), json={"product_id": 9001, "quantity": 1})
    client.post("/api/wishlist/", headers=auth(token), json={"product_id": 9001})

    with SessionLocal() as db:
        seed_catalog(db, [catalog_item(9001, "Brand New Product")])

    with SessionLocal() as db:
        assert db.query(CartItem).filter(CartItem.product_id == 9001).count() == 0
        assert db.query(Wishlist).filter(Wishlist.product_id == 9001).count() == 0
        assert db.get(Product, 9001).name == "Brand New Product"


def test_cart_import_skips_unknown_products_instead_of_blocking(client, user_token):
    token, _ = user_token
    with SessionLocal() as db:
        seed_catalog(db, [catalog_item(7001, "Valid Product")])

    response = client.post(
        "/api/cart/import",
        headers=auth(token),
        json={
            "migration_id": "migration-test-0001",
            "items": [
                {"product_id": 7001, "quantity": 1},
                {"product_id": 999999, "quantity": 3},
            ],
        },
    )

    assert response.status_code == 200
    assert response.json()["skipped_product_ids"] == [999999]
    names = [item["name"] for item in response.json()["items"]]
    assert names == ["Valid Product"]


def test_checkout_saves_order_payment_and_returns_full_order(client, user_token):
    token, _ = user_token
    with SessionLocal() as db:
        seed_catalog(db, [catalog_item(4001, "Knee Support", price=499)])

    client.post("/api/cart", headers=auth(token), json={"product_id": 4001, "quantity": 2})

    response = client.post(
        "/api/checkout/orders",
        headers=auth(token),
        json={
            "items": [{"product_id": 4001, "quantity": 2}],
            "shipping_address": SHIPPING,
            "payment_method": "COD",
            "delivery_type": "normal",
            "delivery_distance": "short",
        },
    )

    assert response.status_code == 201
    order = response.json()["order"]
    assert order["created_at"] is not None
    assert order["status"] == "Order Confirmed"
    assert order["items"][0]["product_name"] == "Knee Support"
    assert order["items"][0]["quantity"] == 2
    assert order["items"][0]["image"] == "/catalog/healthcare/4001.png"

    with SessionLocal() as db:
        saved_order = db.query(Order).filter(Order.order_id == order["order_id"]).one()
        assert saved_order.total_amount == order["total_amount"]

        payment = db.query(Payment).filter(Payment.order_id == saved_order.id).one()
        assert payment.status == "Pending"
        assert payment.method == "COD"
        assert payment.amount == order["total_amount"]


def test_payment_process_updates_the_saved_payment_row(client, user_token):
    token, _ = user_token
    with SessionLocal() as db:
        seed_catalog(db, [catalog_item(4002, "Cervical Collar", price=699)])

    created = client.post(
        "/api/checkout/orders",
        headers=auth(token),
        json={
            "items": [{"product_id": 4002, "quantity": 1}],
            "shipping_address": SHIPPING,
            "payment_method": "COD",
        },
    ).json()["order"]

    paid = client.post(
        "/api/payments/process",
        headers=auth(token),
        json={"order_id": created["order_id"], "method": "COD"},
    )
    assert paid.status_code == 200

    with SessionLocal() as db:
        rows = db.query(Payment).join(Order).filter(Order.order_id == created["order_id"]).all()
        assert len(rows) == 1, "checkout and payment must share one payment row"
