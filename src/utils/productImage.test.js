import {
  fallbackProductImage,
  getUniqueProductsByImage,
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

  test("uses distinct images for the concentrator and portable oxygen cylinder", () => {
    const concentrator = products.find(
      (product) => product.name === "Oxygen Concentrator"
    );
    const cylinder = products.find(
      (product) => product.name === "Portable Oxygen Cylinder"
    );

    expect(concentrator.image).not.toBe(cylinder.image);
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

  test("replaces a generic catalog image with the medicine's own image", () => {
    const azithralImage = products.find(
      (product) => product.name === "Azithral 500"
    ).image;

    expect(
      getProductImage(
        "/catalog/products/product1.png",
        "Azithral 500",
        "Medicines"
      )
    ).toBe(azithralImage);
  });

  test("replaces a generic uploaded image with the medicine's own image", () => {
    const azithralImage = products.find(
      (product) => product.name === "Azithral 500"
    ).image;

    expect(
      getProductImage(
        "/uploads/product1.png",
        "Azithral 500",
        "Medicines"
      )
    ).toBe(azithralImage);
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
      products.find((product) => product.name === "Azithral 500").image
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

    expect(getProductImage(imageUrl, "Unknown Product")).toBe(imageUrl);
  });

  test.each([
    ["Paracetamol 650 mg", "Medicines", "Dolo 650 Tablet"],
    ["Vitamin C 500 mg Tablets", "Vitamins", "Limcee Vitamin C"],
    ["Multivitamin Daily Tablets", "Vitamins", "Supradyn Daily"],
    ["Omega-3 Fish Oil", "Vitamins", "Omega-3 Fish Oil"],
  ])(
    "uses the right catalog image for %s instead of the stale database image",
    (name, category, catalogName) => {
      const expectedImage = products.find(
        (product) => product.name === catalogName
      ).image;

      expect(
        getProductImage(
          "/uploads/products/reused-paracetamol-image.png",
          name,
          category
        )
      ).toBe(expectedImage);
    }
  );

  test("removes repeated product names and images from a product grid", () => {
    const gridProducts = getUniqueProductsByImage([
      {
        id: 1,
        name: "Paracetamol 650 mg",
        category: "Medicines",
        image: "/uploads/reused.png",
      },
      {
        id: 2,
        name: "Vitamin C 500 mg Tablets",
        category: "Vitamins",
        image: "/uploads/reused.png",
      },
      {
        id: 3,
        name: "Dolo 650 Tablet",
        category: "Medicines",
        image: "/uploads/wrong.png",
      },
    ]);

    expect(gridProducts.map((product) => product.name)).toEqual([
      "Paracetamol 650 mg",
      "Vitamin C 500 mg Tablets",
    ]);
  });

  test("resolves backend media paths against the API origin", () => {
    expect(getProductImage("/uploads/product.png")).toBe(
      "http://127.0.0.1:8000/uploads/product.png"
    );
  });
});
