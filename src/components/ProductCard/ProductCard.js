import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaHeart } from "react-icons/fa";
import styles from "./ProductCard.module.css";

const ProductCard = ({ product, showWishlist = true }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const wishlist =
      JSON.parse(localStorage.getItem("wishlist")) || [];

    setIsWishlisted(
      wishlist.some((item) => item.id === product.id)
    );
  }, [product.id]);

  // Add to Cart
  const handleAddToCart = () => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const existingProduct = cart.find(
      (item) => item.id === product.id
    );

    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.push({
        ...product,
        quantity: 1,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    window.dispatchEvent(new Event("cartUpdated"));

    toast.success(`${product.name} added to cart!`);
  };

  // Wishlist
  const handleWishlist = () => {
    let wishlist =
      JSON.parse(localStorage.getItem("wishlist")) || [];

    const exists = wishlist.find(
      (item) => item.id === product.id
    );

    if (exists) {
      wishlist = wishlist.filter(
        (item) => item.id !== product.id
      );
      setIsWishlisted(false);
    } else {
      wishlist.push(product);
      setIsWishlisted(true);
    }

    localStorage.setItem(
      "wishlist",
      JSON.stringify(wishlist)
    );

    window.dispatchEvent(
      new Event("wishlistUpdated")
    );
  };

  return (
    <div className={styles.card}>
      {/* Wishlist */}
      {showWishlist && (
        <button
          className={`${styles.wishlist} ${isWishlisted ? styles.active : ""}`}
          onClick={handleWishlist}
          aria-pressed={isWishlisted}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <FaHeart />
        </button>
      )}

      {/* Product Image */}
      <div className={styles.imageContainer}>
        {(() => {
          let imgSrc = product.image;

          if (typeof imgSrc === "string" && imgSrc.startsWith("/images/")) {
            try {
              imgSrc = require("../../assets/images/" + imgSrc.split("/").pop());
            } catch (err) {
              imgSrc = null;
            }
          }

          const fallback = require("../../assets/images/Mediction.png");

          return (
            <img
              src={imgSrc || fallback}
              alt={product.name}
              className={styles.image}
              onError={(e) => {
                e.target.src = fallback;
              }}
            />
          );
        })()}
      </div>

      {/* Product Details */}
      <div className={styles.info}>
        <span className={styles.category}>
          {product.category}
        </span>

        <h3 className={styles.name}>
          {product.name}
        </h3>

        <p className={styles.price}>
          ₹{product.price}
        </p>

        <p className={styles.rating}>
          ⭐ {product.rating}
        </p>

        <div className={styles.buttons}>
          <Link
            to={`/product/${product.id}`}
            className={styles.details}
          >
            View Details
          </Link>

          <button
            className={styles.cart}
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;