import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./FeaturedProducts.css";

import immunityBooster from "../assets/vitamins/immunity-booster.png";
import vitaminD3 from "../assets/vitamins/vitamin-d3.png";
import hair7 from "../assets/hairCare/hair7.png";
import SafetyGoggles from "../assets/EyeCare/eye17.png";

const products = [
  {
    id: 25,
    name: "Immunity Booster Tablets",
    brand: "Himalaya",
    category: "Vitamins",
    price: 275,
    originalPrice: 325,
    discount: 15,
    rating: 4.8,
    reviews: 1540,
    image: immunityBooster,
    packSize: "60 Tablets",
    expiry: "24 Months",
    stock: 40,
    description:
      "Nutritional supplement designed for daily wellness support.",
  },
  {
    id: 8,
    name: "Vitamin D3 60000 IU",
    brand: "Uprise",
    category: "Vitamins",
    price: 120,
    originalPrice: 145,
    discount: 17,
    rating: 4.8,
    reviews: 2100,
    image: vitaminD3,
    packSize: "8 Capsules",
    expiry: "24 Months",
    stock: 40,
    description:
      "Vitamin D3 supplement supplied in capsule form.",
  },
  {
    id: 206,
    name: "Keratin Shampoo",
    brand: "Tresemme",
    category: "Hair Care",
    originalPrice: 799,
    price: 699,
    rating: 4.9,
    reviews: 1430,
    discount: 13,
    image: hair7,
    packSize: "580ml",
    expiry: "24 Months",
    delivery: "2-3 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description:
      "Keratin shampoo formulated to cleanse hair while helping improve smoothness."
  },
  {
    id: 166,
    name: "Eye Protection Goggles",
    brand: "Safety",
    category: "Eye Care",
    originalPrice: 688,
    price: 550,
    rating: 4.7,
    reviews: 940,
    discount: 20,
    image: SafetyGoggles,
    packSize: "1 Piece",
    expiry: "5 Years",
    delivery: "3-5 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description: "Protective goggles for medical and industrial use."
  },
];
function FeaturedProducts() {
  const [addedItems, setAddedItems] = useState({});

  const handleAddToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    const existingProduct = cart.find(
      (item) => item.id === product.id
    );

    let updatedCart;

    if (existingProduct) {
      updatedCart = cart.map((item) =>
        item.id === product.id
          ? {
            ...item,
            quantity: (item.quantity || 1) + 1,
          }
          : item
      );
    } else {
      updatedCart = [
        ...cart,
        {
          ...product,
          quantity: 1,
        },
      ];
    }

    localStorage.setItem("cart", JSON.stringify(updatedCart));

    // Update Navbar Cart Count
    window.dispatchEvent(new Event("cartUpdated"));

    // Toast Message
    toast.success(`${product.name} added to cart!`, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "colored",
    });

    // Change Button Text
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

          <div className="products-grid">
            {products.map((product) => (
              <div
                className="product-card"
                key={product.id}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="product-image"
                />

                <div className="product-info">
                  <h3>{product.name}</h3>

                  <p className="price">
                    ₹{product.price}
                  </p>

                  <p className="rating">
                    ⭐ {product.rating}
                  </p>

                  <div className="button-group">
                    <Link
                      to={`/product/${product.id}`}
                      className="view-btn"
                    >
                      View Details
                    </Link>

                    <button
                      className={`cart-btn ${addedItems[product.id]
                        ? "added"
                        : ""
                        }`}
                      onClick={() =>
                        handleAddToCart(product)
                      }
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
    </>
  );
}

export default FeaturedProducts;