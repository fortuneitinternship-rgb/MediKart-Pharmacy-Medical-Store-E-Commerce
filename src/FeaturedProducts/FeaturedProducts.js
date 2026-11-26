import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./FeaturedProducts.css";
import { addProductToCart } from "../api/cartApi";
import products from "../data/products";
import {
  getUniqueProductsByImage,
  getProductImage,
  handleProductImageError,
} from "../utils/productImage";

// These IDs are taken from the local product catalog. Keeping the sections
// catalog-backed guarantees that the detail page, image, name and price match.
const FEATURED_PRODUCT_IDS = [16, 150, 151, 157, 200, 201, 253, 300];
const featuredCatalogProducts = getUniqueProductsByImage(
  FEATURED_PRODUCT_IDS
    .map((id) => products.find((product) => Number(product.id) === id))
    .filter(Boolean)
);

function FeaturedProducts() {
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
    <section className="featured-products">
      <div className="container">
        <div className="featured-header">
          <h2>Featured Products</h2>
          <p>Discover selected products from the MediKart catalog</p>
        </div>
        <div className="products-grid">
          {featuredCatalogProducts.map((product) => (
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
                <p className="price">₹{Number(product.price || 0).toLocaleString("en-IN")}</p>
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

export default FeaturedProducts;
