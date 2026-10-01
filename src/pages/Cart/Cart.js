import React, { useEffect, useState } from "react";
import styles from "./Cart.module.css";

import CartItem from "../../components/CartItem/CartItem";
import CartSummary from "../../components/CartSummary/CartSummary";
import EmptyState from "../../components/EmptyState/EmptyState";

import emptyCart from "../../assets/empty-cart.png";
const Cart = () => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    loadCart();

    // Update automatically when another page adds items
    window.addEventListener("cartUpdated", loadCart);

    return () => {
      window.removeEventListener("cartUpdated", loadCart);
    };
  }, []);

  const loadCart = () => {
    const items = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(items);
  };

  // Increase Quantity
  const handleIncrease = (id) => {
    const updatedCart = cartItems.map((item) =>
      item.id === id
        ? {
          ...item,
          quantity: (item.quantity || 1) + 1,
        }
        : item
    );

    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // Decrease Quantity
  const handleDecrease = (id) => {
    const updatedCart = cartItems.map((item) =>
      item.id === id
        ? {
          ...item,
          quantity: Math.max(1, (item.quantity || 1) - 1),
        }
        : item
    );

    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // Remove Product
  const handleRemove = (id) => {
    const updatedCart = cartItems.filter(
      (item) => item.id !== id
    );

    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // Totals
  const totalItems = cartItems.reduce(
    (sum, item) => sum + (Number(item.quantity) || 1),
    0
  );

  const subtotal = cartItems.reduce(
    (sum, item) =>
      sum + (Number(item.price ?? item.discountedPrice) || 0) * (Number(item.quantity) || 1),
    0
  );

  const discount = Math.round(subtotal * 0.1);

  // Delivery charge: ₹10 for low order (<499), FREE for >=499, +₹50 for Medical Devices & Premium Healthcare
  const isSpecialCategory = (category) => {
    if (!category) return false;
    const cat = String(category).toLowerCase().replace(/[-_]/g, " ");
    return (
      cat.includes("medical device") ||
      cat.includes("medicaldevices") ||
      cat.includes("device") ||
      cat.includes("premium healthcare") ||
      cat.includes("premiumhealthcare") ||
      cat.includes("premium")
    );
  };

  const hasSpecialItem = cartItems.some((item) => isSpecialCategory(item.category));

  const baseDelivery = subtotal >= 499 ? 0 : 10;
  const specialSurcharge = hasSpecialItem ? 50 : 0;
  const delivery = baseDelivery + specialSurcharge;

  const totalAmount =
    subtotal - discount + delivery;

  // Empty Cart
  if (cartItems.length === 0) {
    return (
      <>
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
    <>
      <div className={styles.cartPage}>
        <div className={styles.cartHeader}>
          <h1>🛒 My Cart</h1>

          <span className={styles.itemCount}> {totalItems} Items </span>
        </div>

        {/* Layout */}
        <div className={styles.cartContainer}>
          {/* Left */}
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

          {/* Right */}
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
    </>
  );
};

export default Cart;