import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaHeart } from "react-icons/fa";
import styles from "./ProductCard.module.css";
import { addProductToCart } from "../../api/cartApi";
import {
  getProductImage,
  handleProductImageError,
} from "../../utils/productImage";

const ProductCard = ({ product, showWishlist = true }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const salePrice = Number(product.discount_price ?? product.price ?? 0);
  const originalPrice = Number(product.originalPrice ?? product.price ?? 0);

  useEffect(() => {
    const wishlist =
      JSON.parse(localStorage.getItem("wishlist")) || [];

    setIsWishlisted(
      wishlist.some((item) => item.id === product.id)
    );
  }, [product.id]);

  // Add to Cart
  const handleAddToCart = async () => {
    try {
      await addProductToCart(product);
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      toast.error(error.message || "Unable to add this product to your cart.");
    }
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
        <img
          src={getProductImage(product.image, product.name, product.category)}
          alt={product.name}
          className={styles.image}
          onError={(event) =>
            handleProductImageError(event, product.name, product.category)
          }
        />
      </div>

      {/* Product Details */}
      <div className={styles.info}>
        <span className={styles.category}>
          {product.category}
        </span>

        {product.brand && (
          <span className={styles.brand}>{product.brand}</span>
        )}

        <h3 className={styles.name}>
          {product.name}
        </h3>

        {(product.pack_size || product.packSize) && (
          <p className={styles.packSize}>
            Pack: {product.pack_size || product.packSize}
          </p>
        )}

        <p className={styles.price}>
          ₹{salePrice.toLocaleString("en-IN")}
          {originalPrice > salePrice && (
            <del className={styles.originalPrice}>
              ₹{originalPrice.toLocaleString("en-IN")}
            </del>
          )}
        </p>

        <p className={styles.rating}>
          ⭐ {product.rating}
          {product.reviews > 0 && ` (${product.reviews} reviews)`}
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