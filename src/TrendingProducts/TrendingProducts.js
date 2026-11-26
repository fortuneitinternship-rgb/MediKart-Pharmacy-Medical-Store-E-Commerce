import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "./TrendingProducts.css";
import { addProductToCart } from "../api/cartApi";
import products from "../data/products";
import {
  getUniqueProductsByImage,
  getProductImage,
  handleProductImageError,
} from "../utils/productImage";

// Exactly four real catalog entries; each links to its own matching detail page.
const TRENDING_PRODUCT_IDS = [350, 354, 144, 148];
const trendingCatalogProducts = getUniqueProductsByImage(
  TRENDING_PRODUCT_IDS
    .map((id) => products.find((product) => Number(product.id) === id))
    .filter(Boolean)
).slice(0, 4);

function TrendingProducts() {
  const [addedItems, setAddedItems] = useState({});

  const handleAddToCart = async (product) => {
    try {
      await addProductToCart(product);
      toast.success(`${product.name} added to cart!`);
      setAddedItems((previous) => ({ ...previous, [product.id]: true }));
    } catch (error) {
      toast.error(error.message || "Unable to add this product to your cart.");
    }
  };

  return (
    <section className="trending-products">
      <div className="container">
        <div className="trending-header">
          <h2>Trending Products</h2>
          <p>Explore popular products from the MediKart catalog</p>
        </div>
        <div className="trending-grid">
          {trendingCatalogProducts.map((product) => (
            <div className="product-card" key={product.id}>
              <img
                src={getProductImage(product.image, product.name, product.category)}
                alt={product.name}
                className="product-image"
                loading="lazy"
                onError={(event) => handleProductImageError(event, product.name, product.category)}
              />
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="price"><strong>₹{Number(product.price || 0).toLocaleString("en-IN")}</strong></p>
                <p className="rating">⭐ {product.rating || "4.5"}</p>
                <div className="button-group">
                  <Link to={`/product/${product.id}`} className="view-btn">View Details</Link>
                  <button
                    className={`cart-btn ${addedItems[product.id] ? "added" : ""}`}
                    onClick={() => handleAddToCart(product)}
                  >
                    {addedItems[product.id] ? "✓ Added" : "Add to Cart"}
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
