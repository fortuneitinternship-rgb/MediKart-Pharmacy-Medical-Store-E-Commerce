from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.address import Address
from app.schemas.address import AddressCreate, AddressResponse, AddressUpdate
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/addresses", tags=["Addresses"])

@router.post("", response_model=AddressResponse)
def create_address(
    data: AddressCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    address = Address(
        user_id=current_user.id,
        full_name=data.full_name,
        phone=data.phone,
        address_line1=data.address_line1,
        address_line2=data.address_line2,
        city=data.city,
        state=data.state,
        pincode=data.pincode,
        address_type=data.address_type,
        country=data.country,
        landmark=data.landmark,
        is_default=data.is_default,
    )

    db.add(address)
    db.commit()
    db.refresh(address)

    return address

@router.get("", response_model=list[AddressResponse])
def get_addresses(db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):

    return db.query(Address).filter(Address.user_id == current_user.id).all()


@router.put("/{address_id}", response_model=AddressResponse)
def update_address(
    address_id: int,
    data: AddressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    address = db.query(Address).filter(
        Address.id == address_id,
        Address.user_id == current_user.id,
    ).first()
    if address is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(address, field, value)
    db.commit()
    db.refresh(address)
    return address


@router.delete("/{address_id}", status_code=status.HTTP_200_OK)
def delete_address(
    address_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    address = db.query(Address).filter(
        Address.id == address_id,
        Address.user_id == current_user.id,
    ).first()
    if address is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found")

    db.delete(address)
    db.commit()
    return {"message": "Address deleted successfully"}