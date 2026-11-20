
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
    seconds: "00",
  });

  const [addedItems, setAddedItems] = useState({});
  const [loadingItems, setLoadingItems] = useState({});
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // FLASH SALE TIMER
  useEffect(() => {
    const target = Date.now() + 24 * 60 * 60 * 1000;

    const updateTimer = () => {
      const difference = Math.max(0, target - Date.now());

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor(
        (difference / (1000 * 60)) % 60
      );
      const seconds = Math.floor(
        (difference / 1000) % 60
      );

      setTimeLeft({
        hours: String(hours).padStart(2, "0"),
        minutes: String(minutes).padStart(2, "0"),
        seconds: String(seconds).padStart(2, "0"),
      });

      return difference > 0;
    };

    updateTimer();

    const timer = setInterval(() => {
      if (!updateTimer()) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // FETCH FLASH SALE PRODUCTS
  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getFlashSaleProducts();

        if (isMounted) {
          setFlashSaleProducts(
            Array.isArray(response) ? response : []
          );
        }
      } catch (loadError) {
        console.error(
          "Unable to load flash-sale products:",
          loadError
        );

        if (isMounted) {
          setError("Flash-sale products could not be loaded.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  // ADD PRODUCT TO CART
  const handleAddToCart = async (product) => {
    if (!product?.id || loadingItems[product.id]) {
      return;
    }

    const productId = product.id;

    setLoadingItems((prev) => ({
      ...prev,
      [productId]: true,
    }));

    try {
      await addProductToCart(product);

      toast.success("Product added to cart!", {
        position: "top-right",
        autoClose: 2000,
        theme: "colored",
      });

      setAddedItems((prev) => ({
        ...prev,
        [productId]: true,
      }));

      setTimeout(() => {
        setAddedItems((prev) => ({
          ...prev,
          [productId]: false,
        }));
      }, 2000);
    } catch (cartError) {
      toast.error(
        cartError?.message ||
        "Unable to add this product to your cart."
      );
    } finally {
      setLoadingItems((prev) => ({
        ...prev,
        [productId]: false,
      }));
    }
  };

  // LOADING STATE
  if (loading) {
    return (
      <section className={styles.flashSale}>
        <p role="status">Loading flash-sale products...</p>
      </section>
    );
  }

  // ERROR STATE
  if (error) {
    return (
      <section className={styles.flashSale}>
        <p role="alert">{error}</p>
      </section>
    );
  }

  // EMPTY STATE
  if (flashSaleProducts.length === 0) {
    return (
      <section className={styles.flashSale}>
        <h2>🔥 Flash Sale</h2>
        <p>No flash-sale products available.</p>
      </section>
    );
  }

  // MAIN JSX
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
                src={getProductImage(
                  product.image,
                  product.name,
                  product.category
                )}
                alt={product.name || "Product"}
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

              {product.brand && (
                <p className={styles.brand}>
                  {product.brand}
                </p>
              )}

              {/* RATING */}
              {product.rating != null && (
                <div className={styles.rating}>
                  ⭐ {product.rating}
                </div>
              )}

              {/* PRICE */}
              <div className={styles.priceSection}>
                <span className={styles.originalPrice}>
                  ₹{product.price ?? 0}
                </span>

                <span className={styles.discountedPrice}>
                  ₹{product.discount_price ?? product.price ?? 0}
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
                  onClick={() => handleAddToCart(product)}
                  disabled={loadingItems[product.id]}
                >
                  {loadingItems[product.id]
                    ? "Adding..."
                    : addedItems[product.id]
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
