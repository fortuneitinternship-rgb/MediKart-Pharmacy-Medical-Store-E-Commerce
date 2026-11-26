
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

const getProductList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const CATEGORY_DATA = {
  medicines: getProductList(medicines),
  healthcare: getProductList(healthcare),
  vitamins: getProductList(vitamins),
  "personal-care": getProductList(personalCare),
  "baby-care": getProductList(babyCare),
  "medical-devices": getProductList(medicalDevices),
  "women-care": getProductList(womenCare),
  "hair-care": getProductList(hairCare),
  "eye-care": getProductList(eyeCare),
  "premium-healthcare": getProductList(premiumHealthcare),
};

const ALL_PRODUCTS = Object.values(CATEGORY_DATA).flat();

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

const normalizeCategory = (value) => {
  if (!value || !String(value).trim()) return "all";

  const key = String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const aliases = {
    all: "all",
    "all-products": "all",
    medicines: "medicines",
    medicine: "medicines",
    healthcare: "healthcare",
    vitamins: "vitamins",
    "vitamins-and-supplements": "vitamins",
    "vitamins-supplements": "vitamins",
    "personal-care": "personal-care",
    personalcare: "personal-care",
    "baby-care": "baby-care",
    babycare: "baby-care",
    "medical-devices": "medical-devices",
    medicaldevices: "medical-devices",
    "women-care": "women-care",
    womencare: "women-care",
    "hair-care": "hair-care",
    haircare: "hair-care",
    "eye-care": "eye-care",
    eyecare: "eye-care",
    "premium-healthcare": "premium-healthcare",
    premiumhealthcare: "premium-healthcare",
  };

  return aliases[key] || null;
};

const getPrice = (product) =>
  Number(
    product?.discountedPrice ??
    product?.discounted_price ??
    product?.salePrice ??
    product?.sale_price ??
    product?.price ??
    0
  );

const getCategoryName = (product) => {
  const category = product?.category;
  if (category && typeof category === "object") {
    return String(category.name ?? category.title ?? "");
  }
  return String(category ?? "");
};

const Shop = () => {
  const navigate = useNavigate();
  const { category } = useParams();

  const selectedCategory = normalizeCategory(category) || "all";

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [priceRange, setPriceRange] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [visibleProducts, setVisibleProducts] = useState(12);

  useEffect(() => {
    setSearchTerm("");
    setSortBy("default");
    setPriceRange("all");
    setSelectedRating("all");
    setSelectedBrand("all");
    setVisibleProducts(12);
  }, [selectedCategory]);

  const products = useMemo(() => {
    if (selectedCategory === "all") return ALL_PRODUCTS;
    return CATEGORY_DATA[selectedCategory] || [];
  }, [selectedCategory]);

  useEffect(() => {
    console.table(
      Object.entries(CATEGORY_DATA).map(([name, items]) => ({
        category: name,
        count: items.length,
      }))
    );
    console.log("Total products:", ALL_PRODUCTS.length);
    console.log("Selected category:", selectedCategory);
    console.log("Current products:", products.length);
  }, [selectedCategory, products]);

  const brands = useMemo(() => {
    const values = products
      .map((product) => product?.brand)
      .filter((brand) => typeof brand === "string" && brand.trim());

    return [...new Set(values)].sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchTerm.trim()) {
      const search = searchTerm.trim().toLowerCase();

      result = result.filter((product) =>
        String(product?.name ?? "").toLowerCase().includes(search) ||
        String(product?.brand ?? "").toLowerCase().includes(search) ||
        getCategoryName(product).toLowerCase().includes(search)
      );
    }

    if (priceRange !== "all") {
      result = result.filter((product) => {
        const price = getPrice(product);

        switch (priceRange) {
          case "0-199": return price >= 0 && price <= 199;
          case "200-499": return price >= 200 && price <= 499;
          case "500-999": return price >= 500 && price <= 999;
          case "1000-1999": return price >= 1000 && price <= 1999;
          case "2000": return price >= 2000;
          default: return true;
        }
      });
    }

    if (selectedRating !== "all") {
      result = result.filter(
        (product) => Number(product?.rating ?? 0) >= Number(selectedRating)
      );
    }

    if (selectedBrand !== "all") {
      result = result.filter(
        (product) =>
          String(product?.brand ?? "").toLowerCase() ===
          selectedBrand.toLowerCase()
      );
    }

    switch (sortBy) {
      case "priceLow":
        result.sort((a, b) => getPrice(a) - getPrice(b));
        break;
      case "priceHigh":
        result.sort((a, b) => getPrice(b) - getPrice(a));
        break;
      case "rating":
        result.sort((a, b) => Number(b.rating ?? 0) - Number(a.rating ?? 0));
        break;
      case "name":
        result.sort((a, b) =>
          String(a.name ?? "").localeCompare(String(b.name ?? ""))
        );
        break;
      default:
        break;
    }

    return result;
  }, [products, searchTerm, priceRange, selectedRating, selectedBrand, sortBy]);

  const displayedProducts = filteredProducts.slice(0, visibleProducts);

  const handleCategoryChange = (value) => {
    const nextCategory = normalizeCategory(value);

    if (
      !nextCategory ||
      (nextCategory !== "all" && !CATEGORY_DATA[nextCategory])
    ) {
      console.error("Unknown category:", value);
      toast.error("Category not found");
      return;
    }

    setSearchTerm("");
    setSortBy("default");
    setPriceRange("all");
    setSelectedRating("all");
    setSelectedBrand("all");
    setVisibleProducts(12);

    navigate(CATEGORY_URLS[nextCategory]);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSortBy("default");
    setPriceRange("all");
    setSelectedRating("all");
    setSelectedBrand("all");
    setVisibleProducts(12);
  };

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-title">
          <h1>{CATEGORY_NAMES[selectedCategory] || "All Products"}</h1>
          <span>{filteredProducts.length} Products</span>
        </div>

        <div className="shop-search">
          <FaSearch />
          <input
            type="text"
            placeholder="Search medicines, healthcare products..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setVisibleProducts(12);
            }}
          />
        </div>

        <div className="shop-sort">
          <FaSortAmountDown />
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setVisibleProducts(12);
            }}
          >
            <option value="default">Sort By</option>
            <option value="priceLow">Price: Low to High</option>
            <option value="priceHigh">Price: High to Low</option>
            <option value="rating">Highest Rating</option>
            <option value="name">Name: A-Z</option>
          </select>
        </div>
      </div>

      <div className="shop-content">
        <aside className="shop-filter">
          <FilterPanel
            selectedCategory={selectedCategory}
            setSelectedCategory={handleCategoryChange}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            selectedRating={selectedRating}
            setSelectedRating={setSelectedRating}
            selectedBrand={selectedBrand}
            setSelectedBrand={setSelectedBrand}
            brands={brands}
            onReset={resetFilters}
          />
        </aside>

        <main className="shop-products">
          {filteredProducts.length === 0 ? (
            <div className="empty-products">
              <div className="empty-icon">🔍</div>
              <h2>No Products Found</h2>
              <p>
                {products.length === 0
                  ? "No products are exported from this category data file."
                  : "Try changing your search or filters."}
              </p>
              <button
                type="button"
                className="reset-empty-btn"
                onClick={resetFilters}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="products-grid">
                {displayedProducts.map((product, index) => (
                  <ProductCard
                    key={`${product?.id ?? product?.name ?? "product"}-${index}`}
                    product={product}
                    showWishlist={false}
                  />
                ))}
              </div>

              {visibleProducts < filteredProducts.length && (
                <div className="load-more">
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleProducts((previous) =>
                        Math.min(previous + 12, filteredProducts.length)
                      )
                    }
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
