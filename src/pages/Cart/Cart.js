import React, { useEffect, useState } from "react";
import styles from "./Cart.module.css";

import CartItem from "../../components/CartItem/CartItem";
import CartSummary from "../../components/CartSummary/CartSummary";
import EmptyState from "../../components/EmptyState/EmptyState";

import emptyCart from "../../assets/empty-cart.png";

import axios from "axios";


/* ============================================================
   API CONFIGURATION
============================================================ */

const API_URL =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";


/* ============================================================
   CART COMPONENT
============================================================ */

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  /* ==========================================================
     GET AUTH TOKEN
  ========================================================== */

  const getToken = () => {
    return (
      localStorage.getItem("access_token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken")
    );
  };


  /* ==========================================================
     AXIOS CONFIG
  ========================================================== */

  const getHeaders = () => {
    const token = getToken();

    return {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        : {
            "Content-Type": "application/json",
          },
    };
  };


  /* ==========================================================
     LOAD CART FROM FASTAPI
  ========================================================== */

  useEffect(() => {
    loadCart();

    window.addEventListener("cartUpdated", loadCart);

    return () => {
      window.removeEventListener("cartUpdated", loadCart);
    };
  },);


  const loadCart = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${API_URL}/api/cart`,
        getHeaders()
      );

      /*
       * Expected FastAPI response:
       *
       * {
       *   "items": [
       *     {
       *       "id": 1,
       *       "product_id": 10,
       *       "name": "Paracetamol",
       *       "quantity": 2,
       *       "price": 100,
       *       "discount_price": 90,
       *       "image": "...",
       *       "category": "Medicine"
       *     }
       *   ],
       *   "total_items": 2,
       *   "subtotal": 180
       * }
       */

      const data = response.data;

      const apiItems = Array.isArray(data)
        ? data
        : data.items || [];

      /*
       * Normalize API response so your existing
       * CartItem component can continue using:
       *
       * item.id
       * item.quantity
       * item.price
       * item.discountedPrice
       * item.category
       */

      const formattedItems = apiItems.map((item) => ({
        ...item,

        // Cart item ID from backend
        id: item.id,

        // Product ID
        product_id:
          item.product_id ||
          item.productId ||
          item.product?.id,

        // Product name
        name:
          item.name ||
          item.product?.name ||
          "Product",

        // Quantity
        quantity: Number(item.quantity) || 1,

        // Price
        price:
          Number(
            item.price ??
            item.product?.price ??
            item.unit_price ??
            0
          ),

        // Discounted price
        discountedPrice:
          Number(
            item.discountedPrice ??
            item.discount_price ??
            item.product?.discount_price ??
            item.price ??
            0
          ),

        // Product image
        image:
          item.image ||
          item.product?.image ||
          item.product?.image_url ||
          "",

        // Category
        category:
          item.category ||
          item.product?.category ||
          "",
      }));

      setCartItems(formattedItems);

      /*
       * Keep localStorage only as a small cache/fallback.
       * The actual cart is now controlled by FastAPI.
       */
      localStorage.setItem(
        "cart",
        JSON.stringify(formattedItems)
      );

    } catch (err) {
      console.error("Failed to load cart:", err);

      if (err.response?.status === 401) {
        setError("Please login to view your cart.");
      } else {
        setError(
          err.response?.data?.detail ||
          "Unable to load your cart."
        );
      }

      setCartItems([]);

    } finally {
      setLoading(false);
    }
  };


  /* ==========================================================
     INCREASE QUANTITY
  ========================================================== */

  const handleIncrease = async (id) => {
    try {
      const item = cartItems.find(
        (cartItem) => cartItem.id === id
      );

      if (!item) return;

      const newQuantity =
        (Number(item.quantity) || 1) + 1;

      await axios.put(
        `${API_URL}/api/cart/${id}`,
        {
          quantity: newQuantity,
        },
        getHeaders()
      );

      await loadCart();

      window.dispatchEvent(
        new Event("cartUpdated")
      );

    } catch (err) {
      console.error(
        "Failed to increase cart quantity:",
        err
      );

      alert(
        err.response?.data?.detail ||
        "Unable to increase quantity."
      );
    }
  };


  /* ==========================================================
     DECREASE QUANTITY
  ========================================================== */

  const handleDecrease = async (id) => {
    try {
      const item = cartItems.find(
        (cartItem) => cartItem.id === id
      );

      if (!item) return;

      const currentQuantity =
        Number(item.quantity) || 1;

      /*
       * Don't allow quantity below 1
       */
      const newQuantity =
        Math.max(1, currentQuantity - 1);

      /*
       * Nothing to update
       */
      if (newQuantity === currentQuantity) {
        return;
      }

      await axios.put(
        `${API_URL}/api/cart/${id}`,
        {
          quantity: newQuantity,
        },
        getHeaders()
      );

      await loadCart();

      window.dispatchEvent(
        new Event("cartUpdated")
      );

    } catch (err) {
      console.error(
        "Failed to decrease cart quantity:",
        err
      );

      alert(
        err.response?.data?.detail ||
        "Unable to decrease quantity."
      );
    }
  };


  /* ==========================================================
     REMOVE PRODUCT
  ========================================================== */

  const handleRemove = async (id) => {
    try {
      await axios.delete(
        `${API_URL}/api/cart/${id}`,
        getHeaders()
      );

      await loadCart();

      window.dispatchEvent(
        new Event("cartUpdated")
      );

    } catch (err) {
      console.error(
        "Failed to remove cart item:",
        err
      );

      alert(
        err.response?.data?.detail ||
        "Unable to remove product from cart."
      );
    }
  };


  /* ==========================================================
     TOTAL ITEMS
  ========================================================== */

  const totalItems = cartItems.reduce(
    (sum, item) =>
      sum + (Number(item.quantity) || 1),
    0
  );


  /* ==========================================================
     SUBTOTAL
  ========================================================== */

  const subtotal = cartItems.reduce(
    (sum, item) => {
      const price =
        Number(
          item.discountedPrice ??
          item.discount_price ??
          item.price ??
          0
        );

      const quantity =
        Number(item.quantity) || 1;

      return sum + price * quantity;
    },
    0
  );


  /* ==========================================================
     DISCOUNT
  ========================================================== */

  const discount = Math.round(
    subtotal * 0.1
  );


  /* ==========================================================
     SPECIAL CATEGORY
  ========================================================== */

  const isSpecialCategory = (category) => {
    if (!category) return false;

    const cat = String(category)
      .toLowerCase()
      .replace(/[-_]/g, " ");

    return (
      cat.includes("medical device") ||
      cat.includes("medicaldevices") ||
      cat.includes("device") ||
      cat.includes("premium healthcare") ||
      cat.includes("premiumhealthcare") ||
      cat.includes("premium")
    );
  };


  const hasSpecialItem = cartItems.some(
    (item) =>
      isSpecialCategory(item.category)
  );


  /* ==========================================================
     DELIVERY
  ========================================================== */

  const baseDelivery =
    subtotal >= 499 ? 0 : 10;

  const specialSurcharge =
    hasSpecialItem ? 50 : 0;

  const delivery =
    baseDelivery + specialSurcharge;


  /* ==========================================================
     TOTAL
  ========================================================== */

  const totalAmount =
    subtotal -
    discount +
    delivery;


  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <div className={styles.cartPage}>
        <div className={styles.cartHeader}>
          <h1>🛒 My Cart</h1>
        </div>

        <div
          style={{
            textAlign: "center",
            padding: "50px",
          }}
        >
          Loading cart...
        </div>
      </div>
    );
  }


  /* ==========================================================
     ERROR
  ========================================================== */

  if (error) {
    return (
      <div className={styles.cartPage}>
        <div className={styles.cartHeader}>
          <h1>🛒 My Cart</h1>
        </div>

        <div
          style={{
            textAlign: "center",
            padding: "50px",
          }}
        >
          <p>{error}</p>

          <button
            onClick={loadCart}
            style={{
              padding: "10px 20px",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }


  /* ==========================================================
     EMPTY CART
  ========================================================== */

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


  /* ==========================================================
     UI
  ========================================================== */

  return (
    <>
      <div className={styles.cartPage}>

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className={styles.cartHeader}>

          <h1>🛒 My Cart</h1>

          <span className={styles.itemCount}>
            {totalItems} Items
          </span>

        </div>


        {/* ====================================================
            CART LAYOUT
        ==================================================== */}

        <div className={styles.cartContainer}>

          {/* ==================================================
              LEFT SECTION
          ================================================== */}

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


          {/* ==================================================
              RIGHT SECTION
          ================================================== */}

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
