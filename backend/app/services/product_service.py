from datetime import datetime

from sqlalchemy.orm import Session, joinedload

from app.models.product import Product


def calculate_discount_percentage(product: Product) -> float:

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


def get_featured_products(
    db: Session,
    limit: int = 8
):
    return (
        db.query(Product)
        .filter(
            Product.is_active.is_(True),
            Product.is_featured.is_(True)
        )
        .order_by(Product.created_at.desc())
        .limit(limit)
        .all()
    )


def get_trending_products(
    db: Session,
    limit: int = 8
):
    return (
        db.query(Product)
        .filter(
            Product.is_active.is_(True),
            Product.is_trending.is_(True),
            Product.stock > 0
        )
        .order_by(Product.created_at.desc())
        .limit(limit)
        .all()
    )


def get_flash_sale_products(
    db: Session,
    limit: int = 10
):

    now = datetime.utcnow()

    return (
        db.query(Product)
        .filter(
            Product.is_active.is_(True),

            Product.is_flash_sale.is_(True),

            Product.stock > 0,

            Product.flash_sale_start <= now,

            Product.flash_sale_end >= now
        )
        .order_by(Product.flash_sale_end.asc())
        .limit(limit)
        .all()
    )


def get_new_arrivals(
    db: Session,
    limit: int = 8
):

    return (
        db.query(Product)
        .filter(
            Product.is_active.is_(True)
        )
        .order_by(
            Product.created_at.desc()
        )
        .limit(limit)
        .all()
    )


def get_product_details(
    db: Session,
    product_id: int
):

    return (
        db.query(Product)
        .options(
            joinedload(Product.category)
        )
        .filter(
            Product.id == product_id,
            Product.is_active.is_(True)
        )
        .first()
    )