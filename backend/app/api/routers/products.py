
from datetime import datetime
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_admin
from app.database.database import get_db
from app.models.category import Category
from app.models.product import Product
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryResponse, CategoryUpdate
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate


router = APIRouter(
    prefix="/api/products",
    tags=["Products"],
)


# -------------------------------------------------
# PRODUCT RESPONSE HELPERS
# -------------------------------------------------

def calculate_discount(product):
    if product.discount_price is None or product.price <= 0:
        return 0

    discount = (
        (product.price - product.discount_price)
        / product.price
    ) * 100

    return round(discount, 2)


def product_response(product):
    return {
        "id": product.id,
        "name": product.name,
        "brand": product.brand,
        "description": product.description,
        "price": product.price,
        "discount_price": product.discount_price,
        "discount_percentage": calculate_discount(product),
        "category": product.category.name if product.category else None,
        "stock": product.stock,
        "image": product.image,
        "rating": product.rating,
        "reviews": product.reviews or 0,
        "pack_size": product.pack_size,
        "expiry": product.expiry,
        "delivery": product.delivery,
        "return_policy": product.return_policy,
        "is_active": product.is_active,
        "is_featured": product.is_featured,
        "is_trending": product.is_trending,
        "is_flash_sale": product.is_flash_sale,
        "flash_sale_start": product.flash_sale_start,
        "flash_sale_end": product.flash_sale_end,
        "created_at": product.created_at,
        "updated_at": product.updated_at,
    }


# -------------------------------------------------
# PRODUCT DUPLICATE VALIDATION
# -------------------------------------------------


# -------------------------------------------------
# PRODUCT DUPLICATE VALIDATION
# -------------------------------------------------

def normalize_text(value):
    if value is None:
        return None

    return " ".join(str(value).split()).casefold()


def ensure_product_is_unique(
    db: Session,
    name: str,
    image: str | None = None,
    exclude_product_id: int | None = None,
) -> None:
    """
    Prevent duplicate product names and duplicate image paths.
    Name comparison ignores case and extra whitespace.
    Image comparison ignores case and surrounding whitespace.
    """

    normalized_name = normalize_text(name)
    normalized_image = normalize_text(image)

    if not normalized_name:
        raise HTTPException(
            status_code=422,
            detail="Product name cannot be blank.",
        )

    query = db.query(Product)

    if exclude_product_id is not None:
        query = query.filter(
            Product.id != exclude_product_id
        )

    existing_products = query.all()

    for existing in existing_products:
        existing_name = normalize_text(existing.name)
        existing_image = normalize_text(existing.image)

        # Duplicate product name
        if existing_name == normalized_name:
            raise HTTPException(
                status_code=409,
                detail="A product with this name already exists.",
            )

        # Duplicate product image
        if (
            normalized_image is not None
            and existing_image is not None
            and existing_image == normalized_image
        ):
            raise HTTPException(
                status_code=409,
                detail="This image is already assigned to another product.",
            )

def ensure_product_is_unique(
    db: Session,
    name: str,
    image: str | None = None,
    exclude_product_id: int | None = None,
) -> None:

    normalized_name = " ".join(name.split()).casefold()
    normalized_image = (
        image.strip().casefold()
        if image
        else None
    )

    query = db.query(Product)

    if exclude_product_id is not None:
        query = query.filter(
            Product.id != exclude_product_id
        )

    existing_products = query.all()

    for existing in existing_products:

        existing_name = (
            " ".join(existing.name.split()).casefold()
        )

        existing_image = (
            existing.image.strip().casefold()
            if existing.image
            else None
        )

        if existing_name == normalized_name:
            raise HTTPException(
                status_code=409,
                detail="A product with this name already exists.",
            )

        if (
            normalized_image
            and existing_image
            and existing_image == normalized_image
        ):
            raise HTTPException(
                status_code=409,
                detail="This image is already assigned to another product.",
            )
# -------------------------------------------------
# CATEGORY HELPERS
# -------------------------------------------------

def get_or_create_category(
    db: Session,
    name: str,
) -> Category:

    category_name = name.strip()

    category = (
        db.query(Category)
        .filter(
            func.lower(Category.name) == category_name.lower()
        )
        .first()
    )

    if category is None:
        category = Category(name=category_name)
        db.add(category)
        db.flush()

    return category


# -------------------------------------------------
# PRODUCT LISTING
# -------------------------------------------------

@router.get(
    "",
    response_model=list[ProductResponse],
)
def get_products(
    q: str | None = Query(default=None, min_length=1, max_length=100),
    category: str | None = Query(default=None, min_length=1, max_length=100),
    min_price: float | None = Query(default=None, ge=0),
    max_price: float | None = Query(default=None, ge=0),
    sort_by: Literal["name", "price", "rating", "created_at"] = "name",
    sort_order: Literal["asc", "desc"] = "asc",
    limit: int | None = Query(default=None, ge=1, le=1000),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):

    if (
        min_price is not None
        and max_price is not None
        and min_price > max_price
    ):
        raise HTTPException(
            status_code=422,
            detail="min_price cannot be greater than max_price.",
        )

    query = (
        db.query(Product)
        .options(joinedload(Product.category))
        .filter(Product.is_active.is_(True))
    )

    if q is not None:
        search = f"%{q.strip()}%"

        query = query.filter(
            or_(
                Product.name.ilike(search),
                Product.brand.ilike(search),
                Product.description.ilike(search),
            )
        )

    if category is not None:
        query = (
            query.join(Product.category)
            .filter(
                func.lower(Category.name) == category.strip().lower(),
                Category.is_active.is_(True),
            )
        )

    if min_price is not None:
        query = query.filter(
            func.coalesce(
                Product.discount_price,
                Product.price,
            ) >= min_price
        )

    if max_price is not None:
        query = query.filter(
            func.coalesce(
                Product.discount_price,
                Product.price,
            ) <= max_price
        )

    sort_column = {
        "name": Product.name,
        "price": func.coalesce(
            Product.discount_price,
            Product.price,
        ),
        "rating": Product.rating,
        "created_at": Product.created_at,
    }[sort_by]

    query = query.order_by(
        sort_column.desc() if sort_order == "desc"
        else sort_column.asc(),
        Product.id.asc(),
    )

    query = query.offset(offset)

    if limit is not None:
        query = query.limit(limit)

    products = query.all()

    return [
        product_response(product)
        for product in products
    ]


# -------------------------------------------------
# CATEGORIES
# -------------------------------------------------

@router.get(
    "/categories",
    response_model=list[CategoryResponse],
)
def list_categories(
    db: Session = Depends(get_db),
):

    return (
        db.query(Category)
        .filter(Category.is_active.is_(True))
        .order_by(Category.name)
        .all()
    )


@router.post(
    "/categories",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_category(
    data: CategoryCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):

    category = Category(**data.model_dump())

    db.add(category)

    try:
        db.commit()

    except IntegrityError as error:
        db.rollback()

        raise HTTPException(
            status_code=409,
            detail="A category with this name already exists.",
        ) from error

    db.refresh(category)

    return category


@router.put(
    "/categories/{category_id}",
    response_model=CategoryResponse,
)
def update_category(
    category_id: int,
    data: CategoryUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):

    category = (
        db.query(Category)
        .filter(Category.id == category_id)
        .first()
    )

    if category is None:
        raise HTTPException(
            status_code=404,
            detail="Category not found.",
        )

    values = data.model_dump(exclude_unset=True)

    for field, value in values.items():
        setattr(category, field, value)

    try:
        db.commit()

    except IntegrityError as error:
        db.rollback()

        raise HTTPException(
            status_code=409,
            detail="A category with this name already exists.",
        ) from error

    db.refresh(category)

    return category


@router.delete(
    "/categories/{category_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def deactivate_category(
    category_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):

    category = (
        db.query(Category)
        .filter(Category.id == category_id)
        .first()
    )

    if category is None:
        raise HTTPException(
            status_code=404,
            detail="Category not found.",
        )

    category.is_active = False
    db.commit()


# -------------------------------------------------
# CREATE PRODUCT
# -------------------------------------------------

@router.post(
    "",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_product(
    data: ProductCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):

    ensure_product_is_unique(
        db,
        name=data.name,
        image=data.image,
    )

    values = data.model_dump(exclude={"category"})

    product = Product(**values)

    product.category = get_or_create_category(
        db,
        data.category,
    )

    db.add(product)

    try:
        db.commit()

    except IntegrityError as error:
        db.rollback()

        raise HTTPException(
            status_code=409,
            detail="A product with these details already exists.",
        ) from error

    db.refresh(product)

    return product_response(product)


# -------------------------------------------------
# UPDATE PRODUCT
# -------------------------------------------------

@router.put(
    "/{product_id}",
    response_model=ProductResponse,
)
def update_product(
    product_id: int,
    data: ProductUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):

    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found.",
        )

    values = data.model_dump(exclude_unset=True)

    # Check uniqueness using updated values or
    # the product's existing values.
    new_name = values.get("name", product.name)
    new_image = values.get("image", product.image)

    ensure_product_is_unique(
        db=db,
        name=new_name,
        image=new_image,
        exclude_product_id=product.id,
    )

    category_name = values.pop("category", None)

    if category_name is not None:
        product.category = get_or_create_category(
            db,
            category_name,
        )

    for field, value in values.items():
        setattr(product, field, value)

    try:
        db.commit()

    except IntegrityError as error:
        db.rollback()

        raise HTTPException(
            status_code=409,
            detail="The product could not be updated because of a database conflict.",
        ) from error

    db.refresh(product)

    return product_response(product)


# -------------------------------------------------
# DELETE PRODUCT
# -------------------------------------------------

@router.delete(
    "/{product_id}",
)
def delete_product(
    product_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):

    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found.",
        )

    db.delete(product)

    try:
        db.commit()

    except IntegrityError as error:
        db.rollback()

        raise HTTPException(
            status_code=409,
            detail="Product cannot be deleted because it is being used elsewhere.",
        ) from error

    return {
        "message": "Product deleted successfully"
    }


# -------------------------------------------------
# FEATURED PRODUCTS
# -------------------------------------------------

@router.get(
    "/featured",
    response_model=list[ProductResponse],
)
def get_featured_products(
    limit: int = Query(default=8, ge=1, le=100),
    db: Session = Depends(get_db),
):

    products = (
        db.query(Product)
        .options(joinedload(Product.category))
        .filter(
            Product.is_active.is_(True),
            Product.is_featured.is_(True),
        )
        .limit(limit)
        .all()
    )

    return [
        product_response(product)
        for product in products
    ]


# -------------------------------------------------
# TRENDING PRODUCTS
# -------------------------------------------------

@router.get(
    "/trending",
    response_model=list[ProductResponse],
)
def get_trending_products(
    limit: int = Query(default=8, ge=1, le=100),
    db: Session = Depends(get_db),
):

    products = (
        db.query(Product)
        .options(joinedload(Product.category))
        .filter(
            Product.is_active.is_(True),
            Product.is_trending.is_(True),
            Product.stock > 0,
        )
        .limit(limit)
        .all()
    )

    return [
        product_response(product)
        for product in products
    ]


# -------------------------------------------------
# FLASH SALE
# -------------------------------------------------

@router.get(
    "/flash-sale",
    response_model=list[ProductResponse],
)
def get_flash_sale_products(
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
):

    now = datetime.utcnow()

    products = (
        db.query(Product)
        .options(joinedload(Product.category))
        .filter(
            Product.is_active.is_(True),
            Product.is_flash_sale.is_(True),
            Product.stock > 0,
            Product.flash_sale_start <= now,
            Product.flash_sale_end >= now,
        )
        .limit(limit)
        .all()
    )

    return [
        product_response(product)
        for product in products
    ]


# -------------------------------------------------
# NEW ARRIVALS
# -------------------------------------------------

@router.get(
    "/new-arrivals",
    response_model=list[ProductResponse],
)
def get_new_arrivals(
    limit: int = Query(default=8, ge=1, le=100),
    db: Session = Depends(get_db),
):

    products = (
        db.query(Product)
        .options(joinedload(Product.category))
        .filter(Product.is_active.is_(True))
        .order_by(
            Product.created_at.desc(),
            Product.id.desc(),
        )
        .limit(limit)
        .all()
    )

    return [
        product_response(product)
        for product in products
    ]


# -------------------------------------------------
# PRODUCT DETAILS
# -------------------------------------------------

@router.get(
    "/{product_id}",
    response_model=ProductResponse,
)
def get_product_details(
    product_id: int,
    db: Session = Depends(get_db),
):

    product = (
        db.query(Product)
        .options(joinedload(Product.category))
        .filter(
            Product.id == product_id,
            Product.is_active.is_(True),
        )
        .first()
    )

    if product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found.",
        )

    return product_response(product)
