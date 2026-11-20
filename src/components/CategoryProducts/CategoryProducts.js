import React from "react";
import { useParams } from "react-router-dom";
import medicines from "../../data/medicines";

function CategoryProducts() {
  const { categoryName } = useParams();

  let products = [];

  // Load products according to category
  if (categoryName === "medicines") {
    products = medicines;
  }

  return (
    <div className="container">
      <h2>
        {categoryName
          ? categoryName.toUpperCase()
          : "CATEGORY"}
      </h2>

      <div className="product-grid">
        {products.length > 0 ? (
          products.map((item) => (
            <div
              key={item.id}
              className="product-card"
            >
              <img
                src={item.image}
                alt={item.name}
              />

              <h3>{item.name}</h3>

              <p>{item.brand}</p>

              <h4>₹{item.price}</h4>

              <p>⭐ {item.rating}</p>
            </div>
          ))
        ) : (
          <p className="no-products">
            No products available in this category.
          </p>
        )}
      </div>
    </div>
  );
}

export default CategoryProducts;