import React, { useState } from "react";
import "./SortDropdown.css";

const sortOptions = [
  { value: "", label: "Sort By" },
  { value: "priceLowHigh", label: "Price: Low to High" },
  { value: "priceHighLow", label: "Price: High to Low" },
  { value: "nameAZ", label: "Name: A - Z" },
  { value: "nameZA", label: "Name: Z - A" },
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest First" },
];

function SortDropdown({ sortBy, setSortBy }) {
  const [isOpen, setIsOpen] = useState(false);

  const selected =
    sortOptions.find((option) => option.value === sortBy)?.label ||
    "Sort By";

  const handleSelect = (value) => {
    setSortBy(value);
    setIsOpen(false);
  };

  return (
    <div className="sort-dropdown">

      {/* Desktop */}
      <select
        className="sort-select desktop-sort"
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Mobile */}
      <div className="mobile-sort">
        <button
          type="button"
          className="sort-btn"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <span>{selected}</span>
          <span>{isOpen ? "▲" : "▼"}</span>
        </button>

        {isOpen && (
          <ul className="sort-menu">
            {sortOptions.map((option) => (
              <li
                key={option.value}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default SortDropdown;