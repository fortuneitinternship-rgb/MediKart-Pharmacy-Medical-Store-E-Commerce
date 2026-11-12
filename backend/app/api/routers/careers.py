from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.job_listing import JobListing
from app.schemas.careers import JobListingResponse


router = APIRouter(prefix="/api/careers", tags=["Careers"])


@router.get("/jobs", response_model=list[JobListingResponse])
def list_jobs(
    q: str | None = Query(default=None, min_length=1, max_length=100),
    location: str | None = Query(default=None, min_length=1, max_length=150),
    job_type: str | None = Query(
        default=None, alias="type", min_length=1, max_length=100
    ),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    query = db.query(JobListing).filter(JobListing.is_active.is_(True))
    if q is not None:
        search = f"%{q.strip()}%"
        query = query.filter(
            or_(
                JobListing.title.ilike(search),
                JobListing.description.ilike(search),
            )
        )
    if location is not None:
        query = query.filter(
            func.lower(JobListing.location) == location.strip().lower()
        )
    if job_type is not None:
        query = query.filter(func.lower(JobListing.type) == job_type.strip().lower())

    return (
        query.order_by(JobListing.created_at.desc(), JobListing.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
