import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "./TrendingProducts.css";

import { addProductToCart } from "../api/cartApi";
import { getTrendingProducts } from "../api/productApi";
import {
  getProductImage,
  handleProductImageError,
} from "../utils/productImage";


function TrendingProducts() {
  const [addedItems, setAddedItems] = useState({});
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getTrendingProducts()
      .then(setTrendingProducts)
      .catch((loadError) => {
        console.error("Unable to load trending products:", loadError);
        setError("Trending products could not be loaded.");
      });
  }, []);

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
      theme: "colored",
      icon: "🛒",
      });

      setAddedItems((prev) => ({
        ...prev,
        [product.id]: true,
      }));

      setTimeout(() => {
      setAddedItems((prev) => ({
        ...prev,
        [product.id]: false,
      }));
      }, 2000);
    } catch (error) {
      toast.error(error.message || "Unable to add this product to your cart.");
    }
  };

  return (
    <section className="trending-products">
      <div className="container">
        <div className="trending-header">
          <h2>Trending Products</h2>
          <p>
            Explore the most popular healthcare products on Medikart
          </p>
        </div>

        {error && <p role="alert">{error}</p>}

        <div className="trending-grid">
          {trendingProducts.map((product) => (
            <div className="product-card" key={product.id}>
              <img
                src={getProductImage(
                  product.image,
                  product.name,
                  product.category
                )}
                alt={product.name}
                className="product-image"
                onError={(event) =>
                  handleProductImageError(
                    event,
                    product.name,
                    product.category
                  )
                }
              />

              <div className="product-info">
                <h3>{product.name}</h3>

                <p className="price">
                  <strong>₹{product.price}</strong>
                </p>

                <p className="rating">⭐ {product.rating}</p>

                <div className="button-group">
                  <Link
                    to={`/product/${product.id}`}
                    className="view-btn"
                  >
                    View Details
                  </Link>

                  <button
                    className={`cart-btn ${addedItems[product.id] ? "added" : ""
                      }`}
                    onClick={() => handleAddToCart(product)}
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
      </div>
    </section>
  );
}

export default TrendingProducts;