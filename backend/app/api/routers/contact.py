from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.database.database import get_db
from app.models.submission import ContactMessage
from app.models.user import User
from app.schemas.submission import ContactMessageCreate

router = APIRouter(tags=["Contact and Support"])


@router.post(
    "/api/contact/messages",
    status_code=status.HTTP_201_CREATED,
)
def create_contact_message(
    data: ContactMessageCreate,
    db: Session = Depends(get_db),
):
    message = ContactMessage(
        name=data.name.strip(),
        email=str(data.email).lower(),
        phone=data.phone.strip(),
        message=data.message.strip(),
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return {"id": message.id, "message": "Message received"}


@router.get("/api/admin/contact/messages")
def list_contact_messages(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    messages = (
        db.query(ContactMessage)
        .order_by(ContactMessage.created_at.desc())
        .limit(200)
        .all()
    )
    return [
        {
            "id": message.id,
            "name": message.name,
            "email": message.email,
            "phone": message.phone,
            "message": message.message,
            "created_at": message.created_at,
        }
        for message in messages
    ]
