import React, { useState } from "react";
import {
  FaFilter,
  FaChevronDown,
  FaStar,
  FaTimes,
} from "react-icons/fa";

import "./FilterPanel.css";

const FilterPanel = ({
  selectedCategory = "all",
  setSelectedCategory,

  priceRange = "all",
  setPriceRange,

  selectedRating = "all",
  setSelectedRating,

  selectedBrand = "all",
  setSelectedBrand,

  brands = [],

  onReset,
}) => {
  const [openCategory, setOpenCategory] =
    useState(true);

  const [openPrice, setOpenPrice] =
    useState(true);

  const [openRating, setOpenRating] =
    useState(true);

  const [openBrand, setOpenBrand] =
    useState(true);

  const categories = [
    {
      value: "all",
      label: "All Products",
    },
    {
      value: "medicines",
      label: "Medicines",
    },
    {
      value: "healthcare",
      label: "Healthcare",
    },
    {
      value: "vitamins",
      label: "Vitamins & Supplements",
    },
    {
      value: "personal-care",
      label: "Personal Care",
    },
    {
      value: "baby-care",
      label: "Baby Care",
    },
    {
      value: "medical-devices",
      label: "Medical Devices",
    },
    {
      value: "eye-care",
      label: "Eye Care",
    },
    {
      value: "hair-care",
      label: "Hair Care",
    },
    {
      value: "women-care",
      label: "Women's Health",
    },
    {
      value: "premium-healthcare",
      label: "Premium Healthcare",
    },
  ];

  const priceOptions = [
    {
      value: "all",
      label: "All Prices",
    },
    {
      value: "0-199",
      label: "Under ₹200",
    },
    {
      value: "200-499",
      label: "₹200 - ₹499",
    },
    {
      value: "500-999",
      label: "₹500 - ₹999",
    },
    {
      value: "1000-1999",
      label: "₹1,000 - ₹1,999",
    },
    {
      value: "2000",
      label: "₹2,000 & Above",
    },
  ];

  const ratingOptions = [
    {
      value: "all",
      label: "All Ratings",
    },
    {
      value: "4",
      label: "4★ & Above",
    },
    {
      value: "3",
      label: "3★ & Above",
    },
    {
      value: "2",
      label: "2★ & Above",
    },
    {
      value: "1",
      label: "1★ & Above",
    },
  ];

  return (
    <div className="filter-panel">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="filter-header">

        <div className="filter-title">
          <FaFilter />

          <h3>
            Filters
          </h3>
        </div>

        <button
          type="button"
          className="clear-filter-btn"
          onClick={onReset}
        >
          Clear All
        </button>

      </div>

      {/* ==================================================
          CATEGORY
      ================================================== */}

      <div className="filter-section">

        <button
          type="button"
          className="filter-section-title"
          onClick={() =>
            setOpenCategory(
              !openCategory
            )
          }
        >
          <span>
            Category
          </span>

          <FaChevronDown
            className={
              openCategory
                ? "rotate"
                : ""
            }
          />
        </button>

        {openCategory && (
          <div className="filter-options">

            {categories.map(
              (category) => (
                <label
                  key={category.value}
                  className="filter-option"
                >

                  <input
                    type="radio"
                    name="category"
                    value={
                      category.value
                    }
                    checked={
                      selectedCategory ===
                      category.value
                    }
                    onChange={() =>
                      setSelectedCategory(
                        category.value
                      )
                    }
                  />

                  <span>
                    {category.label}
                  </span>

                </label>
              )
            )}

          </div>
        )}
      </div>

      {/* ==================================================
          PRICE
      ================================================== */}

      <div className="filter-section">

        <button
          type="button"
          className="filter-section-title"
          onClick={() =>
            setOpenPrice(!openPrice)
          }
        >
          <span>
            Price
          </span>

          <FaChevronDown
            className={
              openPrice
                ? "rotate"
                : ""
            }
          />
        </button>

        {openPrice && (
          <div className="filter-options">

            {priceOptions.map(
              (option) => (
                <label
                  key={option.value}
                  className="filter-option"
                >

                  <input
                    type="radio"
                    name="price"
                    value={option.value}
                    checked={
                      priceRange ===
                      option.value
                    }
                    onChange={() =>
                      setPriceRange(
                        option.value
                      )
                    }
                  />

                  <span>
                    {option.label}
                  </span>

                </label>
              )
            )}

          </div>
        )}
      </div>

      {/* ==================================================
          RATING
      ================================================== */}

      <div className="filter-section">

        <button
          type="button"
          className="filter-section-title"
          onClick={() =>
            setOpenRating(
              !openRating
            )
          }
        >
          <span>
            Rating
          </span>

          <FaChevronDown
            className={
              openRating
                ? "rotate"
                : ""
            }
          />
        </button>

        {openRating && (
          <div className="filter-options">

            {ratingOptions.map(
              (option) => (
                <label
                  key={option.value}
                  className="filter-option rating-option"
                >

                  <input
                    type="radio"
                    name="rating"
                    value={option.value}
                    checked={
                      selectedRating ===
                      option.value
                    }
                    onChange={() =>
                      setSelectedRating(
                        option.value
                      )
                    }
                  />

                  <span>
                    {option.value !==
                      "all" && (
                        <FaStar />
                      )}

                    {option.label}
                  </span>

                </label>
              )
            )}

          </div>
        )}
      </div>

      {/* ==================================================
          BRAND
      ================================================== */}

      <div className="filter-section">

        <button
          type="button"
          className="filter-section-title"
          onClick={() =>
            setOpenBrand(
              !openBrand
            )
          }
        >
          <span>
            Brand
          </span>

          <FaChevronDown
            className={
              openBrand
                ? "rotate"
                : ""
            }
          />
        </button>

        {openBrand && (
          <div className="filter-options brand-options">

            <label className="filter-option">

              <input
                type="radio"
                name="brand"
                value="all"
                checked={
                  selectedBrand ===
                  "all"
                }
                onChange={() =>
                  setSelectedBrand(
                    "all"
                  )
                }
              />

              <span>
                All Brands
              </span>

            </label>

            {brands.map(
              (brand) => (
                <label
                  key={brand}
                  className="filter-option"
                >

                  <input
                    type="radio"
                    name="brand"
                    value={brand}
                    checked={
                      selectedBrand ===
                      brand
                    }
                    onChange={() =>
                      setSelectedBrand(
                        brand
                      )
                    }
                  />

                  <span>
                    {brand}
                  </span>

                </label>
              )
            )}

            {brands.length === 0 && (
              <p className="no-brands">
                No brands available
              </p>
            )}

          </div>
        )}
      </div>

      {/* ==================================================
          RESET BUTTON
      ================================================== */}

      <button
        type="button"
        className="filter-reset-button"
        onClick={onReset}
      >
        <FaTimes />
        Reset Filters
      </button>

    </div>
  );
};

export default FilterPanel;