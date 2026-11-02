import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./RelatedProducts.module.css";
import { addProductToCart } from "../../api/cartApi";
import {
  getProductImage,
  handleProductImageError,
} from "../../utils/productImage";


const RelatedProducts = ({ products }) => {
  const navigate = useNavigate();
  const [added, setAdded] = useState({});
  const handleAddToCart = async (e, product) => {
    e.stopPropagation();

    try {
      await addProductToCart(product);
      toast.success(`${product.name} added to cart!`);
      setAdded(prev => ({ ...prev, [product.id]: true }));
      setTimeout(() => {
        setAdded(prev => ({
          ...prev,
          [product.id]: false
        }));
      }, 2000);
    } catch (error) {
      toast.error(error.message || "Unable to add this product to your cart.");
    }
  };
  return (
    <section className={styles.relatedProducts}>
      <h2 className={styles.relatedTitle}> Our Products </h2>
      <div className={styles.relatedGrid}>
        {
          products.map((product) => (
            <div key={product.id} className={styles.relatedCard} >
              <div className={styles.imageBox} onClick={() => navigate(`/product/${product.id}`)} >
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