import {
  fallbackProductImage,
  getProductImage,
  handleProductImageError,
} from "./productImage";
import products from "../data/products";

describe("getProductImage", () => {
  test("maps every bundled shop catalog product to its own image", () => {
    products.forEach((product) => {
      expect(
        getProductImage(null, product.name, product.category)
      ).toBe(product.image);
    });
  });

  test("uses a fallback for an empty image value", () => {
    expect(getProductImage("")).toBe(fallbackProductImage);
  });

  test("uses a matching catalog image when a product image is missing", () => {
    const catalogImage = products.find(
      (product) => product.name === "Crocin Advance"
    ).image;

    expect(getProductImage("", "Crocin Advance 500 mg")).toBe(catalogImage);
  });

  test.each([
    ["Baby Powder 400 g", "Baby Care"],
    ["Blood Pressure Monitor", "Medical Devices"],
  ])("uses the matching bundled image for %s", (name, category) => {
    const expectedProduct = products.find(
      (product) =>
        product.category === category &&
        name.toLowerCase().startsWith(product.name.toLowerCase())
    );

    expect(getProductImage("", name, category)).toBe(expectedProduct.image);
  });

  test("replaces the promotional banner with a matching medicine image", () => {
    const catalogImage = products.find(
      (product) => product.name === "Electral ORS"
    ).image;

    expect(
      getProductImage("/uploads/Mediction.png", "ORS Electral Powder")
    ).toBe(catalogImage);
  });

  test("does not show the liquid image for the tablet product", () => {
    expect(getProductImage("/uploads/azithral.png", "Azithral 500")).toBe(
      fallbackProductImage
    );
  });

  test("uses a matching catalog image when a requested image fails", () => {
    const catalogImage = products.find(
      (product) => product.name === "Cetirizine 10mg"
    ).image;
    const event = {
      currentTarget: {
        getAttribute: () => "broken-image.png",
        src: "broken-image.png",
      },
    };

    handleProductImageError(event, "Cetirizine 10 mg");

    expect(event.currentTarget.src).toBe(catalogImage);
  });

  test("preserves remote image URLs", () => {
    const imageUrl = "https://cdn.example.com/product.png";

    expect(getProductImage(imageUrl, "Crocin Advance")).toBe(imageUrl);
  });

  test("resolves backend media paths against the API origin", () => {
    expect(getProductImage("/uploads/product.png")).toBe(
      "http://127.0.0.1:8000/uploads/product.png"
    );
  });
});
