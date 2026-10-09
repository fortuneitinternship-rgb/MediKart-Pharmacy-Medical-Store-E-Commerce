from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.order import Order
from app.models.order_item import OrderItem
from app.schemas.order import OrderCreate, OrderResponse


router = APIRouter(
    prefix="/api/orders",
    tags=["Orders"]
)


# =========================================================
# CREATE ORDER
# =========================================================

@router.post(
    "/",
    response_model=OrderResponse,
    status_code=201
)
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db)
):

    try:

        # Generate MediKart Order ID
        generated_order_id = (
            "MK" +
            str(int(datetime.now().timestamp() * 1000))[-10:]
        )

        # Create order
        new_order = Order(
            order_id=generated_order_id,

            user_id=order_data.user_id,

            customer_name=order_data.customer_name,
            phone=order_data.phone,

            address=order_data.address,
            city=order_data.city,
            state=order_data.state,
            pincode=order_data.pincode,

            payment_method=order_data.payment_method,

            delivery_type=order_data.delivery_type,
            delivery_distance=order_data.delivery_distance,
            delivery_time=order_data.delivery_time,

            delivery_charge=order_data.delivery_charge,
            product_amount=order_data.product_amount,
            discount=order_data.discount,
            platform_fee=order_data.platform_fee,
            total_amount=order_data.total_amount,

            status="Order Confirmed"
        )

        db.add(new_order)

        db.flush()

        # Add products
        for item in order_data.items:

            order_item = OrderItem(

                order_id=new_order.id,

                product_id=item.product_id,

                product_name=item.product_name,

                quantity=item.quantity,

                price=item.price,

                total=item.total,

                image=item.image
            )

            db.add(order_item)

        db.commit()

        db.refresh(new_order)

        return new_order

    except Exception as error:

        db.rollback()

        print("ORDER CREATE ERROR:", error)

        raise HTTPException(
            status_code=500,
            detail="Unable to create order."
        )


# =========================================================
# GET ALL ORDERS
# =========================================================

@router.get("/")
def get_orders(
    db: Session = Depends(get_db)
):

    orders = (
        db.query(Order)
        .order_by(Order.id.desc())
        .all()
    )

    result = []

    for order in orders:

        items = (
            db.query(OrderItem)
            .filter(
                OrderItem.order_id == order.id
            )
            .all()
        )

        result.append({

            "id": order.id,

            "order_id": order.order_id,

            "user_id": order.user_id,

            "customer_name": order.customer_name,

            "phone": order.phone,

            "address": order.address,

            "city": order.city,

            "state": order.state,

            "pincode": order.pincode,

            "payment_method": order.payment_method,

            "delivery_type": order.delivery_type,

            "delivery_distance":
                order.delivery_distance,

            "delivery_time":
                order.delivery_time,

            "delivery_charge":
                order.delivery_charge,

            "product_amount":
                order.product_amount,

            "discount":
                order.discount,

            "platform_fee":
                order.platform_fee,

            "total_amount":
                order.total_amount,

            "status":
                order.status,

            "items": [

                {
                    "id": item.id,

                    "product_id":
                        item.product_id,

                    "product_name":
                        item.product_name,

                    "quantity":
                        item.quantity,

                    "price":
                        item.price,

                    "total":
                        item.total,

                    "image":
                        item.image
                }

                for item in items
            ]
        })

    return result


# =========================================================
# GET ORDER BY ORDER ID
# =========================================================

@router.get("/{order_id}")
def get_order(
    order_id: str,
    db: Session = Depends(get_db)
):

    order = (
        db.query(Order)
        .filter(
            Order.order_id == order_id
        )
        .first()
    )

    if not order:

        raise HTTPException(
            status_code=404,
            detail="Order not found."
        )

    items = (
        db.query(OrderItem)
        .filter(
            OrderItem.order_id == order.id
        )
        .all()
    )

    return {

        "id": order.id,

        "order_id": order.order_id,

        "user_id": order.user_id,

        "customer_name":
            order.customer_name,

        "phone":
            order.phone,

        "address":
            order.address,

        "city":
            order.city,

        "state":
            order.state,

        "pincode":
            order.pincode,

        "payment_method":
            order.payment_method,

        "delivery_type":
            order.delivery_type,

        "delivery_distance":
            order.delivery_distance,

        "delivery_time":
            order.delivery_time,

        "delivery_charge":
            order.delivery_charge,

        "product_amount":
            order.product_amount,

        "discount":
            order.discount,

        "platform_fee":
            order.platform_fee,

        "total_amount":
            order.total_amount,

        "status":
            order.status,

        "items": [

            {
                "id": item.id,

                "product_id":
                    item.product_id,

                "product_name":
                    item.product_name,

                "quantity":
                    item.quantity,

                "price":
                    item.price,

                "total":
                    item.total,

                "image":
                    item.image
            }

            for item in items
        ]
    }