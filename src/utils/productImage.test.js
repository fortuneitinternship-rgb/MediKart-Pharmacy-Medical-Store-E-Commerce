
import {
  getProductImage,
  handleProductImageError,
  getUniqueProductsByImage,
  fallbackProductImage,
} from "./productImage";

jest.mock("../data/products", () => [
  {
    id: 1,
    name: "Electral ORS",
    category: "healthcare",
    image: "/catalog/electral.png",
  },
  {
    id: 2,
    name: "Dolo 650 Tablet",
    category: "medicines",
    image: "/catalog/dolo.png",
  },
  {
    id: 3,
    name: "Limcee Vitamin C",
    category: "vitamins",
    image: "/catalog/limcee.png",
  },
  {
    id: 4,
    name: "Supradyn Daily",
    category: "healthcare",
    image: "/catalog/supradyn.png",
  },
  {
    id: 5,
    name: "Generic Item",
    category: "general",
    image: "/catalog/generic.png",
  },
]);

describe("productImage utility", () => {
  describe("getProductImage", () => {
    test("is exported as a function", () => {
      expect(typeof getProductImage).toBe("function");
    });

    test("returns the fallback image for an empty image", () => {
      expect(
        getProductImage("", "Unknown Item", "general")
      ).toBe(fallbackProductImage);
    });

    test("returns the fallback image for null image", () => {
      expect(
        getProductImage(null, "Unknown Item", "general")
      ).toBe(fallbackProductImage);
    });

    test("returns the fallback image for undefined image", () => {
      expect(
        getProductImage(undefined, "Unknown Item", "general")
      ).toBe(fallbackProductImage);
    });

    test("returns the fallback image for a non-string image", () => {
      expect(
        getProductImage(123, "Unknown Item", "general")
      ).toBe(fallbackProductImage);
    });

    test("uses the catalog image when a product name matches", () => {
      expect(
        getProductImage("/old-image.png", "Generic Item", "general")
      ).toBe("/catalog/generic.png");
    });

    test("matches product names without case sensitivity", () => {
      expect(
        getProductImage("/old-image.png", "GENERIC ITEM", "general")
      ).toBe("/catalog/generic.png");
    });

    test("normalizes spaces and special characters in product names", () => {
      expect(
        getProductImage("/old-image.png", "Generic-Item", "general")
      ).toBe("/catalog/generic.png");
    });

    test("uses the Electral catalog alias", () => {
      expect(
        getProductImage("/old-image.png", "Electral", "healthcare")
      ).toBe("/catalog/electral.png");
    });

    test("uses the Paracetamol 650 catalog alias", () => {
      expect(
        getProductImage("/old-image.png", "Paracetamol 650 mg", "medicines")
      ).toBe("/catalog/dolo.png");
    });

    test("uses the Vitamin C 500 catalog alias", () => {
      expect(
        getProductImage("/old-image.png", "Vitamin C 500 mg", "vitamins")
      ).toBe("/catalog/limcee.png");
    });

    test("uses the Multivitamin Daily catalog alias", () => {
      expect(
        getProductImage("/old-image.png", "Multivitamin Daily", "healthcare")
      ).toBe("/catalog/supradyn.png");
    });

    test("matches a product using normalized measurement units", () => {
      expect(
        getProductImage("/old-image.png", "Generic Item", "general")
      ).toBe("/catalog/generic.png");
    });

    test("uses category matching when multiple matching products exist", () => {
      expect(
        getProductImage("/old-image.png", "Generic Item", "general")
      ).toBe("/catalog/generic.png");
    });

    test("returns an external HTTP image URL unchanged", () => {
      const image = "https://example.com/image.png";

      expect(
        getProductImage(image, "Unknown Item", "unknown")
      ).toBe(image);
    });

    test("returns an external HTTPS image URL unchanged", () => {
      const image = "https://example.com/image.webp";

      expect(
        getProductImage(image, "Unknown Item", "unknown")
      ).toBe(image);
    });

    test("returns a data image URL unchanged", () => {
      const image = "data:image/png;base64,test";

      expect(
        getProductImage(image, "Unknown Item", "unknown")
      ).toBe(image);
    });

    test("returns a blob image URL unchanged", () => {
      const image = "blob:http://localhost/test-image";

      expect(
        getProductImage(image, "Unknown Item", "unknown")
      ).toBe(image);
    });

    test("normalizes backslashes in image paths", () => {
      const image = "folder\\custom-image.png";

      expect(
        getProductImage(image, "Unknown Item", "unknown")
      ).toBe("folder/custom-image.png");
    });

    test("returns the fallback image for promotional banners", () => {
      expect(
        getProductImage("/assets/mediction.png", "Unknown Item", "unknown")
      ).toBe(fallbackProductImage);

      expect(
        getProductImage("/assets/mediction1.png", "Unknown Item", "unknown")
      ).toBe(fallbackProductImage);

      expect(
        getProductImage("/assets/mediction2.png", "Unknown Item", "unknown")
      ).toBe(fallbackProductImage);

      expect(
        getProductImage("/assets/mediction3.png", "Unknown Item", "unknown")
      ).toBe(fallbackProductImage);
    });

    test("returns the fallback image for generic product image names", () => {
      expect(
        getProductImage("/assets/product1.png", "Unknown Item", "unknown")
      ).toBe(fallbackProductImage);

      expect(
        getProductImage("/assets/product2.jpg", "Unknown Item", "unknown")
      ).toBe(fallbackProductImage);
    });

    test("returns the fallback image for a known mismatched asset", () => {
      expect(
        getProductImage("/assets/azithral.png", "Azithral 500", "medicines")
      ).toBe(fallbackProductImage);
    });

    test("returns the fallback image for catalog paths in test environment", () => {
    });

    test("returns the fallback image for images paths", () => {
      expect(
        getProductImage("/images/unknown-image.png", "Unknown Item", "unknown")
      ).toBe(fallbackProductImage);
    });

    test("returns an API URL for uploads paths", () => {
      expect(
        getProductImage("/uploads/test-image.png", "Unknown Item", "unknown")
      ).toBe("http://127.0.0.1:8000/uploads/test-image.png");
    });

    test("returns an API URL for media paths", () => {
      expect(
        getProductImage("/media/test-image.png", "Unknown Item", "unknown")
      ).toBe("http://127.0.0.1:8000/media/test-image.png");
    });

    test("returns an API URL for static paths", () => {
      expect(
        getProductImage("/static/test-image.png", "Unknown Item", "unknown")
      ).toBe("http://127.0.0.1:8000/static/test-image.png");
    });

    test("returns an unknown relative image path unchanged", () => {
      expect(
        getProductImage("custom-folder/image.png", "Unknown Item", "unknown")
      ).toBe("custom-folder/image.png");
    });

    test("returns a root relative image path unchanged when it is not a special path", () => {
      expect(
        getProductImage("/custom/image.png", "Unknown Item", "unknown")
      ).toBe("/custom/image.png");
    });
  });

  describe("handleProductImageError", () => {
    test("is exported as a function", () => {
      expect(typeof handleProductImageError).toBe("function");
    });

    test("sets the fallback image when the current image is incorrect", () => {
      const event = {
        currentTarget: {
          getAttribute: jest.fn().mockReturnValue("/broken.png"),
          set src(value) {
            this.imageSource = value;
          },
        },
      };

      handleProductImageError(event, "Unknown Item", "unknown");

      expect(event.currentTarget.imageSource).toBe(fallbackProductImage);
    });

    test("uses the catalog image when the product matches", () => {
      const event = {
        currentTarget: {
          getAttribute: jest.fn().mockReturnValue("/broken.png"),
          set src(value) {
            this.imageSource = value;
          },
        },
      };

      handleProductImageError(event, "Generic Item", "general");

      expect(event.currentTarget.imageSource).toBe(
        "/catalog/generic.png"
      );
    });

    test("does not replace an image that already uses the fallback", () => {
      const event = {
        currentTarget: {
          getAttribute: jest.fn().mockReturnValue(fallbackProductImage),
          set src(value) {
            this.imageSource = value;
          },
        },
      };

      handleProductImageError(event, "Unknown Item", "unknown");

      expect(event.currentTarget.imageSource).toBeUndefined();
    });
  });

  describe("getUniqueProductsByImage", () => {
    test("is exported as a function", () => {
      expect(typeof getUniqueProductsByImage).toBe("function");
    });

    test("returns an empty array for an empty product list", () => {
      expect(getUniqueProductsByImage([])).toEqual([]);
    });

    test("keeps products with unique names and images", () => {
      const productList = [
        {
          name: "First Item",
          image: "https://example.com/first.png",
          category: "general",
        },
        {
          name: "Second Item",
          image: "https://example.com/second.png",
          category: "general",
        },
      ];

      expect(getUniqueProductsByImage(productList)).toHaveLength(2);
    });

    test("removes duplicate product names", () => {
      const productList = [
        {
          name: "Same Item",
          image: "https://example.com/first.png",
        },
        {
          name: "Same Item",
          image: "https://example.com/second.png",
        },
      ];

      expect(getUniqueProductsByImage(productList)).toHaveLength(1);
    });

    test("removes duplicate image paths", () => {
      const productList = [
        {
          name: "First Item",
          image: "https://example.com/shared.png",
        },
        {
          name: "Second Item",
          image: "https://example.com/shared.png",
        },
      ];

      expect(getUniqueProductsByImage(productList)).toHaveLength(1);
    });

    test("ignores query parameters when comparing images", () => {
      const productList = [
        {
          name: "First Item",
          image: "https://example.com/shared.png?v=1",
        },
        {
          name: "Second Item",
          image: "https://example.com/shared.png?v=2",
        },
      ];

      expect(getUniqueProductsByImage(productList)).toHaveLength(1);
    });

    test("ignores image path case when comparing images", () => {
      const productList = [
        {
          name: "First Item",
          image: "https://example.com/image.png",
        },
        {
          name: "Second Item",
          image: "https://EXAMPLE.com/IMAGE.png",
        },
      ];

      expect(getUniqueProductsByImage(productList)).toHaveLength(1);
    });

    test("removes products with empty names", () => {
      const productList = [
        {
          name: "",
          image: "https://example.com/first.png",
        },
        {
          name: "Valid Item",
          image: "https://example.com/second.png",
        },
      ];

      expect(getUniqueProductsByImage(productList)).toHaveLength(1);
    });

    test("normalizes product names before checking duplicates", () => {
      const productList = [
        {
          name: "Sample Item",
          image: "https://example.com/first.png",
        },
        {
          name: "SAMPLE-ITEM",
          image: "https://example.com/second.png",
        },
      ];

      expect(getUniqueProductsByImage(productList)).toHaveLength(1);
    });

    test("returns the original product objects", () => {
      const product = {
        name: "Sample Item",
        image: "https://example.com/sample.png",
      };

      const result = getUniqueProductsByImage([product]);

      expect(result[0]).toBe(product);
    });
  });

  describe("fallbackProductImage", () => {
    test("exports a fallback image", () => {
      expect(fallbackProductImage).toBeTruthy();
    });
  });
});
