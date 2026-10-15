
import React, { useEffect, useState, useCallback } from "react";
import styles from "./Cart.module.css";

import CartItem from "../../components/CartItem/CartItem";
import CartSummary from "../../components/CartSummary/CartSummary";
import EmptyState from "../../components/EmptyState/EmptyState";
import emptyCart from "../../assets/empty-cart.png";

import {
  getCart,
  updateCartItem,
  removeCartItem,
} from "../../api/cartApi";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const saveLocalCart = (items) => {
    localStorage.setItem("cart", JSON.stringify(items));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const normalizeCart = (response) => {
    const items = Array.isArray(response)
      ? response
      : response?.items || response?.cart_items || [];

    return items.map((item) => ({
      ...item,
      // Preserve the existing CartItem component's expected fields.
      id: item.id ?? item.product_id,
      quantity: Number(item.quantity) || 1,
      price: Number(item.price ?? item.discountedPrice) || 0,
    }));
  };

  const loadCart = useCallback(async () => {
    try {
      const response = await getCart();
      const items = normalizeCart(response);

      setCartItems(items);
      localStorage.setItem("cart", JSON.stringify(items));
      setError("");
    } catch (err) {
      // Allow the existing local cart to work if the API is unavailable.
      const localItems = JSON.parse(
        localStorage.getItem("cart") || "[]"
      );

      setCartItems(localItems);
      console.error("Failed to load cart:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();

    const handleCartUpdated = () => loadCart();

    window.addEventListener("cartUpdated", handleCartUpdated);

    return () => {
      window.removeEventListener(
        "cartUpdated",
        handleCartUpdated
      );
    };
  }, [loadCart]);

  const handleIncrease = async (id) => {
    const item = cartItems.find((product) => product.id === id);
    if (!item) return;

    const quantity = (Number(item.quantity) || 1) + 1;

    // Update the UI immediately.
    const updatedCart = cartItems.map((product) =>
      product.id === id ? { ...product, quantity } : product
    );

    setCartItems(updatedCart);
    saveLocalCart(updatedCart);

    try {
      await updateCartItem(item.cart_item_id ?? item.id, quantity);
      await loadCart();
    } catch (err) {
      console.error("Failed to update cart quantity:", err);
      setError("Quantity was updated locally, but server sync failed.");
    }
  };

  const handleDecrease = async (id) => {
    const item = cartItems.find((product) => product.id === id);
    if (!item) return;

    const quantity = Math.max(
      1,
      (Number(item.quantity) || 1) - 1
    );

    if (quantity === Number(item.quantity)) return;

    const updatedCart = cartItems.map((product) =>
      product.id === id ? { ...product, quantity } : product
    );

    setCartItems(updatedCart);
    saveLocalCart(updatedCart);

    try {
      await updateCartItem(item.cart_item_id ?? item.id, quantity);
      await loadCart();
    } catch (err) {
      console.error("Failed to update cart quantity:", err);
      setError("Quantity was updated locally, but server sync failed.");
    }
  };

  const handleRemove = async (id) => {
    const item = cartItems.find((product) => product.id === id);
    if (!item) return;

    const updatedCart = cartItems.filter(
      (product) => product.id !== id
    );

    setCartItems(updatedCart);
    saveLocalCart(updatedCart);

    try {
      await removeCartItem(item.cart_item_id ?? item.id);
      await loadCart();
      setError("");
    } catch (err) {
      console.error("Failed to remove cart item:", err);
      setError("Item was removed locally, but server deletion failed.");
    }
  };

  const totalItems = cartItems.reduce(
    (sum, item) => sum + (Number(item.quantity) || 1),
    0
  );

  const subtotal = cartItems.reduce(
    (sum, item) =>
      sum +
      (Number(item.price ?? item.discountedPrice) || 0) *
        (Number(item.quantity) || 1),
    0
  );

  const discount = Math.round(subtotal * 0.1);

  const isSpecialCategory = (category) => {
    if (!category) return false;

    const cat = String(category)
      .toLowerCase()
      .replace(/[-_]/g, " ");

    return (
      cat.includes("medical device") ||
      cat.includes("device") ||
      cat.includes("premium healthcare") ||
      cat.includes("premium")
    );
  };

  const hasSpecialItem = cartItems.some((item) =>
    isSpecialCategory(item.category)
  );

  const baseDelivery = subtotal >= 499 ? 0 : 10;
  const specialSurcharge = hasSpecialItem ? 50 : 0;
  const delivery = baseDelivery + specialSurcharge;
  const totalAmount = subtotal - discount + delivery;

  if (loading) {
    return <div className={styles.cartPage}>Loading cart...</div>;
  }

  if (cartItems.length === 0) {
    return (
      <>
        {error && <p role="alert">{error}</p>}
        <EmptyState
          image={emptyCart}
          title="Your Cart is Empty"
          description="Looks like you haven't added any products yet."
          buttonText="Continue Shopping"
          buttonLink="/shop"
        />
      </>
    );
  }

  return (
    <div className={styles.cartPage}>
      <div className={styles.cartHeader}>
        <h1>🛒 My Cart</h1>
        <span className={styles.itemCount}>
          {totalItems} Items
        </span>
      </div>

      {error && (
        <p role="alert" className={styles.cartError}>
          {error}
        </p>
      )}

      <div className={styles.cartContainer}>
        <div className={styles.leftSection}>
          {cartItems.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onIncrease={handleIncrease}
              onDecrease={handleDecrease}
              onRemove={handleRemove}
            />
          ))}
        </div>

        <div className={styles.rightSection}>
          <CartSummary
            cartItems={cartItems}
            totalItems={totalItems}
            subtotal={subtotal}
            discount={discount}
            delivery={delivery}
            totalPrice={totalAmount}
          />
        </div>
      </div>
    </div>
  );
};

export default Cart;
