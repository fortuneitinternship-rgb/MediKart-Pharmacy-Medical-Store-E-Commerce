import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  FaHeart,
  FaShoppingCart,
  FaBolt,
  FaStar,
} from "react-icons/fa";

import ProductGallery from "../../components/ProductGallery/ProductGallery";
import QuantitySelector from "../../components/QuantitySelector/QuantitySelector";
import ProductSpecifications from "../../components/ProductSpecifications/ProductSpecifications";
import RelatedProducts from "../../components/RelatedProducts/RelatedProducts";
import { getProductDetails, getProducts } from "../../api/productApi";
import { addProductToCart } from "../../api/cartApi";

import "./ProductDetails.css";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // ==========================================
  // FIND PRODUCT
  // ==========================================

  // ==========================================
  // STATES
  // ==========================================

  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);

  const [wishlist, setWishlist] = useState(false);

  const [isAdded, setIsAdded] = useState(false);

  const [loading, setLoading] = useState(true);
  const [requestError, setRequestError] = useState("");

  // ==========================================
  // PRODUCT CHANGE
  // ==========================================

  useEffect(() => {
    setQuantity(1);
    setLoading(true);
    setRequestError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    let active = true;
    Promise.all([getProductDetails(id), getProducts()])
      .then(([productDetails, productsList]) => {
        if (active) {
          setProduct(productDetails);
          setAllProducts(productsList);
        }
      })
      .catch((error) => {
        console.error("Unable to load product details:", error);
        if (active) {
          setRequestError("Product details could not be loaded.");
          setProduct(null);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  // ==========================================
  // CHECK WISHLIST
  // ==========================================

  useEffect(() => {
    if (!product) return;

    try {
      const wishlistData =
        JSON.parse(localStorage.getItem("wishlist")) || [];

      const exists = wishlistData.some(
        (item) =>
          Number(item.id) === Number(product.id)
      );

      setWishlist(exists);
    } catch (error) {
      console.error(
        "Failed to load wishlist:",
        error
      );

      setWishlist(false);
    }
  }, [product]);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="loadingContainer">
        <div className="loader"></div>

        <h2>
          Loading Product...
        </h2>
      </div>
    );
  }

  // ==========================================
  // PRODUCT NOT FOUND
  // ==========================================

  if (!product) {
    return (
      <div className="not-found">
        <h2>
          Product Not Found
        </h2>

        <p>
          The product you are looking
          for does not exist.
        </p>

        <button
          className="back-shop-btn"
          onClick={() => navigate("/shop")}
        >
          Go to Shop
        </button>
      </div>
    );
  }

  // ==========================================
  // PRICE
  // ==========================================

  const originalPrice = Number(product.price);

  const sellingPrice = Number(
    product.discount_price ?? product.price
  );

  const discount = Number(
    product.discount_percentage || 0
  );

  // ==========================================
  // TOTAL
  // ==========================================

  const totalAmount =
    sellingPrice * quantity;

  // ==========================================
  // PRODUCT IMAGES
  // ==========================================

  const productImages =
    product.images &&
      product.images.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : [];

  // ==========================================
  // ADD TO CART
  // ==========================================

  const handleAddToCart = async () => {
    setRequestError("");
    try {
      await addProductToCart(product, quantity);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    } catch (error) {
      setRequestError(error.message || "Unable to add this product to your cart.");
    }
  };

  // ==========================================
  // WISHLIST
  // ==========================================

  const handleWishlist = () => {
    let wishlistData = [];

    try {
      wishlistData =
        JSON.parse(
          localStorage.getItem("wishlist")
        ) || [];
    } catch (error) {
      console.error(
        "Failed to load wishlist:",
        error
      );

      wishlistData = [];
    }

    const exists = wishlistData.some(
      (item) =>
        Number(item.id) ===
        Number(product.id)
    );

    // ==========================================
    // REMOVE FROM WISHLIST
    // ==========================================

    if (exists) {
      wishlistData =
        wishlistData.filter(
          (item) =>
            Number(item.id) !==
            Number(product.id)
        );

      setWishlist(false);
    }

    // ==========================================
    // ADD TO WISHLIST
    // ==========================================

    else {
      wishlistData.push({
        ...product,
      });

      setWishlist(true);
    }

    // ==========================================
    // SAVE WISHLIST
    // ==========================================

    localStorage.setItem(
      "wishlist",
      JSON.stringify(wishlistData)
    );

    window.dispatchEvent(
      new Event("wishlistUpdated")
    );
  };

  // ==========================================
  // BUY NOW
  // ==========================================

  const handleBuyNow = async () => {
    // ==========================================
    // CREATE SELECTED PRODUCT
    // ==========================================

    setRequestError("");
    try {
      await addProductToCart(product, quantity);
      navigate(`/checkout/${product.id}`);
    } catch (error) {
      setRequestError(error.message || "Unable to add this product to your cart.");
    }
  };

  // ==========================================
  // RELATED PRODUCTS
  // ==========================================

  const relatedProducts =
    allProducts
      .filter(
        (item) =>
          Number(item.id) !==
          Number(product.id)
      )
      .filter(
        (item) =>
          item.category ===
          product.category
      )
      .slice(0, 8);

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="product-page">

      {/* ==========================================
          TOP BAR
      ========================================== */}

      <div className="product-topbar">

        <button
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

      </div>

      {requestError && <p role="alert">{requestError}</p>}

      {/* ==========================================
          PRODUCT MAIN
      ========================================== */}

      <div className="product-wrapper">

        {/* ========================================
            LEFT COLUMN
        ======================================== */}

        <div className="left-column">

          <ProductGallery
            images={productImages}
            productName={product.name}
            category={product.category}
          />

        </div>

        {/* ========================================
            RIGHT COLUMN
        ======================================== */}

        <div className="right-column">

          {/* PRODUCT NAME */}

          <h1 className="product-name">
            {product.name}
          </h1>

          {/* BRAND */}

          {product.brand && (
            <p className="product-brand">
              Brand:{" "}
              <strong>
                {product.brand}
              </strong>
            </p>
          )}

          {/* ======================================
              RATING
          ====================================== */}

          <div className="rating-box">

            <div className="rating-badge">

              <FaStar />

              {product.rating || 4.5}

            </div>

            <span>
              {product.reviews || 0} Ratings
            </span>

          </div>

          {/* ======================================
              PRICE
          ====================================== */}

          <div className="price-box">

            <span className="discount-price">

              ₹
              {sellingPrice.toFixed(2)}

            </span>

            {originalPrice >
              sellingPrice && (
                <span className="actual-price">

                  ₹
                  {originalPrice.toFixed(2)}

                </span>
              )}

            {discount > 0 && (
              <span className="discount">

                {discount}% OFF

              </span>
            )}

          </div>

          {/* ======================================
              DESCRIPTION
          ====================================== */}

          <div className="description">

            <h3>
              Description
            </h3>

            <p>
              {product.description ||
                "No description available for this product."}
            </p>

          </div>

          {/* ======================================
              QUANTITY
          ====================================== */}

          <div className="quantity-area">

            <h3>
              Quantity
            </h3>

            <QuantitySelector
              quantity={quantity}
              setQuantity={setQuantity}
            />

          </div>

          {/* ======================================
              TOTAL
          ====================================== */}

          <div className="total-box">

            <div className="row">

              <span>
                Unit Price
              </span>

              <strong>
                ₹
                {sellingPrice.toFixed(2)}
              </strong>

            </div>

            <div className="row">

              <span>
                Quantity
              </span>

              <strong>
                {quantity}
              </strong>

            </div>

            <div className="row total">

              <span>
                Total Amount
              </span>

              <strong>
                ₹
                {totalAmount.toFixed(2)}
              </strong>

            </div>

          </div>

          {/* ======================================
              BUTTONS
          ====================================== */}

          <div className="button-group">

            {/* ====================================
                ADD TO CART
            ==================================== */}

            <button
              className={`cart-btn ${isAdded ? "added" : ""
                }`}
              onClick={
                handleAddToCart
              }
            >

              <FaShoppingCart />

              {isAdded
                ? "✓ Added"
                : "Add to Cart"}

            </button>

            {/* ====================================
                BUY NOW
            ==================================== */}

            <button
              className="buy-btn"
              onClick={
                handleBuyNow
              }
            >

              <FaBolt />

              Buy Now

            </button>

            {/* ====================================
                WISHLIST
            ==================================== */}

            <button
              className={`wish-btn ${wishlist ? "active" : ""
                }`}
              onClick={
                handleWishlist
              }
            >

              <FaHeart />

            </button>

          </div>

        </div>

      </div>

      {/* ==========================================
          SPECIFICATIONS
      ========================================== */}

      <ProductSpecifications
        product={product}
      />

      {/* ==========================================
          RELATED PRODUCTS
      ========================================== */}

      {relatedProducts.length > 0 && (
        <RelatedProducts
          products={relatedProducts}
        />
      )}

    </div>
  );
};

export default ProductDetails;
