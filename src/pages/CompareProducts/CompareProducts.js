import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../../api/productApi";
import "./CompareProducts.css";

function CompareProducts() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        getProducts()
            .then((catalog) => {
                if (active) {
                    setProducts(catalog.slice(0, 3));
                }
            })
            .catch((requestError) => {
                console.error("Unable to load products for comparison:", requestError);
                if (active) {
                    setError("Products could not be loaded from the database.");
                }
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, []);

    const buyNow = (product) => {
        const price = Number(
            product.discount_price ??
            product.discounted_price ??
            product.price
        );

        navigate("/checkout", {
            state: {
                buyNowItems: [
                    {
                        product_id: Number(product.id),
                        name: product.name,
                        category: product.category,
                        image: product.image || product.image_url || "",
                        price,
                        discountedPrice: price,
                        quantity: 1,
                    },
                ],
            },
        });
    };

    return (
        <div className="compare-container">
            <div className="compare-header">
                <h1>Compare Products</h1>
                <p>
                    Compare product specifications and choose the
                    best one for your healthcare needs.
                </p>
            </div>

            {loading && <p role="status">Loading products...</p>}
            {!loading && error && <p role="alert">{error}</p>}
            {!loading && !error && products.length === 0 && (
                <p>No products are available to compare.</p>
            )}

            {!loading && !error && products.length > 0 && (
                <div className="compare-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Feature</th>
                                {products.map((product) => (
                                    <th key={product.id}>{product.name}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Brand</td>
                                {products.map((product) => (
                                    <td key={product.id}>{product.brand || "N/A"}</td>
                                ))}
                            </tr>
                            <tr>
                                <td>Category</td>
                                {products.map((product) => (
                                    <td key={product.id}>{product.category || "N/A"}</td>
                                ))}
                            </tr>
                            <tr>
                                <td>Price</td>
                                {products.map((product) => (
                                    <td key={product.id}>
                                        ₹{Number(
                                            product.discount_price ??
                                            product.discounted_price ??
                                            product.price ??
                                            0
                                        ).toLocaleString("en-IN")}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td>Rating</td>
                                {products.map((product) => (
                                    <td key={product.id}>⭐ {product.rating ?? "N/A"}</td>
                                ))}
                            </tr>
                            <tr>
                                <td>Availability</td>
                                {products.map((product) => (
                                    <td key={product.id}>
                                        {Number(product.stock) > 0 ? "In Stock" : "Out of Stock"}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td>Action</td>
                                {products.map((product) => (
                                    <td key={product.id}>
                                        <button
                                            type="button"
                                            disabled={Number(product.stock) <= 0}
                                            onClick={() => buyNow(product)}
                                        >
                                            Buy Now
                                        </button>
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default CompareProducts;
