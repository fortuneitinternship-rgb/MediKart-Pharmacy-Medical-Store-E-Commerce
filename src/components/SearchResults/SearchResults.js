import React from "react";
import ProductCard from "../ProductCard/ProductCard";
import "./SearchResults.css";

function SearchResults({ products }) {
  return (
    <div className="results-container">
      {products.length > 0 ? (
        <div className="results-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      ) : (
        <div className="no-products">
          <h2>No Products Found</h2>
          <p>Try searching with a different product name or category.</p>
        </div>
      )}
    </div>
  );
}

export default SearchResults;