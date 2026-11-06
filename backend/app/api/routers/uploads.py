from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.core.config import settings
from app.database.database import get_db
from app.models.product import Product
from app.models.product_image import ProductImage
from app.models.user import User

router = APIRouter(prefix="/api/uploads", tags=["Product Images"])
MAX_PRODUCT_IMAGE_SIZE = 5 * 1024 * 1024
IMAGE_SIGNATURES = {
    "image/jpeg": (".jpg", lambda data: data.startswith(b"\xff\xd8\xff")),
    "image/png": (".png", lambda data: data.startswith(b"\x89PNG\r\n\x1a\n")),
    "image/webp": (
        ".webp",
        lambda data: data.startswith(b"RIFF") and data[8:12] == b"WEBP",
    ),
}


@router.post(
    "/products/{product_id}",
    status_code=status.HTTP_201_CREATED,
)
async def upload_product_image(
    product_id: int,
    file: UploadFile = File(...),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )

    signature = IMAGE_SIGNATURES.get(file.content_type or "")
    if signature is None:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Upload a JPEG, PNG, or WebP product image.",
        )

    content = await file.read(MAX_PRODUCT_IMAGE_SIZE + 1)
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded image is empty.",
        )
    if len(content) > MAX_PRODUCT_IMAGE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Product images must be 5 MB or smaller.",
        )
    extension, matches_signature = signature
    if not matches_signature(content):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="The uploaded file content does not match its image type.",
        )

    product_directory = settings.UPLOAD_DIR / "products"
    product_directory.mkdir(parents=True, exist_ok=True)
    image_count = (
        db.query(func.count(ProductImage.id))
        .filter(ProductImage.product_id == product_id)
        .scalar()
        or 0
    )
    filename = f"{uuid4().hex}{extension}"
    file_path = product_directory / filename
    image_url = f"/uploads/products/{filename}"

    file_path.write_bytes(content)
    image = ProductImage(
        product_id=product_id,
        image_url=image_url,
        is_primary=image_count == 0,
        sort_order=image_count,
    )
    db.add(image)
    if image.is_primary:
        product.image = image_url

    try:
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        file_path.unlink(missing_ok=True)
        raise
    db.refresh(image)

    return {
        "id": image.id,
        "product_id": product_id,
        "image_url": image.image_url,
        "is_primary": image.is_primary,
        "sort_order": image.sort_order,
    }
