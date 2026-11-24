
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.cart import Cart
from app.models.cart_item import CartItem
from app.models.product import Product
from app.models.shopping_list_import import ShoppingListImport
from app.api.deps import get_current_user


router = APIRouter(prefix="/api/cart", tags=["Cart"])


# =========================================================
# PYDANTIC SCHEMAS
# =========================================================

class CartQuantityUpdate(BaseModel):
    quantity: int = Field(ge=1)


class CartItemCreate(BaseModel):
    product_id: int = Field(gt=0)
    quantity: int = Field(default=1, ge=1)


class CartImportItem(BaseModel):
    product_id: int = Field(gt=0)
    quantity: int = Field(default=1, ge=1)


class CartImportRequest(BaseModel):
    migration_id: str = Field(min_length=8, max_length=64)
    items: list[CartImportItem] = Field(min_length=1, max_length=100)


# =========================================================
# CART HELPER FUNCTIONS
# =========================================================

def get_or_create_cart(db: Session, user_id: int):
    """
    Get the existing cart or create a new cart
    for the authenticated user.
    """

    cart = (
        db.query(Cart)
        .filter(Cart.user_id == user_id)
        .first()
    )

    if cart:
        return cart

    cart = Cart(user_id=user_id)

    db.add(cart)

    try:
        db.commit()
        db.refresh(cart)
        return cart

    except IntegrityError:
        db.rollback()

        # Another request might have created the cart.
        cart = (
            db.query(Cart)
            .filter(Cart.user_id == user_id)
            .first()
        )

        if cart:
            return cart

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Unable to create the user's cart.",
        )


def get_product_data(db: Session, product_id: int):
    """
    Return product details for the frontend.
    """

    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if product is None:
        return {
            "name": "Product",
            "price": 0,
            "discounted_price": 0,
            "image": "",
            "category": "",
        }

    price = getattr(product, "price", 0) or 0

    discounted_price = (
        getattr(product, "discounted_price", None)
        or getattr(product, "discount_price", None)
        or price
    )

    image = (
        getattr(product, "image_url", None)
        or getattr(product, "image", None)
        or ""
    )

    category = getattr(product, "category", None)

    if category is not None:
        category = getattr(category, "name", "") or ""

    return {
        "name": getattr(product, "name", "Product") or "Product",
        "price": float(price),
        "discounted_price": float(discounted_price),
        "image": image,
        "category": category,
    }


def serialize_cart_item(db: Session, item: CartItem):
    """
    Convert cart item into JSON-compatible response.
    """

    product_data = get_product_data(db, item.product_id)

    return {
        "id": item.id,
        "product_id": item.product_id,
        "quantity": item.quantity,
        "name": product_data["name"],
        "price": product_data["price"],
        "discounted_price": product_data["discounted_price"],
        "image": product_data["image"],
        "category": product_data["category"],
    }


def get_cart_items(db: Session, user_id: int):
    """
    Retrieve cart items using cart_id.
    """

    cart = get_or_create_cart(db, user_id)

    return (
        db.query(CartItem)
        .filter(CartItem.cart_id == cart.id)
        .all()
    )


def get_cart_item(
    db: Session,
    cart_id: int,
    product_id: int,
):
    return (
        db.query(CartItem)
        .filter(
            CartItem.cart_id == cart_id,
            CartItem.product_id == product_id,
        )
        .first()
    )


# =========================================================
# GET CART
# =========================================================

@router.get("")
@router.get("/")
def get_cart(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    items = get_cart_items(db, current_user.id)

    return {
        "message": "Cart retrieved successfully.",
        "items": [
            serialize_cart_item(db, item)
            for item in items
        ],
        "total_items": sum(item.quantity for item in items),
    }


# =========================================================
# ADD PRODUCT TO CART
# =========================================================

@router.post("", status_code=status.HTTP_201_CREATED)
@router.post("/", status_code=status.HTTP_201_CREATED)
def add_cart_item(
    payload: CartItemCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # Check product existence.
    product = (
        db.query(Product)
        .filter(Product.id == payload.product_id)
        .first()
    )

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )

    # Check product stock.
    if product.stock < payload.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Requested quantity is not available in stock.",
        )

    # Get or create user's cart.
    cart = get_or_create_cart(db, current_user.id)

    # Find existing product in this cart.
    existing_item = get_cart_item(
        db,
        cart.id,
        payload.product_id,
    )

    if existing_item:
        new_quantity = existing_item.quantity + payload.quantity

        if new_quantity > product.stock:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Requested quantity exceeds available stock.",
            )

        existing_item.quantity = new_quantity

        try:
            db.commit()
            db.refresh(existing_item)

        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Unable to update the cart quantity.",
            )

        return {
            "message": "Product quantity updated in cart.",
            "item": serialize_cart_item(db, existing_item),
        }

    # Create new cart item with cart_id.
    item = CartItem(
        cart_id=cart.id,
        user_id=current_user.id,
        product_id=payload.product_id,
        quantity=payload.quantity,
    )

    db.add(item)

    try:
        db.commit()
        db.refresh(item)

    except IntegrityError:
        db.rollback()

        # Check whether another request inserted the same product.
        existing_item = get_cart_item(
            db,
            cart.id,
            payload.product_id,
        )

        if existing_item:
            new_quantity = existing_item.quantity + payload.quantity

            if new_quantity > product.stock:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Requested quantity exceeds available stock.",
                )

            existing_item.quantity = new_quantity

            try:
                db.commit()
                db.refresh(existing_item)
            except IntegrityError:
                db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Unable to update the cart quantity.",
                )

            return {
                "message": "Product quantity updated in cart.",
                "item": serialize_cart_item(db, existing_item),
            }

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Unable to add this product to your cart.",
        )

    return {
        "message": "Product added to cart successfully.",
        "item": serialize_cart_item(db, item),
    }


# =========================================================
# IMPORT LOCAL / GUEST CART
# =========================================================

@router.post("/import")
def import_local_cart(
    payload: CartImportRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # Check whether migration was already completed.
    existing_import = (
        db.query(ShoppingListImport)
        .filter(
            ShoppingListImport.user_id == current_user.id,
            ShoppingListImport.list_type == "cart",
            ShoppingListImport.migration_id == payload.migration_id,
        )
        .first()
    )

    if existing_import:
        return {
            "message": "Cart import was already processed.",
            "items": [
                serialize_cart_item(db, item)
                for item in get_cart_items(db, current_user.id)
            ],
        }

    # Combine duplicate product IDs.
    quantities: dict[int, int] = {}

    for item in payload.items:
        quantities[item.product_id] = (
            quantities.get(item.product_id, 0)
            + item.quantity
        )

    # Validate all products.
    products = (
        db.query(Product)
        .filter(Product.id.in_(list(quantities.keys())))
        .all()
    )

    products_by_id = {
        product.id: product
        for product in products
    }

    missing_product_ids = (
        set(quantities.keys())
        - set(products_by_id.keys())
    )

    if missing_product_ids:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Products not found: {sorted(missing_product_ids)}.",
        )

    # Validate stock.
    for product_id, quantity in quantities.items():
        product = products_by_id[product_id]

        existing_item = (
            db.query(CartItem)
            .filter(
                CartItem.user_id == current_user.id,
                CartItem.product_id == product_id,
            )
            .first()
        )

        current_quantity = (
            existing_item.quantity if existing_item else 0
        )

        if current_quantity + quantity > product.stock:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for product {product_id}.",
            )

    # Get or create cart.
    cart = get_or_create_cart(db, current_user.id)

    try:
        for product_id, quantity in quantities.items():

            existing_item = get_cart_item(
                db,
                cart.id,
                product_id,
            )

            if existing_item:
                existing_item.quantity += quantity

            else:
                db.add(
                    CartItem(
                        cart_id=cart.id,
                        user_id=current_user.id,
                        product_id=product_id,
                        quantity=quantity,
                    )
                )

        # Record successful migration.
        db.add(
            ShoppingListImport(
                user_id=current_user.id,
                list_type="cart",
                migration_id=payload.migration_id,
            )
        )

        db.commit()

    except IntegrityError:
        db.rollback()

        existing_import = (
            db.query(ShoppingListImport)
            .filter(
                ShoppingListImport.user_id == current_user.id,
                ShoppingListImport.list_type == "cart",
                ShoppingListImport.migration_id == payload.migration_id,
            )
            .first()
        )

        if existing_import:
            return {
                "message": "Cart import was already processed.",
                "items": [
                    serialize_cart_item(db, item)
                    for item in get_cart_items(db, current_user.id)
                ],
            }

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cart import conflicts with existing data.",
        )

    return {
        "message": "Cart imported successfully.",
        "items": [
            serialize_cart_item(db, item)
            for item in get_cart_items(db, current_user.id)
        ],
    }


# =========================================================
# UPDATE CART ITEM QUANTITY
# =========================================================

@router.put("/{cart_item_id}")
def update_cart_item(
    cart_item_id: int,
    payload: CartQuantityUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    cart = get_or_create_cart(db, current_user.id)

    item = (
        db.query(CartItem)
        .filter(
            CartItem.id == cart_item_id,
            CartItem.cart_id == cart.id,
        )
        .first()
    )

    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found.",
        )

    product = (
        db.query(Product)
        .filter(Product.id == item.product_id)
        .first()
    )

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )

    if payload.quantity > product.stock:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Requested quantity exceeds available stock.",
        )

    item.quantity = payload.quantity

    try:
        db.commit()
        db.refresh(item)

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Unable to update cart item.",
        )

    return {
        "message": "Cart quantity updated successfully.",
        "item": serialize_cart_item(db, item),
    }


# =========================================================
# DELETE INDIVIDUAL CART ITEM
# =========================================================

@router.delete("/{cart_item_id}")
def delete_cart_item(
    cart_item_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    cart = get_or_create_cart(db, current_user.id)

    item = (
        db.query(CartItem)
        .filter(
            CartItem.id == cart_item_id,
            CartItem.cart_id == cart.id,
        )
        .first()
    )

    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found.",
        )

    db.delete(item)
    db.commit()

    return {
        "message": "Product removed from cart successfully."
    }


# =========================================================
# CLEAR ENTIRE CART
# =========================================================

@router.delete("")
@router.delete("/")
def clear_cart(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    cart = get_or_create_cart(db, current_user.id)

    db.query(CartItem).filter(
        CartItem.cart_id == cart.id
    ).delete(synchronize_session=False)

    db.commit()

    return {
        "message": "Cart cleared successfully."
    }
