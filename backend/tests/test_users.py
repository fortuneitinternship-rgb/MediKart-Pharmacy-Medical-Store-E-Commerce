import os
import tempfile

import pytest
from sqlalchemy.engine import URL

_test_directory = tempfile.TemporaryDirectory()
os.environ["DATABASE_URL"] = URL.create(
    "sqlite", database=os.path.join(_test_directory.name, "users-tests.db")
).render_as_string(hide_password=False)
os.environ["SECRET_KEY"] = "test-profile-secret"

from fastapi.testclient import TestClient

from app.core.security import create_access_token
from app.database.database import Base, SessionLocal, engine
from app.main import app
from app.models.user import User


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
        "id", "full_name", "email", "phone", "profile_image",
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
            "phone": "4155550101",
            "profile_image": "https://example.com/profile.png",
        },
    )
    assert response.status_code == 200
    assert response.json()["full_name"] == "Updated First"
    assert response.json()["phone"] == "4155550101"
    with SessionLocal() as db:
        stored = db.get(User, users["first_id"])
        assert stored.name == "Updated First"
        assert stored.phone == "4155550101"
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


def test_duplicate_phone_returns_409(client, users):
    response = client.put(
        "/api/users/me",
        headers=auth(users["first_token"]),
        json={"phone": "+1 (415) 555-0100"},
    )
    assert response.status_code == 409


@pytest.mark.parametrize("payload", [{"email": "attacker@example.com"}, {"password": "changed"}])
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
