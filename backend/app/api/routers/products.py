from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.database.database import get_db
from app.models.product import Product
from app.schemas.product import ProductResponse


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
        "description": product.description,

        "price": product.price,

        "discount_price": product.discount_price,

        "discount_percentage":
            calculate_discount(product),

        "category": product.category,

        "stock": product.stock,

        "image": product.image,

        "rating": product.rating,

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
            Product.created_at.desc()
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