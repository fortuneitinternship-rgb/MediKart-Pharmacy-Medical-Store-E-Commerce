import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    FaCheckCircle,
    FaBox,
    FaTruck,
    FaMapMarkerAlt,
    FaArrowLeft,
    FaShoppingBag,
    FaTimesCircle,
    FaCalendarAlt,
    FaShippingFast,
    FaTimes,
    FaSearch,
    FaCopy,
} from "react-icons/fa";

import { toast } from "react-toastify";

import "./Orders.css";

const Orders = () => {
    const navigate = useNavigate();

    // =====================================================
    // STATE
    // =====================================================

    const [orders, setOrders] = useState([]);
    const [filterTab, setFilterTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const [cancellingOrder, setCancellingOrder] = useState(null);
    const [cancelReason, setCancelReason] = useState(
        "Found a better price elsewhere"
    );

    // =====================================================
    // LOAD ORDERS
    // =====================================================

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

    // =====================================================
    // FORMAT ADDRESS
    // =====================================================

    const formatAddress = (address) => {
        if (!address) {
            return "Delivery address not available";
        }

        if (typeof address === "string") {
            return address;
        }

        const parts = [
            address.name,
            address.address,
            address.street,
            address.city,
            address.state,
            address.pincode ? `PIN: ${address.pincode}` : null,
        ].filter(Boolean);

        return parts.length
            ? parts.join(", ")
            : "Address details not available";
    };

    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (date) => {
        if (!date) {
            return "Date not available";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return String(date);
        }

        return parsedDate.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    // =====================================================
    // GET ORDER ITEMS
    // =====================================================

    const getOrderItems = (order) => {
        if (Array.isArray(order.items)) {
            return order.items;
        }

        if (Array.isArray(order.products)) {
            return order.products;
        }

        if (order.product) {
            return [order.product];
        }

        return [];
    };

    // =====================================================
    // STATUS BADGE
    // =====================================================

    const getStatusBadge = (status) => {
        const currentStatus = String(
            status || "Processing"
        ).toLowerCase();

        if (currentStatus.includes("cancel")) {
            return {
                label: "Cancelled",
                className: "status-cancelled",
                icon: <FaTimesCircle />,
            };
        }

        if (currentStatus.includes("deliver")) {
            return {
                label: "Delivered",
                className: "status-delivered",
                icon: <FaCheckCircle />,
            };
        }

        if (currentStatus.includes("out")) {
            return {
                label: "Out for Delivery",
                className: "status-out",
                icon: <FaShippingFast />,
            };
        }

        if (
            currentStatus.includes("ship") ||
            currentStatus.includes("transit")
        ) {
            return {
                label: "In Transit",
                className: "status-transit",
                icon: <FaTruck />,
            };
        }

        if (currentStatus.includes("pack")) {
            return {
                label: "Packed",
                className: "status-packed",
                icon: <FaBox />,
            };
        }

        return {
            label: status || "Order Confirmed",
            className: "status-confirmed",
            icon: <FaBox />,
        };
    };

    // =====================================================
    // COPY ORDER ID
    // =====================================================

    const handleCopyOrderId = async (orderId) => {
        try {
            await navigator.clipboard.writeText(String(orderId));

            toast.success("Order ID copied!");
        } catch (error) {
            console.error("Copy failed:", error);
            toast.error("Unable to copy Order ID");
        }
    };

    // =====================================================
    // CANCEL ORDER
    // =====================================================

    const handleConfirmCancel = () => {
        if (!cancellingOrder) {
            return;
        }

        try {
            const existingOrders = JSON.parse(
                localStorage.getItem("orders") || "[]"
            );

            const targetId =
                cancellingOrder.orderId || cancellingOrder.id;

            const cancelledTime = new Date().toLocaleString("en-IN");

            const updatedOrders = existingOrders.map((item) => {
                const itemId = item.orderId || item.id;

                if (String(itemId) === String(targetId)) {
                    return {
                        ...item,
                        status: "Cancelled",
                        cancelReason,
                        cancelledAt: cancelledTime,
                        cancellationDetails: {
                            reason: cancelReason,
                            cancelledAt: cancelledTime,
                        },
                    };
                }

                return item;
            });

            localStorage.setItem(
                "orders",
                JSON.stringify(updatedOrders)
            );

            setOrders(updatedOrders);

            window.dispatchEvent(new Event("ordersUpdated"));

            toast.info(`Order #${targetId} has been cancelled.`);

            setCancellingOrder(null);
        } catch (error) {
            console.error("Error cancelling order:", error);

            toast.error("Failed to cancel order.");
        }
    };

    // =====================================================
    // FILTER ORDERS
    // =====================================================

    const filteredOrders = orders.filter((order) => {
        const status = String(order.status || "").toLowerCase();

        const orderId = String(
            order.orderId || order.id || ""
        ).toLowerCase();

        // Search
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();

            const matchesOrderId = orderId.includes(query);

            const items = getOrderItems(order);

            const matchesProduct = items.some((item) =>
                String(item.name || item.title || "")
                    .toLowerCase()
                    .includes(query)
            );

            if (!matchesOrderId && !matchesProduct) {
                return false;
            }
        }

        // Active
        if (filterTab === "active") {
            return (
                !status.includes("deliver") &&
                !status.includes("cancel")
            );
        }

        // Delivered
        if (filterTab === "delivered") {
            return status.includes("deliver");
        }

        // Cancelled
        if (filterTab === "cancelled") {
            return status.includes("cancel");
        }

        return true;
    });

    // =====================================================
    // COUNTS
    // =====================================================

    const activeCount = orders.filter((order) => {
        const status = String(order.status || "").toLowerCase();

        return (
            !status.includes("deliver") &&
            !status.includes("cancel")
        );
    }).length;

    const deliveredCount = orders.filter((order) =>
        String(order.status || "")
            .toLowerCase()
            .includes("deliver")
    ).length;

    const cancelledCount = orders.filter((order) =>
        String(order.status || "")
            .toLowerCase()
            .includes("cancel")
    ).length;

    // =====================================================
    // CANCEL REASONS
    // =====================================================

    const cancelReasons = [
        "Found a better price elsewhere",
        "Order placed by mistake",
        "Delivery time is too long",
        "Need to change delivery address or phone",
        "Expected faster delivery",
        "Product no longer required",
        "Ordered wrong product",
        "Other reasons",
    ];

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="order-page">
            {/* =================================================
          HEADER
      ================================================= */}

            <div className="order-header">
                <div className="order-header-left">
                    <button
                        className="back-button"
                        onClick={() => navigate(-1)}
                    >
                        <FaArrowLeft />
                        Back
                    </button>

                    <h1>My Orders</h1>

                    <p>
                        Track shipments, cancel orders, or review your
                        complete purchase history.
                    </p>
                </div>

                <div className="order-header-actions">
                    <Link to="/track-order" className="track-id-button">
                        <FaShippingFast />
                        Track by ID
                    </Link>
                </div>
            </div>

            {/* =================================================
          MAIN
      ================================================= */}

            <div className="order-container">
                {/* SEARCH & FILTER */}

                <div className="order-filter-box">
                    <div className="order-tabs">
                        {[
                            {
                                key: "all",
                                label: "All Orders",
                                count: orders.length,
                            },
                            {
                                key: "active",
                                label: "Active",
                                count: activeCount,
                            },
                            {
                                key: "delivered",
                                label: "Delivered",
                                count: deliveredCount,
                            },
                            {
                                key: "cancelled",
                                label: "Cancelled",
                                count: cancelledCount,
                            },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                className={`order-tab ${filterTab === tab.key ? "active" : ""
                                    }`}
                                onClick={() => setFilterTab(tab.key)}
                            >
                                {tab.label}

                                <span className="tab-count">
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="order-search">
                        <FaSearch />

                        <input
                            type="text"
                            placeholder="Search by Order ID or Product..."
                            value={searchQuery}
                            onChange={(e) =>
                                setSearchQuery(e.target.value)
                            }
                        />
                    </div>
                </div>

                {/* =================================================
            EMPTY STATE
        ================================================= */}

                {filteredOrders.length === 0 ? (
                    <div className="empty-orders">
                        <FaShoppingBag className="empty-orders-icon" />

                        <h2>No Orders Found</h2>

                        <p>
                            {searchQuery
                                ? `No orders matched your search "${searchQuery}".`
                                : "You don't have any orders in this category."}
                        </p>

                        <button
                            onClick={() => navigate("/shop")}
                            className="start-shopping-button"
                        >
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    /* =================================================
                       ORDERS LIST
                    ================================================= */

                    <div className="orders-list">
                        {filteredOrders.map((order, index) => {
                            const orderId =
                                order.orderId ||
                                order.id ||
                                `MK${10000 + index}`;

                            const items = getOrderItems(order);

                            const status =
                                order.status || "Order Confirmed";

                            const badge = getStatusBadge(status);

                            const normalizedStatus =
                                String(status).toLowerCase();

                            const isCancelled =
                                normalizedStatus.includes("cancel");

                            const isDelivered =
                                normalizedStatus.includes("deliver");

                            const productSubtotal = items.reduce(
                                (sum, item) =>
                                    sum +
                                    Number(
                                        item.price ||
                                        item.discountedPrice ||
                                        0
                                    ) *
                                    Number(item.quantity || 1),
                                0
                            );

                            const discount = Number(
                                order.discount || 0
                            );

                            const deliveryCharge = Number(
                                order.deliveryCharge || 0
                            );

                            const totalAmount =
                                order.totalAmount !== undefined
                                    ? Number(order.totalAmount)
                                    : productSubtotal -
                                    discount +
                                    deliveryCharge;

                            return (
                                <div
                                    className="order-card"
                                    key={`${orderId}-${index}`}
                                >
                                    {/* ORDER HEADER */}

                                    <div className="order-card-header">
                                        <div className="order-header-info">
                                            {/* ORDER ID */}

                                            <div className="order-info-block">
                                                <span>Order ID</span>

                                                <h3>
                                                    #{orderId}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleCopyOrderId(orderId)
                                                        }
                                                        title="Copy Order ID"
                                                        className="copy-order-button"
                                                    >
                                                        <FaCopy />
                                                    </button>
                                                </h3>
                                            </div>

                                            {/* DATE */}

                                            <div className="order-info-block separated">
                                                <span>Order Placed</span>

                                                <p>
                                                    {formatDate(
                                                        order.orderDate ||
                                                        order.date
                                                    )}
                                                </p>
                                            </div>

                                            {/* TOTAL */}

                                            <div className="order-info-block separated">
                                                <span>Total Amount</span>

                                                <p className="order-total">
                                                    ₹
                                                    {totalAmount.toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {/* STATUS */}

                                        <div
                                            className={`order-status ${badge.className}`}
                                        >
                                            {badge.icon}
                                            {badge.label}
                                        </div>
                                    </div>

                                    {/* =================================================
                      PRODUCTS
                  ================================================= */}

                                    <div className="order-products">
                                        {items.length === 0 ? (
                                            <p className="no-product-details">
                                                No product details available.
                                            </p>
                                        ) : (
                                            <div className="products-list">
                                                {items.map(
                                                    (item, itemIndex) => {
                                                        const quantity = Number(
                                                            item.quantity || 1
                                                        );

                                                        const price = Number(
                                                            item.price ||
                                                            item.discountedPrice ||
                                                            0
                                                        );

                                                        return (
                                                            <div
                                                                className="order-product"
                                                                key={
                                                                    item.id ||
                                                                    itemIndex
                                                                }
                                                            >
                                                                <div className="product-left">
                                                                    {/* IMAGE */}

                                                                    <div className="order-product-image">
                                                                        {item.image ? (
                                                                            <img
                                                                                src={
                                                                                    item.image
                                                                                }
                                                                                alt={
                                                                                    item.name ||
                                                                                    item.title ||
                                                                                    "Product"
                                                                                }
                                                                                onError={(
                                                                                    event
                                                                                ) => {
                                                                                    event.currentTarget.style.display =
                                                                                        "none";
                                                                                }}
                                                                            />
                                                                        ) : (
                                                                            <FaBox />
                                                                        )}
                                                                    </div>

                                                                    {/* DETAILS */}

                                                                    <div className="order-product-details">
                                                                        <h4>
                                                                            {item.name ||
                                                                                item.title ||
                                                                                "Healthcare Item"}
                                                                        </h4>

                                                                        <p>
                                                                            Qty:{" "}
                                                                            <strong>
                                                                                {quantity}
                                                                            </strong>

                                                                            <span>
                                                                                |
                                                                            </span>

                                                                            ₹
                                                                            {price.toLocaleString(
                                                                                "en-IN"
                                                                            )}{" "}
                                                                            each
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {/* ITEM TOTAL */}

                                                                <strong className="item-total">
                                                                    ₹
                                                                    {(
                                                                        price *
                                                                        quantity
                                                                    ).toLocaleString(
                                                                        "en-IN"
                                                                    )}
                                                                </strong>
                                                            </div>
                                                        );
                                                    }
                                                )}
                                            </div>
                                        )}

                                        {/* =================================================
                        DELIVERY INFO
                    ================================================= */}

                                        <div className="delivery-info">
                                            <div className="delivery-address">
                                                <FaMapMarkerAlt />

                                                <span>
                                                    <strong>
                                                        Deliver To:
                                                    </strong>{" "}
                                                    {formatAddress(
                                                        order.address ||
                                                        order.deliveryAddress ||
                                                        order.customer
                                                    )}
                                                </span>
                                            </div>

                                            <div className="delivery-date">
                                                <FaCalendarAlt />

                                                <span>
                                                    <strong>
                                                        Est. Delivery:
                                                    </strong>{" "}
                                                    {order.estimatedDelivery ||
                                                        "2-3 Days"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* =================================================
                      ACTION FOOTER
                  ================================================= */}

                                    <div className="order-card-footer">
                                        <div className="payment-info">
                                            Payment:{" "}
                                            <strong>
                                                {order.paymentMethod ||
                                                    "Online Payment"}
                                            </strong>
                                        </div>

                                        <div className="order-actions">
                                            {/* TRACK */}

                                            {!isCancelled && (
                                                <button
                                                    type="button"
                                                    className="track-shipment-button"
                                                    onClick={() =>
                                                        navigate(
                                                            `/track-order?id=${encodeURIComponent(
                                                                orderId
                                                            )}`
                                                        )
                                                    }
                                                >
                                                    <FaShippingFast />
                                                    Track Shipment
                                                </button>
                                            )}

                                            {/* CANCEL */}

                                            {!isCancelled &&
                                                !isDelivered && (
                                                    <button
                                                        type="button"
                                                        className="cancel-order-button"
                                                        onClick={() => {
                                                            setCancelReason(
                                                                "Found a better price elsewhere"
                                                            );

                                                            setCancellingOrder(
                                                                order
                                                            );
                                                        }}
                                                    >
                                                        <FaTimes />
                                                        Cancel Order
                                                    </button>
                                                )}

                                            {/* CANCELLED */}

                                            {isCancelled && (
                                                <span className="cancelled-text">
                                                    Cancelled
                                                    {order.cancelReason
                                                        ? ` (${order.cancelReason})`
                                                        : ""}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* =================================================
          CANCEL MODAL
      ================================================= */}

            {cancellingOrder && (
                <div
                    className="cancel-modal-overlay"
                    onClick={(event) => {
                        if (
                            event.target === event.currentTarget
                        ) {
                            setCancellingOrder(null);
                        }
                    }}
                >
                    <div className="cancel-modal">
                        {/* MODAL HEADER */}

                        <div className="cancel-modal-header">
                            <h3>
                                Cancel Order #
                                {cancellingOrder.orderId ||
                                    cancellingOrder.id}
                            </h3>

                            <button
                                type="button"
                                onClick={() =>
                                    setCancellingOrder(null)
                                }
                                aria-label="Close"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <p className="cancel-modal-description">
                            Are you sure you want to cancel this
                            order? Please select a reason:
                        </p>

                        {/* REASONS */}

                        <div className="cancel-reasons">
                            {cancelReasons.map((reason) => (
                                <label
                                    key={reason}
                                    className={
                                        cancelReason === reason
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    <input
                                        type="radio"
                                        name="cancelReason"
                                        value={reason}
                                        checked={
                                            cancelReason === reason
                                        }
                                        onChange={(event) =>
                                            setCancelReason(
                                                event.target.value
                                            )
                                        }
                                    />

                                    {reason}
                                </label>
                            ))}
                        </div>

                        {/* BUTTONS */}

                        <div className="cancel-modal-buttons">
                            <button
                                type="button"
                                className="keep-order-button"
                                onClick={() =>
                                    setCancellingOrder(null)
                                }
                            >
                                Keep Order
                            </button>

                            <button
                                type="button"
                                className="confirm-cancel-button"
                                onClick={handleConfirmCancel}
                            >
                                Yes, Cancel Order
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Orders;