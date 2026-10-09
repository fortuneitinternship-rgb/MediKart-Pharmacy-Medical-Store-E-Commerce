from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_admin
from app.database.database import get_db
from app.models.category import Category
from app.models.product import Product
from app.models.user import User
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
        "description": product.description,

        "price": product.price,

        "discount_price": product.discount_price,

        "discount_percentage":
            calculate_discount(product),

        "category": product.category.name if product.category else None,

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
# PRODUCT COLLECTION AND ADMIN MUTATIONS
# -------------------------------------------------

@router.get("", response_model=list[ProductResponse])
def get_products(db: Session = Depends(get_db)):
    products = (
        db.query(Product)
        .options(joinedload(Product.category))
        .filter(Product.is_active.is_(True))
        .order_by(Product.name)
        .all()
    )
    return [product_response(product) for product in products]


def get_or_create_category(db: Session, name: str) -> Category:
    category_name = name.strip()
    category = db.query(Category).filter(Category.name == category_name).first()
    if category is None:
        category = Category(name=category_name)
        db.add(category)
        db.flush()
    return category


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