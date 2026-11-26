
import React, { useState } from "react";

import {
  getProductImage,
  handleProductImageError,
  getUniqueProductsByImage,
  fallbackProductImage,
} from "../utils/productImage";

function ProductImageTest() {
  const [results, setResults] = useState([]);

  const products = [
    {
      name: "Electral",
      category: "Healthcare",
      image: "/images/electral.png",
    },
    {
      name: "Paracetamol 650 mg",
      category: "Medicines",
      image: "/images/paracetamol.png",
    },
    {
      name: "Vitamin C 500 mg",
      category: "Vitamins",
      image: "/images/vitamin-c.png",
    },
    {
      name: "Multivitamin Daily",
      category: "Vitamins",
      image: "/images/multivitamin.png",
    },
    {
      name: "Unknown Product",
      category: "Healthcare",
      image: "",
    },
    {
      name: "Promotional Image",
      category: "Healthcare",
      image: "/assets/Mediction.png",
    },
    {
      name: "Generic Image",
      category: "Healthcare",
      image: "/assets/product1.png",
    },
    {
      name: "External Product",
      category: "Healthcare",
      image: "https://example.com/product.png",
    },
  ];

  const runTests = () => {
    const testResults = [];

    const check = (testName, condition) => {
      testResults.push({
        name: testName,
        status: condition ? "PASS" : "FAIL",
      });
    };

    // Test 1: Fallback image
    check(
      "Fallback image is available",
      Boolean(fallbackProductImage)
    );

    // Test 2: Missing image
    check(
      "Missing image returns fallback",
      getProductImage(null, "Unknown Product") === fallbackProductImage
    );

    // Test 3: Empty image
    check(
      "Empty image returns fallback",
      getProductImage("", "Unknown Product") === fallbackProductImage
    );

    // Test 4: Electral alias
    check(
      "Electral catalog image is found",
      Boolean(getProductImage("", "Electral"))
    );

    // Test 5: Paracetamol alias
    check(
      "Paracetamol 650 catalog image is found",
      Boolean(getProductImage("", "Paracetamol 650 mg"))
    );

    // Test 6: Vitamin C alias
    check(
      "Vitamin C 500 catalog image is found",
      Boolean(getProductImage("", "Vitamin C 500 mg"))
    );

    // Test 7: Multivitamin alias
    check(
      "Multivitamin Daily catalog image is found",
      Boolean(getProductImage("", "Multivitamin Daily"))
    );

    // Test 8: Promotional banner
    check(
      "Promotional banner returns fallback",
      getProductImage(
        "/assets/Mediction.png",
        "Unknown Product"
      ) === fallbackProductImage
    );

    // Test 9: Generic image
    check(
      "Generic product image returns fallback",
      getProductImage(
        "/assets/product1.png",
        "Unknown Product"
      ) === fallbackProductImage
    );

    // Test 10: External image URL
    const externalUrl = "https://example.com/product.png";

    check(
      "External image URL is preserved",
      getProductImage(externalUrl, "Unknown Product") === externalUrl
    );

    // Test 11: Data URL
    const dataUrl = "data:image/png;base64,abc123";

    check(
      "Data image URL is preserved",
      getProductImage(dataUrl, "Unknown Product") === dataUrl
    );

    // Test 12: Blob URL
    const blobUrl = "blob:http://localhost/test-image";

    check(
      "Blob image URL is preserved",
      getProductImage(blobUrl, "Unknown Product") === blobUrl
    );

    // Test 13: API uploads path
    const uploadResult = getProductImage(
      "/uploads/product.png",
      "Unknown Product"
    );

    check(
      "Upload image gets API base URL",
      uploadResult.includes("/uploads/product.png")
    );

    // Test 14: Windows path
    check(
      "Windows path separators are normalized",
      getProductImage(
        "C:\\images\\product.png",
        "Unknown Product"
      ) === "C:/images/product.png"
    );

    // Test 15: Unique products
    const duplicateProducts = [
      {
        name: "Product A",
        image: "https://example.com/shared.png",
      },
      {
        name: "Product B",
        image: "https://example.com/shared.png",
      },
    ];

    check(
      "Duplicate product images are removed",
      getUniqueProductsByImage(duplicateProducts).length === 1
    );

    // Test 16: Duplicate names
    const duplicateNames = [
      {
        name: "Paracetamol",
        image: "https://example.com/para1.png",
      },
      {
        name: "Paracetamol",
        image: "https://example.com/para2.png",
      },
    ];

    check(
      "Duplicate product names are removed",
      getUniqueProductsByImage(duplicateNames).length === 1
    );

    // Test 17: Unique images
    const uniqueProducts = [
      {
        name: "Product A",
        image: "https://example.com/a.png",
      },
      {
        name: "Product B",
        image: "https://example.com/b.png",
      },
    ];

    check(
      "Unique products are retained",
      getUniqueProductsByImage(uniqueProducts).length === 2
    );

    setResults(testResults);
  };

  const passed = results.filter(
    (result) => result.status === "PASS"
  ).length;

  const failed = results.filter(
    (result) => result.status === "FAIL"
  ).length;

  return (
    <div style={styles.container}>
      <h2>Product Image Testing</h2>

      <button onClick={runTests} style={styles.button}>
        Run All Tests
      </button>

      {results.length > 0 && (
        <>
          <div style={styles.summary}>
            <p>Total Tests: {results.length}</p>
            <p style={{ color: "green" }}>Passed: {passed}</p>
            <p style={{ color: "red" }}>Failed: {failed}</p>
          </div>

          {results.map((result, index) => (
            <div key={index} style={styles.result}>
              <span>{index + 1}. {result.name}</span>

              <strong
                style={{
                  color:
                    result.status === "PASS" ? "green" : "red",
                }}
              >
                {result.status}
              </strong>
            </div>
          ))}
        </>
      )}

      <h3>Product Image Preview</h3>

      <div style={styles.grid}>
        {products.map((product, index) => {
          const image = getProductImage(
            product.image,
            product.name,
            product.category
          );

          return (
            <div style={styles.card} key={index}>
              <img
                src={image}
                alt={product.name}
                onError={(event) =>
                  handleProductImageError(
                    event,
                    product.name,
                    product.category
                  )
                }
                style={styles.image}
              />

              <h4>{product.name}</h4>
              <p>{product.category}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "25px",
    fontFamily: "Arial, sans-serif",
  },
  button: {
    padding: "12px 25px",
    background: "#087bdb",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  summary: {
    display: "flex",
    gap: "25px",
    flexWrap: "wrap",
    margin: "20px 0",
    fontWeight: "bold",
  },
  result: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px",
    borderBottom: "1px solid #ddd",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "20px",
    marginTop: "20px",
  },
  card: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "15px",
    textAlign: "center",
  },
  image: {
    width: "130px",
    height: "130px",
    objectFit: "contain",
  },
};

export default ProductImageTest;
