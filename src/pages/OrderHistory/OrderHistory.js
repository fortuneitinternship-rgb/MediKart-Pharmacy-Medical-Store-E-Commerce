import React, { useEffect, useState } from "react";
import { FaBox, FaCalendarAlt, FaCheckCircle, FaTruck } from "react-icons/fa";
import "./OrderHistory.css";

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        loadOrders();

        const handleOrderUpdate = () => {
            loadOrders();
        };

        window.addEventListener("ordersUpdated", handleOrderUpdate);

        return () => {
            window.removeEventListener("ordersUpdated", handleOrderUpdate);
        };
    }, []);

    const loadOrders = () => {
        try {
            const savedOrders = JSON.parse(
                localStorage.getItem("orders") || "[]"
            );

            setOrders(Array.isArray(savedOrders) ? savedOrders : []);
        } catch (error) {
            console.error("Error loading orders:", error);
            setOrders([]);
        }
    };

    const formatDate = (date) => {
        if (!date) return "Date not available";

        // Already formatted date
        if (
            typeof date === "string" &&
            /^\d{1,2} [A-Za-z]+ \d{4}$/.test(date)
        ) {
            return date;
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return date;
        }

        return parsedDate.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const getOrderItems = (order) => {
        if (Array.isArray(order.items)) {
            return order.items;
        }

        if (Array.isArray(order.products)) {
            return order.products;
        }

        if (order.productName) {
            return [
                {
                    name: order.productName,
                    brand: order.brand,
                    image: order.image,
                    price: order.price,
                    quantity: order.quantity || 1,
                },
            ];
        }

        return [];
    };

    const getStatusClass = (status) => {
        const value = String(status || "Processing").toLowerCase();

        if (value === "delivered") return "delivered";
        if (value === "shipped") return "shipped";
        if (value === "cancelled") return "cancelled";
        if (value === "out for delivery") return "out-for-delivery";

        return "processing";
    };

    const getStatusIcon = (status) => {
        const value = String(status || "").toLowerCase();

        if (value === "delivered") {
            return <FaCheckCircle />;
        }

        if (
            value === "shipped" ||
            value === "out for delivery"
        ) {
            return <FaTruck />;
        }

        return <FaBox />;
    };

    const getTotal = (order) => {
        if (order.totalAmount !== undefined) {
            return order.totalAmount;
        }

        if (order.total !== undefined) {
            return order.total;
        }

        if (order.totalPrice !== undefined) {
            return order.totalPrice;
        }

        const items = getOrderItems(order);

        return items.reduce((total, item) => {
            return (
                total +
                Number(item.price || 0) *
                Number(item.quantity || 1)
            );
        }, 0);
    };

    const handleClearHistory = () => {
        const confirmDelete = window.confirm(
            "Are you sure you want to clear your order history?"
        );

        if (!confirmDelete) return;

        localStorage.removeItem("orders");
        setOrders([]);

        window.dispatchEvent(new Event("ordersUpdated"));
    };

    return (
        <div className="order-history-page">
            <div className="order-history-container">

                {/* Page Header */}
                <div className="order-history-header">
                    <div>
                        <h1>Order History</h1>
                        <p>
                            View all your previous MEDIKART orders.
                        </p>
                    </div>

                    {orders.length > 0 && (
                        <button
                            className="clear-history-btn"
                            onClick={handleClearHistory}
                        >
                            Clear History
                        </button>
                    )}
                </div>

                {/* Empty State */}
                {orders.length === 0 ? (
                    <div className="order-history-empty">
                        <div className="empty-icon">
                            <FaBox />
                        </div>

                        <h2>No Orders Yet</h2>

                        <p>
                            You haven't placed any orders yet.
                        </p>

                        <button
                            className="shop-now-btn"
                            onClick={() => {
                                window.location.href = "/shop";
                            }}
                        >
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="order-history-list">

                        {orders.map((order, index) => {
                            const items = getOrderItems(order);

                            const orderId =
                                order.orderId ||
                                order.id ||
                                `MED${10000 + index}`;

                            const status =
                                order.status || "Processing";

                            const orderDate =
                                order.orderDate ||
                                order.date ||
                                order.createdAt;

                            return (
                                <div
                                    className="history-order-card"
                                    key={orderId}
                                >

                                    {/* Order Top */}
                                    <div className="history-order-top">

                                        <div className="history-order-info">
                                            <h2>
                                                Order #{orderId}
                                            </h2>

                                            <div className="history-date">
                                                <FaCalendarAlt />

                                                <span>
                                                    {formatDate(orderDate)}
                                                </span>
                                            </div>
                                        </div>

                                        <div
                                            className={`history-status ${getStatusClass(
                                                status
                                            )}`}
                                        >
                                            {getStatusIcon(status)}

                                            <span>{status}</span>
                                        </div>

                                    </div>

                                    {/* Products */}
                                    <div className="history-products">

                                        {items.map((item, itemIndex) => (
                                            <div
                                                className="history-product"
                                                key={`${orderId}-${itemIndex}`}
                                            >

                                                <div className="history-product-image">

                                                    {item.image ? (
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                        />
                                                    ) : (
                                                        <div className="product-placeholder">
                                                            <FaBox />
                                                        </div>
                                                    )}

                                                </div>

                                                <div className="history-product-details">

                                                    <h3>
                                                        {item.name ||
                                                            "Product"}
                                                    </h3>

                                                    {item.brand && (
                                                        <p>
                                                            <strong>
                                                                Brand:
                                                            </strong>{" "}
                                                            {item.brand}
                                                        </p>
                                                    )}

                                                    <p>
                                                        <strong>
                                                            Quantity:
                                                        </strong>{" "}
                                                        {item.quantity || 1}
                                                    </p>

                                                    {item.price !==
                                                        undefined && (
                                                            <p className="history-price">
                                                                ₹{item.price}
                                                            </p>
                                                        )}

                                                </div>

                                            </div>
                                        ))}

                                    </div>

                                    {/* Order Bottom */}
                                    <div className="history-order-bottom">

                                        <div>
                                            <span className="total-label">
                                                Total Amount
                                            </span>

                                            <span className="total-price">
                                                ₹{getTotal(order)}
                                            </span>
                                        </div>

                                        {order.paymentMethod && (
                                            <div>
                                                <span className="payment-label">
                                                    Payment
                                                </span>

                                                <span>
                                                    {order.paymentMethod}
                                                </span>
                                            </div>
                                        )}

                                    </div>

                                </div>
                            );
                        })}

                    </div>
                )}

            </div>
        </div>
    );
};

export default OrderHistory;