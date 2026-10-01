import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import WishlistItem from "../../components/WishlistItem/WishlistItem";
import EmptyState from "../../components/EmptyState/EmptyState";

import emptyWishlist from "../../assets/empty-wishlist.png";

import styles from "./Wishlist.module.css";

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    const items =
      JSON.parse(localStorage.getItem("wishlist")) || [];

    setWishlistItems(items);
  }, []);

  // Remove Wishlist Item
  const handleRemove = (id) => {
    const updatedWishlist = wishlistItems.filter(
      (item) => item.id !== id
    );

    setWishlistItems(updatedWishlist);

    localStorage.setItem(
      "wishlist",
      JSON.stringify(updatedWishlist)
    );

    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  // Move to Cart
  const handleMoveToCart = (id) => {
    const product = wishlistItems.find(
      (item) => item.id === id
    );

    if (!product) return;

    const cart =
      JSON.parse(localStorage.getItem("cart")) || [];

    const existing = cart.find(
      (item) => item.id === product.id
    );

    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      cart.push({
        ...product,
        quantity: 1,
      });
    }

    localStorage.setItem(
      "cart",
      JSON.stringify(cart)
    );

    window.dispatchEvent(new Event("cartUpdated"));

    handleRemove(id);
  };

  if (wishlistItems.length === 0) {
    return (
      <>
        <EmptyState
          image={emptyWishlist}
          title="Your Wishlist is Empty"
          description="Save your favourite products here."
          buttonText="Continue Shopping"
          buttonLink="/shop"
        />
      </>
    );
  }

  return (
    <>
      <div className={styles.wishlistPage}>
        <h1 className={styles.title}>
          ❤️ My Wishlist
        </h1>

        <div className={styles.grid}>
          {wishlistItems.map((item) => (
            <WishlistItem
              key={item.id}
              item={item}
              onMoveToCart={handleMoveToCart}
              onRemove={handleRemove}
            />
          ))}
        </div>

        <div className={styles.bottom}>
          <Link
            to="/shop"
            className={styles.continueBtn}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </>
  );
};

export default Wishlist;