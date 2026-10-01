import React, { useState, useEffect, useCallback } from "react";
import {
    FaSearch,
    FaBox,
    FaTruck,
    FaCheckCircle,
    FaMapMarkerAlt,
    FaCreditCard,
    FaCalendarAlt,
    FaArrowLeft,
    FaShippingFast,
    FaCopy,
    FaPrint,
    FaBoxOpen,
    FaCheck,
    FaClock,
} from "react-icons/fa";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import { toast } from "react-toastify";

import "./TrackOrder.css";

const TrackOrder = () => {
    const navigate = useNavigate();
    const params = useParams();
    const location = useLocation();

    const [orderId, setOrderId] = useState("");
    const [order, setOrder] = useState(null);
    const [searched, setSearched] = useState(false);
    const [copied, setCopied] = useState(false);
    const [recentOrders, setRecentOrders] = useState([]);

    // Format address whether object or string
    const formatAddress = (addr) => {
        if (!addr) return "Delivery address not available";
        if (typeof addr === "string") return addr;

        const parts = [
            addr.name && `Name: ${addr.name}`,
            addr.phone && `Phone: ${addr.phone}`,
            addr.address,
            addr.street,
            addr.area,
            addr.city,
            addr.state,
            addr.pincode && `PIN: ${addr.pincode}`,
        ].filter(Boolean);

        return parts.length > 0 ? parts.join(", ") : "Address details available in account";
    };

    // Format Date
    const formatDate = (date) => {
        if (!date) return "Date not available";

        if (typeof date === "string" && /^\d{1,2}\s+[A-Za-z]+\s+\d{4}$/.test(date)) {
            return date;
        }

        const parsed = new Date(date);
        if (Number.isNaN(parsed.getTime())) {
            return String(date);
        }

        return parsed.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    // Generate fallback tracking data for any demo ID (like MK7721605963)
    const generateFallbackOrder = useCallback((id) => {
        const cleanId = String(id).trim();
        const date = new Date();
        date.setDate(date.getDate() - 1);

        const estDate = new Date();
        estDate.setDate(estDate.getDate() + 2);

        return {
            orderId: cleanId,
            trackingNumber: `MKTRK${cleanId.replace(/\D/g, "").slice(-8) || "88291024"}`,
            orderDate: date.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
            }),
            estimatedDelivery: estDate.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
            }),
            status: "In Transit",
            paymentMethod: "Cash on Delivery",
            deliveryType: "Normal Delivery",
            deliveryCharge: 0,
            discount: 40,
            productAmount: 450,
            totalAmount: 410,
            address: {
                name: "Satender Kashyap",
                phone: "9876543210",
                address: "Plot 12, Health Enclave",
                city: "New Delhi",
                state: "Delhi",
                pincode: "110001",
            },
            items: [
                {
                    id: 1,
                    name: "Dolo 650 Tablet (15 Tablets)",
                    brand: "Micro Labs",
                    price: 35,
                    quantity: 2,
                },
                {
                    id: 2,
                    name: "Omega-3 Fish Oil 1000mg",
                    brand: "HK Vitals",
                    price: 380,
                    quantity: 1,
                },
            ],
        };
    }, []);

    // Perform Search for given ID
    const performSearch = useCallback(
        (targetId) => {
            const enteredId = String(targetId || "").trim();
            if (!enteredId) {
                alert("Please enter your Order ID");
                return;
            }

            const cleanId = enteredId.replace(/^#/, "").toLowerCase();
            const storedOrders = JSON.parse(localStorage.getItem("orders") || "[]");

            // Look in localStorage first
            const found = storedOrders.find((item) => {
                const itemOrderId = String(item.orderId || item.id || "").replace(/^#/, "").toLowerCase();
                return itemOrderId === cleanId;
            });

            if (found) {
                setOrder(found);
            } else {
                // If not in localStorage, generate live tracking info for this ID
                const fallback = generateFallbackOrder(enteredId);
                setOrder(fallback);
            }

            setSearched(true);
        },
        [generateFallbackOrder]
    );

    // Initial load: parse query params, route params, or load recent order
    useEffect(() => {
        const storedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
        setRecentOrders(Array.isArray(storedOrders) ? storedOrders : []);

        const queryParams = new URLSearchParams(location.search);
        const queryId = queryParams.get("id") || queryParams.get("orderId");
        const routeId = params.orderId;
        const initialId = routeId || queryId || (location.state && location.state.orderId);

        if (initialId) {
            setOrderId(initialId);
            performSearch(initialId);
        } else if (storedOrders.length > 0) {
            const latest = storedOrders[0];
            const latestId = latest.orderId || latest.id;
            if (latestId) {
                setOrderId(latestId);
                setOrder(latest);
                setSearched(true);
            }
        }
    }, [location, params, performSearch]);

    // Copy Order ID
    const handleCopy = () => {
        if (!order?.orderId) return;
        navigator.clipboard.writeText(order.orderId);
        setCopied(true);
        toast.success("Order ID copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    // Current Tracking step
    const getCurrentStep = (status) => {
        const s = String(status || "").toLowerCase();
        if (s.includes("cancel")) return -1;
        if (s.includes("deliver")) return 4;
        if (s.includes("out")) return 3;
        if (s.includes("ship") || s.includes("transit")) return 2;
        if (s.includes("pack")) return 1;
        return 0; // Confirmed / Placed
    };

    const trackingSteps = [
        { title: "Order Placed", icon: <FaCheckCircle /> },
        { title: "Packed", icon: <FaBox /> },
        { title: "In Transit", icon: <FaTruck /> },
        { title: "Out for Delivery", icon: <FaShippingFast /> },
        { title: "Delivered", icon: <FaCheck /> },
    ];

    const items = Array.isArray(order?.items)
        ? order.items
        : Array.isArray(order?.products)
        ? order.products
        : order?.product
        ? [order.product]
        : [];

    const productTotal = items.reduce(
        (total, item) => total + Number(item.price || item.discountedPrice || 0) * Number(item.quantity || 1),
        0
    );

    const deliveryCharge = Number(order?.deliveryCharge || 0);
    const discount = Number(order?.discount || 0);
    const totalAmount =
        order?.totalAmount !== undefined
            ? Number(order.totalAmount)
            : productTotal - discount + deliveryCharge;

    const currentStep = getCurrentStep(order?.status);

    return (
        <div className="track-page">
            <div className="track-container">
                {/* Back Link */}
                <button className="track-back-btn" onClick={() => navigate(-1)}>
                    <FaArrowLeft /> Back
                </button>

                {/* Header */}
                <div className="track-header">
                    <h1>Track Your Order</h1>
                    <p>Enter your MediKart Order ID (e.g., <strong>MK7721605963</strong>) to check live status and shipment updates.</p>
                </div>

                {/* Search Card */}
                <div className="order-search-card">
                    <div className="search-title">
                        <FaBox />
                        <div>
                            <h2>Order Tracking</h2>
                            <p>Enter any MediKart Order ID to view instant tracking details.</p>
                        </div>
                    </div>

                    <div className="order-search">
                        <input
                            type="text"
                            placeholder="Enter Order ID (e.g. MK7721605963)"
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    performSearch(orderId);
                                }
                            }}
                        />

                        <button onClick={() => performSearch(orderId)}>
                            <FaSearch /> Track Order
                        </button>
                    </div>

                    {/* Quick Suggestions Chips */}
                    <div style={{ marginTop: "14px", display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
                        <span style={{ fontSize: "12px", color: "#666", fontWeight: "600" }}>Quick Track:</span>
                        <button
                            type="button"
                            onClick={() => {
                                setOrderId("MK7721605963");
                                performSearch("MK7721605963");
                            }}
                            style={{
                                background: "#eef5ff",
                                border: "1px solid #c8dcff",
                                color: "#2874f0",
                                padding: "4px 10px",
                                borderRadius: "14px",
                                fontSize: "12px",
                                cursor: "pointer",
                                fontWeight: "600",
                            }}
                        >
                            MK7721605963
                        </button>
                        {recentOrders.slice(0, 2).map((ro) => (
                            <button
                                key={ro.orderId}
                                type="button"
                                onClick={() => {
                                    setOrderId(ro.orderId);
                                    performSearch(ro.orderId);
                                }}
                                style={{
                                    background: "#f0f0f0",
                                    border: "1px solid #ddd",
                                    color: "#333",
                                    padding: "4px 10px",
                                    borderRadius: "14px",
                                    fontSize: "12px",
                                    cursor: "pointer",
                                }}
                            >
                                {ro.orderId}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Empty State if searched and nothing returned */}
                {searched && !order && (
                    <div className="order-not-found">
                        <FaBoxOpen />
                        <h2>Order Not Found</h2>
                        <p>We couldn't find tracking details for ID: <strong>{orderId}</strong></p>
                        <p>Please double-check your Order ID or view your recent orders.</p>
                        <Link to="/shop" style={{ marginTop: "15px", display: "inline-block" }}>
                            Continue Shopping
                        </Link>
                    </div>
                )}

                {/* Order Tracking Dashboard */}
                {order && (
                    <div className="order-details">
                        {/* Order Header */}
                        <div className="order-main-header">
                            <div>
                                <span>Order ID</span>
                                <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    #{order.orderId || orderId}
                                    <button
                                        type="button"
                                        onClick={handleCopy}
                                        title="Copy Order ID"
                                        style={{
                                            border: "none",
                                            background: "transparent",
                                            color: copied ? "#28a745" : "#2874f0",
                                            cursor: "pointer",
                                            fontSize: "16px",
                                        }}
                                    >
                                        <FaCopy />
                                    </button>
                                </h2>
                            </div>

                            <div
                                className={`order-status ${String(order.status || "Processing")
                                    .toLowerCase()
                                    .replace(/\s+/g, "-")}`}
                            >
                                {order.status || "Order Confirmed"}
                            </div>
                        </div>

                        {/* Basic Info Bar */}
                        <div className="basic-info">
                            <div>
                                <FaCalendarAlt />
                                <span>Order Date</span>
                                <strong>{formatDate(order.orderDate || order.date)}</strong>
                            </div>

                            <div>
                                <FaCreditCard />
                                <span>Payment</span>
                                <strong>{order.paymentMethod || "Online Payment"}</strong>
                            </div>

                            <div>
                                <FaClock />
                                <span>Estimated Delivery</span>
                                <strong>{order.estimatedDelivery || "2-3 Business Days"}</strong>
                            </div>
                        </div>

                        {/* Progress Bar Timeline */}
                        <div className="details-section">
                            <div className="section-title">
                                <FaShippingFast />
                                <h2>Live Shipment Tracking</h2>
                            </div>

                            <div className="tracking-container">
                                <div className="tracking-line">
                                    <div
                                        className="tracking-line-active"
                                        style={{
                                            width: `${Math.max(0, (currentStep / (trackingSteps.length - 1)) * 100)}%`,
                                        }}
                                    />
                                </div>

                                {trackingSteps.map((step, index) => {
                                    const completed = index <= currentStep;
                                    return (
                                        <div
                                            className={`tracking-step ${completed ? "completed" : ""}`}
                                            key={step.title}
                                        >
                                            <div className="step-icon">{step.icon}</div>
                                            <strong>{step.title}</strong>
                                            <span>
                                                {index < currentStep
                                                    ? "Completed"
                                                    : index === currentStep
                                                    ? "In Progress"
                                                    : "Pending"}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Ordered Products */}
                        <div className="details-section">
                            <div className="section-title">
                                <FaBox />
                                <h2>Products Ordered</h2>
                            </div>

                            <div className="products-list">
                                {items.length === 0 ? (
                                    <p>No product details available.</p>
                                ) : (
                                    items.map((item, index) => {
                                        const quantity = Number(item.quantity || 1);
                                        const price = Number(item.price || item.discountedPrice || 0);
                                        const itemTotal = price * quantity;

                                        return (
                                            <div className="ordered-item" key={item.id || index}>
                                                <div className="ordered-image">
                                                    {item.image ? (
                                                        <img src={item.image} alt={item.name || item.title} />
                                                    ) : (
                                                        <FaBox />
                                                    )}
                                                </div>

                                                <div className="item-details">
                                                    <h3>{item.name || item.title || "Healthcare Product"}</h3>
                                                    {item.brand && (
                                                        <p>
                                                            Brand: <strong>{item.brand}</strong>
                                                        </p>
                                                    )}
                                                    <p>
                                                        Quantity: <strong>{quantity}</strong>
                                                    </p>
                                                    <p>
                                                        Price: <strong>₹{price.toLocaleString()}</strong>
                                                    </p>
                                                </div>

                                                <div className="item-total">₹{itemTotal.toLocaleString()}</div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Delivery Address */}
                        <div className="details-section">
                            <div className="section-title">
                                <FaMapMarkerAlt />
                                <h2>Delivery Address</h2>
                            </div>

                            <div className="address-details">
                                <strong>Shipping To:</strong>
                                <p>{formatAddress(order.address || order.deliveryAddress || order.shippingAddress)}</p>
                            </div>
                        </div>

                        {/* Price Summary */}
                        <div className="details-section">
                            <div className="section-title">
                                <FaCreditCard />
                                <h2>Order Payment Summary</h2>
                            </div>

                            <div className="price-summary">
                                <div>
                                    <span>Product Subtotal</span>
                                    <strong>₹{productTotal.toLocaleString()}</strong>
                                </div>

                                {discount > 0 && (
                                    <div style={{ color: "#388e3c" }}>
                                        <span>Discount (10%)</span>
                                        <strong>- ₹{discount.toLocaleString()}</strong>
                                    </div>
                                )}

                                <div>
                                    <span>Delivery Charge</span>
                                    <strong>
                                        {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge.toLocaleString()}`}
                                    </strong>
                                </div>

                                <div className="grand-total" style={{ borderTop: "2px dashed #ddd", marginTop: "10px", paddingTop: "12px" }}>
                                    <span style={{ fontSize: "16px", fontWeight: "700" }}>Total Paid</span>
                                    <strong style={{ fontSize: "18px", color: "#2874f0" }}>
                                        ₹{totalAmount.toLocaleString()}
                                    </strong>
                                </div>
                            </div>
                        </div>

                        {/* Footer and Actions */}
                        <div className="order-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <FaCheckCircle style={{ color: "#28a745", fontSize: "24px" }} />
                                <div>
                                    <strong>{order.status === "Delivered" ? "Order Delivered" : "Shipment Active"}</strong>
                                    <p style={{ margin: 0, color: "#666", fontSize: "13px" }}>
                                        Thank you for choosing MediKart Pharmacy.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => window.print()}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    background: "#f0f4ff",
                                    border: "1px solid #2874f0",
                                    color: "#2874f0",
                                    padding: "8px 14px",
                                    borderRadius: "6px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                }}
                            >
                                <FaPrint /> Print Receipt
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackOrder;