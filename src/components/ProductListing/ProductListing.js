import { useEffect, useState } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import ProductCard from "../ProductCard/ProductCard";
import productsData from "../../data/products";
import SortDropdown from "../SortDropdown/SortDropdown";
import styles from "./ProductListing.module.css";

const ProductListing = ({ sortBy = "", setSortBy = () => { } }) => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [visible, setVisible] = useState(4);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setTimeout(() => {
      setProducts(productsData);
      setLoading(false);
    }, 1200);
  }, []);

  // Filter products by name or category
  const filteredProducts = products.filter((product) => {
    const keyword = searchTerm.toLowerCase();

    return (
      product.name.toLowerCase().includes(keyword) ||
      product.category.toLowerCase().includes(keyword)
    );
  });

  // Apply sorting based on `sortBy` prop
  const sortedProducts = (() => {
    const list = [...filteredProducts];
    switch (sortBy) {
      case "priceLowHigh":
        return list.sort((a, b) => a.price - b.price);
      case "priceHighLow":
        return list.sort((a, b) => b.price - a.price);
      case "nameAZ":
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case "nameZA":
        return list.sort((a, b) => b.name.localeCompare(a.name));
      case "rating":
        return list.sort((a, b) => b.rating - a.rating);
      case "newest":
        return list.sort((a, b) => b.id - a.id);
      default:
        return list;
    }
  })();

  const clearSearch = () => {
    setSearchTerm("");
    setVisible(4);
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        Loading Products...
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className={styles.empty}>
        No Products Available
      </div>
    );
  }

  return (
    <section className={styles.container}>

      {/* Heading and Search Bar */}
      <div className={styles.topBar}>
        <div className={styles.leftControls}>
          <SortDropdown sortBy={sortBy} setSortBy={setSortBy} />
        </div>

        <h2>Our Products</h2>

        <div className={styles.rightControls}>
          <div className={styles.searchBox}>
            <FaSearch className={styles.searchIcon} />

            <input
              type="text"
              placeholder="Search products or categories..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setVisible(4);
              }}
            />

            {searchTerm && (
              <FaTimes
                className={styles.clearIcon}
                onClick={clearSearch}
              />
            )}
          </div>
        </div>
      </div>

      {/* Products */}
      {filteredProducts.length > 0 ? (
        <>
          <div className={styles.grid}>
            {sortedProducts
              .slice(0, visible)
              .map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={(p) =>
                    console.log("Add to cart", p.id)
                  }
                />
              ))}
          </div>

          {visible < filteredProducts.length && (
            <div className={styles.center}>
              <button
                className={styles.load}
                onClick={() => setVisible((prev) => prev + 4)}
              >
                Load More
              </button>
            </div>
          )}
        </>
      ) : (
        <div className={styles.empty}>
          <h3>No Products Found</h3>
          <p>Try another search keyword.</p>
        </div>
      )}
    </section>
  );
};

export default ProductListing;