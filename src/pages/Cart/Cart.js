import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Cart.module.css";

import CartItem from "../../components/CartItem/CartItem";
import CartSummary from "../../components/CartSummary/CartSummary";
import EmptyState from "../../components/EmptyState/EmptyState";
import emptyCart from "../../assets/empty-cart.png";
import { getCart, updateCartItem, removeCartItem, normalizeCartItem, getCartErrorMessage, getAccessToken, } from "../../api/cartApi";

const Cart = () => {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);

  const isLoggedIn = Boolean(getAccessToken());

  const loadCart = useCallback(async () => {
    setError("");

    if (!getAccessToken()) {
      try {
        const saved = JSON.parse(localStorage.getItem("cart") || "[]");
        setCartItems(
          Array.isArray(saved) ? saved.map(normalizeCartItem) : []
        );
      } catch {
        setCartItems([]);
      }

      setLoading(false);
      return;
    }

    try {
      const serverItems = await getCart();
      setCartItems(serverItems);
    } catch (err) {
      setError(getCartErrorMessage(err));

      if (err?.response?.status === 401) {
        setModal({
          type: "login",
          message: "Your login session has expired. Please log in again.",
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();

    const refreshCart = () => loadCart();
    window.addEventListener("cartUpdated", refreshCart);

    return () => {
      window.removeEventListener("cartUpdated", refreshCart);
    };
  }, [loadCart]);

  const saveGuestCart = (items) => {
    localStorage.setItem("cart", JSON.stringify(items));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const findItem = (id) =>
    cartItems.find((item) => String(item.id) === String(id));

  const handleQuantityChange = async (id, change) => {
    if (busy) return;

    const item = findItem(id);
    if (!item) return;

    const newQuantity = Number(item.quantity || 1) + change;
    if (newQuantity < 1) return;

    const previousItems = [...cartItems];
    const updatedItems = cartItems.map((current) =>
      String(current.id) === String(id)
        ? { ...current, quantity: newQuantity }
        : current
    );

    // Update the screen immediately.
    setCartItems(updatedItems);
    setError("");

    // Guest cart: update localStorage only.
    if (!getAccessToken()) {
      saveGuestCart(updatedItems);
      return;
    }

    // Do not send a product ID as a cart-row ID.
    if (!item._serverItem) {
      setCartItems(previousItems);
      setError("This item is not linked to your server cart. Please refresh.");
      return;
    }

    setBusy(true);

    try {
      await updateCartItem(item.id, newQuantity);
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      setCartItems(previousItems);
      setError(getCartErrorMessage(err));

      if (err?.response?.status === 401) {
        setModal({
          type: "login",
          message: "Please log in again to update your cart.",
        });
      }
    } finally {
      setBusy(false);
    }
  };

  const handleIncrease = (id) => handleQuantityChange(id, 1);
  const handleDecrease = (id) => handleQuantityChange(id, -1);

  const handleRemove = (id) => {
    const item = findItem(id);
    if (!item) return;

    setModal({
      type: "confirm",
      item,
      message: `Are you sure you want to remove "${item.name}" from your cart?`,
    });
  };

  const confirmRemove = async () => {
    if (busy || !modal?.item) return;

    const item = modal.item;
    const previousItems = [...cartItems];

    setError("");

    // Guest cart: remove locally.
    if (!getAccessToken()) {
      const updatedItems = cartItems.filter(
        (current) => String(current.id) !== String(item.id)
      );

      setCartItems(updatedItems);
      saveGuestCart(updatedItems);
      setModal({
        type: "success",
        message: `"${item.name}" was removed from your cart.`,
      });
      return;
    }

    if (!item._serverItem) {
      setModal({
        type: "error",
        message: "This item is not linked to your server cart. Please refresh.",
      });
      return;
    }

    setBusy(true);

    try {
      await removeCartItem(item.id);

      const updatedItems = previousItems.filter(
        (current) => String(current.id) !== String(item.id)
      );

      setCartItems(updatedItems);
      setModal({
        type: "success",
        message: `"${item.name}" was successfully removed from your cart.`,
      });
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      setCartItems(previousItems);
      const message = getCartErrorMessage(err);
      setModal({
        type: err?.response?.status === 401 ? "login" : "error",
        message,
      });
    } finally {
      setBusy(false);
    }
  };

  const handleCheckout = () => {
    if (!getAccessToken()) {
      setModal({
        type: "login",
        message: "Please log in before proceeding to checkout.",
      });
      return;
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty. Add a product before checkout.");
      return;
    }

    navigate("/checkout");
  };

  const totals = useMemo(() => {
    const totalItems = cartItems.reduce(
      (sum, item) => sum + (Number(item.quantity) || 1),
      0
    );

    const subtotal = cartItems.reduce((sum, item) => {
      const price = Number(item.price ?? item.discountedPrice) || 0;
      return sum + price * (Number(item.quantity) || 1);
    }, 0);

    const discount = Math.round(subtotal * 0.1);

    const isSpecialCategory = (category) => {
      const value = String(category || "")
        .toLowerCase()
        .replace(/[-_]/g, " ");

      return (
        value.includes("device") ||
        value.includes("premium healthcare") ||
        value.includes("premium")
      );
    };

    const hasSpecialItem = cartItems.some((item) =>
      isSpecialCategory(item.category)
    );

    const baseDelivery = subtotal >= 499 ? 0 : subtotal > 0 ? 10 : 0;
    const specialSurcharge = hasSpecialItem ? 50 : 0;
    const delivery = baseDelivery + specialSurcharge;
    const totalAmount = subtotal - discount + delivery;

    return {
      totalItems,
      subtotal,
      discount,
      delivery,
      totalAmount,
    };
  }, [cartItems]);

  if (loading) {
    return <div className={styles.cartPage}>Loading your cart...</div>;
  }

  if (cartItems.length === 0) {
    return (
      <>
        {error && (
          <p role="alert" className={styles.cartError}>
            {error}
          </p>
        )}

        <EmptyState
          image={emptyCart}
          title="Your Cart is Empty"
          description="Looks like you haven't added any products yet."
          buttonText="Continue Shopping"
          buttonLink="/shop"
        />

        {modal && (
          <CartPopup
            modal={modal}
            busy={busy}
            onClose={() => setModal(null)}
            onConfirm={confirmRemove}
            onLogin={() => navigate("/login", { state: { from: "/checkout" } })}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className={styles.cartPage}>
        <div className={styles.cartHeader}>
          <h1>🛒 My Cart</h1>
          <span className={styles.itemCount}>
            {totals.totalItems} Items
          </span>
        </div>

        {error && (
          <div role="alert" className={styles.cartError}>
            {error}
            <button type="button" onClick={loadCart}>
              Retry
            </button>
          </div>
        )}

        <div className={styles.cartContainer}>
          <div className={styles.leftSection}>
            {cartItems.map((item) => (
              <CartItem
                key={item.id ?? item.product_id}
                item={item}
                onIncrease={handleIncrease}
                onDecrease={handleDecrease}
                onRemove={handleRemove}
                disabled={busy}
              />
            ))}
          </div>

          <div className={styles.rightSection}>
            <CartSummary
              cartItems={cartItems}
              totalItems={totals.totalItems}
              subtotal={totals.subtotal}
              discount={totals.discount}
              delivery={totals.delivery}
              totalPrice={totals.totalAmount}
              onCheckout={handleCheckout}
              isLoggedIn={isLoggedIn}
            />
          </div>
        </div>
      </div>

      {modal && (
        <CartPopup
          modal={modal}
          busy={busy}
          onClose={() => setModal(null)}
          onConfirm={confirmRemove}
          onLogin={() => {
            setModal(null);
            navigate("/login", { state: { from: "/checkout" } });
          }}
        />
      )}
    </>
  );
};

function CartPopup({ modal, busy, onClose, onConfirm, onLogin }) {
  return (
    <div className={styles.cartModalOverlay} onClick={onClose}>
      <div
        className={styles.cartModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-popup-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="cart-popup-title">
          {modal.type === "confirm"
            ? "Remove Product?"
            : modal.type === "success"
            ? "Success"
            : modal.type === "login"
            ? "Login Required"
            : "Unable to Complete"}
        </h2>

        <p>{modal.message}</p>

        <div className={styles.cartModalActions}>
          {modal.type === "confirm" && (
            <>
              <button type="button" onClick={onClose} disabled={busy}>
                Cancel
              </button>
              <button
                type="button"
                className={styles.cartModalDanger}
                onClick={onConfirm}
                disabled={busy}
              >
                {busy ? "Removing..." : "Yes, Remove"}
              </button>
            </>
          )}

          {modal.type === "login" && (
            <>
              <button type="button" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className={styles.cartModalPrimary}
                onClick={onLogin}
              >
                Go to Login
              </button>
            </>
          )}

          {(modal.type === "success" || modal.type === "error") && (
            <button
              type="button"
              className={styles.cartModalPrimary}
              onClick={onClose}
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Cart;
