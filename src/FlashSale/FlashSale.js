import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import styles from "./FlashSale.module.css";

import { addProductToCart } from "../api/cartApi";
import { getFlashSaleProducts } from "../api/productApi";
import {
  getProductImage,
  handleProductImageError,
} from "../utils/productImage";

const FlashSale = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: "24",
    minutes: "00",
    seconds: "00"
  });

  const [addedItems, setAddedItems] = useState({});
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [error, setError] = useState("");

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

  useEffect(() => {
    getFlashSaleProducts()
      .then(setFlashSaleProducts)
      .catch((loadError) => {
        console.error("Unable to load flash-sale products:", loadError);
        setError("Flash-sale products could not be loaded.");
      });
  }, []);

  // =========================================
  // ADD TO CART
  // =========================================

  const handleAddToCart = async (product) => {
    try {
      await addProductToCart(product);
      toast.success(`${product.name} added to cart!`, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored"
      });

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
    } catch (error) {
      toast.error(error.message || "Unable to add this product to your cart.");
    }
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

        {error && <p role="alert">{error}</p>}

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
                src={getProductImage(
                  product.image,
                  product.name,
                  product.category
                )}
                alt={product.name}
                className={styles.productImage}
                onError={(event) =>
                  handleProductImageError(
                    event,
                    product.name,
                    product.category
                  )
                }
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
                  ₹{product.price}
                </span>

                <span className={styles.discountedPrice}>
                  ₹{product.discount_price ?? product.price}
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