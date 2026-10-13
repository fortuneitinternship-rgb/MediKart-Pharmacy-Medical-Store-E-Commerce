import React, { useCallback, useEffect, useState } from "react";
import styles from "./Cart.module.css";

import CartItem from "../../components/CartItem/CartItem";
import CartSummary from "../../components/CartSummary/CartSummary";
import EmptyState from "../../components/EmptyState/EmptyState";
import emptyCart from "../../assets/empty-cart.png";
import axios from "axios";

// Vite uses import.meta.env, not process.env.REACT_APP_API_URL.
const API_URL = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

const readLocalCart = () => {
  try {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    return Array.isArray(storedCart) ? storedCart : [];
  } catch {
    return [];
  }
};

const normalizeCartItem = (item = {}) => ({
  ...item,
  id: item.id ?? item.cart_item_id ?? item.product_id ?? item.productId ?? item.product?.id,
  product_id: item.product_id ?? item.productId ?? item.product?.id ?? item.id,
  name: item.name ?? item.product?.name ?? item.title ?? "Product",
  quantity: Math.max(1, Number(item.quantity) || 1),
  price: Number(item.price ?? item.unit_price ?? item.product?.price ?? 0),
  discountedPrice: Number(
    item.discountedPrice ??
    item.discount_price ??
    item.product?.discount_price ??
    item.price ??
    item.unit_price ??
    0
  ),
  image: item.image ?? item.image_url ?? item.product?.image ?? item.product?.image_url ?? "",
  category: item.category ?? item.product?.category ?? "",
});

const Cart = () => {
  const [cartItems, setCartItems] = useState(() => readLocalCart());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = useCallback(
    () =>
      localStorage.getItem("access_token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken"),
    []
  );

  const getHeaders = useCallback(() => {
    const token = getToken();
    return {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };
  }, [getToken]);

  const saveLocalCart = useCallback((items) => {
    localStorage.setItem("cart", JSON.stringify(items));
    setCartItems(items);
  }, []);

  const loadCart = useCallback(async () => {
    // Show cached items immediately; this also prevents a blank cart
    // when the user is not signed in or the API is temporarily unavailable.
    const cachedItems = readLocalCart();
    setCartItems(cachedItems);
    setLoading(true);
    setError("");

    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/api/cart`, getHeaders());
      const data = response.data;
      const apiItems = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.cart_items)
            ? data.cart_items
            : [];

      const normalizedApiItems = apiItems.map(normalizeCartItem);

      // If the API returns an empty cart but the browser has cached items,
      // keep the cached items visible instead of unexpectedly showing Empty Cart.
      const itemsToUse =
        normalizedApiItems.length > 0 ? normalizedApiItems : cachedItems;

      saveLocalCart(itemsToUse);
    } catch (err) {
      console.error("Failed to load cart from API:", err);

      // Continue displaying local cart data if the API request fails.
      setCartItems(cachedItems);
      if (cachedItems.length === 0) {
        setError(
          err.response?.data?.detail ||
          "Unable to load your cart. Please check that the backend is running."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [getHeaders, getToken, saveLocalCart]);

  useEffect(() => {
    loadCart();
    window.addEventListener("cartUpdated", loadCart);
    window.addEventListener("storage", loadCart);

    return () => {
      window.removeEventListener("cartUpdated", loadCart);
      window.removeEventListener("storage", loadCart);
    };
  }, [loadCart]);

  const updateQuantity = async (id, newQuantity) => {
    const item = cartItems.find((cartItem) => String(cartItem.id) === String(id));
    if (!item) return;

    const updatedItems = cartItems.map((cartItem) =>
      String(cartItem.id) === String(id)
        ? { ...cartItem, quantity: newQuantity }
        : cartItem
    );

    // Update the UI/local cache first so it still works without an API.
    saveLocalCart(updatedItems);

    if (!getToken()) {
      window.dispatchEvent(new Event("cartUpdated"));
      return;
    }

    try {
      await axios.put(
        `${API_URL}/api/cart/${id}`,
        { quantity: newQuantity },
        getHeaders()
      );
      await loadCart();
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Failed to update cart quantity:", err);
      alert(err.response?.data?.detail || "Unable to update quantity.");
    }
  };

  const handleIncrease = (id) => {
    const item = cartItems.find((cartItem) => String(cartItem.id) === String(id));
    if (item) updateQuantity(id, (Number(item.quantity) || 1) + 1);
  };

  const handleDecrease = (id) => {
    const item = cartItems.find((cartItem) => String(cartItem.id) === String(id));
    if (!item) return;
    const currentQuantity = Math.max(1, Number(item.quantity) || 1);
    if (currentQuantity > 1) updateQuantity(id, currentQuantity - 1);
  };

  const handleRemove = async (id) => {
    const previousItems = cartItems;

    // Remove immediately from the UI.
    const updatedItems = cartItems.filter(
      (item) => String(item.id) !== String(id)
    );

    saveLocalCart(updatedItems);

    // Guests use localStorage only.
    if (!getToken()) {
      window.dispatchEvent(new Event("cartUpdated"));
      return;
    }

    try {
      const response = await axios.delete(
        `${API_URL}/api/cart/${id}`,
        getHeaders()
      );

      console.log(
        response.data?.message || "Product removed successfully."
      );

      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error(
        "Failed to remove cart item:",
        err.response?.status,
        err.response?.data || err.message
      );

      // Restore the previous cart if the backend deletion failed.
      saveLocalCart(previousItems);

      if (err.response?.status === 404) {
        alert(
          err.response?.data?.detail ||
          "Cart item not found. Check the cart item ID and API route."
        );
      } else {
        alert(
          err.response?.data?.detail ||
          "Unable to remove the product. Please try again."
        );
      }
    }
  };

  const totalItems = cartItems.reduce(
    (sum, item) => sum + (Number(item.quantity) || 1),
    0
  );

  const subtotal = cartItems.reduce((sum, item) => {
    const price = Number(
      item.discountedPrice ?? item.discount_price ?? item.price ?? 0
    );
    return sum + price * (Number(item.quantity) || 1);
  }, 0);

  const discount = Math.round(subtotal * 0.1);

  const isSpecialCategory = (category) => {
    if (!category) return false;
    const normalized = String(category).toLowerCase().replace(/[-_]/g, " ");
    return (
      normalized.includes("medical device") ||
      normalized.includes("medicaldevices") ||
      normalized.includes("device") ||
      normalized.includes("premium healthcare") ||
      normalized.includes("premiumhealthcare") ||
      normalized.includes("premium")
    );
  };

  const hasSpecialItem = cartItems.some((item) =>
    isSpecialCategory(item.category)
  );
  const baseDelivery = subtotal >= 499 ? 0 : 10;
  const specialSurcharge = hasSpecialItem ? 50 : 0;
  const delivery = baseDelivery + specialSurcharge;
  const totalAmount = subtotal - discount + delivery;

  if (loading && cartItems.length === 0) {
    return (
      <div className={styles.cartPage}>
        <div className={styles.cartHeader}>
          <h1>🛒 My Cart</h1>
        </div>
        <div style={{ textAlign: "center", padding: "50px" }}>
          Loading cart...
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className={styles.cartPage}>
        {error && (
          <p role="alert" style={{ textAlign: "center", color: "#b42318" }}>
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
      </div>
    );
  }

  return (
    <div className={styles.cartPage}>
      <div className={styles.cartHeader}>
        <h1>🛒 My Cart</h1>
        <span className={styles.itemCount}>{totalItems} Items</span>
      </div>

      {error && (
        <p role="status" style={{ textAlign: "center", color: "#8a5a00" }}>
          {error} Showing saved cart items.
        </p>
      )}

      <div className={styles.cartContainer}>
        <div className={styles.leftSection}>
          {cartItems.map((item, index) => (
            <CartItem
              key={item.id ?? item.product_id ?? index}
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
