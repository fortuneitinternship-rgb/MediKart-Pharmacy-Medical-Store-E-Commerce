import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  createCheckoutOrder,
  getCheckoutCart,
  saveCheckoutAddress,
} from "../../api/checkoutApi";
import { getApiErrorMessage } from "../../services/api";
import "./Checkout.css";

const EMPTY_ADDRESS = {
  name: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

const money = (value) => `₹${Number(value || 0).toFixed(2)}`;

function normalizeItem(item = {}) {
  const productId = Number(item.product_id ?? item.productId ?? item.id);
  const price = Number(
    item.discountedPrice ?? item.discounted_price ?? item.discount_price ?? item.price ?? item.sellingPrice ?? 0
  );
  return {
    ...item,
    id: item.id ?? productId,
    product_id: productId,
    name: item.name ?? item.title ?? "Healthcare Product",
    image: item.image ?? item.image_url ?? item.imageUrl ?? "",
    price: Number.isFinite(price) ? price : 0,
    quantity: Math.max(1, Number(item.quantity) || 1),
  };
}

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: routeProductId } = useParams();
  const buyNowItems = location.state?.buyNowItems;
  const selectedItems = location.state?.checkoutItems;
  const isBuyNow = Array.isArray(buyNowItems) && buyNowItems.length > 0;

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

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setLoadError("");
      try {
        let source;
        if (isBuyNow) source = buyNowItems;
        else if (Array.isArray(selectedItems) && selectedItems.length) source = selectedItems;
        else {
          const response = await getCheckoutCart();
          source = Array.isArray(response)
            ? response
            : response?.items ?? response?.cart_items ?? [];
        }
        if (active) setCartItems(source.map(normalizeItem));
      } catch (err) {
        if (active) setLoadError(getApiErrorMessage(err, "Unable to load your cart."));
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => { active = false; };
  }, [isBuyNow, buyNowItems, selectedItems]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("deliveryAddress") || "null");
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
        setDeliveryDistance(saved.deliveryDistance || "short");
      }
    } catch {
      localStorage.removeItem("deliveryAddress");
    }
  }, []);

  const visibleItems = useMemo(() => {
    if (!routeProductId) return cartItems;
    return cartItems.filter((item) => String(item.product_id) === String(routeProductId));
  }, [cartItems, routeProductId]);

  const subtotal = useMemo(
    () => Number(visibleItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)),
    [visibleItems]
  );
  // Keep these display rules aligned with backend/app/api/routers/checkout.py.
  const discount = Number((subtotal * 0.1).toFixed(2));
  const deliveryCharge = deliveryType === "express"
    ? 49
    : deliveryType === "today"
      ? 99
      : subtotal >= 499 ? 0 : 10;
  const total = Number((subtotal - discount + deliveryCharge).toFixed(2));

  function changeAddress(event) {
    const { name, value } = event.target;
    setAddress((current) => ({ ...current, [name]: value }));
    setAddressMode("form");
  }

  function validateAddress() {
    if (address.name.trim().length < 2 || address.name.trim().length > 100) return "Enter your full name (2–100 characters).";
    if (!/^\d{10}$/.test(address.phone.trim())) return "Enter a valid 10-digit phone number.";
    if (address.address.trim().length < 3 || address.address.trim().length > 255) return "Enter a delivery address (3–255 characters).";
    if (address.city.trim().length < 2 || address.city.trim().length > 100) return "Enter a valid city.";
    if (address.state.trim().length < 2 || address.state.trim().length > 100) return "Enter a valid state.";
    if (!/^\d{6}$/.test(address.pincode.trim())) return "Enter a valid 6-digit pincode.";
    return "";
  }

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
      localStorage.setItem("deliveryAddress", JSON.stringify(payload));
      setStep(3);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to save your delivery address. Please try again."));
    } finally {
      setSavingAddress(false);
    }
  }

  async function placeOrder() {
    if (!visibleItems.length) {
      setError("Your cart is empty.");
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
      remove_from_cart: !isBuyNow,
    };

    try {
      const response = await createCheckoutOrder(payload);
      const created = response?.order ?? response;
      const generatedId = created?.order_id ?? created?.orderId ?? created?.id;
      if (!generatedId) throw new Error("The server did not return an order ID.");

      const confirmedOrder = { ...created, order_id: String(generatedId) };
      setOrder(confirmedOrder);
      setCartItems([]);
      if (isBuyNow) localStorage.removeItem("buyNow");
      window.dispatchEvent(new Event("ordersUpdated"));
      window.dispatchEvent(new Event("cartUpdated"));
      setStep(4);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to place your order. Please try again."));
    } finally {
      setPlacingOrder(false);
    }
  }

  if (loading) return <main className="checkout-page"><p role="status">Loading checkout...</p></main>;
  if (loadError) {
    return (
      <main className="checkout-page">
        <section className="checkout-message" role="alert">
          <h2>Unable to load checkout</h2><p>{loadError}</p>
          <button type="button" onClick={() => window.location.reload()}>Retry</button>
        </section>
      </main>
    );
  }

  if (step === 4 && order) {
    return (
      <main className="checkout-page">
        <section className="checkout-success" aria-live="polite">
          <div className="checkout-success-icon" aria-hidden="true">✓</div>
          <h1>Order placed successfully!</h1>
          <p>Your order has been saved.</p>
          <p><strong>Order ID:</strong> {order.order_id}</p>
          <p><strong>Amount:</strong> {money(order.total_amount ?? total)}</p>
          <button type="button" onClick={() => navigate("/orders")}>View my orders</button>
          <button className="checkout-secondary" type="button" onClick={() => navigate("/shop")}>Continue shopping</button>
        </section>
      </main>
    );
  }

  if (!visibleItems.length) {
    return (
      <main className="checkout-page">
        <section className="checkout-message">
          <h1>Your cart is empty</h1>
          <p>Add products before proceeding to checkout.</p>
          <button type="button" onClick={() => navigate("/shop")}>Continue shopping</button>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <header className="checkout-header">
        <h1>Secure Checkout</h1>
        <p>Complete your order in a few simple steps.</p>
      </header>

      <nav className="checkout-steps" aria-label="Checkout progress">
        {["Review cart", "Delivery address", "Payment"].map((label, index) => (
          <div className={`checkout-step ${step >= index + 1 ? "active" : ""}`} key={label}>
            <span>{index + 1}</span>{label}
          </div>
        ))}
      </nav>

      <div className="checkout-layout">
        <section className="checkout-main">
          {step === 1 && (
            <section className="checkout-panel">
              <h2>Review your items</h2>
              <ul className="checkout-items">
                {visibleItems.map((item) => (
                  <li className="checkout-item" key={`${item.product_id}-${item.id}`}>
                    {item.image ? <img src={item.image} alt={item.name} /> : <div className="checkout-image-placeholder">M</div>}
                    <div className="checkout-item-info">
                      <h3>{item.name}</h3>
                      <p>Product ID: {item.product_id}</p>
                      <p>Quantity: {item.quantity}</p>
                    </div>
                    <strong>{money(item.price * item.quantity)}</strong>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => setStep(2)}>Continue to delivery</button>
            </section>
          )}

          {step === 2 && (
            <form className="checkout-panel" onSubmit={continueToPayment}>
              <h2>Delivery address</h2>
              <div className="checkout-form-grid">
                <label>Full name<input name="name" value={address.name} onChange={changeAddress} autoComplete="name" required /></label>
                <label>Phone number<input name="phone" value={address.phone} onChange={changeAddress} inputMode="numeric" maxLength={10} autoComplete="tel" required /></label>
                <label className="checkout-full">Address<textarea name="address" value={address.address} onChange={changeAddress} rows={3} autoComplete="street-address" required /></label>
                <label>City<input name="city" value={address.city} onChange={changeAddress} autoComplete="address-level2" required /></label>
                <label>State<input name="state" value={address.state} onChange={changeAddress} autoComplete="address-level1" required /></label>
                <label>Pincode<input name="pincode" value={address.pincode} onChange={changeAddress} inputMode="numeric" maxLength={6} autoComplete="postal-code" required /></label>
              </div>
              <label className="checkout-select-label">Delivery distance
                <select value={deliveryDistance} onChange={(event) => setDeliveryDistance(event.target.value)}>
                  <option value="short">Short</option><option value="medium">Medium</option><option value="long">Long</option>
                </select>
              </label>
              <input type="hidden" value={addressMode} readOnly />
              <div className="checkout-actions">
                <button className="checkout-secondary" type="button" onClick={() => setStep(1)}>Back</button>
                <button type="submit" disabled={savingAddress}>{savingAddress ? "Saving address..." : "Continue to payment"}</button>
              </div>
            </form>
          )}

          {step === 3 && (
            <section className="checkout-panel">
              <h2>Payment and delivery</h2>
              <fieldset className="checkout-fieldset">
                <legend>Payment method</legend>
                {[
                  ["COD", "Cash on delivery"],
                  ["CARD", "Card"],
                  ["NETBANKING", "Net banking"],
                ].map(([value, label]) => (
                  <label className="checkout-radio" key={value}>
                    <input type="radio" name="paymentMethod" value={value} checked={paymentMethod === value} onChange={(event) => setPaymentMethod(event.target.value)} />
                    {label}
                  </label>
                ))}
              </fieldset>
              <fieldset className="checkout-fieldset">
                <legend>Delivery option</legend>
                <label className="checkout-radio"><input type="radio" name="deliveryType" value="normal" checked={deliveryType === "normal"} onChange={(event) => setDeliveryType(event.target.value)} />Normal delivery</label>
                <label className="checkout-radio"><input type="radio" name="deliveryType" value="express" checked={deliveryType === "express"} onChange={(event) => setDeliveryType(event.target.value)} disabled={subtotal < 299} />Express delivery (+₹49, orders ₹299+)</label>
                <label className="checkout-radio"><input type="radio" name="deliveryType" value="today" checked={deliveryType === "today"} onChange={(event) => setDeliveryType(event.target.value)} disabled={subtotal < 999} />Today delivery (+₹99, orders ₹999+)</label>
              </fieldset>
              <div className="checkout-actions">
                <button className="checkout-secondary" type="button" onClick={() => setStep(2)}>Back</button>
                <button type="button" onClick={placeOrder} disabled={placingOrder}>{placingOrder ? "Placing order..." : "Place order"}</button>
              </div>
            </section>
          )}

          {error && <p className="checkout-error" role="alert">{error}</p>}
        </section>

        <aside className="checkout-summary">
          <h2>Order summary</h2>
          <div><span>Subtotal</span><span>{money(subtotal)}</span></div>
          <div><span>Discount (10%)</span><span>−{money(discount)}</span></div>
          <div><span>Delivery</span><span>{money(deliveryCharge)}</span></div>
          <div className="checkout-total"><strong>Total</strong><strong>{money(total)}</strong></div>
          <p className="checkout-note">Final prices and eligibility are verified by the MediKart server.</p>
        </aside>
      </div>
    </main>
  );
}
