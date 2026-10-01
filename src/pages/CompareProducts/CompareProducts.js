import React from "react";
import "./CompareProducts.css";

const products = [
    {
        id: 1,
        name: "Paracetamol Tablets",
        brand: "Micro Labs",
        price: 96,
        rating: 4.8,
        stock: "In Stock",
        category: "Tablets",
    },
    {
        id: 2,
        name: "Vitamin D Capsules",
        brand: "HealthVit",
        price: 559,
        rating: 4.7,
        stock: "In Stock",
        category: "Supplements",
    },
    {
        id: 3,
        name: "Blood Pressure Monitor",
        brand: "Omron",
        price: 1874,
        rating: 4.9,
        stock: "In Stock",
        category: "Medical Device",
    },
];

function CompareProducts() {
    return (
        <div className="compare-container">

            <div className="compare-header">
                <h1>Compare Products</h1>
                <p>
                    Compare product specifications and choose the
                    best one for your healthcare needs.
                </p>
            </div>

            <div className="compare-table">

                <table>

                    <thead>
                        <tr>
                            <th>Feature</th>

                            {products.map((product) => (
                                <th key={product.id}>
                                    {product.name}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>

                        <tr>
                            <td>Brand</td>

                            {products.map((product) => (
                                <td key={product.id}>
                                    {product.brand}
                                </td>
                            ))}
                        </tr>

                        <tr>
                            <td>Category</td>

                            {products.map((product) => (
                                <td key={product.id}>
                                    {product.category}
                                </td>
                            ))}
                        </tr>

                        <tr>
                            <td>Price</td>

                            {products.map((product) => (
                                <td key={product.id}>
                                    ₹{product.price}
                                </td>
                            ))}
                        </tr>

                        <tr>
                            <td>Rating</td>

                            {products.map((product) => (
                                <td key={product.id}>
                                    ⭐ {product.rating}
                                </td>
                            ))}
                        </tr>

                        <tr>
                            <td>Availability</td>

                            {products.map((product) => (
                                <td key={product.id}>
                                    {product.stock}
                                </td>
                            ))}
                        </tr>

                        <tr>
                            <td>Action</td>

                            {products.map((product) => (
                                <td key={product.id}>
                                    <button>
                                        Buy Now
                                    </button>
                                </td>
                            ))}
                        </tr>

                    </tbody>

                </table>

            </div>

        </div>
    );
}

export default CompareProducts;