import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import FlashSale from "./FlashSale";
import flashSaleProducts from "../data/flashSaleProducts";

// Mock CSS module
jest.mock("./FlashSale.module.css", () => ({
  flashSale: "flashSale",
  header: "header",
  titleSection: "titleSection",
  timer: "timer",
  timeBox: "timeBox",
  productGrid: "productGrid",
  productCard: "productCard",
  imageWrapper: "imageWrapper",
  productImage: "productImage",
  cardContent: "cardContent",
  brand: "brand",
  rating: "rating",
  priceSection: "priceSection",
  originalPrice: "originalPrice",
  discountedPrice: "discountedPrice",
  buttonGroup: "buttonGroup",
  viewBtn: "viewBtn",
  cartBtn: "cartBtn",
  added: "added",
}));

// Mock react-toastify
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
  },
}));

// Mock images so Jest does not need real image files
jest.mock("../data/flashSaleProducts", () => [
  {
    id: 9001,
    name: "Dolo 650",
    brand: "Micro Labs",
    category: "Medicines",
    originalPrice: 199,
    price: 149,
    rating: 4.8,
    image: "/images/dolo650.png",
  },
  {
    id: 9002,
    name: "Vitamin C Tablets",
    brand: "Limcee",
    category: "Vitamins",
    originalPrice: 299,
    price: 249,
    rating: 4.7,
    image: "/images/vitamin-c.png",
  },
  {
    id: 9003,
    name: "Hand Sanitizer",
    brand: "Dettol",
    category: "Healthcare",
    originalPrice: 179,
    price: 129,
    rating: 4.6,
    image: "/images/sanitizer.png",
  },
  {
    id: 9004,
    name: "Digital Thermometer",
    brand: "Dr Trust",
    category: "Medical Devices",
    originalPrice: 249,
    price: 149,
    rating: 4.9,
    image: "/images/thermometer.png",
  },
]);

const renderComponent = () => {
  return render(
    <MemoryRouter>
      <FlashSale />
    </MemoryRouter>
  );
};

const getProductCard = (productName) => {
  const heading = screen.getByRole("heading", {
    name: productName,
    level: 3,
  });

  return heading.closest(".productCard");
};

describe("FlashSale", () => {
  beforeEach(() => {
    localStorage.clear();

    jest.clearAllMocks();

    jest.useFakeTimers();

    // Reset localStorage before every test
    localStorage.setItem("cart", JSON.stringify([]));
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  // =========================================================
  // BASIC RENDERING
  // =========================================================

  test("renders Flash Sale heading", () => {
    renderComponent();

    expect(
      screen.getByRole("heading", {
        name: /flash sale/i,
      })
    ).toBeInTheDocument();
  });

  test("renders Limited Time Deals text", () => {
    renderComponent();

    expect(
      screen.getByText("Limited Time Deals")
    ).toBeInTheDocument();
  });

  // =========================================================
  // TIMER
  // =========================================================

  test("renders the flash sale timer", () => {
    renderComponent();

    expect(
      screen.getByText("Hours")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Minutes")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Seconds")
    ).toBeInTheDocument();

    // There are TWO "00" elements:
    // Minutes and Seconds.
    // Therefore getAllByText must be used.
    const zeroValues = screen.getAllByText("00");

    expect(zeroValues.length).toBeGreaterThanOrEqual(2);
  });

  test("starts timer at 24 hours", () => {
    renderComponent();

    expect(
      screen.getByText("24", {
        selector: "span",
      })
    ).toBeInTheDocument();
  });

  test("updates timer after one second", () => {
    renderComponent();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(
      screen.getByText("Hours")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Minutes")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Seconds")
    ).toBeInTheDocument();
  });

  // =========================================================
  // PRODUCTS
  // =========================================================

  test("renders all flash sale products", () => {
    renderComponent();

    flashSaleProducts.forEach((product) => {
      expect(
        screen.getByRole("heading", {
          name: product.name,
          level: 3,
        })
      ).toBeInTheDocument();
    });
  });

  test("renders product brands", () => {
    renderComponent();

    flashSaleProducts.forEach((product) => {
      expect(
        screen.getByText(product.brand)
      ).toBeInTheDocument();
    });
  });

  test("renders product ratings", () => {
    renderComponent();

    flashSaleProducts.forEach((product) => {
      expect(
        screen.getByText(
          new RegExp(String(product.rating))
        )
      ).toBeInTheDocument();
    });
  });

  test("renders product original and discounted prices", () => {
    renderComponent();

    flashSaleProducts.forEach((product) => {
      const card = getProductCard(product.name);

      expect(card).toBeInTheDocument();

      // IMPORTANT:
      // Do NOT use screen.getByText() globally because
      // multiple products can have the same price.
      expect(
        card.querySelector(".originalPrice")
      ).toHaveTextContent(`₹${product.originalPrice}`);

      expect(
        card.querySelector(".discountedPrice")
      ).toHaveTextContent(`₹${product.price}`);
    });
  });

  test("renders product images with correct alt text", () => {
    renderComponent();

    flashSaleProducts.forEach((product) => {
      expect(
        screen.getByRole("img", {
          name: product.name,
        })
      ).toBeInTheDocument();
    });
  });

  // =========================================================
  // VIEW DETAILS LINKS
  // =========================================================

  test("renders View Details link for every product", () => {
    renderComponent();

    flashSaleProducts.forEach((product) => {
      const card = getProductCard(product.name);

      const link = card.querySelector(".viewBtn");

      expect(link).toBeInTheDocument();

      expect(link).toHaveAttribute(
        "href",
        `/product/${product.id}`
      );

      expect(link).toHaveTextContent("View Details");
    });
  });

  test("Digital Thermometer has correct View Details link", () => {
    renderComponent();

    const card = getProductCard(
      "Digital Thermometer"
    );

    expect(card).toBeInTheDocument();

    const link = card.querySelector(".viewBtn");

    expect(link).toHaveAttribute(
      "href",
      "/product/9004"
    );
  });

  // =========================================================
  // ADD TO CART
  // =========================================================

  test("adds Digital Thermometer to cart", () => {
    renderComponent();

    const card = getProductCard(
      "Digital Thermometer"
    );

    expect(card).toBeInTheDocument();

    const button = card.querySelector(".cartBtn");

    expect(button).toBeInTheDocument();

    expect(button).toHaveTextContent(
      "Add to Cart"
    );

    fireEvent.click(button);

    const cart = JSON.parse(
      localStorage.getItem("cart")
    );

    expect(cart).toHaveLength(1);

    expect(cart[0].name).toBe(
      "Digital Thermometer"
    );

    expect(cart[0].id).toBe(9004);

    expect(cart[0].quantity).toBe(1);

    expect(cart[0].price).toBe(149);
  });

  test("adds Dolo 650 to cart", () => {
    renderComponent();

    const card = getProductCard("Dolo 650");

    expect(card).toBeInTheDocument();

    const button = card.querySelector(".cartBtn");

    fireEvent.click(button);

    const cart = JSON.parse(
      localStorage.getItem("cart")
    );

    expect(cart).toHaveLength(1);

    expect(cart[0].name).toBe("Dolo 650");
    expect(cart[0].id).toBe(9001);
    expect(cart[0].quantity).toBe(1);
  });

  test("increases quantity when same product is added twice", () => {
    renderComponent();

    const card = getProductCard(
      "Digital Thermometer"
    );

    const button = card.querySelector(".cartBtn");

    fireEvent.click(button);

    // After first click the button changes to ✓ Added,
    // but the same button can still be clicked.
    fireEvent.click(button);

    const cart = JSON.parse(
      localStorage.getItem("cart")
    );

    expect(cart).toHaveLength(1);

    expect(cart[0].name).toBe(
      "Digital Thermometer"
    );

    expect(cart[0].quantity).toBe(2);
  });

  // =========================================================
  // BUTTON STATE
  // =========================================================

  test("changes button text to Added after clicking", () => {
    renderComponent();

    const card = getProductCard(
      "Digital Thermometer"
    );

    const button = card.querySelector("button");

    fireEvent.click(button);

    expect(button).toHaveTextContent("✓ Added");
  });

  test("changes button back to Add to Cart after 2 seconds", () => {
    renderComponent();

    const card = getProductCard(
      "Digital Thermometer"
    );

    const button = card.querySelector("button");

    fireEvent.click(button);

    expect(button).toHaveTextContent("✓ Added");

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(button).toHaveTextContent(
      "Add to Cart"
    );
  });

  // =========================================================
  // TOAST
  // =========================================================

  test("shows success toast when product is added", () => {
    const { toast } = require("react-toastify");

    renderComponent();

    const card = getProductCard(
      "Digital Thermometer"
    );

    const button = card.querySelector("button");

    fireEvent.click(button);

    expect(
      toast.success
    ).toHaveBeenCalledWith(
      "Digital Thermometer added to cart!",
      expect.objectContaining({
        position: "top-right",
        autoClose: 2000,
        theme: "colored",
      })
    );
  });

  // =========================================================
  // CART UPDATED EVENT
  // =========================================================

  test("dispatches cartUpdated event", () => {
    const eventHandler = jest.fn();

    window.addEventListener(
      "cartUpdated",
      eventHandler
    );

    renderComponent();

    const card = getProductCard(
      "Digital Thermometer"
    );

    const button = card.querySelector("button");

    fireEvent.click(button);

    expect(eventHandler).toHaveBeenCalledTimes(1);

    window.removeEventListener(
      "cartUpdated",
      eventHandler
    );
  });

  // =========================================================
  // EXISTING CART
  // =========================================================

  test("increases existing product quantity", () => {
    localStorage.setItem(
      "cart",
      JSON.stringify([
        {
          id: 9004,
          name: "Digital Thermometer",
          price: 149,
          quantity: 2,
        },
      ])
    );

    renderComponent();

    const card = getProductCard(
      "Digital Thermometer"
    );

    const button = card.querySelector("button");

    fireEvent.click(button);

    const cart = JSON.parse(
      localStorage.getItem("cart")
    );

    expect(cart).toHaveLength(1);

    expect(cart[0].id).toBe(9004);

    expect(cart[0].quantity).toBe(3);
  });

  // =========================================================
  // IMAGE
  // =========================================================

  test("renders Digital Thermometer image", () => {
    renderComponent();

    const image = screen.getByRole("img", {
      name: "Digital Thermometer",
    });

    expect(image).toBeInTheDocument();

    expect(image).toHaveAttribute(
      "src",
      "/images/thermometer.png"
    );
  });
});