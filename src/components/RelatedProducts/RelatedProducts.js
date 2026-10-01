import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./RelatedProducts.module.css";


const RelatedProducts = ({ products }) => {
  const navigate = useNavigate();
  const [added, setAdded] = useState({});
  const handleAddToCart = (e, product) => {
    e.stopPropagation();

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingProduct = cart.find(item => item.id === product.id);
    let updatedCart;

    if (existingProduct) {
      updatedCart =
      cart.map(item =>
        item.id === product.id ? { ...item, quantity: (item.quantity || 1) + 1 } : item);
    } else {
      updatedCart = [...cart, { ...product, quantity: 1 }];
    }
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    // Update Navbar Cart Count

    window.dispatchEvent(new Event("cartUpdated"));
    toast.success(`${product.name} added to cart!`);
    setAdded(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAdded(prev => ({
        ...prev,
        [product.id]: false
      }));
    }, 2000);
  };
  return (
    <section className={styles.relatedProducts}>
      <h2 className={styles.relatedTitle}> Our Products </h2>
      <div className={styles.relatedGrid}>
        {
          products.map((product) => (
            <div key={product.id} className={styles.relatedCard} >
              <div className={styles.imageBox} onClick={() => navigate(`/product/${product.id}`)} >
                {(() => {
                  let img = product.image;
                  if (typeof img === "string" && img.startsWith("/images/")) {
                    try {
                      img = require("../../assets/images/" + img.split("/").pop());
                    } catch (err) {
                      img = require("../../assets/images/Mediction.png");
                    }
                  }

                  return (
                    <img src={img} alt={product.name} className={styles.productImage} onError={(e) => { e.target.src = require("../../assets/images/Mediction.png"); }} />
                  );
                })()}
              </div>

              <div className={styles.productInfo}>
                <span className={styles.category}> {product.category} </span>
                <h3 className={styles.productName}> {product.name} </h3>
                <p className={styles.productPrice}> ₹{product.price} </p>
                <p className={styles.rating}> ⭐ {product.rating} </p>

                <div className={styles.buttonGroup}>
                  <button
                    className={styles.detailsBtn}
                    onClick={() => navigate(`/product/${product.id}`)} >
                    View Details
                  </button>

                  <button
                    className={`${styles.cartBtn} ${added[product.id] ? styles.added : ""}`}
                    onClick={(e) => handleAddToCart(e, product)} >
                    {added[product.id] ? "✓ Added" : "Add to Cart"}
                  </button>

                </div>
              </div>
            </div>
          ))
        }
      </div>
    </section>
  );
};
export default RelatedProducts;