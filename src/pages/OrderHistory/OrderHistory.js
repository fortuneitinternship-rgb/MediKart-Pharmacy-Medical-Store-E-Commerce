import React, { useCallback, useEffect, useMemo, useState, } from "react";

import { FaBox, FaCalendarAlt, FaCheckCircle, FaTruck, FaImage, } from "react-icons/fa";

import { getProducts } from "../../api/productApi";
import { getProductImage } from "../../utils/productImage";
import { syncOrdersFromServer } from "../../utils/orders";

import "./OrderHistory.css";

/* ============================================================
   IMAGE COMPONENT
============================================================ */

const OrderProductImage = ({ item }) => {
    const [imageError, setImageError] = useState(false);

    const image = getProductImage(
        item.image ||
        item.image_url ||
        item.imageUrl ||
        item.product_image ||
        item.productImage ||
        item.thumbnail ||
        item.product?.image,
        item.name || item.product_name,
        item.category
    );

    useEffect(() => {
        setImageError(false);
    }, [image]);

    return (
        <div className="history-product-image">
            {image && !imageError ? (
                <img
                    src={image}
                    alt={item.name || item.product_name || "Product"}
                    loading="lazy"
                    onError={() => {
                        console.error(
                            "Unable to load product image:",
                            image
                        );
                        setImageError(true);
                    }}
                />
            ) : (
                <div className="product-placeholder">
                    <FaImage />
                </div>
            )}
        </div>
    );
};

/* ============================================================
   ORDER HISTORY
============================================================ */

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [catalogProducts, setCatalogProducts] = useState([]);
    const [loadingImages, setLoadingImages] = useState(true);

    /* ========================================================
       LOAD SAVED ORDERS
    ======================================================== */

    const loadOrders = useCallback(() => {
        try {
            const saved = JSON.parse(
                localStorage.getItem("orders") || "[]"
            );

            setOrders(Array.isArray(saved) ? saved : []);
        } catch (error) {
            console.error("Unable to load orders:", error);
            setOrders([]);
        }
    }, []);

    /* ========================================================
       LOAD PRODUCT CATALOG
    ======================================================== */

    useEffect(() => {
        let active = true;

        const loadCatalog = async () => {
            try {
                const response = await getProducts();

                const products = Array.isArray(response)
                    ? response
                    : response?.products ||
                    response?.items ||
                    response?.data ||
                    [];

                if (active) {
                    setCatalogProducts(products);
                }
            } catch (error) {
                console.error(
                    "Unable to load product catalog:",
                    error
                );
            } finally {
                if (active) {
                    setLoadingImages(false);
                }
            }
        };

        loadCatalog();

        return () => {
            active = false;
        };
    }, []);

    /* ========================================================
       LOAD AND SYNC ORDERS
    ======================================================== */

    useEffect(() => {
        loadOrders();

        const handleOrderUpdate = () => {
            loadOrders();
        };

        window.addEventListener(
            "ordersUpdated",
            handleOrderUpdate
        );

        const sync = async () => {
            try {
                await syncOrdersFromServer();
                loadOrders();
            } catch (error) {
                console.error(
                    "Order synchronization failed:",
                    error
                );
            }
        };

        sync();

        return () => {
            window.removeEventListener(
                "ordersUpdated",
                handleOrderUpdate
            );
        };
    }, [loadOrders]);

    /* ========================================================
       MATCH PRODUCT WITH CATALOG
    ======================================================== */

    const findCatalogProduct = useCallback(
        (item) => {
            const itemId =
                item.product_id ??
                item.productId ??
                item.id;

            const itemName = String(
                item.name ||
                item.product_name ||
                item.title ||
                ""
            ).trim().toLowerCase();

            // Match by product ID first.
            let product = catalogProducts.find((p) => {
                const productId =
                    p.product_id ?? p.productId ?? p.id;

                return (
                    itemId != null &&
                    productId != null &&
                    String(productId) === String(itemId)
                );
            });

            // Match by name if ID is unavailable.
            if (!product && itemName) {
                product = catalogProducts.find((p) => {
                    const name = String(
                        p.name || p.title || ""
                    ).trim().toLowerCase();

                    return name === itemName;
                });
            }

            return product;
        },
        [catalogProducts]
    );

    /* ========================================================
       GET ORDER ITEMS WITH ORIGINAL IMAGES
    ======================================================== */

    const getOrderItems = useCallback(
        (order) => {
            let items = [];

            if (Array.isArray(order.items)) {
                items = order.items;
            } else if (Array.isArray(order.products)) {
                items = order.products;
            } else if (order.product) {
                items = [order.product];
            } else if (
                order.productName ||
                order.product_name
            ) {
                items = [order];
            }

            return items.map((item) => {
                const product = findCatalogProduct(item);

                const originalImage =
                    item.image ||
                    item.image_url ||
                    item.imageUrl ||
                    item.product_image ||
                    item.productImage ||
                    item.thumbnail ||
                    item.product?.image ||
                    product?.image ||
                    product?.image_url ||
                    product?.imageUrl ||
                    product?.product_image ||
                    "";

                const image = getProductImage(
                    originalImage,
                    item.name ||
                    item.product_name ||
                    product?.name,
                    item.category || product?.category
                );

                return {
                    ...item,
                    product_id:
                        item.product_id ??
                        item.productId ??
                        item.id ??
                        product?.id,
                    name:
                        item.name ||
                        item.product_name ||
                        item.title ||
                        product?.name ||
                        product?.title ||
                        "Product",
                    brand: item.brand || product?.brand || "",
                    category:
                        item.category || product?.category || "",
                    image,
                    image_url: image,
                    price:
                        item.price ??
                        item.discount_price ??
                        product?.discount_price ??
                        product?.price ??
                        0,
                    quantity: Number(item.quantity || 1),
                };
            });
        },
        [findCatalogProduct]
    );

    /* ========================================================
       FORMAT DATE
    ======================================================== */

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
            month: "long",
            year: "numeric",
        });
    };

    /* ========================================================
       STATUS CLASS
    ======================================================== */

    const getStatusClass = (status) => {
        const value = String(
            status || "Processing"
        ).toLowerCase().trim();

        if (value.includes("deliver")) {
            return "delivered";
        }

        if (value.includes("ship")) {
            return "shipped";
        }

        if (value.includes("cancel")) {
            return "cancelled";
        }

        return "processing";
    };

    /* ========================================================
       STATUS ICON
    ======================================================== */

    const getStatusIcon = (status) => {
        const value = String(
            status || ""
        ).toLowerCase();

        if (value.includes("deliver")) {
            return <FaCheckCircle />;
        }

        if (
            value.includes("ship") ||
            value.includes("delivery")
        ) {
            return <FaTruck />;
        }

        return <FaBox />;
    };

    /* ========================================================
       ORDER TOTAL
    ======================================================== */

    const getTotal = (order, items) => {
        const total =
            order.totalAmount ??
            order.total_amount ??
            order.total ??
            order.totalPrice;

        if (total !== undefined && total !== null) {
            return Number(total).toLocaleString("en-IN");
        }

        return items.reduce(
            (sum, item) =>
                sum +
                Number(item.price || 0) *
                Number(item.quantity || 1),
            0
        ).toLocaleString("en-IN");
    };

    /* ========================================================
       CLEAR HISTORY
    ======================================================== */

    const handleClearHistory = () => {
        const confirmed = window.confirm(
            "Are you sure you want to clear your order history?"
        );

        if (!confirmed) return;

        localStorage.removeItem("orders");

        setOrders([]);

        window.dispatchEvent(
            new Event("ordersUpdated")
        );
    };

    /* ========================================================
       PREPARE DISPLAY ORDERS
    ======================================================== */

    const displayOrders = useMemo(() => {
        return orders.map((order) => ({
            ...order,
            displayItems: getOrderItems(order),
        }));
    }, [orders, getOrderItems]);

    /* ========================================================
       RENDER
    ======================================================== */

    return (
        <div className="order-history-page">
            <div className="order-history-container">

                <div className="order-history-header">
                    <div>
                        <h1>Order History</h1>

                        <p>
                            View all your previous MEDIKART orders.
                        </p>
                    </div>

                    {orders.length > 0 && (
                        <button
                            type="button"
                            className="clear-history-btn"
                            onClick={handleClearHistory}
                        >
                            Clear History
                        </button>
                    )}
                </div>

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
                            type="button"
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

                        {displayOrders.map((order, index) => {
                            const items = order.displayItems;

                            const orderId =
                                order.orderId ||
                                order.order_id ||
                                order.id ||
                                `MED${10000 + index}`;

                            const status =
                                order.status || "Order Confirmed";

                            const orderDate =
                                order.orderDate ||
                                order.date ||
                                order.createdAt ||
                                order.created_at;

                            return (
                                <div
                                    className="history-order-card"
                                    key={orderId}
                                >
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
                                            className={`history-status ${getStatusClass(status)}`}
                                        >
                                            {getStatusIcon(status)}

                                            <span>{status}</span>
                                        </div>
                                    </div>

                                    <div className="history-products">
                                        {items.map((item, itemIndex) => (
                                            <div
                                                className="history-product"
                                                key={`${orderId}-${item.product_id || itemIndex}`}
                                            >
                                                <OrderProductImage
                                                    item={item}
                                                />

                                                <div className="history-product-details">
                                                    <h3>
                                                        {item.name}
                                                    </h3>

                                                    {item.brand && (
                                                        <p>
                                                            <strong>Brand:</strong>{" "}
                                                            {item.brand}
                                                        </p>
                                                    )}

                                                    <p>
                                                        <strong>Quantity:</strong>{" "}
                                                        {item.quantity}
                                                    </p>

                                                    <p className="history-price">
                                                        ₹{Number(
                                                            item.price || 0
                                                        ).toLocaleString("en-IN")}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="history-order-bottom">
                                        <div>
                                            <span className="total-label">
                                                Total Amount
                                            </span>

                                            <span className="total-price">
                                                ₹{getTotal(order, items)}
                                            </span>
                                        </div>

                                        {(order.paymentMethod ||
                                            order.payment_method) && (
                                                <div>
                                                    <span className="payment-label">
                                                        Payment
                                                    </span>

                                                    <span>
                                                        {order.paymentMethod ||
                                                            order.payment_method}
                                                    </span>
                                                </div>
                                            )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {loadingImages && orders.length > 0 && (
                    <p className="image-loading-message">
                        Loading product images...
                    </p>
                )}
            </div>
        </div>
    );
};

export default OrderHistory;