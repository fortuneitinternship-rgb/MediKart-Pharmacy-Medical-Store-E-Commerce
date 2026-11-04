from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.database import get_db
from app.models.order import Order
from app.models.submission import (
    HealthRecord,
    OrderFeedback,
    Prescription,
)
from app.models.user import User
from app.schemas.submission import (
    HealthRecordCreate,
    HealthRecordResponse,
    OrderFeedbackCreate,
    PrescriptionResponse,
)

router = APIRouter(tags=["Submissions"])
MAX_PRESCRIPTION_SIZE = 10 * 1024 * 1024
PRESCRIPTION_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/png",
}


@router.post(
    "/api/feedback",
    status_code=status.HTTP_201_CREATED,
)
def create_order_feedback(
    data: OrderFeedbackCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(
        Order.order_id == data.order_id,
        Order.user_id == current_user.id,
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    feedback = OrderFeedback(
        user_id=current_user.id,
        order_id=order.order_id,
        rating=data.rating,
        feedback=data.feedback.strip(),
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return {"id": feedback.id, "message": "Feedback submitted"}


@router.get(
    "/api/health-records",
    response_model=list[HealthRecordResponse],
)
def get_health_records(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(HealthRecord).filter(
        HealthRecord.user_id == current_user.id
    ).order_by(HealthRecord.record_date.desc()).all()


@router.post(
    "/api/health-records",
    response_model=HealthRecordResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_health_record(
    data: HealthRecordCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    record = HealthRecord(user_id=current_user.id, **data.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.delete("/api/health-records/{record_id}")
def delete_health_record(
    record_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    record = db.query(HealthRecord).filter(
        HealthRecord.id == record_id,
        HealthRecord.user_id == current_user.id,
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Health record not found")
    db.delete(record)
    db.commit()
    return {"message": "Health record deleted"}


@router.post(
    "/api/prescriptions",
    response_model=PrescriptionResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_prescription(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if file.content_type not in PRESCRIPTION_TYPES:
        raise HTTPException(
            status_code=415,
            detail="Upload a PDF, JPEG, or PNG prescription",
        )

    content = await file.read(MAX_PRESCRIPTION_SIZE + 1)
    if not content:
        raise HTTPException(status_code=400, detail="The uploaded file is empty")
    if len(content) > MAX_PRESCRIPTION_SIZE:
        raise HTTPException(
            status_code=413,
            detail="Prescription file must be 10 MB or smaller",
        )

    prescription = Prescription(
        user_id=current_user.id,
        filename=(file.filename or "prescription").replace("\\", "/").split("/")[-1],
        content_type=file.content_type,
        content=content,
    )
    db.add(prescription)
    db.commit()
    db.refresh(prescription)
    return prescription


@router.get(
    "/api/prescriptions",
    response_model=list[PrescriptionResponse],
)
def get_prescriptions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Prescription).filter(
        Prescription.user_id == current_user.id
    ).order_by(Prescription.created_at.desc()).all()
