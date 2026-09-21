import React, { useState } from "react";
import {
    FaBell,
    FaShoppingBag,
    FaTruck,
    FaGift,
    FaCheckCircle,
    FaTrash,
} from "react-icons/fa";
import "./Notifications.css";

const Notifications = () => {
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            icon: <FaShoppingBag />,
            title: "Order Confirmed",
            message: "Your order #MK100245 has been confirmed.",
            time: "2 hours ago",
        },
        {
            id: 2,
            icon: <FaTruck />,
            title: "Order Shipped",
            message: "Your Digital Thermometer has been shipped.",
            time: "Yesterday",
        },
        {
            id: 3,
            icon: <FaGift />,
            title: "New Offer",
            message: "Flat 20% OFF on medicines. Use code MEDI20.",
            time: "2 days ago",
        },
        {
            id: 4,
            icon: <FaCheckCircle />,
            title: "Prescription Approved",
            message: "Your uploaded prescription has been verified.",
            time: "3 days ago",
        },
    ]);

    const clearNotification = (id) => {
        const updated = notifications.filter(
            (item) => item.id !== id
        );

        setNotifications(updated);

        // Remove React icon before storing in localStorage
        const storageData = updated.map(
            ({ icon, ...item }) => item
        );

        localStorage.setItem(
            "notifications",
            JSON.stringify(storageData)
        );
    };

    return (
        <div className="notifications-page">
            <div className="notifications-header">
                <h2>
                    <FaBell />
                    Notifications
                </h2>
            </div>

            {notifications.length === 0 ? (
                <div className="empty-notification">
                    <FaBell />
                    <h3>No Notifications Found</h3>
                </div>
            ) : (
                notifications.map((item) => (
                    <div
                        className="notification-card"
                        key={item.id}
                    >
                        <div className="notification-icon">
                            {item.icon}
                        </div>

                        <div className="notification-content">
                            <h3>{item.title}</h3>

                            <p>{item.message}</p>

                            <small>{item.time}</small>
                        </div>

                        <button
                            className="delete-notification"
                            onClick={() =>
                                clearNotification(item.id)
                            }
                            aria-label={`Delete ${item.title}`}
                        >
                            <FaTrash />
                        </button>
                    </div>
                ))
            )}
        </div>
    );
};

export default Notifications;