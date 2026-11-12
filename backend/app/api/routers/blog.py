from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.blog_post import BlogPost
from app.schemas.blog import BlogPostDetail, BlogPostSummary


router = APIRouter(prefix="/api/blog", tags=["Blog"])


@router.get("", response_model=list[BlogPostSummary])
def list_blog_posts(
    category: str | None = Query(default=None, min_length=1, max_length=100),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    query = db.query(BlogPost).filter(BlogPost.is_published.is_(True))
    if category is not None:
        query = query.filter(
            func.lower(BlogPost.category) == category.strip().lower()
        )
    return (
        query.order_by(BlogPost.date.desc(), BlogPost.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


@router.get("/{slug}", response_model=BlogPostDetail)
def get_blog_post(slug: str, db: Session = Depends(get_db)):
    post = (
        db.query(BlogPost)
        .filter(
            BlogPost.slug == slug,
            BlogPost.is_published.is_(True),
        )
        .first()
    )
    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog post not found",
        )
    return post
