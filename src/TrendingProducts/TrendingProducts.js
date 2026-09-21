import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "./TrendingProducts.css";

import cottonRoll from "../assets/healthcare/cotton-roll.png";
import amoxycillin from "../assets/medicines/amoxycillin.png";
import fishOil from "../assets/vitamins/fish-oil.png";
import premium14 from "../assets/premium/premium14.png";

const trendingProducts = [
  {
    id: 253,
    name: "Cotton Roll",
    brand: "Johnson's",
    category: "Healthcare",
    originalPrice: 90,
    price: 70,
    rating: 4.8,
    reviews: 760,
    discount: 22,
    image: cottonRoll,
    packSize: "100g",
    expiry: "36 Months",
    delivery: "2-3 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description: "Soft and absorbent cotton roll suitable for wound dressing and personal care.",
  },
  {
    id: 354,
    name: "Amoxycillin 500mg",
    brand: "Mankind",
    category: "Medicines",
    originalPrice: 120,
    price: 95,
    rating: 4.5,
    reviews: 860,
    discount: 21,
    image: amoxycillin,
    packSize: "10 Capsules",
    expiry: "24 Months",
    delivery: "2-3 Business Days",
    returnPolicy: "7 Days Return Eligible",
    stock: true,
    description:
      "Amoxycillin 500mg is an antibiotic used to treat bacterial infections.",
  },
  {
    id: 16,
    name: "Omega-3 Fish Oil",
    brand: "HK Vitals",
    category: "Vitamins",
    price: 699,
    originalPrice: 899,
    discount: 22,
    rating: 4.8,
    reviews: 2850,
    image: fishOil,
    packSize: "60 Capsules",
    expiry: "24 Months",
    stock: 32,
    description:
      "Omega-3 fish oil dietary supplement.",
  },
  {
      id: 2014,
      name: "Johnson's Baby Premium Care Kit",
      brand: "Johnson & Johnson",
      category: "Premium Healthcare",
      price: 250,
      originalPrice: 325,
      discount: 23,
      rating: 4.9,
      reviews: 1540,
      image: premium14,
      packSize: "Baby Care Kit",
      expiry: "24 Months",
      stock: 38,
      description:
        "A baby care kit containing gentle everyday care essentials suitable for baby's daily hygiene routine.",
    },
];


function TrendingProducts() {
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
      icon: "🛒",
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
    <section className="trending-products">
      <div className="container">
        <div className="trending-header">
          <h2>Trending Products</h2>
          <p>
            Explore the most popular healthcare products on Medikart
          </p>
        </div>

        <div className="trending-grid">
          {trendingProducts.map((product) => (
            <div className="product-card" key={product.id}>
              <img
                src={product.image}
                alt={product.name}
                className="product-image"
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