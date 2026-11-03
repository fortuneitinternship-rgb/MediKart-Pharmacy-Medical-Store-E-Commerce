import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { FaCheck, FaMapMarkerAlt, FaCreditCard, FaUniversity, FaMoneyBillWave, FaTruck, FaBolt, FaClock, FaPlus, FaMinus, FaLocationArrow, FaEdit, FaMap, } from "react-icons/fa";
import { getCheckoutCart, saveCheckoutAddress, createCheckoutOrder, } from "../../api/checkoutApi";
import { removeCartItem, updateCartItem, } from "../../api/cartApi";
import { getApiErrorMessage } from "../../services/api";
import { getProductImage, handleProductImageError, } from "../../utils/productImage";

import "./Checkout.css";

const Checkout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id: routeProductId } = useParams();
    const buyNowItems = location.state?.buyNowItems;

    // ======================= STATES =======================

    const [step, setStep] = useState(1);
    const [cartItems, setCartItems] = useState([]);
    const [cartLoading, setCartLoading] = useState(true);
    const [cartLoadError, setCartLoadError] = useState("");
    const [cartLoadStatus, setCartLoadStatus] = useState(null);
    const [cartLoadAttempt, setCartLoadAttempt] = useState(0);
    const [placingOrder, setPlacingOrder] = useState(false);
    const visibleCartItems = Array.isArray(buyNowItems) && buyNowItems.length > 0
        ? buyNowItems.map((item) => {
            const productId = Number(
                item.product_id ?? item.productId ?? item.id
            );
            const price = Number(
                item.discountedPrice ??
                item.discounted_price ??
                item.discount_price ??
                item.price ??
                0
            );

            return {
                ...item,
                id: item.id ?? productId,
                product_id: productId,
                name: item.name || item.title || "Healthcare Product",
                price,
                discountedPrice: price,
                quantity: Math.max(1, Number(item.quantity) || 1),
            };
        }).filter(
            (item) =>
                !routeProductId ||
                String(item.product_id) === String(routeProductId)
        )
        : routeProductId
        ? cartItems.filter(
            (item) => String(item.product_id) === String(routeProductId)
        )
        : cartItems;

    const [address, setAddress] = useState({
        name: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
    });

    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [deliveryType, setDeliveryType] = useState("normal");
    const [orderId, setOrderId] = useState("");

    // NEW:
    // Address mode = map or manual
    const [addressMode, setAddressMode] = useState("form");

    // NEW:
    // Delivery distance
    const [deliveryDistance, setDeliveryDistance] = useState("short");

    // NEW:
    // Location loading
    const [locationLoading, setLocationLoading] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);

    // ======================= LOAD CART =======================

    useEffect(() => {
        let cancelled = false;

        const loadCart = async () => {
            setCartLoading(true);
            setCartLoadError("");
            setCartLoadStatus(null);

            if (Array.isArray(buyNowItems) && buyNowItems.length > 0) {
                setCartItems(buyNowItems);
                setCartLoading(false);
                return;
            }

            try {
                const data = await getCheckoutCart();

                const items = Array.isArray(data)
                    ? data
                    : data.items || data.cart_items || [];

                if (!cancelled) {
                    setCartItems(items);
                }
            } catch (error) {
                console.error(
                    "Failed to load checkout cart:",
                    error.response?.data || error.message
                );
                if (!cancelled) {
                    setCartLoadError(
                        getApiErrorMessage(
                            error,
                            "Your cart could not be loaded. Please try again."
                        )
                    );
                    setCartLoadStatus(error.response?.status ?? null);
                }
            } finally {
                if (!cancelled) {
                    setCartLoading(false);
                }
            }
        };

        loadCart();

        return () => {
            cancelled = true;
        };
    }, [routeProductId, cartLoadAttempt, buyNowItems]);

    // ======================= LOAD SAVED ADDRESS =======================

    useEffect(() => {
        try {
            const savedAddress = JSON.parse(
                localStorage.getItem("deliveryAddress")
            );

            if (savedAddress) {
                setAddress({
                    name: savedAddress.name || "",
                    phone: savedAddress.phone || "",
                    address: savedAddress.address || "",
                    city: savedAddress.city || "",
                    state: savedAddress.state || "",
                    pincode: savedAddress.pincode || "",
                });

                if (savedAddress.addressMode) {
                    setAddressMode(savedAddress.addressMode);
                }

                if (savedAddress.deliveryDistance) {
                    setDeliveryDistance(
                        savedAddress.deliveryDistance
                    );
                }
            }
        } catch (error) {
            console.error(
                "Failed to load address:",
                error
            );
        }
    }, []);

    // ======================= GET PRICE =======================

    const getPrice = (item) => {
        return Number(
            item.discountedPrice ??
            item.price ??
            item.sellingPrice ??
            0
        );
    };

    // ======================= PRODUCT TOTAL =======================

    const productTotal = visibleCartItems.reduce(
        (total, item) => {
            const price = getPrice(item);
            const quantity = Number(
                item.quantity || 1
            );

            return total + price * quantity;
        },
        0
    );

    // ======================= DISCOUNT =======================

    const discount = Math.round(
        productTotal * 0.1
    );

    // ======================= SPECIAL CATEGORY =======================

    // ======================= DELIVERY CHARGES =======================

    const baseDelivery =
        productTotal >= 499 ? 0 : 10;

    const normalDeliveryCharge =
        baseDelivery;

    // ======================= DELIVERY ELIGIBILITY =======================

    const expressAvailable =
        productTotal >= 299;

    const todayAvailable =
        productTotal >= 999;

    // ======================= CURRENT DELIVERY CHARGE =======================

    let deliveryCharge = 0;

    if (deliveryType === "normal") {
        deliveryCharge =
            normalDeliveryCharge;
    }

    if (deliveryType === "express") {
        deliveryCharge = 49;
    }

    if (deliveryType === "today") {
        deliveryCharge = 99;
    }

    // ======================= PLATFORM FEE =======================

    const platformFee = 0;

    // ======================= TOTAL =======================

    const totalAmount =
        productTotal -
        discount +
        deliveryCharge +
        platformFee;

    // =====================================================
    // DELIVERY DISTANCE / TIME
    // =====================================================

    const getDeliveryTime = () => {
        if (deliveryDistance === "short") {
            return "20–30 minutes";
        }

        if (deliveryDistance === "medium") {
            return "45–60 minutes";
        }

        return "1.5–2.5 hours";
    };

    const getDistanceLabel = () => {
        if (deliveryDistance === "short") {
            return "Short distance";
        }

        if (deliveryDistance === "medium") {
            return "Medium distance";
        }

        return "Long distance";
    };

    // ======================= DELIVERY DATE =======================

    const getDeliveryDate = () => {
        const today = new Date();

        // For short/medium/long distance,
        // today delivery shows time.

        if (deliveryType === "today") {
            return `Today • ${getDeliveryTime()}`;
        }

        if (deliveryType === "express") {
            if (
                deliveryDistance === "short"
            ) {
                return `Today • ${getDeliveryTime()}`;
            }

            const tomorrow = new Date(today);

            tomorrow.setDate(
                tomorrow.getDate() + 1
            );

            return (
                "Tomorrow, " +
                tomorrow.toLocaleDateString(
                    "en-IN",
                    {
                        day: "numeric",
                        month: "short",
                    }
                ) +
                ` • ${getDeliveryTime()}`
            );
        }

        // Normal delivery

        if (
            deliveryDistance === "short"
        ) {
            return `Today • ${getDeliveryTime()}`;
        }

        const expectedDate = new Date(today);

        expectedDate.setDate(
            expectedDate.getDate() + 3
        );

        return (
            "By " +
            expectedDate.toLocaleDateString(
                "en-IN",
                {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                }
            ) +
            ` • ${getDeliveryTime()}`
        );
    };

    // ======================= NORMAL DELIVERY DATE =======================

    const getNormalDeliveryDate = () => {
        if (deliveryDistance === "short") {
            return "Today";
        }

        if (deliveryDistance === "medium") {
            return "Today";
        }

        const date = new Date();

        date.setDate(
            date.getDate() + 2
        );

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "short",
            }
        );
    };

    // =====================================================
    // CHOOSE LOCATION ON MAP
    // =====================================================

    const chooseLocationOnMap = () => {
        if (!navigator.geolocation) {
            alert(
                "Location services are not supported by your browser."
            );
            return;
        }

        setLocationLoading(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude =
                    position.coords.latitude;

                const longitude =
                    position.coords.longitude;

                setSelectedLocation({ latitude, longitude });

                setAddressMode("map");

                setLocationLoading(false);

                alert(
                    "Your current location has been selected."
                );
            },
            (error) => {
                console.error(
                    "Location error:",
                    error
                );

                setLocationLoading(false);

                alert(
                    "Unable to get your location. Please allow location access or fill the address manually."
                );
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    };

    // ======================= REMOVE ITEM =======================

    const removeItem = async (id) => {
        try {
            await removeCartItem(id);
            setCartItems((items) => items.filter((item) => item.id !== id));
            window.dispatchEvent(new Event("cartUpdated"));
        } catch (error) {
            console.error("Unable to remove checkout item:", error);
            alert(error.message || "Unable to remove this item.");
        }
    };

    // ======================= UPDATE QUANTITY =======================

    const updateQuantity = async (
        id,
        change
    ) => {
        const item = cartItems.find((cartItem) => cartItem.id === id);
        if (!item) return;

        const quantity = Number(item.quantity || 1) + change;
        if (quantity < 1) return;

        try {
            await updateCartItem(id, quantity);
            setCartItems((items) =>
                items.map((cartItem) =>
                    cartItem.id === id ? { ...cartItem, quantity } : cartItem
                )
            );
            window.dispatchEvent(new Event("cartUpdated"));
        } catch (error) {
            console.error("Unable to update checkout quantity:", error);
            alert(error.message || "Unable to update item quantity.");
        }
    };

    // ======================= ADDRESS CHANGE =======================

    const handleAddressChange = (e) => {
        const {
            name,
            value,
        } = e.target;

        setAddress((previous) => ({
            ...previous,
            [name]: value,
        }));

        // If user starts editing,
        // switch to manual address mode.
        setAddressMode("form");
    };

    // =====================================================
    // ADDRESS VALIDATION
    // =====================================================

    const validateAddress = () => {
        if (!address.name.trim()) {
            alert(
                "Please enter your name."
            );
            return false;
        }

        if (
            !/^\d{10}$/.test(
                address.phone.trim()
            )
        ) {
            alert(
                "Please enter a valid 10-digit phone number."
            );
            return false;
        }

        if (!address.address.trim()) {
            alert(
                "Please enter your full delivery address."
            );
            return false;
        }

        if (!address.city.trim()) {
            alert(
                "Please enter your city."
            );
            return false;
        }

        if (!address.state.trim()) {
            alert(
                "Please enter your state."
            );
            return false;
        }

        if (
            !/^\d{6}$/.test(
                address.pincode.trim()
            )
        ) {
            alert(
                "Please enter a valid 6-digit pincode."
            );
            return false;
        }

        return true;
    };

    // ======================= STEP 1 → STEP 2 =======================

    const continueToAddress = () => {
        if (visibleCartItems.length === 0) {
            alert(
                "Your cart is empty."
            );
            return;
        }

        setStep(2);
    };

    // ======================= STEP 2 → STEP 3 =======================

    const [addressSaving, setAddressSaving] = useState(false);

    const continueToPayment = async () => {
        if (!validateAddress()) return;

        setAddressSaving(true);

        try {
            const savedAddress = {
                ...address,
                addressMode,
                deliveryDistance,
            };

            await saveCheckoutAddress(savedAddress);

            localStorage.setItem(
                "deliveryAddress",
                JSON.stringify(savedAddress)
            );

            setStep(3);
        } catch (error) {
            console.error(
                "Address save failed:",
                error.response?.data || error.message
            );

            const detail = error.response?.data?.detail;
            const reason = Array.isArray(detail)
                ? detail
                    .map((item) => {
                        const field = Array.isArray(item.loc)
                            ? item.loc[item.loc.length - 1]
                            : "";
                        return `${field ? `${field}: ` : ""}${item.msg}`;
                    })
                    .join("\n")
                : typeof detail === "string"
                  ? detail
                  : error.response
                    ? "The server rejected the address."
                    : "Could not reach the API. Check that the backend is running.";

            alert(`Unable to save address. ${reason}`);
        } finally {
            setAddressSaving(false);
        }
    };

    // =====================================================
    // PLACE ORDER
    // =====================================================

    const placeOrder = async () => {
        if (!paymentMethod || visibleCartItems.length === 0) {
            alert("Please select a payment method and check your cart.");
            return;
        }

        try {
            const orderData = {
                items: visibleCartItems.map((item) => ({
                    product_id: Number(item.product_id),
                    quantity: Number(item.quantity || 1),
                })),

                shipping_address: {
                    name: address.name,
                    phone: address.phone,
                    address: address.address,
                    city: address.city,
                    state: address.state,
                    pincode: address.pincode,
                },

                payment_method: paymentMethod,
                delivery_type: deliveryType,
                delivery_distance: deliveryDistance,
                remove_from_cart: !(Array.isArray(buyNowItems) && buyNowItems.length > 0),
            };

            const response = await createCheckoutOrder(orderData);

            // Adapt these fields to your backend's response schema.
            const createdOrder = response.order || response;

            const generatedOrderId =
                createdOrder.order_id ||
                createdOrder.orderId ||
                createdOrder.id;

            if (!generatedOrderId) {
                throw new Error("The server did not return an order ID.");
            }

            setOrderId(String(generatedOrderId));

            // Cart checkout clears purchased cart rows; Buy Now preserves them.
            localStorage.removeItem("buyNow");

            setCartItems([]);

            window.dispatchEvent(new Event("ordersUpdated"));
            window.dispatchEvent(new Event("cartUpdated"));

            setStep(5);
        } catch (error) {
            console.error(
                "Order creation failed:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.detail ||
                "Unable to place order. Please try again."
            );

            setStep(3);
        }
    };

    // ======================= EMPTY CART =======================

    if (cartLoading && step !== 5) {
        return (
            <div className="checkout-loading" role="status">
                Loading your checkout cart...
            </div>
        );
    }

    if (cartLoadError && step !== 5) {
        return (
            <div className="checkout-error" role="alert">
                <p>{cartLoadError}</p>
                <button
                    type="button"
                    onClick={() => setCartLoadAttempt((attempt) => attempt + 1)}
                >
                    Retry
                </button>
                {cartLoadStatus === 401 && (
                    <button
                        type="button"
                        onClick={() =>
                            navigate("/login", {
                                state: {
                                    from: routeProductId
                                        ? `/checkout/${routeProductId}`
                                        : "/checkout",
                                },
                            })
                        }
                    >
                        Log in
                    </button>
                )}
            </div>
        );
    }

    if (
        visibleCartItems.length === 0 &&
        step !== 5
    ) {
        return (
            <div className="checkout-empty">
                <h2>
                    Your Cart is Empty
                </h2>

                <p>
                    Add products before
                    checkout.
                </p>

                <button
                    onClick={() =>
                        navigate(
                            "/shop"
                        )
                    }
                >
                    Continue Shopping
                </button>
            </div>
        );
    }

    // ======================= RENDER =======================

    return (
        <div className="checkout-page">

            {/* ================= HEADER ================= */}

            <div className="checkout-header">
                <h1>
                    MediKart Checkout
                </h1>

                <span>
                    100% Secure Checkout
                </span>
            </div>

            {/* ================= STEP INDICATOR ================= */}

            <div className="checkout-steps">

                <div
                    className={`checkout-step ${step >= 1
                        ? "active"
                        : ""
                        }`}
                >
                    <div className="step-circle">
                        {step > 1 ? (
                            <FaCheck />
                        ) : (
                            "1"
                        )}
                    </div>

                    <span>
                        Order
                    </span>
                </div>

                <div className="step-line" />

                <div
                    className={`checkout-step ${step >= 2
                        ? "active"
                        : ""
                        }`}
                >
                    <div className="step-circle">
                        {step > 2 ? (
                            <FaCheck />
                        ) : (
                            "2"
                        )}
                    </div>

                    <span>
                        Address
                    </span>
                </div>

                <div className="step-line" />

                <div
                    className={`checkout-step ${step >= 3
                        ? "active"
                        : ""
                        }`}
                >
                    <div className="step-circle">
                        {step > 3 ? (
                            <FaCheck />
                        ) : (
                            "3"
                        )}
                    </div>

                    <span>
                        Payment
                    </span>
                </div>

                <div className="step-line" />

                <div
                    className={`checkout-step ${step >= 4
                        ? "active"
                        : ""
                        }`}
                >
                    <div className="step-circle">
                        {step > 4 ? (
                            <FaCheck />
                        ) : (
                            "4"
                        )}
                    </div>

                    <span>
                        Order ID
                    </span>
                </div>

                <div className="step-line" />

                <div
                    className={`checkout-step ${step >= 5
                        ? "active"
                        : ""
                        }`}
                >
                    <div className="step-circle">
                        {step >= 5 ? (
                            <FaCheck />
                        ) : (
                            "5"
                        )}
                    </div>

                    <span>
                        Success
                    </span>
                </div>

            </div>

            {/* =====================================================
                STEP 1 - ORDER
            ===================================================== */}

            {step === 1 && (
                <div className="checkout-card">

                    <div
                        className="card-heading"
                        style={{
                            display:
                                "flex",
                            justifyContent:
                                "space-between",
                            alignItems:
                                "center",
                        }}
                    >

                        <div
                            style={{
                                display:
                                    "flex",
                                alignItems:
                                    "center",
                                gap:
                                    "14px",
                            }}
                        >

                            <div className="heading-icon">
                                🛒
                            </div>

                            <div>
                                <h2>
                                    Your Order
                                </h2>

                                <p>
                                    Review
                                    medicines
                                    and
                                    healthcare
                                    items in
                                    your bag.
                                </p>
                            </div>

                        </div>

                        <span
                            data-testid="cart-item-count"
                            style={{
                                background:
                                    "#eef5ff",
                                color:
                                    "#2874f0",
                                fontWeight:
                                    "700",
                                fontSize:
                                    "13px",
                                padding:
                                    "5px 12px",
                                borderRadius:
                                    "16px",
                            }}
                        >
                            {
                                visibleCartItems.length
                            }{" "}
                            {
                                visibleCartItems.length ===
                                    1
                                    ? "Item"
                                    : "Items"
                            }
                        </span>

                    </div>

                    {/* PRODUCTS */}

                    <div
                        className="checkout-products"
                        style={{
                            display:
                                "flex",
                            flexDirection:
                                "column",
                            gap:
                                "14px",
                            marginTop:
                                "16px",
                        }}
                    >

                        {visibleCartItems.map(
                            (item) => {

                                const unitPrice =
                                    Number(
                                        getPrice(
                                            item
                                        )
                                    );

                                const quantity =
                                    Number(
                                        item.quantity ||
                                        1
                                    );

                                const itemTotal =
                                    unitPrice *
                                    quantity;

                                const productName =
                                    item.name ||
                                    item.title ||
                                    "Healthcare Product";

                                return (
                                    <div
                                        className="checkout-product"
                                        key={
                                            item.id
                                        }
                                        data-testid={`checkout-product-${item.id}`}
                                        style={{
                                            display:
                                                "flex",
                                            alignItems:
                                                "center",
                                            justifyContent:
                                                "space-between",
                                            padding:
                                                "16px",
                                            background:
                                                "#fafbfc",
                                            borderRadius:
                                                "10px",
                                            border:
                                                "1px solid #eef0f3",
                                            gap:
                                                "16px",
                                        }}
                                    >

                                        <div
                                            style={{
                                                display:
                                                    "flex",
                                                alignItems:
                                                    "center",
                                                gap:
                                                    "14px",
                                                flex:
                                                    1,
                                            }}
                                        >

                                            <div
                                                className="product-image"
                                                style={{
                                                    width:
                                                        "64px",
                                                    height:
                                                        "64px",
                                                    borderRadius:
                                                        "8px",
                                                    background:
                                                        "#ffffff",
                                                    border:
                                                        "1px solid #e1e4e8",
                                                    display:
                                                        "flex",
                                                    alignItems:
                                                        "center",
                                                    justifyContent:
                                                        "center",
                                                    overflow:
                                                        "hidden",
                                                    flexShrink:
                                                        0,
                                                }}
                                            >

                                                <img
                                                    src={getProductImage(
                                                        item.image,
                                                        productName,
                                                        item.category
                                                    )}
                                                    alt={productName}
                                                    onError={(event) =>
                                                        handleProductImageError(
                                                            event,
                                                            productName,
                                                            item.category
                                                        )
                                                    }
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: "contain",
                                                    }}
                                                />

                                            </div>

                                            <div
                                                className="product-info"
                                                style={{
                                                    flex:
                                                        1,
                                                }}
                                            >

                                                <div
                                                    style={{
                                                        display:
                                                            "flex",
                                                        alignItems:
                                                            "center",
                                                        gap:
                                                            "8px",
                                                        flexWrap:
                                                            "wrap",
                                                    }}
                                                >

                                                    <h3
                                                        style={{
                                                            margin:
                                                                0,
                                                            fontSize:
                                                                "15px",
                                                            fontWeight:
                                                                "700",
                                                            color:
                                                                "#222",
                                                        }}
                                                    >
                                                        {
                                                            productName
                                                        }
                                                    </h3>

                                                </div>

                                                <p
                                                    style={{
                                                        margin:
                                                            "4px 0 6px",
                                                        color:
                                                            "#666",
                                                        fontSize:
                                                            "13px",
                                                    }}
                                                >
                                                    {item.brand
                                                        ? `Brand: ${item.brand} | `
                                                        : ""}
                                                    {item.category ||
                                                        "Healthcare"}
                                                </p>

                                                <div
                                                    style={{
                                                        display:
                                                            "flex",
                                                        alignItems:
                                                            "center",
                                                        gap:
                                                            "10px",
                                                    }}
                                                >

                                                    <strong
                                                        data-testid={`unit-price-${item.id}`}
                                                        style={{
                                                            fontSize:
                                                                "15px",
                                                            color:
                                                                "#2874f0",
                                                        }}
                                                    >
                                                        ₹
                                                        {
                                                            unitPrice
                                                        }
                                                    </strong>

                                                    <span
                                                        style={{
                                                            fontSize:
                                                                "12px",
                                                            color:
                                                                "#888",
                                                        }}
                                                    >
                                                        each
                                                    </span>

                                                </div>

                                            </div>

                                        </div>

                                        <div
                                            style={{
                                                display:
                                                    "flex",
                                                alignItems:
                                                    "center",
                                                gap:
                                                    "16px",
                                            }}
                                        >

                                            <div
                                                className="quantity-box"
                                                style={{
                                                    display:
                                                        "flex",
                                                    alignItems:
                                                        "center",
                                                    background:
                                                        "#ffffff",
                                                    border:
                                                        "1px solid #d1d5db",
                                                    borderRadius:
                                                        "6px",
                                                    overflow:
                                                        "hidden",
                                                }}
                                            >

                                                <button
                                                    type="button"
                                                    aria-label={`Decrease quantity of ${productName}`}
                                                    data-testid={`decrease-${item.id}`}
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.id,
                                                            -1
                                                        )
                                                    }
                                                    disabled={
                                                        quantity <=
                                                        1
                                                    }
                                                    style={{
                                                        padding:
                                                            "6px 10px",
                                                        border:
                                                            "none",
                                                        background:
                                                            "transparent",
                                                        cursor:
                                                            quantity <=
                                                                1
                                                                ? "not-allowed"
                                                                : "pointer",
                                                        color:
                                                            quantity <=
                                                                1
                                                                ? "#ccc"
                                                                : "#333",
                                                    }}
                                                >
                                                    <FaMinus
                                                        size={
                                                            11
                                                        }
                                                    />
                                                </button>

                                                <span
                                                    data-testid={`quantity-${item.id}`}
                                                    style={{
                                                        padding:
                                                            "0 10px",
                                                        fontWeight:
                                                            "700",
                                                        fontSize:
                                                            "14px",
                                                    }}
                                                >
                                                    {
                                                        quantity
                                                    }
                                                </span>

                                                <button
                                                    type="button"
                                                    aria-label={`Increase quantity of ${productName}`}
                                                    data-testid={`increase-${item.id}`}
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.id,
                                                            1
                                                        )
                                                    }
                                                    style={{
                                                        padding:
                                                            "6px 10px",
                                                        border:
                                                            "none",
                                                        background:
                                                            "transparent",
                                                        cursor:
                                                            "pointer",
                                                        color:
                                                            "#333",
                                                    }}
                                                >
                                                    <FaPlus
                                                        size={
                                                            11
                                                        }
                                                    />
                                                </button>

                                            </div>

                                            <div
                                                style={{
                                                    textAlign:
                                                        "right",
                                                    minWidth:
                                                        "80px",
                                                }}
                                            >

                                                <span
                                                    style={{
                                                        display:
                                                            "block",
                                                        fontSize:
                                                            "11px",
                                                        color:
                                                            "#888",
                                                    }}
                                                >
                                                    Total
                                                </span>

                                                <strong
                                                    data-testid={`item-total-${item.id}`}
                                                    style={{
                                                        fontSize:
                                                            "16px",
                                                        color:
                                                            "#111827",
                                                    }}
                                                >
                                                    ₹
                                                    {itemTotal.toLocaleString()}
                                                </strong>

                                            </div>

                                            <button
                                                type="button"
                                                aria-label={`Remove ${productName}`}
                                                data-testid={`remove-${item.id}`}
                                                onClick={() =>
                                                    removeItem(
                                                        item.id
                                                    )
                                                }
                                                title="Remove item"
                                                style={{
                                                    background:
                                                        "#fee2e2",
                                                    border:
                                                        "none",
                                                    color:
                                                        "#dc2626",
                                                    padding:
                                                        "7px 10px",
                                                    borderRadius:
                                                        "6px",
                                                    cursor:
                                                        "pointer",
                                                    fontSize:
                                                        "12px",
                                                    fontWeight:
                                                        "600",
                                                }}
                                            >
                                                ✕
                                            </button>

                                        </div>

                                    </div>
                                );
                            }
                        )}

                    </div>

                    {/* PRICE SUMMARY */}

                    <div
                        style={{
                            background:
                                "#f9fafb",
                            border:
                                "1px solid #e5e7eb",
                            borderRadius:
                                "10px",
                            padding:
                                "16px 20px",
                            marginTop:
                                "20px",
                        }}
                    >

                        <div
                            style={{
                                display:
                                    "flex",
                                justifyContent:
                                    "space-between",
                                marginBottom:
                                    "10px",
                                fontSize:
                                    "14px",
                                color:
                                    "#4b5563",
                            }}
                        >
                            <span>
                                Items Subtotal
                            </span>

                            <strong
                                data-testid="product-total"
                                style={{
                                    color:
                                        "#111827",
                                }}
                            >
                                ₹
                                {productTotal.toLocaleString()}
                            </strong>
                        </div>

                        {discount > 0 && (
                            <div
                                style={{
                                    display:
                                        "flex",
                                    justifyContent:
                                        "space-between",
                                    marginBottom:
                                        "10px",
                                    fontSize:
                                        "14px",
                                    color:
                                        "#16a34a",
                                }}
                            >
                                <span>
                                    Flat 10% Discount
                                </span>

                                <strong>
                                    - ₹
                                    {discount.toLocaleString()}
                                </strong>
                            </div>
                        )}

                        <div
                            style={{
                                display:
                                    "flex",
                                justifyContent:
                                    "space-between",
                                marginBottom:
                                    "10px",
                                fontSize:
                                    "14px",
                                color:
                                    "#4b5563",
                            }}
                        >
                            <span>
                                Delivery Charges
                            </span>

                            <strong
                                style={{
                                    color:
                                        normalDeliveryCharge ===
                                            0
                                            ? "#16a34a"
                                            : "#111827",
                                }}
                            >
                                {normalDeliveryCharge ===
                                    0
                                    ? "FREE"
                                    : `₹${normalDeliveryCharge}`}
                            </strong>
                        </div>

                        <div
                            style={{
                                display:
                                    "flex",
                                justifyContent:
                                    "space-between",
                                borderTop:
                                    "2px dashed #d1d5db",
                                paddingTop:
                                    "12px",
                                marginTop:
                                    "6px",
                            }}
                        >
                            <span
                                style={{
                                    fontSize:
                                        "16px",
                                    fontWeight:
                                        "700",
                                    color:
                                        "#111827",
                                }}
                            >
                                Estimated Total
                            </span>

                            <strong
                                data-testid="estimated-total"
                                style={{
                                    fontSize:
                                        "20px",
                                    color:
                                        "#2874f0",
                                }}
                            >
                                ₹
                                {(
                                    productTotal -
                                    discount +
                                    normalDeliveryCharge
                                ).toLocaleString()}
                            </strong>
                        </div>

                    </div>

                    <button
                        className="continue-btn"
                        data-testid="proceed-address"
                        onClick={
                            continueToAddress
                        }
                        style={{
                            width:
                                "100%",
                            marginTop:
                                "18px",
                            padding:
                                "14px",
                            background:
                                "#2874f0",
                            color:
                                "#ffffff",
                            border:
                                "none",
                            borderRadius:
                                "8px",
                            fontSize:
                                "16px",
                            fontWeight:
                                "700",
                            cursor:
                                "pointer",
                        }}
                    >
                        Proceed to Delivery
                        Address →
                    </button>

                </div>
            )}

            {/* =====================================================
                STEP 2 - ADDRESS
            ===================================================== */}

            {step === 2 && (
                <div className="checkout-card">

                    {/* ADDRESS HEADER */}

                    <div className="card-heading">

                        <div className="heading-icon">
                            <FaMapMarkerAlt />
                        </div>

                        <div>
                            <h2>
                                Delivery Address
                            </h2>

                            <p>
                                Enter where you
                                want your
                                MediKart order
                                delivered.
                            </p>
                        </div>

                    </div>

                    {/* =================================================
                        ADDRESS MODE
                    ================================================= */}

                    <div
                        style={{
                            display:
                                "grid",
                            gridTemplateColumns:
                                "1fr 1fr",
                            gap:
                                "12px",
                            margin:
                                "20px 0",
                        }}
                    >

                        {/* MAP */}

                        <button
                            type="button"
                            onClick={
                                chooseLocationOnMap
                            }
                            style={{
                                display:
                                    "flex",
                                alignItems:
                                    "center",
                                justifyContent:
                                    "center",
                                gap:
                                    "10px",
                                padding:
                                    "14px",
                                border:
                                    addressMode ===
                                        "map"
                                        ? "2px solid #2874f0"
                                        : "1px solid #d1d5db",
                                borderRadius:
                                    "10px",
                                background:
                                    addressMode ===
                                        "map"
                                        ? "#eff6ff"
                                        : "#fff",
                                color:
                                    "#2874f0",
                                fontWeight:
                                    "700",
                                cursor:
                                    "pointer",
                            }}
                        >
                            <FaMap />

                            {locationLoading
                                ? "Getting Location..."
                                : "Choose on Map"}
                        </button>

                        {/* FORM */}

                        <button
                            type="button"
                            onClick={() =>
                                setAddressMode(
                                    "form"
                                )
                            }
                            style={{
                                display:
                                    "flex",
                                alignItems:
                                    "center",
                                justifyContent:
                                    "center",
                                gap:
                                    "10px",
                                padding:
                                    "14px",
                                border:
                                    addressMode ===
                                        "form"
                                        ? "2px solid #2874f0"
                                        : "1px solid #d1d5db",
                                borderRadius:
                                    "10px",
                                background:
                                    addressMode ===
                                        "form"
                                        ? "#eff6ff"
                                        : "#fff",
                                color:
                                    "#2874f0",
                                fontWeight:
                                    "700",
                                cursor:
                                    "pointer",
                            }}
                        >
                            <FaEdit />

                            Fill Details
                        </button>

                    </div>

                    {/* MAP SELECTED MESSAGE */}

                    {addressMode ===
                        "map" && (
                            <div
                                style={{
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    gap:
                                        "10px",
                                    background:
                                        "#ecfdf5",
                                    border:
                                        "1px solid #bbf7d0",
                                    color:
                                        "#166534",
                                    padding:
                                        "12px 14px",
                                    borderRadius:
                                        "8px",
                                    marginBottom:
                                        "16px",
                                    fontSize:
                                        "14px",
                                    fontWeight:
                                        "600",
                                }}
                            >
                                <FaLocationArrow />

                                Location selected. Please enter your full delivery
                                address, name, phone, city, state and pincode below.
                            </div>
                        )}

                    {addressMode === "map" && selectedLocation && (
                        <div className="checkout-map">
                            <iframe
                                title="Selected delivery location"
                                loading="lazy"
                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedLocation.longitude - 0.01}%2C${selectedLocation.latitude - 0.01}%2C${selectedLocation.longitude + 0.01}%2C${selectedLocation.latitude + 0.01}&layer=mapnik&marker=${selectedLocation.latitude}%2C${selectedLocation.longitude}`}
                            />
                            <a
                                href={`https://www.openstreetmap.org/?mlat=${selectedLocation.latitude}&mlon=${selectedLocation.longitude}#map=16/${selectedLocation.latitude}/${selectedLocation.longitude}`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                View this location on OpenStreetMap
                            </a>
                        </div>
                    )}

                    {/* ADDRESS FORM */}

                    <div className="address-form">

                        <div className="form-row">

                            <div className="form-group">

                                <label htmlFor="checkout-name">
                                    Full Name
                                </label>

                                <input
                                    id="checkout-name"
                                    type="text"
                                    name="name"
                                    value={
                                        address.name
                                    }
                                    onChange={
                                        handleAddressChange
                                    }
                                    placeholder="Enter full name"
                                />

                            </div>

                            <div className="form-group">

                                <label htmlFor="checkout-phone">
                                    Mobile Number
                                </label>

                                <input
                                    id="checkout-phone"
                                    type="tel"
                                    name="phone"
                                    value={
                                        address.phone
                                    }
                                    onChange={
                                        handleAddressChange
                                    }
                                    placeholder="10 digit mobile number"
                                    maxLength="10"
                                />

                            </div>

                        </div>

                        <div className="form-group">

                            <label htmlFor="checkout-address">
                                Complete Address
                            </label>

                            <textarea
                                id="checkout-address"
                                name="address"
                                value={
                                    address.address
                                }
                                onChange={
                                    handleAddressChange
                                }
                                placeholder="House No, Street, Area"
                                rows="3"
                            />

                        </div>

                        <div className="form-row">

                            <div className="form-group">

                                <label htmlFor="checkout-city">
                                    City
                                </label>

                                <input
                                    id="checkout-city"
                                    type="text"
                                    name="city"
                                    value={
                                        address.city
                                    }
                                    onChange={
                                        handleAddressChange
                                    }
                                    placeholder="City"
                                />

                            </div>

                            <div className="form-group">

                                <label htmlFor="checkout-state">
                                    State
                                </label>

                                <input
                                    id="checkout-state"
                                    type="text"
                                    name="state"
                                    value={
                                        address.state
                                    }
                                    onChange={
                                        handleAddressChange
                                    }
                                    placeholder="State"
                                />

                            </div>

                            <div className="form-group">

                                <label htmlFor="checkout-pincode">
                                    Pincode
                                </label>

                                <input
                                    id="checkout-pincode"
                                    type="text"
                                    name="pincode"
                                    value={
                                        address.pincode
                                    }
                                    onChange={
                                        handleAddressChange
                                    }
                                    placeholder="Pincode"
                                    maxLength="6"
                                />

                            </div>

                        </div>

                    </div>

                    {/* =====================================================
                        DELIVERY DISTANCE
                    ===================================================== */}

                    <div
                        style={{
                            marginTop:
                                "25px",
                            padding:
                                "18px",
                            background:
                                "#f8fafc",
                            border:
                                "1px solid #e2e8f0",
                            borderRadius:
                                "12px",
                        }}
                    >

                        <h2
                            style={{
                                margin:
                                    "0 0 6px",
                                fontSize:
                                    "18px",
                            }}
                        >
                            Delivery Distance
                        </h2>

                        <p
                            style={{
                                margin:
                                    "0 0 15px",
                                color:
                                    "#64748b",
                                fontSize:
                                    "13px",
                            }}
                        >
                            Delivery time is
                            estimated based
                            on how far the
                            delivery location
                            is from the
                            MediKart delivery
                            point.
                        </p>

                        <div
                            style={{
                                display:
                                    "grid",
                                gridTemplateColumns:
                                    "repeat(3, 1fr)",
                                gap:
                                    "10px",
                            }}
                        >

                            {/* SHORT */}

                            <button
                                type="button"
                                onClick={() =>
                                    setDeliveryDistance(
                                        "short"
                                    )
                                }
                                style={{
                                    padding:
                                        "14px 10px",
                                    border:
                                        deliveryDistance ===
                                            "short"
                                            ? "2px solid #16a34a"
                                            : "1px solid #d1d5db",
                                    background:
                                        deliveryDistance ===
                                            "short"
                                            ? "#f0fdf4"
                                            : "#fff",
                                    borderRadius:
                                        "10px",
                                    cursor:
                                        "pointer",
                                    textAlign:
                                        "center",
                                }}
                            >

                                <FaBolt
                                    style={{
                                        color:
                                            "#16a34a",
                                        fontSize:
                                            "18px",
                                    }}
                                />

                                <strong
                                    style={{
                                        display:
                                            "block",
                                        marginTop:
                                            "6px",
                                    }}
                                >
                                    Short
                                </strong>

                                <small>
                                    0–5 km
                                </small>

                                <span
                                    style={{
                                        display:
                                            "block",
                                        marginTop:
                                            "5px",
                                        color:
                                            "#16a34a",
                                        fontWeight:
                                            "700",
                                    }}
                                >
                                    20–30 min
                                </span>

                            </button>

                            {/* MEDIUM */}

                            <button
                                type="button"
                                onClick={() =>
                                    setDeliveryDistance(
                                        "medium"
                                    )
                                }
                                style={{
                                    padding:
                                        "14px 10px",
                                    border:
                                        deliveryDistance ===
                                            "medium"
                                            ? "2px solid #2874f0"
                                            : "1px solid #d1d5db",
                                    background:
                                        deliveryDistance ===
                                            "medium"
                                            ? "#eff6ff"
                                            : "#fff",
                                    borderRadius:
                                        "10px",
                                    cursor:
                                        "pointer",
                                    textAlign:
                                        "center",
                                }}
                            >

                                <FaTruck
                                    style={{
                                        color:
                                            "#2874f0",
                                        fontSize:
                                            "18px",
                                    }}
                                />

                                <strong
                                    style={{
                                        display:
                                            "block",
                                        marginTop:
                                            "6px",
                                    }}
                                >
                                    Medium
                                </strong>

                                <small>
                                    5–15 km
                                </small>

                                <span
                                    style={{
                                        display:
                                            "block",
                                        marginTop:
                                            "5px",
                                        color:
                                            "#2874f0",
                                        fontWeight:
                                            "700",
                                    }}
                                >
                                    45–60 min
                                </span>

                            </button>

                            {/* LONG */}

                            <button
                                type="button"
                                onClick={() =>
                                    setDeliveryDistance(
                                        "long"
                                    )
                                }
                                style={{
                                    padding:
                                        "14px 10px",
                                    border:
                                        deliveryDistance ===
                                            "long"
                                            ? "2px solid #f97316"
                                            : "1px solid #d1d5db",
                                    background:
                                        deliveryDistance ===
                                            "long"
                                            ? "#fff7ed"
                                            : "#fff",
                                    borderRadius:
                                        "10px",
                                    cursor:
                                        "pointer",
                                    textAlign:
                                        "center",
                                }}
                            >

                                <FaClock
                                    style={{
                                        color:
                                            "#f97316",
                                        fontSize:
                                            "18px",
                                    }}
                                />

                                <strong
                                    style={{
                                        display:
                                            "block",
                                        marginTop:
                                            "6px",
                                    }}
                                >
                                    Long
                                </strong>

                                <small>
                                    15+ km
                                </small>

                                <span
                                    style={{
                                        display:
                                            "block",
                                        marginTop:
                                            "5px",
                                        color:
                                            "#f97316",
                                        fontWeight:
                                            "700",
                                    }}
                                >
                                    1.5–2.5 hrs
                                </span>

                            </button>

                        </div>

                        {/* CURRENT DELIVERY TIME */}

                        <div
                            style={{
                                marginTop:
                                    "15px",
                                padding:
                                    "12px",
                                background:
                                    "#ffffff",
                                border:
                                    "1px solid #e5e7eb",
                                borderRadius:
                                    "8px",
                                display:
                                    "flex",
                                alignItems:
                                    "center",
                                gap:
                                    "10px",
                            }}
                        >

                            <FaClock
                                style={{
                                    color:
                                        "#2874f0",
                                }}
                            />

                            <span>
                                Estimated delivery
                                time:
                            </span>

                            <strong>
                                {
                                    getDeliveryTime()
                                }
                            </strong>

                        </div>

                    </div>

                    {/* =====================================================
                        CHOOSE DELIVERY OPTION
                    ===================================================== */}

                    <div className="delivery-section">

                        <h2>
                            Choose Delivery
                            Option
                        </h2>

                        <p className="delivery-subtitle">
                            Delivery time is
                            adjusted according
                            to the delivery
                            distance.
                        </p>

                        {/* NORMAL */}

                        <label
                            className={`delivery-option ${deliveryType ===
                                "normal"
                                ? "selected"
                                : ""
                                }`}
                        >

                            <input
                                type="radio"
                                name="delivery"
                                value="normal"
                                checked={
                                    deliveryType ===
                                    "normal"
                                }
                                onChange={() =>
                                    setDeliveryType(
                                        "normal"
                                    )
                                }
                            />

                            <div className="delivery-icon normal">
                                <FaTruck />
                            </div>

                            <div className="delivery-content">

                                <strong>
                                    Normal Delivery
                                </strong>

                                <span>
                                    Delivery by{" "}
                                    <b>
                                        {
                                            getNormalDeliveryDate()
                                        }
                                    </b>
                                </span>

                                <small
                                    style={{
                                        color:
                                            "#2874f0",
                                        fontWeight:
                                            "700",
                                    }}
                                >
                                    Estimated time:
                                    {" "}
                                    {
                                        getDeliveryTime()
                                    }
                                </small>

                            </div>

                            <div className="delivery-price">
                                {normalDeliveryCharge ===
                                    0
                                    ? "FREE"
                                    : `₹${normalDeliveryCharge}`}
                            </div>

                        </label>

                        {/* EXPRESS */}

                        <label
                            className={`delivery-option ${!expressAvailable
                                ? "disabled"
                                : deliveryType ===
                                    "express"
                                    ? "selected"
                                    : ""
                                }`}
                        >

                            <input
                                type="radio"
                                name="delivery"
                                value="express"
                                disabled={
                                    !expressAvailable
                                }
                                checked={
                                    deliveryType ===
                                    "express"
                                }
                                onChange={() =>
                                    setDeliveryType(
                                        "express"
                                    )
                                }
                            />

                            <div className="delivery-icon express">
                                <FaBolt />
                            </div>

                            <div className="delivery-content">

                                <strong>
                                    Express Delivery
                                </strong>

                                <span>
                                    Delivery in{" "}
                                    <b>
                                        {
                                            getDeliveryTime()
                                        }
                                    </b>
                                </span>

                                {!expressAvailable && (
                                    <small>
                                        Available
                                        for
                                        orders
                                        above
                                        ₹299
                                    </small>
                                )}

                            </div>

                            <div className="delivery-price">
                                ₹49
                            </div>

                        </label>

                        {/* TODAY */}

                        <label
                            className={`delivery-option ${!todayAvailable
                                ? "disabled"
                                : deliveryType ===
                                    "today"
                                    ? "selected"
                                    : ""
                                }`}
                        >

                            <input
                                type="radio"
                                name="delivery"
                                value="today"
                                disabled={
                                    !todayAvailable
                                }
                                checked={
                                    deliveryType ===
                                    "today"
                                }
                                onChange={() =>
                                    setDeliveryType(
                                        "today"
                                    )
                                }
                            />

                            <div className="delivery-icon today">
                                <FaClock />
                            </div>

                            <div className="delivery-content">

                                <strong>
                                    Today Delivery
                                </strong>

                                <span>
                                    Get it{" "}
                                    <b>
                                        Today
                                    </b>
                                </span>

                                <small
                                    style={{
                                        color:
                                            "#16a34a",
                                        fontWeight:
                                            "700",
                                    }}
                                >
                                    Within{" "}
                                    {
                                        getDeliveryTime()
                                    }
                                </small>

                                {!todayAvailable && (
                                    <small>
                                        Available
                                        for
                                        orders
                                        above
                                        ₹999
                                    </small>
                                )}

                            </div>

                            <div className="delivery-price">
                                ₹99
                            </div>

                        </label>

                    </div>

                    <div className="button-row">

                        <button
                            className="back-btn"
                            onClick={() =>
                                setStep(1)
                            }
                        >
                            Back
                        </button>

                        <button
                            className="continue-btn"
                            disabled={addressSaving}
                            onClick={continueToPayment}
                        >
                            {addressSaving ? "Saving Address..." : "Continue to Payment"}
                        </button>

                    </div>

                </div>
            )}

            {/* =====================================================
                STEP 3 - PAYMENT
            ===================================================== */}

            {step === 3 && (
                <div className="checkout-card">

                    <div className="card-heading">

                        <div className="heading-icon">
                            <FaCreditCard />
                        </div>

                        <div>

                            <h2>
                                Payment Method
                            </h2>

                            <p>
                                Select your
                                preferred
                                payment method.
                            </p>

                        </div>

                    </div>

                    <div className="payment-options">

                        {/* CARD */}

                        <label
                            className={`payment-option ${paymentMethod ===
                                "CARD"
                                ? "selected"
                                : ""
                                }`}
                        >

                            <input
                                type="radio"
                                name="payment"
                                value="CARD"
                                aria-label="Credit / Debit Card"
                                checked={
                                    paymentMethod ===
                                    "CARD"
                                }
                                onChange={(e) =>
                                    setPaymentMethod(
                                        e.target
                                            .value
                                    )
                                }
                            />

                            <FaCreditCard />

                            <div>
                                <strong>
                                    Credit / Debit
                                    Card
                                </strong>

                                <span>
                                    Visa,
                                    Mastercard,
                                    RuPay
                                </span>
                            </div>

                        </label>

                        {/* NET BANKING */}

                        <label
                            className={`payment-option ${paymentMethod ===
                                "NETBANKING"
                                ? "selected"
                                : ""
                                }`}
                        >

                            <input
                                type="radio"
                                name="payment"
                                value="NETBANKING"
                                aria-label="Net Banking"
                                checked={
                                    paymentMethod ===
                                    "NETBANKING"
                                }
                                onChange={(e) =>
                                    setPaymentMethod(
                                        e.target
                                            .value
                                    )
                                }
                            />

                            <FaUniversity />

                            <div>
                                <strong>
                                    Net Banking
                                </strong>

                                <span>
                                    All major
                                    banks
                                </span>
                            </div>

                        </label>

                        {/* COD */}

                        <label
                            className={`payment-option ${paymentMethod ===
                                "COD"
                                ? "selected"
                                : ""
                                }`}
                        >

                            <input
                                type="radio"
                                name="payment"
                                value="COD"
                                aria-label="Cash on Delivery"
                                checked={
                                    paymentMethod ===
                                    "COD"
                                }
                                onChange={(e) =>
                                    setPaymentMethod(
                                        e.target
                                            .value
                                    )
                                }
                            />

                            <FaMoneyBillWave />

                            <div>
                                <strong>
                                    Cash on Delivery
                                </strong>

                                <span>
                                    Pay when the
                                    order arrives
                                </span>
                            </div>

                        </label>

                    </div>

                    {/* CARD FORM */}

                    {paymentMethod ===
                        "CARD" && (
                            <div className="payment-form">

                                <input
                                    placeholder="Card Number"
                                />

                                <div className="form-row">

                                    <input
                                        placeholder="MM/YY"
                                    />

                                    <input
                                        placeholder="CVV"
                                    />

                                </div>

                                <input
                                    placeholder="Card Holder Name"
                                />

                            </div>
                        )}

                    {/* NET BANKING */}

                    {paymentMethod ===
                        "NETBANKING" && (
                            <div className="payment-form">

                                <select>

                                    <option>
                                        Select Bank
                                    </option>

                                    <option>
                                        State Bank of
                                        India
                                    </option>

                                    <option>
                                        HDFC Bank
                                    </option>

                                    <option>
                                        ICICI Bank
                                    </option>

                                    <option>
                                        Axis Bank
                                    </option>

                                    <option>
                                        Punjab National
                                        Bank
                                    </option>

                                </select>

                            </div>
                        )}

                    {/* DELIVERY ESTIMATE */}

                    <div
                        style={{
                            marginTop:
                                "18px",
                            padding:
                                "14px",
                            background:
                                "#eff6ff",
                            border:
                                "1px solid #bfdbfe",
                            borderRadius:
                                "8px",
                            display:
                                "flex",
                            alignItems:
                                "center",
                            gap:
                                "10px",
                            color:
                                "#1e40af",
                        }}
                    >

                        <FaClock />

                        <span>
                            Estimated delivery:
                        </span>

                        <strong>
                            {
                                getDeliveryTime()
                            }
                        </strong>

                    </div>

                    {/* PAYMENT SUMMARY */}

                    <div className="payment-summary">

                        <div>

                            <span>
                                Products
                            </span>

                            <strong>
                                ₹
                                {productTotal.toLocaleString()}
                            </strong>

                        </div>

                        {discount > 0 && (
                            <div>

                                <span>
                                    Discount (10%)
                                </span>

                                <strong
                                    style={{
                                        color:
                                            "#388e3c",
                                    }}
                                >
                                    - ₹
                                    {discount.toLocaleString()}
                                </strong>

                            </div>
                        )}

                        <div>

                            <span>
                                Delivery
                            </span>

                            <strong>
                                {deliveryCharge ===
                                    0
                                    ? "FREE"
                                    : `₹${deliveryCharge}`}
                            </strong>

                        </div>

                        <div className="final-total">

                            <span>
                                Payable Amount
                            </span>

                            <strong
                                data-testid="payable-amount"
                            >
                                ₹
                                {totalAmount.toLocaleString()}
                            </strong>

                        </div>

                    </div>

                    <div className="button-row">

                        <button
                            className="back-btn"
                            onClick={() =>
                                setStep(2)
                            }
                        >
                            Back
                        </button>

                        <button
                            className="place-order-btn"
                            data-testid="place-order"
                            disabled={placingOrder}
                            onClick={async () => {
                                if (placingOrder) return;

                                setPlacingOrder(true);
                                setStep(4);

                                try {
                                    await placeOrder();
                                } finally {
                                    setPlacingOrder(false);
                                }
                            }}
                        >
                            {placingOrder ? "Placing Order..." : "Place Order"}
                        </button>

                    </div>

                </div>
            )}

            {/* =====================================================
                STEP 4 - PROCESSING
            ===================================================== */}

            {step === 4 && (
                <div className="processing-card">

                    <div className="processing-loader">
                        <div></div>
                    </div>

                    <h2>
                        Placing Your Order...
                    </h2>

                    <p>
                        Please wait while we
                        confirm your order.
                    </p>

                </div>
            )}

            {/* =====================================================
                STEP 5 - SUCCESS
            ===================================================== */}

            {step === 5 && (
                <div className="success-card">

                    <div className="success-circle">
                        <FaCheck />
                    </div>

                    <h1>
                        Order Placed
                        Successfully!
                    </h1>

                    <p>
                        Thank you for choosing
                        MediKart.
                    </p>

                    {/* ORDER ID */}

                    <div className="order-id-box">

                        <span>
                            Your Order ID
                        </span>

                        <strong
                            data-testid="order-id"
                        >
                            {orderId}
                        </strong>

                    </div>

                    {/* SUCCESS DETAILS */}

                    <div className="success-details">

                        <div>

                            <span>
                                Payment
                            </span>

                            <strong>
                                {paymentMethod ===
                                    "COD"
                                    ? "Cash on Delivery"
                                    : paymentMethod ===
                                        "CARD"
                                        ? "Credit/Debit Card"
                                        : "Net Banking"}
                            </strong>

                        </div>

                        <div>

                            <span>
                                Delivery
                            </span>

                            <strong>
                                {deliveryType ===
                                    "today"
                                    ? "Today Delivery"
                                    : deliveryType ===
                                        "express"
                                        ? "Express Delivery"
                                        : "Normal Delivery"}
                            </strong>

                        </div>

                        <div>

                            <span>
                                Delivery Distance
                            </span>

                            <strong>
                                {
                                    getDistanceLabel()
                                }
                            </strong>

                        </div>

                        <div>

                            <span>
                                Delivery Time
                            </span>

                            <strong>
                                {
                                    getDeliveryTime()
                                }
                            </strong>

                        </div>

                        <div>

                            <span>
                                Estimated Delivery
                            </span>

                            <strong>
                                {
                                    getDeliveryDate()
                                }
                            </strong>

                        </div>

                        <div>

                            <span>
                                Total Amount
                            </span>

                            <strong>
                                ₹
                                {totalAmount.toLocaleString()}
                            </strong>

                        </div>

                    </div>

                    {/* SUCCESS BUTTONS */}

                    <div className="success-buttons">

                        <button
                            data-testid="view-order"
                            onClick={() =>
                                navigate(
                                    `/orders/${orderId}`
                                )
                            }
                        >
                            View Order
                        </button>

                        <button
                            className="secondary"
                            onClick={() =>
                                navigate(
                                    "/shop"
                                )
                            }
                        >
                            Continue Shopping
                        </button>

                    </div>

                </div>
            )}
        </div>


    );
};

export default Checkout;