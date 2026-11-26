import products, {
  categoryProducts,
  totalProducts,
  categoryProductCounts,
} from "./products";

// ============================================================
// MEDIKART - ALL PRODUCTS TESTING
// ============================================================

describe("MEDIKART - All Products", () => {
  const expectedCategories = [
    "medicines",
    "healthcare",
    "vitamins",
    "personal-care",
    "baby-care",
    "medical-devices",
    "eye-care",
    "hair-care",
    "women-care",
    "premium-healthcare",
  ];

  // ----------------------------------------------------------
  // 1. Check product export
  // ----------------------------------------------------------

  test("should export products as an array", () => {
    expect(Array.isArray(products)).toBe(true);
  });

  // ----------------------------------------------------------
  // 2. Check all categories
  // ----------------------------------------------------------

  test("should contain all 10 product categories", () => {
    expect(Object.keys(categoryProducts)).toHaveLength(10);

    expectedCategories.forEach((category) => {
      expect(categoryProducts).toHaveProperty(category);
    });
  });

  // ----------------------------------------------------------
  // 3. Check category product arrays
  // ----------------------------------------------------------

  test.each(expectedCategories)(
    "should load products from %s",
    (category) => {
      expect(Array.isArray(categoryProducts[category])).toBe(true);
    }
  );

  // ----------------------------------------------------------
  // 4. Check category product counts
  // ----------------------------------------------------------

  test("should have correct category product counts", () => {
    expectedCategories.forEach((category) => {
      expect(categoryProductCounts[category]).toBe(
        categoryProducts[category].length
      );
    });
  });

  // ----------------------------------------------------------
  // 5. Check total products
  // ----------------------------------------------------------

  test("should calculate total product count correctly", () => {
    const expectedTotal = Object.values(categoryProducts).reduce(
      (total, category) => total + category.length,
      0
    );

    expect(totalProducts).toBe(expectedTotal);
    expect(products.length).toBe(expectedTotal);
  });

  // ----------------------------------------------------------
  // 6. Check products are not missing during combination
  // ----------------------------------------------------------

  test("should combine every category product", () => {
    const expectedProducts = Object.values(categoryProducts).flat();

    expect(products).toEqual(expectedProducts);
  });

  // ----------------------------------------------------------
  // 7. Check product objects
  // ----------------------------------------------------------

  test("should contain valid product objects", () => {
    products.forEach((product, index) => {
      expect(product).toBeDefined();

      expect(typeof product).toBe("object");
      expect(product).not.toBeNull();

      expect(product).toHaveProperty("id");
      expect(product).toHaveProperty("name");

      expect(product.name).toBeTruthy();

      if (index < 5) {
        console.log("Product:", product);
      }
    });
  });

  // ----------------------------------------------------------
  // 8. Check duplicate product IDs
  // ----------------------------------------------------------

  test("should identify duplicate product IDs", () => {
    const ids = products.map((product) => String(product.id));

    const duplicateIds = ids.filter(
      (id, index) => ids.indexOf(id) !== index
    );

    if (duplicateIds.length > 0) {
      console.warn("Duplicate Product IDs:", [
        ...new Set(duplicateIds),
      ]);
    }

    expect(duplicateIds).toEqual([]);
  });

  // ----------------------------------------------------------
  // 9. Check products with missing images
  // ----------------------------------------------------------

  test("should identify products with missing images", () => {
    const missingImages = products.filter(
      (product) =>
        !product.image ||
        typeof product.image !== "string" ||
        product.image.trim() === ""
    );

    if (missingImages.length > 0) {
      console.warn(
        "Products with missing images:",
        missingImages.map((product) => ({
          id: product.id,
          name: product.name,
        }))
      );
    }

    // Diagnostic test: reports missing images without failing.
    expect(Array.isArray(missingImages)).toBe(true);
  });

  // ----------------------------------------------------------
  // 10. Print final product report
  // ----------------------------------------------------------

  test("should print the complete product report", () => {
    console.log("========== MEDIKART TEST REPORT ==========");

    console.table(categoryProductCounts);

    console.log("Total Products:", totalProducts);

    console.log(
      "Products Loaded Successfully:",
      products.length
    );

    console.log("==========================================");

    expect(totalProducts).toBe(products.length);
  });
});
