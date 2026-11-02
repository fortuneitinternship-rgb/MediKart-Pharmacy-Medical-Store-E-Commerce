import React, { useState, useRef, useEffect } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import products from "../../data/products";
import "./SearchBar.css";
import {
  getProductImage,
  handleProductImageError,
} from "../../utils/productImage";

function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);

  const searchRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(e.target)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleClear = () => {
    setSearchTerm("");
    setShowResults(false);
  };

  return (
    <div className="search-wrapper" ref={searchRef}>
      <div className="search-container">
        {/* Left Search Icon */}
        <FaSearch className="search-left-icon" />

        <input
          type="text"
          placeholder="Search Medicines..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowResults(true);
          }}
          className="search-input"
        />

        {/* Right Close Icon */}
        {searchTerm && (
          <FaTimes
            className="search-close-icon"
            onClick={handleClear}
          />
        )}
      </div>

      {showResults && searchTerm && (
        <div className="search-results">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="search-item"
                onClick={() => setShowResults(false)}
              >
                <img
                  src={getProductImage(
                    product.image,
                    product.name,
                    product.category
                  )}
                  alt={product.name}
                  onError={(event) =>
                    handleProductImageError(
                      event,
                      product.name,
                      product.category
                    )
                  }
                />

                <div>
                  <h4>{product.name}</h4>
                  <p>₹{product.price}</p>
                </div>
              </Link>
            ))
          ) : (
            <div className="no-results">
              No products found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;