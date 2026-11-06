import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./FeaturedProducts.css";
import { addProductToCart } from "../api/cartApi";
import { getFeaturedProducts } from "../api/productApi";
import {
  getUniqueProductsByImage,
  getProductImage,
  handleProductImageError,
} from "../utils/productImage";

function FeaturedProducts() {
  const [addedItems, setAddedItems] = useState({});
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getFeaturedProducts()
      .then((items) => setProducts(getUniqueProductsByImage(items)))
      .catch((loadError) => {
        console.error("Unable to load featured products:", loadError);
        setError("Featured products could not be loaded.");
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
    } catch (addError) {
      toast.error(addError.message || "Unable to add this product to your cart.");
    }
  };

  return (
    <>
      <section className="featured-products">
        <div className="container">
          <div className="featured-header">
            <h2>Featured Products</h2>
            <p>
              Discover our most popular healthcare products
            </p>
          </div>

          {error && <p role="alert">{error}</p>}

          <div className="products-grid">
            {products.map((product) => (
              <div
                className="product-card"
                key={product.id}
              >
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
                    ₹{product.price}
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
                      className={`cart-btn ${
                        addedItems[product.id] ? "added" : ""
                      }`}
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
    </>
  );
}

export default FeaturedProducts;