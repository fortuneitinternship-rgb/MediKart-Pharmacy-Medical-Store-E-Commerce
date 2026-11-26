
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaSearch, FaSortAmountDown } from "react-icons/fa";
import { toast } from "react-toastify";

import ProductCard from "../../components/ProductCard/ProductCard";
import FilterPanel from "../../components/FilterPanel/FilterPanel";
import { getProducts } from "../../api/productApi";

import "./Shop.css";

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
   CATEGORY URLS
============================================================ */

const CATEGORY_URLS = {
  all: "/shop",
  medicines: "/shop/medicines",
  healthcare: "/shop/healthcare",
  vitamins: "/shop/vitamins",
  "personal-care": "/shop/personal-care",
  "baby-care": "/shop/baby-care",
  "medical-devices": "/shop/medical-devices",
  "women-care": "/shop/womencare",
  "hair-care": "/shop/haircare",
  "eye-care": "/shop/eyecare",
  "premium-healthcare": "/shop/premiumhealthcare",
};

/* ============================================================
   CATEGORY NORMALIZATION
============================================================ */

const normalizeCategory = (value) => {
  if (!value) return "";

  return String(
    typeof value === "object"
      ? value.name || value.title || ""
      : value
  )
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

const CATEGORY_ALIASES = {
  all: "all",
  "all-products": "all",

  medicine: "medicines",
  medicines: "medicines",

  healthcare: "healthcare",

  vitamin: "vitamins",
  vitamins: "vitamins",
  "vitamins-and-supplements": "vitamins",
  "vitamins-supplements": "vitamins",

  personalcare: "personal-care",
  "personal-care": "personal-care",

  babycare: "baby-care",
  "baby-care": "baby-care",

  medicaldevices: "medical-devices",
  "medical-devices": "medical-devices",

  womencare: "women-care",
  "womens-health": "women-care",
  "women-health": "women-care",
  "women-care": "women-care",

  haircare: "hair-care",
  "hair-care": "hair-care",

  eyecare: "eye-care",
  "eye-care": "eye-care",

  premiumhealthcare: "premium-healthcare",
  "premium-healthcare": "premium-healthcare",
};

const resolveCategory = (value) => {
  const normalized = normalizeCategory(value);

  return CATEGORY_ALIASES[normalized] || normalized;
};

/* ============================================================
   PRODUCT HELPERS
============================================================ */

const getProductList = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.products)) {
    return response.products;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  return [];
};

const getProductCategory = (product) => {
  return resolveCategory(product?.category);
};

const getProductPrice = (product) => {
  return Number(
    product?.discount_price ??
    product?.discountedPrice ??
    product?.discounted_price ??
    product?.price ??
    0
  );
};

const getProductRating = (product) => {
  return Number(product?.rating ?? 0);
};

/* ============================================================
   SHOP COMPONENT
============================================================ */

const Shop = () => {
  const navigate = useNavigate();
  const { category } = useParams();

  /* ==========================================================
     STATES
  ========================================================== */

  const [products, setProducts] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("default");

  const [priceRange, setPriceRange] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");

  const [visibleProducts, setVisibleProducts] = useState(12);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  /* ==========================================================
     SELECTED CATEGORY FROM URL
  ========================================================== */

  const selectedCategory = category
    ? resolveCategory(category)
    : "all";

  const selectedCategoryName =
    CATEGORY_NAMES[selectedCategory] ||
    (selectedCategory === "all"
      ? CATEGORY_NAMES.all
      : category || "All Products");

  /* ==========================================================
     LOAD PRODUCTS
  ========================================================== */

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      try {
        setLoading(true);
        setLoadError("");

        const response = await getProducts();

        const items = getProductList(response);

        if (!active) return;

        // IMPORTANT:
        // Do not remove products based on duplicate images.
        // Two different products can share the same image.
        setProducts(items);

        console.log("Total API products:", items.length);

        console.table(
          items.reduce((counts, product) => {
            const name =
              getProductCategory(product) || "uncategorized";

            counts[name] = (counts[name] || 0) + 1;

            return counts;
          }, {})
        );
      } catch (error) {
        console.error("Unable to load products:", error);

        if (active) {
          setLoadError(
            "Products could not be loaded from the database."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      active = false;
    };
  }, []);

  /* ==========================================================
     RESET FILTERS WHEN URL CATEGORY CHANGES
  ========================================================== */

  useEffect(() => {
    setPriceRange("all");
    setSelectedRating("all");
    setSelectedBrand("all");
    setSearchTerm("");
    setSortBy("default");
    setVisibleProducts(12);
  }, [selectedCategory]);

  /* ==========================================================
     CATEGORY LIST
  ========================================================== */

  const categories = useMemo(() => {
    return [
      { value: "all", label: "All Products" },
      { value: "medicines", label: "Medicines" },
      { value: "healthcare", label: "Healthcare" },
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
        value: "women-care",
        label: "Women's Health",
      },
      {
        value: "hair-care",
        label: "Hair Care",
      },
      {
        value: "eye-care",
        label: "Eye Care",
      },
      {
        value: "premium-healthcare",
        label: "Premium Healthcare",
      },
    ];
  }, []);

  /* ==========================================================
     BRANDS
  ========================================================== */

  const brands = useMemo(() => {
    const brandList = products
      .map((product) => product?.brand)
      .filter(
        (brand) =>
          typeof brand === "string" &&
          brand.trim() !== ""
      );

    return [...new Set(brandList)].sort((a, b) =>
      a.localeCompare(b)
    );
  }, [products]);

  /* ==========================================================
     CATEGORY PRODUCTS
  ========================================================== */

  const categoryProducts = useMemo(() => {
    if (selectedCategory === "all") {
      return products;
    }

    return products.filter((product) => {
      return (
        getProductCategory(product) === selectedCategory
      );
    });
  }, [products, selectedCategory]);

  /* ==========================================================
     FILTER PRODUCTS
  ========================================================== */

  const filteredProducts = useMemo(() => {
    let result = [...categoryProducts];

    /* SEARCH */

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();

      result = result.filter((product) => {
        const name = String(product?.name || "").toLowerCase();

        const brand = String(product?.brand || "").toLowerCase();

        const productCategory = String(
          product?.category?.name ??
          product?.category?.title ??
          product?.category ??
          ""
        ).toLowerCase();

        return (
          name.includes(search) ||
          brand.includes(search) ||
          productCategory.includes(search)
        );
      });
    }

    /* PRICE */

    if (priceRange !== "all") {
      result = result.filter((product) => {
        const price = getProductPrice(product);

        switch (priceRange) {
          case "0-199":
            return price >= 0 && price <= 199;

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

    /* RATING */

    if (selectedRating !== "all") {
      result = result.filter(
        (product) =>
          getProductRating(product) >= Number(selectedRating)
      );
    }

    /* BRAND */

    if (selectedBrand !== "all") {
      result = result.filter(
        (product) =>
          String(product?.brand || "").toLowerCase() ===
          selectedBrand.toLowerCase()
      );
    }

    /* SORT */

    switch (sortBy) {
      case "priceLow":
        result.sort(
          (a, b) => getProductPrice(a) - getProductPrice(b)
        );
        break;

      case "priceHigh":
        result.sort(
          (a, b) => getProductPrice(b) - getProductPrice(a)
        );
        break;

      case "rating":
        result.sort(
          (a, b) => getProductRating(b) - getProductRating(a)
        );
        break;

      case "name":
        result.sort((a, b) =>
          String(a?.name || "").localeCompare(
            String(b?.name || "")
          )
        );
        break;

      default:
        break;
    }

    return result;
  }, [
    categoryProducts,
    searchTerm,
    priceRange,
    selectedRating,
    selectedBrand,
    sortBy,
  ]);

  /* ==========================================================
     DISPLAY PRODUCTS
  ========================================================== */

  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleProducts);
  }, [filteredProducts, visibleProducts]);

  /* ==========================================================
     CATEGORY CHANGE
  ========================================================== */

  const handleCategoryChange = (value) => {
    const selected = resolveCategory(value);

    if (!CATEGORY_URLS[selected]) {
      console.error("Invalid category:", value);
      toast.error("Category not found");
      return;
    }

    setSearchTerm("");
    setPriceRange("all");
    setSelectedRating("all");
    setSelectedBrand("all");
    setSortBy("default");
    setVisibleProducts(12);

    // Update browser URL.
    navigate(CATEGORY_URLS[selected]);
  };

  /* ==========================================================
     SEARCH
  ========================================================== */

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setVisibleProducts(12);
  };

  /* ==========================================================
     SORT
  ========================================================== */

  const handleSort = (event) => {
    const value = event.target.value;

    setSortBy(value);
    setVisibleProducts(12);

    const messages = {
      priceLow: "Sorted by Price: Low to High",
      priceHigh: "Sorted by Price: High to Low",
      rating: "Sorted by Highest Rating",
      name: "Sorted by Name: A-Z",
    };

    if (messages[value]) {
      toast.info(messages[value]);
    }
  };

  /* ==========================================================
     PRICE FILTER
  ========================================================== */

  const handlePriceChange = (value) => {
    setPriceRange(value);
    setVisibleProducts(12);
  };

  /* ==========================================================
     RATING FILTER
  ========================================================== */

  const handleRatingChange = (value) => {
    setSelectedRating(value);
    setVisibleProducts(12);
  };

  /* ==========================================================
     BRAND FILTER
  ========================================================== */

  const handleBrandChange = (value) => {
    setSelectedBrand(value);
    setVisibleProducts(12);
  };

  /* ==========================================================
     LOAD MORE
  ========================================================== */

  const loadMore = () => {
    setVisibleProducts((previous) =>
      Math.min(previous + 12, filteredProducts.length)
    );
  };

  const showAllProducts = () => {
    setVisibleProducts(filteredProducts.length);
  };

  /* ==========================================================
     RESET FILTERS
  ========================================================== */

  const resetFilters = () => {
    setPriceRange("all");
    setSelectedRating("all");
    setSelectedBrand("all");
    setSearchTerm("");
    setSortBy("default");
    setVisibleProducts(12);

    toast.success("Filters cleared successfully");
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
     RENDER
  ========================================================== */

  return (
    <div className="shop-page">

      {/* HEADER */}

      <div className="shop-header">

        <div className="shop-title">
          <h1>{selectedCategoryName}</h1>

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
              aria-label="Clear search"
              onClick={() => setSearchTerm("")}
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
            <option value="default">Sort By</option>
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

      {/* SHOP CONTENT */}

      <div className="shop-content">

        {/* FILTER PANEL */}

        <aside className="shop-filter">

          <FilterPanel
            selectedCategory={selectedCategory}
            setSelectedCategory={handleCategoryChange}

            priceRange={priceRange}
            setPriceRange={handlePriceChange}

            selectedRating={selectedRating}
            setSelectedRating={handleRatingChange}

            selectedBrand={selectedBrand}
            setSelectedBrand={handleBrandChange}

            brands={brands}
            categories={categories}

            onReset={resetFilters}

            activeFilterCount={activeFilterCount}
          />

        </aside>

        {/* PRODUCTS SECTION */}

        <main className="shop-products">

          {/* LOADING */}

          {loading && (
            <div className="loading-container">
              <div className="loader"></div>
              <h3>Loading Products...</h3>
            </div>
          )}

          {/* ERROR */}

          {!loading && loadError && (
            <div className="empty-products">
              <h2>Unable to Load Products</h2>
              <p>{loadError}</p>

              <button
                onClick={() => window.location.reload()}
                className="reset-empty-btn"
              >
                Try Again
              </button>
            </div>
          )}

          {/* NO PRODUCTS */}

          {!loading &&
            !loadError &&
            filteredProducts.length === 0 && (
              <div className="empty-products">

                <div className="empty-icon">🔍</div>

                <h2>No Products Found</h2>

                <p>
                  {categoryProducts.length === 0
                    ? `No products found in ${selectedCategoryName}. Check the category values returned by your API.`
                    : "Try changing your search or filters."}
                </p>

                <button
                  type="button"
                  className="reset-empty-btn"
                  onClick={resetFilters}
                >
                  Clear Filters
                </button>

                {categoryProducts.length === 0 && (
                  <button
                    type="button"
                    onClick={() => navigate("/shop")}
                  >
                    View All Products
                  </button>
                )}

              </div>
            )}

          {/* PRODUCT GRID */}

          {!loading &&
            !loadError &&
            filteredProducts.length > 0 && (
              <>

                <div className="products-grid">

                  {displayedProducts.map((product, index) => (
                    <ProductCard
                      key={
                        product.id ??
                        product.product_id ??
                        `${product.name}-${index}`
                      }
                      product={product}
                      showWishlist={false}
                    />
                  ))}

                </div>

                {/* LOAD MORE */}

                {visibleProducts < filteredProducts.length && (
                  <div className="load-more">

                    <button
                      type="button"
                      onClick={loadMore}
                    >
                      Load More Products
                    </button>

                    <button
                      type="button"
                      onClick={showAllProducts}
                    >
                      Show All Products
                    </button>

                  </div>
                )}

                {/* ALL PRODUCTS LOADED */}

                {visibleProducts >= filteredProducts.length && (
                  <div className="all-products-loaded">
                    <p>
                      Showing all {filteredProducts.length} products.
                    </p>
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
