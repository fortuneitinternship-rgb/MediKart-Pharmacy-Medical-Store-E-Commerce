import React from "react";
import "./ProductSpecifications.css";

function ProductSpecifications({ product }) {
  const specs = [
    { label: "Product Name",   value: product.name },
    { label: "Brand",          value: product.brand },
    { label: "Pack Size",      value: product.packSize },
    { label: "Expiry Date",    value: product.expiry },
    { label: "Availability",   value: product.stock ? "In Stock" : "Out of Stock" },
    { label: "Delivery Time",  value: product.delivery },
    { label: "Return Policy",  value: product.returnPolicy },
  ];

  return (
    <div className="specifications">
      <h2>Product Specifications</h2>

      <div className="spec-list">
        {specs.map((item) => (
          <div className="spec-item" key={item.label}>
            <span className="spec-label">{item.label}</span>
            <span className="spec-value">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductSpecifications;