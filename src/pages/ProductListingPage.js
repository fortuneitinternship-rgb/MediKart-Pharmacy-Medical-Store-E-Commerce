import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import SearchBar from "../components/SearchBar/SearchBar";
import ProductCard from "../components/ProductCard/ProductCard";
import products from "../data/products";
import "./ProductListingPage.css";

const categorySlugMap = {
  medicines: ["medicine", "medicines", "tablets", "tablet"],
  vitamins: ["vitamin", "vitamins", "supplement", "supplements"],
  "personal-care": ["personal care", "personal-care", "skincare", "face wash"],
  "baby-care": ["baby", "baby care"],
  "medical-devices": ["device", "devices", "monitor", "thermometer"],
  healthcare: ["healthcare", "medical"],
  "premium-healthcare": ["premium", "premium healthcare"],
  "hair-care": ["hair", "hair care"]
};

const matchesCategory = (product, selectedCategory) => {
  if (!selectedCategory) return true;

  const keywords = categorySlugMap[selectedCategory] || [selectedCategory];
  const haystack = [product.category, product.name, product.description]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return keywords.some((keyword) => haystack.includes(keyword.toLowerCase()));
};

const ProductListing = () => {
  const { category } = useParams();
  const [search, setSearch] = useState("");

  const normalizedCategory = category
    ? category.toLowerCase().replace(/-/g, " ").trim()
    : "";

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const keywordMatch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase());

      const categoryMatch = matchesCategory(item, category?.toLowerCase());

      return keywordMatch && categoryMatch;
    });
  }, [search, category]);

  return (
    <div className="container">
      <h1>
        {normalizedCategory
          ? `Category: ${normalizedCategory}`
          : "MediKart Products"}
      </h1>

      <SearchBar
        searchTerm={search}
        setSearchTerm={setSearch}
      />

      <div className="grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))
        ) : (
          <div className="no-products">
            <h2>No Products Found</h2>
            <p>Try another keyword.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductListing;