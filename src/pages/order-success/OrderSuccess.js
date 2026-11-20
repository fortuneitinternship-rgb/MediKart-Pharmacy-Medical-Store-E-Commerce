import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    FaCheckCircle,
    FaShoppingBag,
    FaClipboardList,
} from "react-icons/fa";
import "./OrderSuccess.css";

const OrderSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const orderId =
        location.state?.orderId ||
        localStorage.getItem("lastOrderId") ||
        "MK0000000000";

    const handleContinueShopping = () => {
        navigate("/shop");
    };

    const handleViewOrders = () => {
        navigate("/orders");
    };

    return (
        <div className="order-success-page">
            <div className="order-success-card">

                <div className="success-icon">
                    <FaCheckCircle />
                </div>

                <h1>Order Placed Successfully!</h1>

                <p className="success-message">
                    Thank you for your order. Your order has been placed
                    successfully.
                </p>

                <div className="order-info">
                    <span>Order ID</span>
                    <strong>{orderId}</strong>
                </div>

                <p className="delivery-message">
                    Your order will be processed and delivered to you soon.
                </p>

                <div className="success-actions">

                    <button
                        className="view-orders-btn"
                        onClick={handleViewOrders}
                    >
                        <FaClipboardList />
                        View Orders
                    </button>

                    <button
                        className="continue-shopping-btn"
                        onClick={handleContinueShopping}
                    >
                        <FaShoppingBag />
                        Continue Shopping
                    </button>

                </div>

            </div>
        </div>
    );
};

export default OrderSuccess;