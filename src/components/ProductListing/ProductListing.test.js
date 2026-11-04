
import { useEffect, useMemo, useState } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";

import ProductCard from "../ProductCard/ProductCard";
import SortDropdown from "../SortDropdown/SortDropdown";
import { getProducts } from "../../api/productApi";

import styles from "./ProductListing.module.css";

const INITIAL_VISIBLE = 4;
const LOAD_MORE_COUNT = 4;

const safeText = (value) =>
    typeof value === "string" ? value.toLowerCase().trim() : "";

const safeNumber = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
};

const sortProducts = (products, sortBy) => {
    const list = [...products];

    switch (sortBy) {
        case "priceLowHigh":
            return list.sort(
                (a, b) => safeNumber(a.price) - safeNumber(b.price)
            );

        case "priceHighLow":
            return list.sort(
                (a, b) => safeNumber(b.price) - safeNumber(a.price)
            );

        case "nameAZ":
            return list.sort((a, b) =>
                safeText(a.name).localeCompare(safeText(b.name))
            );

        case "nameZA":
            return list.sort((a, b) =>
                safeText(b.name).localeCompare(safeText(a.name))
            );

        case "rating":
            return list.sort(
                (a, b) => safeNumber(b.rating) - safeNumber(a.rating)
            );

        case "newest":
            return list.sort(
                (a, b) => safeNumber(b.id) - safeNumber(a.id)
            );

        default:
            return list;
    }
};

const ProductListing = ({
    sortBy = "",
    setSortBy = () => {},
}) => {
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [visible, setVisible] = useState(INITIAL_VISIBLE);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;

        const loadProducts = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await getProducts();

                if (isMounted) {
                    setProducts(
                        Array.isArray(response) ? response : []
                    );
                }
            } catch (loadError) {
                console.error(
                    "Unable to load products:",
                    loadError
                );

                if (isMounted) {
                    setProducts([]);
                    setError(
                        "Products could not be loaded from the database."
                    );
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadProducts();

        return () => {
            isMounted = false;
        };
    }, []);

    const filteredProducts = useMemo(() => {
        const keyword = safeText(searchTerm);

        return products.filter((product) => {
            const name = safeText(product.name);
            const category = safeText(product.category);

            return (
                !keyword ||
                name.includes(keyword) ||
                category.includes(keyword)
            );
        });
    }, [products, searchTerm]);

    const sortedProducts = useMemo(
        () => sortProducts(filteredProducts, sortBy),
        [filteredProducts, sortBy]
    );

    const clearSearch = () => {
        setSearchTerm("");
        setVisible(INITIAL_VISIBLE);
    };

    const handleSearch = (value) => {
        setSearchTerm(value);
        setVisible(INITIAL_VISIBLE);
    };

    if (loading) {
        return (
            <div className={styles.loading} role="status">
                Loading Products...
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.empty} role="alert">
                {error}
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
            <div className={styles.topBar}>
                <div className={styles.leftControls}>
                    <SortDropdown
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                    />
                </div>

                <h2>Our Products</h2>

                <div className={styles.rightControls}>
                    <div className={styles.searchBox}>
                        <FaSearch
                            className={styles.searchIcon}
                            aria-hidden="true"
                        />

                        <input
                            type="text"
                            aria-label="Search products"
                            placeholder="Search products or categories..."
                            value={searchTerm}
                            onChange={(event) =>
                                handleSearch(event.target.value)
                            }
                        />

                        {searchTerm && (
                            <button
                                type="button"
                                className={styles.clearIcon}
                                aria-label="Clear search"
                                onClick={clearSearch}
                            >
                                <FaTimes aria-hidden="true" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {filteredProducts.length > 0 ? (
                <>
                    <div className={styles.grid}>
                        {sortedProducts
                            .slice(0, visible)
                            .map((product, index) => (
                                <ProductCard
                                    key={product.id ?? index}
                                    product={product}
                                />
                            ))}
                    </div>

                    {visible < sortedProducts.length && (
                        <div className={styles.center}>
                            <button
                                type="button"
                                className={styles.load}
                                onClick={() =>
                                    setVisible(
                                        (previous) =>
                                            previous + LOAD_MORE_COUNT
                                    )
                                }
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
