import os

os.environ.setdefault("DATABASE_URL", "sqlite://")

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.api.routers.blog import router as blog_router
from app.api.routers.careers import router as careers_router
from app.database.database import get_db
from app.models.blog_post import BlogPost
from app.models.job_listing import JobListing


@pytest.fixture
def client():
    test_engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    BlogPost.__table__.create(bind=test_engine)
    JobListing.__table__.create(bind=test_engine)
    TestingSessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=test_engine,
    )

    def override_get_db():
        with TestingSessionLocal() as db:
            yield db

    app = FastAPI()
    app.include_router(blog_router)
    app.include_router(careers_router)
    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        test_client.db_session_factory = TestingSessionLocal
        yield test_client

    app.dependency_overrides.clear()
    test_engine.dispose()


def test_blog_listing_filters_drafts_and_supports_category_and_pagination(client):
    with client.db_session_factory() as db:
        db.add_all(
            [
                BlogPost(
                    slug="health-checkups",
                    title="Health Checkups",
                    category="Healthcare",
                    description="Regular screenings matter.",
                    content="Full article.",
                    is_published=True,
                ),
                BlogPost(
                    slug="safe-storage",
                    title="Safe Storage",
                    category="Medicines",
                    description="Store medicines safely.",
                    content="Full article.",
                    is_published=True,
                ),
                BlogPost(
                    slug="unpublished",
                    title="Unpublished",
                    category="Healthcare",
                    description="Draft post.",
                    content="Draft body.",
                    is_published=False,
                ),
            ]
        )
        db.commit()

    response = client.get("/api/blog?category=healthcare&limit=1")

    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["slug"] == "health-checkups"
    assert "content" not in response.json()[0]


def test_blog_details_returns_published_content_and_hides_missing_or_draft_posts(client):
    with client.db_session_factory() as db:
        db.add_all(
            [
                BlogPost(
                    slug="immunity-tips",
                    title="Immunity Tips",
                    category="Health Tips",
                    description="Daily habits for wellness.",
                    content="Detailed article content.",
                    is_published=True,
                ),
                BlogPost(
                    slug="draft",
                    title="Draft",
                    category="Health Tips",
                    description="Not public.",
                    content="Draft content.",
                    is_published=False,
                ),
            ]
        )
        db.commit()

    response = client.get("/api/blog/immunity-tips")

    assert response.status_code == 200
    assert response.json()["content"] == "Detailed article content."
    assert client.get("/api/blog/draft").status_code == 404
    assert client.get("/api/blog/unknown").status_code == 404


def test_careers_listing_excludes_inactive_jobs_and_supports_filters(client):
    with client.db_session_factory() as db:
        db.add_all(
            [
                JobListing(
                    title="Backend Developer",
                    location="Bangalore",
                    type="Full Time",
                    experience="2-5 Years",
                    description="Build API services.",
                    is_active=True,
                ),
                JobListing(
                    title="Frontend Developer",
                    location="Hyderabad",
                    type="Full Time",
                    experience="1-3 Years",
                    description="Build user interfaces.",
                    is_active=True,
                ),
                JobListing(
                    title="Closed Role",
                    location="Bangalore",
                    type="Full Time",
                    experience="2+ Years",
                    description="This role is closed.",
                    is_active=False,
                ),
            ]
        )
        db.commit()

    response = client.get(
        "/api/careers/jobs?location=bangalore&type=full%20time&q=api"
    )

    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["title"] == "Backend Developer"
    assert response.json()[0]["type"] == "Full Time"


def test_content_listing_rejects_invalid_pagination(client):
    assert client.get("/api/blog?limit=0").status_code == 422
    assert client.get("/api/careers/jobs?offset=-1").status_code == 422
