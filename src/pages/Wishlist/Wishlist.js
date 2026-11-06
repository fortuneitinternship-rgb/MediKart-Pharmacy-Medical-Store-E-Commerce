import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import WishlistItem from "../../components/WishlistItem/WishlistItem";
import EmptyState from "../../components/EmptyState/EmptyState";
import emptyWishlist from "../../assets/empty-wishlist.png";
import styles from "./Wishlist.module.css";

import { getWishlist, removeWishlistItem, moveWishlistItemToCart, } from "../../api/wishlistApi";

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);

  // Load wishlist from FastAPI
  const fetchWishlist = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getWishlist();

      const items = Array.isArray(data)
        ? data
        : data.items || data.wishlist || [];

      setWishlistItems(items);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Unable to load wishlist. Please log in and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  // Remove an item using the API
  const handleRemove = async (id) => {
    setProcessingId(id);
    setError("");

    try {
      await removeWishlistItem(id);

      setWishlistItems((previousItems) =>
        previousItems.filter((item) => item.id !== id)
      );

      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Unable to remove this product from your wishlist."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // Move item to cart through the API
  const handleMoveToCart = async (id) => {
    setProcessingId(id);
    setError("");

    try {
      await moveWishlistItemToCart(id);

      // Remove from wishlist only after adding to cart succeeds
      await removeWishlistItem(id);

      setWishlistItems((previousItems) =>
        previousItems.filter((item) => item.id !== id)
      );

      window.dispatchEvent(new Event("cartUpdated"));
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Unable to move this product to your cart."
      );
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className={styles.wishlistPage}>
        <p>Loading your wishlist...</p>
      </div>
    );
  }

  if (wishlistItems.length === 0 && !error) {
    return (
      <EmptyState
        image={emptyWishlist}
        title="Your Wishlist is Empty"
        description="Save your favourite products here."
        buttonText="Continue Shopping"
        buttonLink="/shop"
      />
    );
  }

  return (
    <div className={styles.wishlistPage}>
      <h1 className={styles.title}>❤️ My Wishlist</h1>

      {error && (
        <div role="alert" className={styles.error}>
          {typeof error === "string"
            ? error
            : "Something went wrong. Please try again."}
          <button type="button" onClick={fetchWishlist}>
            Retry
          </button>
        </div>
      )}

      <div className={styles.grid}>
        {wishlistItems.map((item) => (
          <WishlistItem
            key={item.id}
            item={item}
            onMoveToCart={handleMoveToCart}
            onRemove={handleRemove}
            disabled={processingId === item.id}
          />
        ))}
      </div>

      <div className={styles.bottom}>
        <Link to="/shop" className={styles.continueBtn}>
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default Wishlist;
