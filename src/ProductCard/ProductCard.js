import React from "react";
import { Link } from "react-router-dom";
import {
  FaHeart,
  FaShoppingCart,
  FaEye,
  FaStar,
} from "react-icons/fa";
import "./ProductCard.css";

function ProductCard({
  product,
  onAddToCart,
  onAddToWishlist,
}) {
  return (
    <div className="product-card">

      {/* Product Image */}
      <div className="image-box">
        <img
          src={product.image}
          alt={product.name}
        />
      </div>

      {/* Product Info */}
      <div className="product-info">

        <h3>{product.name}</h3>

        <p className="brand">
          {product.brand}
        </p>

        <p className="category">
          {product.category}
        </p>

        <div className="rating">
          <FaStar className="star" />
          <span>{product.rating}</span>
        </div>

        <h2 className="price">
          ₹{product.price}
        </h2>

        <p
          className={
            product.stock
              ? "stock in"
              : "stock out"
          }
        >
          {product.stock ? "✔ In Stock" : "✖ Out of Stock"}
        </p>

      </div>

      {/* Buttons */}
      <div className="buttons">

        <button
          className="cart-btn"
          onClick={() =>
            onAddToCart(product)
          }
        >
          <FaShoppingCart />
          Add to Cart
        </button>

        <button
          className="wish-btn"
          onClick={() =>
            onAddToWishlist(product)
          }
        >
          <FaHeart />
          Wishlist
        </button>

        <Link
          to={`/product/${product.id}`}
          className="details-btn"
        >
          <FaEye />
          View Details
        </Link>

      </div>

    </div>
  );
}

export default ProductCard;