from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.newsletter import Newsletter
from app.schemas.newsletter import NewsletterRequest, NewsletterResponse

router = APIRouter(prefix="/api/newsletter", tags=["Newsletter"])


@router.post("/subscribe", response_model=NewsletterResponse)
def subscribe(
    data: NewsletterRequest,
    db: Session = Depends(get_db),
):
    email = data.email.lower().strip()
    existing = db.query(Newsletter).filter(
        Newsletter.email == email
    ).first()

    if existing:
        if existing.is_active:
            raise HTTPException(status_code=400, detail="Email already subscribed")
        existing.is_active = True
        db.commit()
        return {"message": "Newsletter subscription restored", "email": email}

    subscriber = Newsletter(email=email)
    db.add(subscriber)
    db.commit()
    return {"message": "Successfully subscribed to newsletter", "email": email}
