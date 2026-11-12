import React from "react";
import { Link } from "react-router-dom";
import "./EmptyState.css";

function EmptyState() {
    return (
        <div className="error-page">
            <h1>📦</h1>

            <h2>No Data Available</h2>

            <p>
                Nothing to display here.
            </p>

            <Link to="/shop" className="error-btn">
                Continue Shopping
            </Link>
        </div>
    );
}

export default EmptyState;