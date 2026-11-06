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
    tags=["Products"]
)


def calculate_discount(product):
    if (
        product.discount_price is None
        or product.price <= 0
    ):
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

        "discount_percentage":
            calculate_discount(product),

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

        "flash_sale_start":
            product.flash_sale_start,

        "flash_sale_end":
            product.flash_sale_end,

        "created_at":
            product.created_at,

        "updated_at":
            product.updated_at,
    }


# -------------------------------------------------
# PRODUCT COLLECTION AND ADMIN MUTATIONS
# -------------------------------------------------

@router.get("", response_model=list[ProductResponse])
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
    if min_price is not None and max_price is not None and min_price > max_price:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
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
        query = query.join(Product.category).filter(
            func.lower(Category.name) == category.strip().lower(),
            Category.is_active.is_(True),
        )
    if min_price is not None:
        query = query.filter(
            func.coalesce(Product.discount_price, Product.price) >= min_price
        )
    if max_price is not None:
        query = query.filter(
            func.coalesce(Product.discount_price, Product.price) <= max_price
        )

    sort_column = {
        "name": Product.name,
        "price": func.coalesce(Product.discount_price, Product.price),
        "rating": Product.rating,
        "created_at": Product.created_at,
    }[sort_by]
    query = query.order_by(
        sort_column.desc() if sort_order == "desc" else sort_column.asc(),
        Product.id.asc(),
    )
    query = query.offset(offset)
    if limit is not None:
        query = query.limit(limit)
    products = query.all()
    return [product_response(product) for product in products]


def get_or_create_category(db: Session, name: str) -> Category:
    category_name = name.strip()
    category = db.query(Category).filter(Category.name == category_name).first()
    if category is None:
        category = Category(name=category_name)
        db.add(category)
        db.flush()
    return category


@router.get("/categories", response_model=list[CategoryResponse])
def list_categories(db: Session = Depends(get_db)):
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
            status_code=status.HTTP_409_CONFLICT,
            detail="A category with this name already exists.",
        ) from error
    db.refresh(category)
    return category


@router.put("/categories/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    data: CategoryUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found.",
        )

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(category, field, value)
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A category with this name already exists.",
        ) from error
    db.refresh(category)
    return category


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def deactivate_category(
    category_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found.",
        )
    category.is_active = False
    db.commit()


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    data: ProductCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    values = data.model_dump(exclude={"category"})
    product = Product(**values)
    product.category = get_or_create_category(db, data.category)
    db.add(product)
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A product with these details already exists.",
        ) from error
    db.refresh(product)
    return product_response(product)


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    data: ProductUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    values = data.model_dump(exclude_unset=True)
    category_name = values.pop("category", None)
    if category_name is not None:
        product.category = get_or_create_category(db, category_name)
    for field, value in values.items():
        setattr(product, field, value)
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="The product could not be updated because of a database conflict.",
        ) from error
    db.refresh(product)
    return product_response(product)


@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    db.delete(product)
    db.commit()
    return {"message": "Product deleted successfully"}


# -------------------------------------------------
# 1. FEATURED PRODUCTS
# -------------------------------------------------

@router.get(
    "/featured",
    response_model=list[ProductResponse]
)
def get_featured_products(
    limit: int = Query(
        default=8,
        ge=1,
        le=100
    ),
    db: Session = Depends(get_db)
):

    products = (
        db.query(Product)
        .options(
            joinedload(Product.category)
        )
        .filter(
            Product.is_active == True,
            Product.is_featured == True
        )
        .limit(limit)
        .all()
    )

    return [
        product_response(product)
        for product in products
    ]


# -------------------------------------------------
# 2. TRENDING PRODUCTS
# -------------------------------------------------

@router.get(
    "/trending",
    response_model=list[ProductResponse]
)
def get_trending_products(
    limit: int = Query(
        default=8,
        ge=1,
        le=100
    ),
    db: Session = Depends(get_db)
):

    products = (
        db.query(Product)
        .options(
            joinedload(Product.category)
        )
        .filter(
            Product.is_active == True,
            Product.is_trending == True,
            Product.stock > 0
        )
        .limit(limit)
        .all()
    )

    return [
        product_response(product)
        for product in products
    ]


# -------------------------------------------------
# 3. FLASH SALE
# -------------------------------------------------

@router.get(
    "/flash-sale",
    response_model=list[ProductResponse]
)
def get_flash_sale_products(
    limit: int = Query(
        default=10,
        ge=1,
        le=100
    ),
    db: Session = Depends(get_db)
):

    now = datetime.utcnow()

    products = (
        db.query(Product)
        .options(
            joinedload(Product.category)
        )
        .filter(
            Product.is_active == True,
            Product.is_flash_sale == True,
            Product.stock > 0,
            Product.flash_sale_start <= now,
            Product.flash_sale_end >= now
        )
        .limit(limit)
        .all()
    )

    return [
        product_response(product)
        for product in products
    ]


# -------------------------------------------------
# 4. NEW ARRIVALS
# -------------------------------------------------

@router.get(
    "/new-arrivals",
    response_model=list[ProductResponse]
)
def get_new_arrivals(
    limit: int = Query(
        default=8,
        ge=1,
        le=100
    ),
    db: Session = Depends(get_db)
):

    products = (
        db.query(Product)
        .options(
            joinedload(Product.category)
        )
        .filter(
            Product.is_active == True
        )
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
# 5. PRODUCT DETAILS
# -------------------------------------------------

@router.get(
    "/{product_id}",
    response_model=ProductResponse
)
def get_product_details(
    product_id: int,
    db: Session = Depends(get_db)
):

    product = (
        db.query(Product)
        .options(
            joinedload(Product.category)
        )
        .filter(
            Product.id == product_id,
            Product.is_active == True
        )
        .first()
    )

    if product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return product_response(product)