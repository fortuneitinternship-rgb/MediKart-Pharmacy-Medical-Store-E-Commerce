from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.database import get_db
from app.models.card import Card
from app.models.user import User
from app.schemas.card import (
    CardCreate,
    CardResponse
)


router = APIRouter(
    prefix="/api/card",
    tags=["card"]
)


@router.post(
    "",
    response_model=CardResponse
)
def add_card(
    data: CardCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    card = Card(
        user_id=current_user.id,
        card_holder_name=data.card_holder_name,
        last4=data.card_number[-4:],
        expiry_month=data.expiry_month,
        expiry_year=data.expiry_year,
        card_type=data.card_type
    )

    db.add(card)
    db.commit()
    db.refresh(card)

    return card


@router.get(
    "",
    response_model=list[CardResponse]
)
def get_card(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Card).filter(
        Card.user_id == current_user.id
    ).all()


@router.delete("/{card_id}")
def delete_card(
    card_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    card = db.query(Card).filter(
        Card.id == card_id,
        Card.user_id == current_user.id
    ).first()

    if not card:
        raise HTTPException(
            status_code=404,
            detail="Card not found"
        )

    db.delete(card)
    db.commit()

    return {
        "message": "Card deleted successfully"
    }