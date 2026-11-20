import React from "react";
import {
    FaBox,
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaCreditCard,
    FaTruck,
} from "react-icons/fa";
import "./OrderSummary.css";

const OrderSummary = ({ order }) => {
    if (!order) {
        return (
            <div className="order-summary-empty">
                <FaBox />
                <h2>Order Not Found</h2>
                <p>We couldn't find the selected order.</p>
            </div>
        );
    }

    const items = order.items || [];

    const subtotal = items.reduce((total, item) => {
        return (
            total +
            Number(item.price || 0) *
            Number(item.quantity || 1)
        );
    }, 0);

    const deliveryCharge =
        Number(order.deliveryCharge || 0);

    const discount =
        Number(order.discount || 0);

    const totalAmount =
        order.totalAmount !== undefined
            ? Number(order.totalAmount)
            : subtotal + deliveryCharge - discount;

    const orderDate =
        order.orderDate ||
        order.date ||
        "Date not available";

    return (
        <div className="order-summary-page">

            <div className="order-summary-container">

                {/* Header */}

                <div className="summary-header">
                    <div>
                        <h1>Order Summary</h1>

                        <p>
                            Order #{order.orderId || order.id}
                        </p>
                    </div>

                    <div className="summary-status">
                        {order.status || "Processing"}
                    </div>
                </div>

                {/* Order Information */}

                <div className="order-info-card">

                    <div className="order-info-item">
                        <FaBox />

                        <div>
                            <span>Order ID</span>

                            <strong>
                                #{order.orderId || order.id}
                            </strong>
                        </div>
                    </div>

                    <div className="order-info-item">
                        <FaCalendarAlt />

                        <div>
                            <span>Order Date</span>

                            <strong>{orderDate}</strong>
                        </div>
                    </div>

                    <div className="order-info-item">
                        <FaCreditCard />

                        <div>
                            <span>Payment Method</span>

                            <strong>
                                {order.paymentMethod ||
                                    "Online Payment"}
                            </strong>
                        </div>
                    </div>

                </div>

                {/* Products */}

                <div className="summary-card">

                    <div className="summary-card-title">
                        <FaBox />

                        <h2>Products Ordered</h2>
                    </div>

                    <div className="ordered-products">

                        {items.map((item, index) => {

                            const quantity =
                                Number(item.quantity || 1);

                            const price =
                                Number(item.price || 0);

                            const itemTotal =
                                price * quantity;

                            return (
                                <div
                                    className="ordered-product"
                                    key={
                                        item.id ||
                                        `${item.name}-${index}`
                                    }
                                >

                                    {/* Product Image */}

                                    <div className="ordered-product-image">

                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                            />
                                        ) : (
                                            <FaBox />
                                        )}

                                    </div>

                                    {/* Product Details */}

                                    <div className="ordered-product-details">

                                        <h3>
                                            {item.name}
                                        </h3>

                                        {item.brand && (
                                            <p>
                                                Brand:{" "}
                                                <strong>
                                                    {item.brand}
                                                </strong>
                                            </p>
                                        )}

                                        <p>
                                            Quantity:{" "}
                                            <strong>
                                                {quantity}
                                            </strong>
                                        </p>

                                        <p className="unit-price">
                                            ₹{price} × {quantity}
                                        </p>

                                    </div>

                                    {/* Item Total */}

                                    <div className="ordered-product-total">
                                        ₹{itemTotal}
                                    </div>

                                </div>
                            );
                        })}

                    </div>

                </div>

                {/* Delivery Address */}

                <div className="summary-card">

                    <div className="summary-card-title">
                        <FaMapMarkerAlt />

                        <h2>Delivery Address</h2>
                    </div>

                    <div className="delivery-address">

                        {order.deliveryAddress ? (
                            <p>{order.deliveryAddress}</p>
                        ) : order.address ? (
                            <p>{order.address}</p>
                        ) : (
                            <p>
                                Delivery address not available.
                            </p>
                        )}

                    </div>

                </div>

                {/* Price Details */}

                <div className="summary-card">

                    <div className="summary-card-title">
                        <FaTruck />

                        <h2>Price Details</h2>
                    </div>

                    <div className="price-details">

                        <div className="price-row">
                            <span>Product Total</span>

                            <strong>
                                ₹{subtotal}
                            </strong>
                        </div>

                        <div className="price-row">
                            <span>Delivery Charge</span>

                            <strong>
                                {deliveryCharge === 0
                                    ? "FREE"
                                    : `₹${deliveryCharge}`}
                            </strong>
                        </div>

                        {discount > 0 && (
                            <div className="price-row discount-row">
                                <span>Discount</span>

                                <strong>
                                    - ₹{discount}
                                </strong>
                            </div>
                        )}

                        <div className="price-row final-total">
                            <span>Total Amount</span>

                            <strong>
                                ₹{totalAmount}
                            </strong>
                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default OrderSummary;