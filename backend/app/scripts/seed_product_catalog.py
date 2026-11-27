"""
Sync the product catalog into the `products` table.

Run from the backend folder (after `npm run export:catalog` in the project root):

    python -m app.scripts.seed_product_catalog            # safe to re-run
    python -m app.scripts.seed_product_catalog --prune    # also delete products NOT in the catalog

Each catalog item carries the frontend product `id`, and that id is used as the
database primary key. This makes the IDs the React app sends to the cart, wishlist,
checkout and product pages identical to the rows stored in MySQL.

Rules:
  * Missing id          -> product is inserted with that exact id.
  * Same id, same name  -> existing price / stock / custom edits are preserved;
                           empty fields and placeholder images are filled from the catalog.
  * Same id, other name -> the id was previously used by a different product, so the row
                           is overwritten and any cart / wishlist rows that pointed at it
                           are removed (they referred to the wrong product).
"""

import argparse
import json
import logging
import re
from pathlib import Path
from typing import Any

from sqlalchemy import func, inspect, text
from sqlalchemy.orm import Session

from app.database.database import Base, SessionLocal, engine
from app.models.cart_item import CartItem
from app.models.category import Category
from app.models.product import Product
from app.models.wishlist import Wishlist

logger = logging.getLogger(__name__)

CATALOG_FILE = (
    Path(__file__).resolve().parents[2] / "data" / "product_catalog.json"
)
PROMOTIONAL_IMAGE = re.compile(r"mediction(?:[1-3])?\.png$", re.IGNORECASE)
GENERIC_PRODUCT_IMAGE = re.compile(
    r"product\d+\.(?:png|jpe?g|webp)$", re.IGNORECASE
)
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
            for index in inspector.get_indexes("products"):
                if index.get("unique") and index.get("column_names") == ["name"]:
                    if index["name"] == "uq_products_name":
                        connection.execute(
                            text("ALTER TABLE products DROP INDEX `uq_products_name`")
                        )


def normalize_product_name(name: str) -> str:
    normalized = re.sub(r"(\d+)\s+(mg|mcg|ml|g)\b", r"\1\2", name.lower())
    return re.sub(r"[^a-z0-9]+", " ", normalized).strip()


def is_placeholder_image(image_path: str | None) -> bool:
    if not image_path:
        return True

    image_name = re.split(r"[/\\]", image_path)[-1]
    return bool(
        PROMOTIONAL_IMAGE.fullmatch(image_name)
        or GENERIC_PRODUCT_IMAGE.fullmatch(image_name)
    )


def get_or_create_category(db: Session, name: str) -> Category:
    category_name = name.strip()
    category = (
        db.query(Category)
        .filter(func.lower(Category.name) == category_name.lower())
        .first()
    )
    if category is None:
        category = Category(name=category_name)
        db.add(category)
        db.flush()
    return category


def _seed_legacy_item(db: Session, item: dict[str, Any], existing_products: list[Product], category: Category) -> str:
    """Name-based sync for catalog items that have no explicit id.

    Returns "inserted", "updated" or "" (nothing changed).
    """
    product = (
        db.query(Product)
        .filter(
            func.lower(Product.name) == item["name"].strip().lower(),
            Product.category_id == category.id,
        )
        .first()
    )
    if product is None:
        product = next(
            (
                candidate
                for candidate in existing_products
                if normalize_product_name(candidate.name)
                == normalize_product_name(item["name"])
            ),
            None,
        )

    if product is None:
        catalog_name = normalize_product_name(item["name"])
        catalog_image = (item.get("image") or "").strip().casefold()
        if any(
            normalize_product_name(candidate.name) == catalog_name
            or (
                catalog_image
                and candidate.image
                and candidate.image.strip().casefold() == catalog_image
            )
            for candidate in existing_products
        ):
            return ""
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
        existing_products.append(product)
        return "inserted"

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

    catalog_image = item.get("image")
    if catalog_image and is_placeholder_image(product.image):
        if product.image != catalog_image:
            product.image = catalog_image
            changed = True

    return "updated" if changed else ""


def _seed_item_by_id(db: Session, item: dict[str, Any], category: Category, stats: dict[str, int]) -> bool:
    """Id-based sync. Returns True when a new product was inserted."""
    product_id = int(item["id"])
    name = item["name"].strip()
    product = db.get(Product, product_id)

    if product is None:
        db.add(
            Product(
                id=product_id,
                name=name,
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
        )
        return True

    if normalize_product_name(product.name) != normalize_product_name(name):
        # This id previously belonged to a different product. Remove the cart and
        # wishlist rows that point at it, then overwrite the row with the catalog product.
        stats["stale_cart_rows_removed"] += (
            db.query(CartItem)
            .filter(CartItem.product_id == product_id)
            .delete(synchronize_session=False)
        )
        stats["stale_cart_rows_removed"] += (
            db.query(Wishlist)
            .filter(Wishlist.product_id == product_id)
            .delete(synchronize_session=False)
        )
        product.name = name
        product.category = category
        product.description = item.get("description")
        product.price = item["price"]
        product.discount_price = item.get("discount_price")
        product.stock = item.get("stock", 100)
        product.image = item.get("image")
        product.rating = item.get("rating", 0)
        product.reviews = item.get("reviews", 0)
        product.brand = item.get("brand")
        product.pack_size = item.get("pack_size")
        product.expiry = item.get("expiry")
        product.delivery = item.get("delivery")
        product.return_policy = item.get("return_policy")
        product.is_active = True
        stats["replaced"] += 1
        return False

    # Same product: keep admin-edited pricing and stock, fill any gaps.
    changed = False
    if product.category_id != category.id:
        product.category = category
        changed = True
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
    catalog_image = item.get("image")
    if catalog_image and is_placeholder_image(product.image) and product.image != catalog_image:
        product.image = catalog_image
        changed = True
    if changed:
        stats["updated_by_id"] += 1
    return False


def seed_catalog(
    db: Session,
    catalog: list[dict[str, Any]],
    prune: bool = False,
) -> dict[str, int]:
    """Sync catalog items into the products table.

    Items with an "id" use the id-based sync (the id becomes the primary key).
    Items without an "id" use the original name-based sync.
    Returns {"inserted": n, "updated": n}; extra details are logged.
    """
    inserted = 0
    legacy_updated = 0
    stats = {"replaced": 0, "stale_cart_rows_removed": 0, "updated_by_id": 0}
    existing_products = db.query(Product).all()
    catalog_ids: set[int] = set()

    for item in catalog:
        category = get_or_create_category(db, item["category"])

        if item.get("id") is not None:
            catalog_ids.add(int(item["id"]))
            if _seed_item_by_id(db, item, category, stats):
                inserted += 1
            continue

        outcome = _seed_legacy_item(db, item, existing_products, category)
        if outcome == "inserted":
            inserted += 1
        elif outcome == "updated":
            legacy_updated += 1

    updated = legacy_updated + stats["updated_by_id"]

    pruned = 0
    if prune and catalog_ids:
        stale_products = (
            db.query(Product)
            .filter(~Product.id.in_(sorted(catalog_ids)))
            .all()
        )
        for product in stale_products:
            stats["stale_cart_rows_removed"] += (
                db.query(CartItem)
                .filter(CartItem.product_id == product.id)
                .delete(synchronize_session=False)
            )
            stats["stale_cart_rows_removed"] += (
                db.query(Wishlist)
                .filter(Wishlist.product_id == product.id)
                .delete(synchronize_session=False)
            )
            db.delete(product)
            pruned += 1

    db.commit()

    logger.info(
        "Catalog sync: %s inserted, %s updated, %s id-reused replaced, "
        "%s pruned, %s stale cart/wishlist rows removed.",
        inserted,
        updated,
        stats["replaced"],
        pruned,
        stats["stale_cart_rows_removed"],
    )
    return {"inserted": inserted, "updated": updated}


def main() -> None:
    parser = argparse.ArgumentParser(description="Sync the MediKart product catalog.")
    parser.add_argument(
        "--prune",
        action="store_true",
        help="Delete products that are not in the catalog file (and their cart/wishlist rows).",
    )
    args = parser.parse_args()

    if not CATALOG_FILE.is_file():
        raise FileNotFoundError(
            f"Product catalog export not found: {CATALOG_FILE}. "
            "Run `npm run export:catalog` from the medikart folder first."
        )

    with CATALOG_FILE.open(encoding="utf-8") as catalog_file:
        catalog = json.load(catalog_file)

    ensure_catalog_schema()
    with SessionLocal() as db:
        result = seed_catalog(db, catalog, prune=args.prune)

    print(
        f"Catalog sync complete: {result['inserted']} inserted, "
        f"{result['updated']} existing products completed. "
        "Details (replaced / pruned / stale cart rows) are in the log."
    )


if __name__ == "__main__":
    main()
