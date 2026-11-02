import json
import re
from pathlib import Path
from typing import Any

from sqlalchemy import func, inspect, text
from sqlalchemy.orm import Session

from app.database.database import Base, SessionLocal, engine
from app.models.category import Category
from app.models.product import Product

CATALOG_FILE = (
    Path(__file__).resolve().parents[2] / "data" / "product_catalog.json"
)
PROMOTIONAL_IMAGE = re.compile(r"mediction(?:[1-3])?\.png$", re.IGNORECASE)
CATALOG_FIELDS = (
    "brand",
    "description",
    "pack_size",
    "expiry",
    "delivery",
    "return_policy",
)
PRODUCT_SCHEMA_COLUMNS = {
    "brand": "VARCHAR(255) NULL",
    "reviews": "INTEGER NOT NULL DEFAULT 0",
    "pack_size": "VARCHAR(100) NULL",
    "expiry": "VARCHAR(100) NULL",
    "delivery": "VARCHAR(100) NULL",
    "return_policy": "VARCHAR(255) NULL",
}


def ensure_catalog_schema(bind=engine) -> None:
    Base.metadata.create_all(bind=bind)
    inspector = inspect(bind)
    if "products" not in inspector.get_table_names():
        raise RuntimeError("The products table could not be initialized.")

    existing_columns = {
        column["name"] for column in inspector.get_columns("products")
    }
    missing_columns = [
        (name, definition)
        for name, definition in PRODUCT_SCHEMA_COLUMNS.items()
        if name not in existing_columns
    ]
    with bind.begin() as connection:
        for name, definition in missing_columns:
            connection.execute(
                text(f"ALTER TABLE products ADD COLUMN {name} {definition}")
            )
        if bind.dialect.name == "mysql":
            indexes = inspector.get_indexes("products")
            for index in indexes:
                if index.get("unique") and index.get("column_names") == ["name"]:
                    if index["name"] == "uq_products_name":
                        connection.execute(
                            text("ALTER TABLE products DROP INDEX `uq_products_name`")
                        )


def normalize_product_name(name: str) -> str:
    normalized = re.sub(r"(\d+)\s+(mg|mcg|ml|g)\b", r"\1\2", name.lower())
    return re.sub(r"[^a-z0-9]+", " ", normalized).strip()


def is_catalog_name_match(existing_name: str, catalog_name: str) -> bool:
    existing = normalize_product_name(existing_name)
    catalog = normalize_product_name(catalog_name)
    if existing == catalog:
        return True

    for base, candidate in ((catalog, existing), (existing, catalog)):
        if candidate.startswith(f"{base} "):
            suffix = candidate[len(base):].strip()
            return bool(
                re.fullmatch(
                    r"\d+(?:\.\d+)?(?:mg|mcg|ml|g|tablets?|capsules?|units?)",
                    suffix,
                )
            )
    return False


def seed_catalog(db: Session, catalog: list[dict[str, Any]]) -> dict[str, int]:
    inserted = 0
    updated = 0

    for item in catalog:
        category_name = item["category"].strip()
        category = (
            db.query(Category)
            .filter(func.lower(Category.name) == category_name.lower())
            .first()
        )
        if category is None:
            category = Category(name=category_name)
            db.add(category)
            db.flush()

        product = (
            db.query(Product)
            .filter(
                func.lower(Product.name) == item["name"].strip().lower(),
                Product.category_id == category.id,
            )
            .first()
        )
        if product is None:
            category_products = (
                db.query(Product)
                .filter(Product.category_id == category.id)
                .all()
            )
            product = next(
                (
                    candidate
                    for candidate in category_products
                    if is_catalog_name_match(candidate.name, item["name"])
                ),
                None,
            )

        if product is None:
            product = Product(
                name=item["name"].strip(),
                category=category,
                description=item.get("description"),
                price=item["price"],
                discount_price=item.get("discount_price"),
                stock=item.get("stock", 100),
                image=item.get("image"),
                rating=item.get("rating", 0),
                is_active=True,
                brand=item.get("brand"),
                reviews=item.get("reviews", 0),
                pack_size=item.get("pack_size"),
                expiry=item.get("expiry"),
                delivery=item.get("delivery"),
                return_policy=item.get("return_policy"),
            )
            db.add(product)
            inserted += 1
            continue

        changed = False
        for field in CATALOG_FIELDS:
            if not getattr(product, field) and item.get(field):
                setattr(product, field, item[field])
                changed = True

        if not product.reviews and item.get("reviews"):
            product.reviews = item["reviews"]
            changed = True

        if product.discount_price is None and item.get("discount_price") is not None:
            product.discount_price = item["discount_price"]
            changed = True

        if not product.rating and item.get("rating"):
            product.rating = item["rating"]
            changed = True

        if not product.image or PROMOTIONAL_IMAGE.search(product.image):
            product.image = item.get("image")
            changed = True

        if changed:
            updated += 1

    db.commit()
    return {"inserted": inserted, "updated": updated}


def main() -> None:
    if not CATALOG_FILE.is_file():
        raise FileNotFoundError(
            f"Product catalog export not found: {CATALOG_FILE}. "
            "Run `npm run export:catalog` from the medikart folder first."
        )

    with CATALOG_FILE.open(encoding="utf-8") as catalog_file:
        catalog = json.load(catalog_file)

    ensure_catalog_schema()
    with SessionLocal() as db:
        result = seed_catalog(db, catalog)

    print(
        f"Catalog sync complete: {result['inserted']} inserted, "
        f"{result['updated']} existing products completed."
    )


if __name__ == "__main__":
    main()
