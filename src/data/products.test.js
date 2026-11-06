import products from "./products";

describe("MEDIKART Products", () => {
  test("products should be an array", () => {
    expect(Array.isArray(products)).toBe(true);
  });

  test("products should not be empty", () => {
    expect(products.length).toBeGreaterThan(0);
  });

  test("every product should have an id", () => {
    products.forEach((product) => {
      expect(product.id).toBeDefined();
    });
  });

  test("every product should have a name", () => {
    products.forEach((product) => {
      expect(product.name).toBeDefined();
      expect(typeof product.name).toBe("string");
    });
  });

  test("every product should have a price", () => {
    products.forEach((product) => {
      expect(product.price).toBeDefined();
      expect(typeof product.price).toBe("number");
    });
  });

  test("product IDs should be unique", () => {
    const ids = products.map((product) => product.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(ids.length);
  });

  test("products should have valid prices", () => {
    products.forEach((product) => {
      expect(product.price).toBeGreaterThanOrEqual(0);
    });
  });

  test("products should have categories", () => {
    products.forEach((product) => {
      expect(product.category).toBeDefined();
    });
  });
});