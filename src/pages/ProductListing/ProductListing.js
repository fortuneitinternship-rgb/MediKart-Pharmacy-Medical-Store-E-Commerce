import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import FilterPanel from "../../components/FilterPanel/FilterPanel";
import SortDropdown from "../../components/SortDropdown/SortDropdown";

import productsData from "../../data/products";

// If these files exist in your project, import them
import flashSaleProducts from "../../FlashSale/FlashSale.js";
import trendingProducts from "../../TrendingProducts/TrendingProducts.js";
import featuredProducts from "../../FeaturedProducts/FeaturedProducts.js";

import "./ProductListings.css";

/* ============================================================
   CATEGORY SLUG MAP
============================================================ */

const categorySlugMap = {
  medicines: [
    "medicine",
    "medicines",
    "tablets",
    "tablet",
  ],

  vitamins: [
    "vitamin",
    "vitamins",
    "supplement",
    "supplements",
  ],

  "personal-care": [
    "personal care",
    "personal-care",
    "skincare",
    "face wash",
  ],

  "baby-care": [
    "baby",
    "baby care",
  ],

  "medical-devices": [
    "device",
    "devices",
    "monitor",
    "thermometer",
  ],

  healthcare: [
    "healthcare",
    "medical",
  ],
};


/* ============================================================
   MATCH CATEGORY
============================================================ */

const matchesCategory = (
  product,
  selectedCategory
) => {

  if (!selectedCategory) {
    return true;
  }

  const keywords =
    categorySlugMap[selectedCategory] ||
    [selectedCategory];

  const haystack = [
    product.category,
    product.name,
    product.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return keywords.some((keyword) =>
    haystack.includes(
      keyword.toLowerCase()
    )
  );
};


/* ============================================================
   ALL PRODUCTS
============================================================ */

/*
   Combining all products is important.

   This allows Product Details to work for:

   - Normal Products
   - Flash Sale Products
   - Trending Products
   - Featured Products
*/

const allProducts = [
  ...(Array.isArray(productsData)
    ? productsData
    : []),

  ...(Array.isArray(flashSaleProducts)
    ? flashSaleProducts
    : []),

  ...(Array.isArray(trendingProducts)
    ? trendingProducts
    : []),

  ...(Array.isArray(featuredProducts)
    ? featuredProducts
    : []),
];


/* ============================================================
   PRODUCT LISTING
============================================================ */

const ProductListing = () => {

  const { category } = useParams();


  /* ==========================================================
     FILTER STATE
  ========================================================== */

  const [filters, setFilters] =
    useState({
      category: "",
      brand: "",
      rating: "",
      availability: false,
      minPrice: "",
      maxPrice: "",
    });


  /* ==========================================================
     SORT STATE
  ========================================================== */

  const [sortBy, setSortBy] =
    useState("");


  /* ==========================================================
     SELECTED CATEGORY
  ========================================================== */

  const selectedCategory =
    category
      ? category.toLowerCase()
      : "";


  /* ==========================================================
     FILTER PRODUCTS
  ========================================================== */

  const filteredProducts = useMemo(() => {

    let products = [
      ...allProducts,
    ];


    /* ========================================================
       CATEGORY
    ======================================================== */

    const activeCategory =
      filters.category ||
      selectedCategory;

    if (activeCategory) {

      products =
        products.filter((product) =>
          matchesCategory(
            product,
            activeCategory
          )
        );

    }


    /* ========================================================
       BRAND
    ======================================================== */

    if (filters.brand) {

      products =
        products.filter(
          (product) =>
            product.brand ===
            filters.brand
        );

    }


    /* ========================================================
       RATING
    ======================================================== */

    if (filters.rating) {

      products =
        products.filter(
          (product) =>
            Number(product.rating || 0) >=
            Number(filters.rating)
        );

    }


    /* ========================================================
       AVAILABILITY
    ======================================================== */

    if (filters.availability) {

      products =
        products.filter(
          (product) =>
            product.stock === true ||
            product.stock > 0
        );

    }


    /* ========================================================
       MIN PRICE
    ======================================================== */

    if (filters.minPrice) {

      products =
        products.filter(
          (product) =>
            Number(product.price || 0) >=
            Number(filters.minPrice)
        );

    }


    /* ========================================================
       MAX PRICE
    ======================================================== */

    if (filters.maxPrice) {

      products =
        products.filter(
          (product) =>
            Number(product.price || 0) <=
            Number(filters.maxPrice)
        );

    }


    /* ========================================================
       SORT
    ======================================================== */

    switch (sortBy) {

      case "priceLowHigh":

        products.sort(
          (a, b) =>
            Number(a.price || 0) -
            Number(b.price || 0)
        );

        break;


      case "priceHighLow":

        products.sort(
          (a, b) =>
            Number(b.price || 0) -
            Number(a.price || 0)
        );

        break;


      case "nameAZ":

        products.sort(
          (a, b) =>
            (a.name || "").localeCompare(
              b.name || ""
            )
        );

        break;


      case "nameZA":

        products.sort(
          (a, b) =>
            (b.name || "").localeCompare(
              a.name || ""
            )
        );

        break;


      case "rating":

        products.sort(
          (a, b) =>
            Number(b.rating || 0) -
            Number(a.rating || 0)
        );

        break;


      default:
        break;
    }


    /* ========================================================
       REMOVE DUPLICATE IDs
    ======================================================== */

    const uniqueProducts = [];

    const usedIds = new Set();

    products.forEach((product) => {

      const id = String(product.id);

      if (!usedIds.has(id)) {

        usedIds.add(id);

        uniqueProducts.push(
          product
        );

      }

    });

    return uniqueProducts;

  }, [
    filters,
    sortBy,
    selectedCategory,
  ]);


  /* ==========================================================
     VIEW
  ========================================================== */

  return (

    <div className="listing-page">


      {/* ======================================================
          FILTER
      ====================================================== */}

      <aside className="listing-sidebar">

        <FilterPanel
          filters={filters}
          setFilters={setFilters}
        />

      </aside>


      {/* ======================================================
          PRODUCTS
      ====================================================== */}

      <main className="products-section">


        {/* SORT */}

        <div className="listing-top-bar">

          <div className="listing-count">

            <strong>
              {filteredProducts.length}
            </strong>

            {" "}Products

          </div>


          <SortDropdown
            sortBy={sortBy}
            setSortBy={setSortBy}
          />

        </div>


        {/* ====================================================
            PRODUCT GRID
        ==================================================== */}

        <div className="product-grid">

          {filteredProducts.map(
            (product) => (

              <div
                key={product.id}
                className="product-card"
              >

                {/* IMAGE */}

                <Link
                  to={`/product/${product.id}`}
                  className="product-image-link"
                >

                  <img
                    src={product.image}
                    alt={product.name}
                  />

                </Link>


                {/* NAME */}

                <Link
                  to={`/product/${product.id}`}
                  className="product-name-link"
                >

                  <h3>
                    {product.name}
                  </h3>

                </Link>


                {/* BRAND */}

                <p className="product-brand">
                  {product.brand}
                </p>


                {/* PRICE */}

                <span className="product-price">
                  ₹{product.price}
                </span>


                {/* RATING */}

                <div className="rating">

                  ⭐{" "}
                  {product.rating || "4.5"}

                </div>


                {/* VIEW DETAILS */}

                <Link
                  to={`/product/${product.id}`}
                  className="view-details-btn"
                >

                  View Details

                </Link>

              </div>

            )
          )}

        </div>


        {/* ====================================================
            EMPTY
        ==================================================== */}

        {filteredProducts.length === 0 && (

          <div className="empty-products">

            <div className="empty-icon">
              🔍
            </div>

            <h2>
              No Products Found
            </h2>

            <p>
              Try changing your filters.
            </p>

          </div>

        )}

      </main>

    </div>

  );

};


export default ProductListing;