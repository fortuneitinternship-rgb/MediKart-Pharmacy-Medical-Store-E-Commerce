"""Extra API tests: UPI + payment status, categories, central errors, product search."""
import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from app.core.security import create_access_token
from app.database.database import SessionLocal, engine
from app.main import app
from app.api.routers import payments as payments_router
from app.models.category import Category
from app.models.order import Order
from app.models.product import Product
from app.models.user import User

from tests.test_users import auth, client, users  # noqa: F401  (shared fixtures)

ADDRESS = {
    "name": "First User",
    "phone": "9876543210",
    "address": "12 MG Road",
    "city": "Hyderabad",
    "state": "Telangana",
    "pincode": "500001",
}


def make_product(name="Test Product", price=100, category="Medicines", **extra):
    with SessionLocal() as db:
        cat = db.query(Category).filter(Category.name == category).first()
        if cat is None:
            cat = Category(name=category)
            db.add(cat)
            db.flush()
        product = Product(
            name=name, category=cat, price=price, discount_price=price, stock=50, **extra
        )
        db.add(product)
        db.commit()
        return product.id


def make_admin_token():
    with SessionLocal() as db:
        admin = User(
            name="Admin User",
            email="admin@example.com",
            hashed_password="x",
            is_admin=True,
        )
        db.add(admin)
        db.commit()
        return create_access_token({"sub": str(admin.id)})


def place_order(client, token, method, product_id=None):
    product_id = product_id or make_product("Pay Product")
    response = client.post(
        "/api/checkout/orders",
        headers=auth(token),
        json={
            "items": [{"product_id": product_id, "quantity": 1}],
            "shipping_address": ADDRESS,
            "payment_method": method,
            "remove_from_cart": False,
        },
    )
    assert response.status_code == 201, response.text
    return response.json()["order"]["order_id"]


# ------------------------------------------------------------------ UPI
def test_upi_order_requires_valid_upi_id_and_marks_order_paid(client, users):
    token = users["first_token"]
    order_id = place_order(client, token, "UPI")

    missing = client.post(
        "/api/payments/process", headers=auth(token),
        json={"order_id": order_id, "method": "UPI"},
    )
    assert missing.status_code == 422

    invalid = client.post(
        "/api/payments/process", headers=auth(token),
        json={"order_id": order_id, "method": "UPI", "upi_id": "not-a-upi-id"},
    )
    assert invalid.status_code == 422

    ok = client.post(
        "/api/payments/process", headers=auth(token),
        json={"order_id": order_id, "method": "UPI", "upi_id": "rahul.k@okhdfcbank"},
    )
    assert ok.status_code == 200
    assert ok.json()["status"] == "Paid"
    assert ok.json()["method"] == "UPI"
    assert ok.json()["transaction_id"].startswith("TXN-")

    # paying again returns the same receipt (idempotent)
    again = client.post(
        "/api/payments/process", headers=auth(token),
        json={"order_id": order_id, "method": "UPI", "upi_id": "rahul.k@okhdfcbank"},
    )
    assert again.json() == ok.json()

    order = client.get(f"/api/orders/{order_id}", headers=auth(token)).json()
    assert order["payment_status"] == "Paid"
    assert order["payment_method"] == "UPI"


def test_declined_upi_can_be_retried_with_another_id(client, users):
    token = users["first_token"]
    order_id = place_order(client, token, "UPI")

    declined = client.post(
        "/api/payments/process", headers=auth(token),
        json={"order_id": order_id, "method": "UPI", "upi_id": "fail@upi"},
    )
    assert declined.status_code == 402
    assert "declined" in declined.json()["detail"]
    order = client.get(f"/api/orders/{order_id}", headers=auth(token)).json()
    assert order["payment_status"] == "Failed"

    retry = client.post(
        "/api/payments/process", headers=auth(token),
        json={"order_id": order_id, "method": "UPI", "upi_id": "good@okaxis"},
    )
    assert retry.status_code == 200 and retry.json()["status"] == "Paid"
    order = client.get(f"/api/orders/{order_id}", headers=auth(token)).json()
    assert order["payment_status"] == "Paid"


def test_upi_payment_cannot_be_processed_for_another_users_order(client, users):
    order_id = place_order(client, users["first_token"], "UPI")
    other = create_access_token({"sub": str(users["second_id"])})
    response = client.post(
        "/api/payments/process", headers=auth(other),
        json={"order_id": order_id, "method": "UPI", "upi_id": "good@okaxis"},
    )
    assert response.status_code == 404


def test_cod_order_stays_pending_and_unknown_method_is_rejected(client, users):
    token = users["first_token"]
    order_id = place_order(client, token, "COD")
    receipt = client.post(
        "/api/payments/process", headers=auth(token),
        json={"order_id": order_id, "method": "COD"},
    )
    assert receipt.json()["status"] == "Pending"
    assert client.get(f"/api/orders/{order_id}", headers=auth(token)).json()["payment_status"] == "Pending"

    bad = client.post(
        "/api/checkout/orders", headers=auth(token),
        json={
            "items": [{"product_id": make_product("X"), "quantity": 1}],
            "shipping_address": ADDRESS,
            "payment_method": "BITCOIN",
        },
    )
    assert bad.status_code == 422


def test_razorpay_order_accepts_upi_orders(client, users, monkeypatch):
    monkeypatch.setattr(settings, "PAYMENT_MODE", "razorpay")
    monkeypatch.setattr(settings, "RAZORPAY_KEY_ID", "rzp_test_key")
    monkeypatch.setattr(settings, "RAZORPAY_KEY_SECRET", "test-razorpay-secret")
    token = users["first_token"]
    order_id = place_order(client, token, "UPI")

    class FakeResponse:
        def raise_for_status(self):
            return None

        def json(self):
            return {"id": "order_upi_1"}

    class FakeClient:
        def __enter__(self):
            return self

        def __exit__(self, *a):
            return None

        def post(self, url, *, auth, json):
            return FakeResponse()

    monkeypatch.setattr(payments_router.httpx, "Client", lambda timeout: FakeClient())
    response = client.post(
        "/api/payments/razorpay/order", headers=auth(token), json={"order_id": order_id}
    )
    assert response.status_code == 200
    assert response.json()["razorpay_order_id"] == "order_upi_1"

    # simulator endpoint must refuse once Razorpay mode is on
    blocked = client.post(
        "/api/payments/process", headers=auth(token),
        json={"order_id": order_id, "method": "UPI", "upi_id": "good@okaxis"},
    )
    assert blocked.status_code == 409


# ------------------------------------------------------------ categories
def test_categories_public_read_and_admin_crud(client, users):
    admin = make_admin_token()
    user_token = users["first_token"]

    assert client.post("/api/categories", json={"name": "Nope"}).status_code == 401
    assert client.post(
        "/api/categories", headers=auth(user_token), json={"name": "Nope"}
    ).status_code == 403

    created = client.post(
        "/api/categories", headers=auth(admin),
        json={"name": "Ayurveda", "description": "Herbal"},
    )
    assert created.status_code == 201
    category_id = created.json()["id"]

    assert client.post(
        "/api/categories", headers=auth(admin), json={"name": "Ayurveda"}
    ).status_code == 409

    names = [c["name"] for c in client.get("/api/categories").json()]
    assert "Ayurveda" in names
    assert client.get(f"/api/categories/{category_id}").json()["description"] == "Herbal"
    # legacy URL still works
    assert "Ayurveda" in [c["name"] for c in client.get("/api/products/categories").json()]

    updated = client.put(
        f"/api/categories/{category_id}", headers=auth(admin), json={"description": "Updated"}
    )
    assert updated.status_code == 200 and updated.json()["description"] == "Updated"

    assert client.delete(f"/api/categories/{category_id}", headers=auth(admin)).status_code == 204
    assert client.get(f"/api/categories/{category_id}").status_code == 404
    assert "Ayurveda" not in [c["name"] for c in client.get("/api/categories").json()]
    assert client.get("/api/categories/99999").status_code == 404


# ------------------------------------------------------- central errors
def test_error_responses_share_one_json_shape(client, users):
    not_found = client.get("/api/does-not-exist")
    assert not_found.status_code == 404
    body = not_found.json()
    assert set(body) >= {"detail", "message", "code"} and body["code"] == "http_404"

    unauthorized = client.get("/api/users/me")
    assert unauthorized.status_code == 401
    assert unauthorized.json()["code"] == "http_401"

    invalid = client.post("/api/auth/login", json={"email": "not-an-email"})
    assert invalid.status_code == 422
    body = invalid.json()
    assert body["code"] == "validation_error"
    assert isinstance(body["detail"], list) and body["message"]


def test_unhandled_error_returns_json_500_with_cors(users, monkeypatch):
    from app.api.routers import login as login_router

    def boom(*_args):
        raise RuntimeError("kaboom")

    monkeypatch.setattr(login_router, "verify_password", boom)
    with TestClient(app, raise_server_exceptions=False) as test_client:
        response = test_client.post(
            "/api/auth/login",
            headers={"Origin": "http://localhost:3000"},
            json={"email": "first@example.com", "password": "password123"},
        )
    engine.dispose()
    assert response.status_code == 500
    assert response.json()["code"] == "internal_error"
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"


# ------------------------------------------- product search / filter / sort
def test_product_search_filter_sort_and_pagination(client, users):
    make_product("Alpha Cough Syrup", 50, category="Medicines", brand="Cipla")
    make_product("Beta Vitamin C", 150, category="Vitamins", brand="Himalaya")
    make_product("Gamma Vitamin D", 250, category="Vitamins", brand="Himalaya")

    names = lambda r: [p["name"] for p in r.json()]

    assert names(client.get("/api/products", params={"q": "vitamin"})) == [
        "Beta Vitamin C", "Gamma Vitamin D",
    ]
    assert names(client.get("/api/products", params={"category": "Medicines"})) == ["Alpha Cough Syrup"]
    assert names(client.get("/api/products", params={"min_price": 100, "max_price": 200})) == ["Beta Vitamin C"]
    assert names(client.get("/api/products", params={"sort_by": "price", "sort_order": "desc"})) == [
        "Gamma Vitamin D", "Beta Vitamin C", "Alpha Cough Syrup",
    ]
    page = client.get("/api/products", params={"limit": 1, "offset": 1})
    assert names(page) == ["Beta Vitamin C"]
    assert client.get("/api/products", params={"min_price": 9, "max_price": 1}).status_code == 422

    product_id = make_product("Delta Detail", 10)
    detail = client.get(f"/api/products/{product_id}")
    assert detail.status_code == 200 and detail.json()["name"] == "Delta Detail"
    assert client.get("/api/products/999999").status_code == 404


def test_featured_trending_flash_sale_and_new_arrivals_respond(client, users):
    make_product("Featured One", 10, is_featured=True)
    make_product("Trending One", 10, is_trending=True)
    assert [p["name"] for p in client.get("/api/products/featured").json()] == ["Featured One"]
    assert [p["name"] for p in client.get("/api/products/trending").json()] == ["Trending One"]
    assert client.get("/api/products/flash-sale").status_code == 200
    assert client.get("/api/products/new-arrivals").status_code == 200
