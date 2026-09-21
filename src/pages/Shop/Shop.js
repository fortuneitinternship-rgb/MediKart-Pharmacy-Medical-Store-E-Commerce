import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { FaSearch, FaSortAmountDown } from "react-icons/fa";
import { toast } from "react-toastify";

import ProductCard from "../../components/ProductCard/ProductCard";
import FilterPanel from "../../components/FilterPanel/FilterPanel";

import medicines from "../../data/medicines";
import healthcare from "../../data/healthcare";
import vitamins from "../../data/vitamins";
import personalCare from "../../data/personalCare";
import babyCare from "../../data/babyCare";
import medicalDevices from "../../data/medicalDevices";
import womenCare from "../../data/womensHealth";
import hairCare from "../../data/HairCare";
import eyeCare from "../../data/eye-care";
import premiumHealthcare from "../../data/premium-healthcare";
import "./Shop.css";

/* ============================================================
   CATEGORY DATA
============================================================ */

const CATEGORY_DATA = {
  medicines,
  healthcare,
  vitamins,
  "personal-care": personalCare,
  "baby-care": babyCare,
  "medical-devices": medicalDevices,
  "women-care": womenCare,
  "hair-care": hairCare,
  "eye-care": eyeCare,
  "premium-healthcare": premiumHealthcare,
};

/* ============================================================
   CATEGORY NAMES
============================================================ */

const CATEGORY_NAMES = {
  all: "All Products",
  medicines: "Medicines",
  healthcare: "Healthcare",
  vitamins: "Vitamins & Supplements",
  "personal-care": "Personal Care",
  "baby-care": "Baby Care",
  "medical-devices": "Medical Devices",
  "women-care": "Women's Health",
  "hair-care": "Hair Care",
  "eye-care": "Eye Care",
  "premium-healthcare": "Premium Healthcare",
};

/* ============================================================
   ALL PRODUCTS
============================================================ */

const ALL_PRODUCTS = Object.values(CATEGORY_DATA).flat();

/* ============================================================
   SHOP COMPONENT
============================================================ */

const Shop = () => {
  const { category } = useParams();

  const currentCategory =
    category && CATEGORY_DATA[category] ? category : "all";

  /* ==========================================================
     STATES
  ========================================================== */

  const [products, setProducts] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [sortBy, setSortBy] = useState("default");

  const [selectedCategory, setSelectedCategory] = useState(currentCategory);

  const [priceRange, setPriceRange] = useState("all");

  const [selectedRating, setSelectedRating] = useState("all");

  const [selectedBrand, setSelectedBrand] = useState("all");

  const [visibleProducts, setVisibleProducts] = useState(12);

  const [loading, setLoading] = useState(true);

  /* ==========================================================
     LOAD PRODUCTS
  ========================================================== */

  useEffect(() => {
    setLoading(true);

    const timer = setTimeout(() => {
      const data =
        currentCategory === "all"
          ? ALL_PRODUCTS
          : CATEGORY_DATA[currentCategory] || [];

      setProducts(data);
      setVisibleProducts(12);
      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [currentCategory]);

  /* ==========================================================
     RESET FILTERS WHEN CATEGORY CHANGES
  ========================================================== */

  useEffect(() => {
    setSelectedCategory(currentCategory);
    setPriceRange("all");
    setSelectedRating("all");
    setSelectedBrand("all");
    setSearchTerm("");
    setSortBy("default");
    setVisibleProducts(12);
  }, [currentCategory]);

  /* ==========================================================
     BRANDS
  ========================================================== */

  const brands = useMemo(() => {
    const brandList = products
      .map((product) => product.brand)
      .filter(
        (brand) =>
          brand &&
          typeof brand === "string" &&
          brand.trim() !== ""
      );

    return [...new Set(brandList)].sort((a, b) =>
      a.localeCompare(b)
    );
  }, [products]);

  /* ==========================================================
     FILTER PRODUCTS
  ========================================================== */

  const filteredProducts = useMemo(() => {
    let result = [...products];

    /* ========================================================
       SEARCH
    ======================================================== */

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();

      result = result.filter((product) => {
        const name =
          product.name?.toLowerCase() || "";

        const brand =
          product.brand?.toLowerCase() || "";

        const productCategory =
          product.category?.toLowerCase() || "";

        return (
          name.includes(search) ||
          brand.includes(search) ||
          productCategory.includes(search)
        );
      });
    }

    /* ========================================================
       CATEGORY
    ======================================================== */

    if (
      selectedCategory !== "all" &&
      CATEGORY_DATA[selectedCategory]
    ) {
      const selectedProducts =
        CATEGORY_DATA[selectedCategory];

      const ids = new Set(
        selectedProducts.map((item) => item.id)
      );

      result = result.filter((item) =>
        ids.has(item.id)
      );
    }

    /* ========================================================
       PRICE
    ======================================================== */

    if (priceRange !== "all") {
      result = result.filter((product) => {
        const price = Number(product.price || 0);

        switch (priceRange) {
          case "0-199":
            return price <= 199;

          case "200-499":
            return price >= 200 && price <= 499;

          case "500-999":
            return price >= 500 && price <= 999;

          case "1000-1999":
            return price >= 1000 && price <= 1999;

          case "2000":
            return price >= 2000;

          default:
            return true;
        }
      });
    }

    /* ========================================================
       RATING
    ======================================================== */

    if (selectedRating !== "all") {
      const minimumRating =
        Number(selectedRating);

      result = result.filter(
        (product) =>
          Number(product.rating || 0) >=
          minimumRating
      );
    }

    /* ========================================================
       BRAND
    ======================================================== */

    if (selectedBrand !== "all") {
      result = result.filter(
        (product) =>
          product.brand?.toLowerCase() ===
          selectedBrand.toLowerCase()
      );
    }

    /* ========================================================
       SORT
    ======================================================== */

    switch (sortBy) {
      case "priceLow":
        result.sort(
          (a, b) =>
            Number(a.price || 0) -
            Number(b.price || 0)
        );
        break;

      case "priceHigh":
        result.sort(
          (a, b) =>
            Number(b.price || 0) -
            Number(a.price || 0)
        );
        break;

      case "rating":
        result.sort(
          (a, b) =>
            Number(b.rating || 0) -
            Number(a.rating || 0)
        );
        break;

      case "name":
        result.sort((a, b) =>
          (a.name || "").localeCompare(
            b.name || ""
          )
        );
        break;

      default:
        break;
    }

    return result;
  }, [
    products,
    searchTerm,
    selectedCategory,
    priceRange,
    selectedRating,
    selectedBrand,
    sortBy,
  ]);

  /* ==========================================================
     DISPLAY PRODUCTS
  ========================================================== */

  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(
      0,
      visibleProducts
    );
  }, [filteredProducts, visibleProducts]);

  /* ==========================================================
     HANDLERS
  ========================================================== */

  const handleSearch = (event) => {
    const value = event.target.value;

    setSearchTerm(value);
    setVisibleProducts(12);
  };

  const handleSort = (event) => {
    const value = event.target.value;

    setSortBy(value);
    setVisibleProducts(12);

    if (value === "priceLow") {
      toast.info("Sorted by Price: Low to High");
    }

    if (value === "priceHigh") {
      toast.info("Sorted by Price: High to Low");
    }

    if (value === "rating") {
      toast.info("Sorted by Highest Rating");
    }

    if (value === "name") {
      toast.info("Sorted by Name: A-Z");
    }
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setVisibleProducts(12);

    const categoryName =
      CATEGORY_NAMES[value] || "All Products";

    toast.success(
      `Showing ${categoryName}`
    );
  };

  const handlePriceChange = (value) => {
    setPriceRange(value);
    setVisibleProducts(12);

    if (value !== "all") {
      toast.info("Price filter applied");
    }
  };

  const handleRatingChange = (value) => {
    setSelectedRating(value);
    setVisibleProducts(12);

    if (value !== "all") {
      toast.info(
        `Showing products rated ${value}★ and above`
      );
    }
  };

  const handleBrandChange = (value) => {
    setSelectedBrand(value);
    setVisibleProducts(12);

    if (value !== "all") {
      toast.info(`Brand filter: ${value}`);
    }
  };

  /* ==========================================================
     LOAD MORE
  ========================================================== */

  const loadMore = () => {
    const newVisibleCount =
      visibleProducts + 12;

    setVisibleProducts(newVisibleCount);

    if (
      newVisibleCount >=
      filteredProducts.length
    ) {
      toast.success("All products loaded!");
    } else {
      toast.success("More products loaded!");
    }
  };

  /* ==========================================================
     RESET FILTERS
  ========================================================== */

  const resetFilters = () => {
    setSelectedCategory(currentCategory);
    setPriceRange("all");
    setSelectedRating("all");
    setSelectedBrand("all");
    setSearchTerm("");
    setSortBy("default");
    setVisibleProducts(12);

    toast.success("All filters have been cleared");
  };

  /* ==========================================================
     ACTIVE FILTER COUNT
  ========================================================== */

  const activeFilterCount = [
    priceRange !== "all",
    selectedRating !== "all",
    selectedBrand !== "all",
    searchTerm.trim() !== "",
  ].filter(Boolean).length;

  /* ==========================================================
     JSX
  ========================================================== */

  return (
    <div className="shop-page">

      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="shop-header">

        {/* TITLE */}

        <div className="shop-title">
          <h1>
            {CATEGORY_NAMES[selectedCategory] ||
              "All Products"}
          </h1>

          <span>
            {filteredProducts.length} Products
          </span>
        </div>

        {/* SEARCH */}

        <div className="shop-search">
          <FaSearch />

          <input
            type="text"
            placeholder="Search medicines, healthcare products..."
            value={searchTerm}
            onChange={handleSearch}
          />

          {searchTerm && (
            <button
              type="button"
              className="clear-search"
              onClick={() => {
                setSearchTerm("");
                setVisibleProducts(12);
                toast.info("Search cleared");
              }}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* SORT */}

        <div className="shop-sort">
          <FaSortAmountDown />

          <select
            value={sortBy}
            onChange={handleSort}
          >
            <option value="default">
              Sort By
            </option>

            <option value="priceLow">
              Price: Low to High
            </option>

            <option value="priceHigh">
              Price: High to Low
            </option>

            <option value="rating">
              Highest Rating
            </option>

            <option value="name">
              Name: A-Z
            </option>
          </select>
        </div>
      </div>

      {/* ====================================================
          CONTENT
      ==================================================== */}

      <div className="shop-content">

        {/* ==================================================
            FILTER
        ================================================== */}

        <aside className="shop-filter">

          <FilterPanel
            selectedCategory={
              selectedCategory
            }
            setSelectedCategory={
              handleCategoryChange
            }

            priceRange={priceRange}
            setPriceRange={
              handlePriceChange
            }

            selectedRating={
              selectedRating
            }
            setSelectedRating={
              handleRatingChange
            }

            selectedBrand={selectedBrand}
            setSelectedBrand={
              handleBrandChange
            }

            brands={brands}

            onReset={resetFilters}

            activeFilterCount={
              activeFilterCount
            }
          />

        </aside>

        {/* ==================================================
            PRODUCTS
        ================================================== */}

        <main className="shop-products">

          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (
            <div className="loading-container">

              <div className="loader"></div>

              <h3>
                Loading Products...
              </h3>

            </div>
          )}

          {/* =================================================
              EMPTY PRODUCTS
          ================================================= */}

          {!loading &&
            filteredProducts.length === 0 && (
              <div className="empty-products">

                <div className="empty-icon">
                  🔍
                </div>

                <h2>
                  No Products Found
                </h2>

                <p>
                  Try changing your search
                  or filters.
                </p>

                <button
                  className="reset-empty-btn"
                  onClick={resetFilters}
                >
                  Clear Filters
                </button>

              </div>
            )}

          {/* =================================================
              PRODUCTS
          ================================================= */}

          {!loading &&
            filteredProducts.length > 0 && (
              <>

                <div className="products-grid">

                  {displayedProducts.map(
                    (product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        showWishlist={false}
                      />
                    )
                  )}

                </div>

                {/* =================================================
                    LOAD MORE
                ================================================= */}

                {visibleProducts <
                  filteredProducts.length && (
                    <div className="load-more">

                      <button
                        onClick={loadMore}
                      >
                        Load More Products
                      </button>

                    </div>
                  )}

              </>
            )}

        </main>
      </div>
    </div>
  );
};

export default Shop;