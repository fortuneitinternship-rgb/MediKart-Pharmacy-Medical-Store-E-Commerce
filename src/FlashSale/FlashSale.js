import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import styles from "./FlashSale.module.css";

import flashSaleProducts from "../data/flashSaleProducts";

const FlashSale = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: "24",
    minutes: "00",
    seconds: "00"
  });

  const [addedItems, setAddedItems] = useState({});

  // =========================================
  // FLASH SALE TIMER
  // =========================================

  useEffect(() => {
    const target = Date.now() + 24 * 60 * 60 * 1000;

    const timer = setInterval(() => {
      const difference = target - Date.now();

      if (difference <= 0) {
        clearInterval(timer);

        setTimeLeft({
          hours: "00",
          minutes: "00",
          seconds: "00"
        });

        return;
      }

      setTimeLeft({
        hours: String(
          Math.floor(difference / (1000 * 60 * 60))
        ).padStart(2, "0"),

        minutes: String(
          Math.floor((difference / (1000 * 60)) % 60)
        ).padStart(2, "0"),

        seconds: String(
          Math.floor((difference / 1000) % 60)
        ).padStart(2, "0")
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // =========================================
  // ADD TO CART
  // =========================================

  const handleAddToCart = (product) => {
    let cart =
      JSON.parse(localStorage.getItem("cart")) || [];

    const existingProduct = cart.find(
      (item) => Number(item.id) === Number(product.id)
    );

    if (existingProduct) {
      cart = cart.map((item) =>
        Number(item.id) === Number(product.id)
          ? {
            ...item,
            quantity: (item.quantity || 1) + 1
          }
          : item
      );
    } else {
      cart.push({
        id: product.id,

        name: product.name,

        title: product.title,

        brand: product.brand,

        category: product.category,

        image: product.image,

        price: product.price,

        originalPrice: product.originalPrice,

        discountedPrice: product.discountedPrice,

        rating: product.rating,

        quantity: 1
      });
    }

    localStorage.setItem(
      "cart",
      JSON.stringify(cart)
    );

    // Update Navbar Cart Count
    window.dispatchEvent(
      new Event("cartUpdated")
    );

    // Toast
    toast.success(
      `${product.name} added to cart!`,
      {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored"
      }
    );

    // Change button
    setAddedItems((prev) => ({
      ...prev,
      [product.id]: true
    }));

    // Reset button after 2 seconds
    setTimeout(() => {
      setAddedItems((prev) => ({
        ...prev,
        [product.id]: false
      }));
    }, 2000);
  };

  // =========================================
  // JSX
  // =========================================

  return (
    <section className={styles.flashSale}>

      {/* HEADER */}
      <div className={styles.header}>

        <div className={styles.titleSection}>
          <h2>🔥 Flash Sale</h2>
          <p>Limited Time Deals</p>
        </div>

        {/* TIMER */}
        <div className={styles.timer}>

          <div className={styles.timeBox}>
            <span>{timeLeft.hours}</span>
            <small>Hours</small>
          </div>

          <div className={styles.timeBox}>
            <span>{timeLeft.minutes}</span>
            <small>Minutes</small>
          </div>

          <div className={styles.timeBox}>
            <span>{timeLeft.seconds}</span>
            <small>Seconds</small>
          </div>

        </div>

      </div>

      {/* PRODUCTS */}
      <div className={styles.productGrid}>

        {flashSaleProducts.map((product) => (

          <div
            key={product.id}
            className={styles.productCard}
          >

            {/* IMAGE */}
            <div className={styles.imageWrapper}>

              <img
                src={product.image}
                alt={product.name}
                className={styles.productImage}
              />

            </div>

            {/* CONTENT */}
            <div className={styles.cardContent}>

              <h3>{product.name}</h3>

              <p className={styles.brand}>
                {product.brand}
              </p>

              {/* RATING */}
              <div className={styles.rating}>
                ⭐ {product.rating}
              </div>

              {/* PRICE */}
              <div className={styles.priceSection}>

                <span className={styles.originalPrice}>
                  ₹{product.originalPrice}
                </span>

                <span className={styles.discountedPrice}>
                  ₹{product.price}
                </span>

              </div>

              {/* BUTTONS */}
              <div className={styles.buttonGroup}>

                <Link
                  to={`/product/${product.id}`}
                  className={styles.viewBtn}
                >
                  View Details
                </Link>

                <button
                  type="button"
                  className={
                    addedItems[product.id]
                      ? styles.added
                      : styles.cartBtn
                  }
                  onClick={() =>
                    handleAddToCart(product)
                  }
                >
                  {addedItems[product.id]
                    ? "✓ Added"
                    : "Add to Cart"}
                </button>

              </div>

            </div>

          </div>

        ))}

      </div>

    </section>
  );
};

export default FlashSale;