
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import {
    createCheckoutOrder,
    getCheckoutCart,
    saveCheckoutAddress,
    validateCheckoutCoupon,
} from "../../api/checkoutApi";

import { getApiErrorMessage } from "../../services/api";
import { getProductImage } from "../../utils/productImage";

import "./Checkout.css";

const EMPTY_ADDRESS = {
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
};

const IMAGE_FALLBACK =
    "https://placehold.co/150x150?text=MediKart";

const money = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

function normalizeItem(item = {}) {
    const productId = Number(
        item.product_id ?? item.productId ?? item.id
    );

    const price = Number(
        item.discountedPrice ??
        item.discounted_price ??
        item.discount_price ??
        item.sellingPrice ??
        item.price ??
        0
    );

    const originalPrice = Number(
        item.originalPrice ??
        item.original_price ??
        item.price ??
        price
    );

    return {
        ...item,
        id: item.id ?? productId,
        product_id: productId,
        name: item.name ?? item.title ?? item.product_name ?? "Healthcare Product",
        image:
            item.image ??
            item.image_url ??
            item.imageUrl ??
            item.product_image ??
            item.thumbnail ??
            "",
        category: item.category ?? item.category_name ?? "",
        price: Number.isFinite(price) ? price : 0,
        originalPrice: Number.isFinite(originalPrice)
            ? originalPrice
            : price,
        quantity: Math.max(1, Number(item.quantity) || 1),
    };
}

export default function Checkout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id: routeProductId } = useParams();

    const buyNowItems = location.state?.buyNowItems;
    const selectedItems = location.state?.checkoutItems;

    const isBuyNow =
        Array.isArray(buyNowItems) && buyNowItems.length > 0;

    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    const [step, setStep] = useState(1);

    const [address, setAddress] = useState(EMPTY_ADDRESS);

    const [paymentMethod, setPaymentMethod] = useState("COD");

    const [deliveryType, setDeliveryType] = useState("normal");
    const [deliveryDistance, setDeliveryDistance] = useState("short");

    const [addressMode, setAddressMode] = useState("form");

    const [savingAddress, setSavingAddress] = useState(false);
    const [placingOrder, setPlacingOrder] = useState(false);

    const [error, setError] = useState("");
    const [order, setOrder] = useState(null);

    // PAYMENT STATES
    const [upiApp, setUpiApp] = useState("Google Pay");
    const [upiId, setUpiId] = useState("");

    const [cardDetails, setCardDetails] = useState({
        holder: "",
        number: "",
        expiry: "",
        cvv: "",
    });

    const [selectedBank, setSelectedBank] = useState("");

    // COUPON STATES
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState(null);

    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState("");
    const [couponMessage, setCouponMessage] = useState("");

    // LOAD CHECKOUT PRODUCTS
    useEffect(() => {
        let active = true;

        async function load() {
            setLoading(true);
            setLoadError("");

            try {
                let source;

                if (isBuyNow) {
                    source = buyNowItems;
                } else if (
                    Array.isArray(selectedItems) &&
                    selectedItems.length
                ) {
                    source = selectedItems;
                } else {
                    const response = await getCheckoutCart();

                    source = Array.isArray(response)
                        ? response
                        : response?.items ??
                        response?.cart_items ??
                        [];
                }

                if (active) {
                    setCartItems(source.map(normalizeItem));
                }
            } catch (err) {
                if (active) {
                    setLoadError(
                        getApiErrorMessage(
                            err,
                            "Unable to load your cart."
                        )
                    );
                }
            } finally {
                if (active) setLoading(false);
            }
        }

        load();

        return () => {
            active = false;
        };
    }, [isBuyNow, buyNowItems, selectedItems]);

    // LOAD SAVED ADDRESS
    useEffect(() => {
        try {
            const saved = JSON.parse(
                localStorage.getItem("deliveryAddress") || "null"
            );

            if (saved) {
                setAddress({
                    name: saved.name || "",
                    phone: saved.phone || "",
                    address: saved.address || "",
                    city: saved.city || "",
                    state: saved.state || "",
                    pincode: saved.pincode || "",
                });

                setAddressMode(saved.addressMode || "form");

                setDeliveryDistance(
                    saved.deliveryDistance || "short"
                );
            }
        } catch {
            localStorage.removeItem("deliveryAddress");
        }
    }, []);

    // FILTER PRODUCTS
    const visibleItems = useMemo(() => {
        if (!routeProductId) return cartItems;

        return cartItems.filter(
            (item) =>
                String(item.product_id) === String(routeProductId)
        );
    }, [cartItems, routeProductId]);

    // PRICE CALCULATIONS
    const subtotal = useMemo(
        () =>
            Number(
                visibleItems
                    .reduce(
                        (sum, item) =>
                            sum + item.price * item.quantity,
                        0
                    )
                    .toFixed(2)
            ),
        [visibleItems]
    );

    const originalTotal = useMemo(
        () =>
            Number(
                visibleItems
                    .reduce(
                        (sum, item) =>
                            sum +
                            item.originalPrice * item.quantity,
                        0
                    )
                    .toFixed(2)
            ),
        [visibleItems]
    );

    const discount = Number(
        Math.max(0, originalTotal - subtotal).toFixed(2)
    );

    const couponDiscount = Math.min(
        subtotal,
        Number(appliedCoupon?.discount_amount || 0)
    );

    const deliveryCharge =
        deliveryType === "express"
            ? 49
            : deliveryType === "today"
                ? 99
                : subtotal >= 499
                    ? 0
                    : 10;

    const total = Number(
        Math.max(
            0,
            subtotal - couponDiscount + deliveryCharge -
            (appliedCoupon ? 0 : 0)
        ).toFixed(2)
    );

    // ADDRESS HANDLING
    function changeAddress(event) {
        const { name, value } = event.target;

        const updatedValue =
            name === "phone"
                ? value.replace(/\D/g, "").slice(0, 10)
                : name === "pincode"
                    ? value.replace(/\D/g, "").slice(0, 6)
                    : value;

        setAddress((current) => ({
            ...current,
            [name]: updatedValue,
        }));

        setAddressMode("form");
    }

    function validateAddress() {
        if (
            address.name.trim().length < 2 ||
            address.name.trim().length > 100
        ) {
            return "Enter your full name.";
        }

        if (!/^[6-9]\d{9}$/.test(address.phone.trim())) {
            return "Enter a valid 10-digit phone number.";
        }

        if (
            address.address.trim().length < 3 ||
            address.address.trim().length > 255
        ) {
            return "Enter a valid delivery address.";
        }

        if (address.city.trim().length < 2) {
            return "Enter a valid city.";
        }

        if (address.state.trim().length < 2) {
            return "Enter a valid state.";
        }

        if (!/^\d{6}$/.test(address.pincode.trim())) {
            return "Enter a valid 6-digit pincode.";
        }

        return "";
    }

    // SAVE ADDRESS
    async function continueToPayment(event) {
        event.preventDefault();

        const validationError = validateAddress();

        if (validationError) {
            setError(validationError);
            return;
        }

        setSavingAddress(true);
        setError("");

        const payload = {
            ...address,
            name: address.name.trim(),
            phone: address.phone.trim(),
            address: address.address.trim(),
            city: address.city.trim(),
            state: address.state.trim(),
            pincode: address.pincode.trim(),
            addressMode,
            deliveryDistance,
        };

        try {
            await saveCheckoutAddress(payload);

            localStorage.setItem(
                "deliveryAddress",
                JSON.stringify(payload)
            );

            setStep(3);
        } catch (err) {
            setError(
                getApiErrorMessage(
                    err,
                    "Unable to save your delivery address."
                )
            );
        } finally {
            setSavingAddress(false);
        }
    }

    // PAYMENT VALIDATION
    function validatePayment() {
        if (paymentMethod === "UPI") {
            const upiPattern =
                /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z0-9]{2,64}$/;

            if (!upiPattern.test(upiId.trim())) {
                return "Enter a valid UPI ID, such as name@okaxis.";
            }
        }

        if (paymentMethod === "CARD") {
            const cardNumber = cardDetails.number.replace(
                /\s/g,
                ""
            );

            if (cardDetails.holder.trim().length < 3) {
                return "Enter the cardholder name.";
            }

            if (!/^\d{12,19}$/.test(cardNumber)) {
                return "Enter a valid card number.";
            }

            if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardDetails.expiry)) {
                return "Enter expiry date in MM/YY format.";
            }

            if (!/^\d{3,4}$/.test(cardDetails.cvv)) {
                return "Enter a valid CVV.";
            }
        }

        if (
            paymentMethod === "NETBANKING" &&
            !selectedBank
        ) {
            return "Please select your bank.";
        }

        return "";
    }

    // CARD INPUT
    function changeCard(event) {
        const { name, value } = event.target;

        setCardDetails((previous) => ({
            ...previous,
            [name]:
                name === "number"
                    ? value.replace(/\D/g, "").slice(0, 19)
                    : name === "cvv"
                        ? value.replace(/\D/g, "").slice(0, 4)
                        : name === "expiry"
                            ? value.replace(/\D/g, "").slice(0, 4)
                            : value,
        }));
    }

    // COUPON VALIDATION
    async function applyCoupon() {
        const code = couponCode.trim().toUpperCase();

        if (!code) {
            setCouponError("Please enter a coupon code.");
            return;
        }

        setCouponLoading(true);
        setCouponError("");
        setCouponMessage("");

        try {
            if (typeof validateCheckoutCoupon !== "function") {
                throw new Error(
                    "Coupon API is not configured in checkoutApi.js."
                );
            }

            const response = await validateCheckoutCoupon({
                code,
                items: visibleItems.map((item) => ({
                    product_id: Number(item.product_id),
                    quantity: Number(item.quantity),
                })),
                subtotal,
            });

            const result = response?.data ?? response;

            if (
                result?.valid === false ||
                result?.success === false ||
                !Number.isFinite(Number(result?.discount_amount)) ||
                Number(result.discount_amount) <= 0
            ) {
                throw new Error(
                    result?.message ||
                    "Invalid or expired coupon."
                );
            }

            const discountAmount = Math.min(
                subtotal,
                Number(result.discount_amount)
            );

            setAppliedCoupon({
                code: result.code || code,
                discount_amount: discountAmount,
            });

            setCouponCode(result.code || code);

            setCouponMessage(
                `${result.code || code} applied successfully!`
            );
        } catch (err) {
            setAppliedCoupon(null);

            setCouponError(
                getApiErrorMessage(
                    err,
                    "Unable to validate coupon."
                )
            );
        } finally {
            setCouponLoading(false);
        }
    }

    // REMOVE COUPON
    function removeCoupon() {
        setAppliedCoupon(null);
        setCouponCode("");
        setCouponError("");
        setCouponMessage("");
    }

    // PLACE ORDER
    // PLACE ORDER - PRESERVE PRODUCT IMAGES
    async function placeOrder() {
        if (!visibleItems.length) {
            setError("Your cart is empty.");
            return;
        }

        const paymentError = validatePayment();

        if (paymentError) {
            setError(paymentError);
            return;
        }

        setPlacingOrder(true);
        setError("");

        const payload = {
            items: visibleItems.map((item) => ({
                product_id: Number(item.product_id),
                quantity: Number(item.quantity),
            })),
            shipping_address: {
                name: address.name.trim(),
                phone: address.phone.trim(),
                address: address.address.trim(),
                city: address.city.trim(),
                state: address.state.trim(),
                pincode: address.pincode.trim(),
            },
            payment_method: paymentMethod,
            delivery_type: deliveryType,
            delivery_distance: deliveryDistance,
            coupon_code: appliedCoupon?.code || null,
        };

        try {
            const response = await createCheckoutOrder(payload);
            const created = response?.order ?? response;

            const generatedId =
                created?.order_id ??
                created?.orderId ??
                created?.id;

            if (!generatedId) {
                throw new Error("The server did not return an order ID.");
            }

            // Save the original product information locally.
            const orderItems = visibleItems.map((item) => {
                const image = getProductImage(
                    item.image ||
                    item.image_url ||
                    item.imageUrl ||
                    item.product_image,
                    item.name,
                    item.category
                );

                return {
                    id: item.id,
                    product_id: item.product_id,
                    name: item.name,
                    brand: item.brand || "",
                    category: item.category || "",
                    image,
                    image_url: image,
                    price: Number(item.price || 0),
                    quantity: Number(item.quantity || 1),
                };
            });

            const confirmedOrder = {
                ...created,
                id: String(generatedId),
                order_id: String(generatedId),
                orderId: String(generatedId),
                orderDate:
                    created.created_at ||
                    created.createdAt ||
                    new Date().toISOString(),
                status: created.status || "Order Confirmed",
                paymentMethod,
                items: orderItems,
                totalAmount: Number(
                    created.total_amount ??
                    created.totalAmount ??
                    total
                ),
            };

            // Preserve existing orders.
            let existingOrders = [];

            try {
                existingOrders = JSON.parse(
                    localStorage.getItem("orders") || "[]"
                );

                if (!Array.isArray(existingOrders)) {
                    existingOrders = [];
                }
            } catch {
                existingOrders = [];
            }

            const updatedOrders = [
                confirmedOrder,
                ...existingOrders.filter((oldOrder) => {
                    const oldId =
                        oldOrder.orderId ||
                        oldOrder.order_id ||
                        oldOrder.id;

                    return String(oldId) !== String(generatedId);
                }),
            ];

            localStorage.setItem(
                "orders",
                JSON.stringify(updatedOrders)
            );

            setOrder(confirmedOrder);
            setCartItems([]);

            if (isBuyNow) {
                localStorage.removeItem("buyNow");
            }

            window.dispatchEvent(new Event("ordersUpdated"));
            window.dispatchEvent(new Event("cartUpdated"));

            setStep(4);
        } catch (err) {
            console.error("Order placement failed:", err);

            setError(
                getApiErrorMessage(
                    err,
                    "Unable to place your order. Please try again."
                )
            );
        } finally {
            setPlacingOrder(false);
        }
    }

    // LOADING
    if (loading) {
        return (
            <main className="checkout-page">
                <p role="status">Loading checkout...</p>
            </main>
        );
    }

    // LOAD ERROR
    if (loadError) {
        return (
            <main className="checkout-page">
                <section className="checkout-message" role="alert">
                    <h2>Unable to load checkout</h2>
                    <p>{loadError}</p>

                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                    >
                        Retry
                    </button>
                </section>
            </main>
        );
    }

    // ORDER SUCCESS
    if (step === 4 && order) {
        return (
            <main className="checkout-page">
                <section className="checkout-success" aria-live="polite">
                    <div className="checkout-success-icon">✓</div>

                    <h1>Order placed successfully!</h1>

                    <p>Your order has been saved.</p>

                    <p>
                        <strong>Order ID:</strong> {order.order_id}
                    </p>

                    <p>
                        <strong>Amount:</strong>{" "}
                        {money(order.total_amount ?? total)}
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate("/orders")}
                    >
                        View my orders
                    </button>

                    <button
                        className="checkout-secondary"
                        type="button"
                        onClick={() => navigate("/shop")}
                    >
                        Continue shopping
                    </button>
                </section>
            </main>
        );
    }

    // EMPTY CART
    if (!visibleItems.length) {
        return (
            <main className="checkout-page">
                <section className="checkout-message">
                    <h1>Your cart is empty</h1>

                    <p>Add products before proceeding to checkout.</p>

                    <button
                        type="button"
                        onClick={() => navigate("/shop")}
                    >
                        Continue shopping
                    </button>
                </section>
            </main>
        );
    }

    return (
        <main className="checkout-page">

            {/* HEADER */}
            <header className="checkout-header">
                <h1>Secure Checkout</h1>
                <p>Complete your order in a few simple steps.</p>
            </header>

            {/* CHECKOUT STEPS */}
            <nav className="checkout-steps" aria-label="Checkout progress">
                {["Review cart", "Delivery address", "Payment"].map(
                    (label, index) => (
                        <div
                            className={`checkout-step ${step >= index + 1 ? "active" : ""
                                }`}
                            key={label}
                        >
                            <span>{index + 1}</span>
                            {label}
                        </div>
                    )
                )}
            </nav>

            <div className="checkout-layout">

                {/* LEFT SECTION */}
                <section className="checkout-main">

                    {/* STEP 1: REVIEW CART */}
                    {step === 1 && (
                        <section className="checkout-panel">
                            <h2>Review your items</h2>

                            <ul className="checkout-items">
                                {visibleItems.map((item) => {
                                    const productImage = getProductImage(
                                        item.image,
                                        item.name,
                                        item.category
                                    );

                                    return (
                                        <li
                                            className="checkout-item"
                                            key={`${item.product_id}-${item.id}`}
                                        >
                                            <img
                                                src={productImage || IMAGE_FALLBACK}
                                                alt={item.name}
                                                className="checkout-product-image"
                                                onError={(event) => {
                                                    event.currentTarget.onerror = null;
                                                    event.currentTarget.src = IMAGE_FALLBACK;
                                                }}
                                            />

                                            <div className="checkout-item-info">
                                                <h3>{item.name}</h3>

                                                <p>Product ID: {item.product_id}</p>

                                                <p>Quantity: {item.quantity}</p>

                                                <strong>
                                                    {money(item.price * item.quantity)}
                                                </strong>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>

                            <button
                                type="button"
                                onClick={() => setStep(2)}
                            >
                                Continue to delivery
                            </button>
                        </section>
                    )}

                    {/* STEP 2: ADDRESS */}
                    {step === 2 && (
                        <form
                            className="checkout-panel"
                            onSubmit={continueToPayment}
                        >
                            <h2>Delivery address</h2>

                            <div className="checkout-form-grid">

                                <label>
                                    Full name
                                    <input
                                        name="name"
                                        value={address.name}
                                        onChange={changeAddress}
                                        autoComplete="name"
                                        required
                                    />
                                </label>

                                <label>
                                    Phone number
                                    <input
                                        name="phone"
                                        value={address.phone}
                                        onChange={changeAddress}
                                        inputMode="numeric"
                                        maxLength={10}
                                        autoComplete="tel"
                                        required
                                    />
                                </label>

                                <label className="checkout-full">
                                    Address
                                    <textarea
                                        name="address"
                                        value={address.address}
                                        onChange={changeAddress}
                                        rows={3}
                                        autoComplete="street-address"
                                        required
                                    />
                                </label>

                                <label>
                                    City
                                    <input
                                        name="city"
                                        value={address.city}
                                        onChange={changeAddress}
                                        required
                                    />
                                </label>

                                <label>
                                    State
                                    <input
                                        name="state"
                                        value={address.state}
                                        onChange={changeAddress}
                                        required
                                    />
                                </label>

                                <label>
                                    Pincode
                                    <input
                                        name="pincode"
                                        value={address.pincode}
                                        onChange={changeAddress}
                                        inputMode="numeric"
                                        maxLength={6}
                                        required
                                    />
                                </label>

                            </div>

                            <label className="checkout-select-label">
                                Delivery distance

                                <select
                                    value={deliveryDistance}
                                    onChange={(event) =>
                                        setDeliveryDistance(event.target.value)
                                    }
                                >
                                    <option value="short">Short</option>
                                    <option value="medium">Medium</option>
                                    <option value="long">Long</option>
                                </select>
                            </label>

                            <div className="checkout-actions">
                                <button
                                    className="checkout-secondary"
                                    type="button"
                                    onClick={() => setStep(1)}
                                >
                                    Back
                                </button>

                                <button
                                    type="submit"
                                    disabled={savingAddress}
                                >
                                    {savingAddress
                                        ? "Saving address..."
                                        : "Continue to payment"}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* STEP 3: PAYMENT AND COUPON */}
                    {step === 3 && (
                        <section className="checkout-panel">
                            <h2>Payment and delivery</h2>

                            {/* PAYMENT OPTIONS */}
                            <fieldset className="checkout-fieldset">
                                <legend>Choose payment method</legend>

                                {[
                                    ["COD", "💵 Cash on Delivery"],
                                    ["UPI", "📱 UPI Payment"],
                                    ["CARD", "💳 Credit / Debit Card"],
                                    ["NETBANKING", "🏦 Net Banking"],
                                ].map(([value, label]) => (
                                    <label
                                        className="checkout-radio"
                                        key={value}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value={value}
                                            checked={paymentMethod === value}
                                            onChange={(event) => {
                                                setPaymentMethod(event.target.value);
                                                setError("");
                                            }}
                                        />

                                        {label}
                                    </label>
                                ))}
                            </fieldset>

                            {/* COD FORM */}
                            {paymentMethod === "COD" && (
                                <div className="checkout-payment-details">
                                    <h3>Cash on Delivery</h3>
                                    <p>
                                        Pay when your order arrives at your
                                        delivery address.
                                    </p>
                                </div>
                            )}

                            {/* UPI FORM */}
                            {paymentMethod === "UPI" && (
                                <div className="checkout-payment-details">
                                    <h3>Pay using UPI</h3>

                                    <div className="checkout-upi-apps">
                                        {[
                                            "Google Pay",
                                            "PhonePe",
                                            "Paytm",
                                            "BHIM",
                                        ].map((app) => (
                                            <button
                                                type="button"
                                                key={app}
                                                className={
                                                    upiApp === app ? "active" : ""
                                                }
                                                onClick={() => setUpiApp(app)}
                                            >
                                                {app}
                                            </button>
                                        ))}
                                    </div>

                                    <label>
                                        UPI ID

                                        <input
                                            type="text"
                                            placeholder="example@okaxis"
                                            value={upiId}
                                            onChange={(event) =>
                                                setUpiId(event.target.value)
                                            }
                                        />
                                    </label>

                                    <small>
                                        Online payment requires a configured
                                        payment gateway.
                                    </small>
                                </div>
                            )}

                            {/* CARD FORM */}
                            {paymentMethod === "CARD" && (
                                <div className="checkout-payment-details">
                                    <h3>Credit / Debit Card</h3>

                                    <label>
                                        Cardholder Name

                                        <input
                                            name="holder"
                                            placeholder="Name on card"
                                            value={cardDetails.holder}
                                            onChange={changeCard}
                                            autoComplete="cc-name"
                                        />
                                    </label>

                                    <label>
                                        Card Number

                                        <input
                                            name="number"
                                            placeholder="Card number"
                                            value={cardDetails.number}
                                            onChange={changeCard}
                                            inputMode="numeric"
                                            autoComplete="cc-number"
                                        />
                                    </label>

                                    <div className="checkout-card-fields">
                                        <label>
                                            Expiry Date

                                            <input
                                                name="expiry"
                                                placeholder="MMYY"
                                                value={cardDetails.expiry}
                                                onChange={changeCard}
                                                inputMode="numeric"
                                                autoComplete="cc-exp"
                                            />
                                        </label>

                                        <label>
                                            CVV

                                            <input
                                                name="cvv"
                                                type="password"
                                                placeholder="CVV"
                                                value={cardDetails.cvv}
                                                onChange={changeCard}
                                                inputMode="numeric"
                                                autoComplete="cc-csc"
                                            />
                                        </label>
                                    </div>

                                    <small>
                                        For real transactions, collect card details
                                        using your payment gateway's secure hosted
                                        checkout or tokenization interface. Never
                                        send raw card details or CVV to your order API.
                                    </small>
                                </div>
                            )}

                            {/* NET BANKING FORM */}
                            {paymentMethod === "NETBANKING" && (
                                <div className="checkout-payment-details">
                                    <h3>Select Your Bank</h3>

                                    <label>
                                        Bank

                                        <select
                                            value={selectedBank}
                                            onChange={(event) =>
                                                setSelectedBank(event.target.value)
                                            }
                                        >
                                            <option value="">Select bank</option>

                                            {[
                                                "State Bank of India",
                                                "HDFC Bank",
                                                "ICICI Bank",
                                                "Axis Bank",
                                                "Kotak Mahindra Bank",
                                                "Punjab National Bank",
                                                "Bank of Baroda",
                                                "Canara Bank",
                                            ].map((bank) => (
                                                <option key={bank} value={bank}>
                                                    {bank}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <small>
                                        Bank payment requires payment gateway
                                        integration.
                                    </small>
                                </div>
                            )}

                            {/* DELIVERY OPTIONS */}
                            <fieldset className="checkout-fieldset">
                                <legend>Delivery option</legend>

                                <label className="checkout-radio">
                                    <input
                                        type="radio"
                                        name="deliveryType"
                                        value="normal"
                                        checked={deliveryType === "normal"}
                                        onChange={(event) =>
                                            setDeliveryType(event.target.value)
                                        }
                                    />
                                    Normal delivery
                                </label>

                                <label className="checkout-radio">
                                    <input
                                        type="radio"
                                        name="deliveryType"
                                        value="express"
                                        checked={deliveryType === "express"}
                                        onChange={(event) =>
                                            setDeliveryType(event.target.value)
                                        }
                                        disabled={subtotal < 299}
                                    />
                                    Express delivery (+₹49, orders ₹299+)
                                </label>

                                <label className="checkout-radio">
                                    <input
                                        type="radio"
                                        name="deliveryType"
                                        value="today"
                                        checked={deliveryType === "today"}
                                        onChange={(event) =>
                                            setDeliveryType(event.target.value)
                                        }
                                        disabled={subtotal < 999}
                                    />
                                    Priority delivery (+₹99, orders ₹999+)
                                </label>
                            </fieldset>

                            {/* COUPON SECTION */}
                            <section className="checkout-coupon">
                                <h3>🎁 Apply Product Coupon</h3>

                                {appliedCoupon ? (
                                    <div className="checkout-coupon-applied">
                                        <div>
                                            <strong>
                                                ✓ {appliedCoupon.code}
                                            </strong>

                                            <p>
                                                Discount:{" "}
                                                {money(couponDiscount)}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={removeCoupon}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <div className="checkout-coupon-form">
                                        <input
                                            type="text"
                                            placeholder="Enter coupon code"
                                            value={couponCode}
                                            onChange={(event) => {
                                                setCouponCode(
                                                    event.target.value.toUpperCase()
                                                );

                                                setCouponError("");
                                                setCouponMessage("");
                                            }}
                                        />

                                        <button
                                            type="button"
                                            onClick={applyCoupon}
                                            disabled={couponLoading}
                                        >
                                            {couponLoading ? "Checking..." : "Apply"}
                                        </button>
                                    </div>
                                )}

                                {couponError && (
                                    <p className="checkout-error" role="alert">
                                        {couponError}
                                    </p>
                                )}

                                {couponMessage && (
                                    <p className="checkout-coupon-success">
                                        {couponMessage}
                                    </p>
                                )}
                            </section>

                            {/* ACTION BUTTONS */}
                            <div className="checkout-actions">
                                <button
                                    className="checkout-secondary"
                                    type="button"
                                    onClick={() => setStep(2)}
                                >
                                    Back
                                </button>

                                <button
                                    type="button"
                                    onClick={placeOrder}
                                    disabled={placingOrder}
                                >
                                    {placingOrder
                                        ? "Placing order..."
                                        : `Place order • ${money(total)}`}
                                </button>
                            </div>
                        </section>
                    )}

                    {error && (
                        <p className="checkout-error" role="alert">
                            {error}
                        </p>
                    )}
                </section>

                {/* RIGHT SECTION: ORDER SUMMARY */}
                <aside className="checkout-summary">
                    <h2>Order summary</h2>

                    {visibleItems.map((item) => (
                        <div
                            className="checkout-summary-product"
                            key={`${item.product_id}-${item.id}`}
                        >
                            <span>
                                {item.name} × {item.quantity}
                            </span>

                            <strong>
                                {money(item.price * item.quantity)}
                            </strong>
                        </div>
                    ))}

                    <div>
                        <span>Original Price</span>
                        <span>{money(originalTotal)}</span>
                    </div>

                    <div>
                        <span>Product Discount</span>
                        <span className="checkout-green">
                            −{money(discount)}
                        </span>
                    </div>

                    <div>
                        <span>Subtotal</span>
                        <span>{money(subtotal)}</span>
                    </div>

                    <div>
                        <span>Coupon Discount</span>
                        <span className="checkout-green">
                            −{money(couponDiscount)}
                        </span>
                    </div>

                    <div>
                        <span>Delivery</span>
                        <span>
                            {deliveryCharge === 0
                                ? "FREE"
                                : money(deliveryCharge)}
                        </span>
                    </div>

                    <div className="checkout-total">
                        <strong>Total</strong>
                        <strong>{money(total)}</strong>
                    </div>

                    <p className="checkout-note">
                        Final prices, stock availability and coupon eligibility
                        must be verified by the MediKart server.
                    </p>
                </aside>
            </div>
        </main>
    );
}
