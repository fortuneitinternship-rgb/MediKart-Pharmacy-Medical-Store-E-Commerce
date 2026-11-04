
import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";

import FlashSale from "../FlashSale";

import { addProductToCart } from "../../api/cartApi";
import { getFlashSaleProducts } from "../../api/productApi";

import {
  getProductImage,
  handleProductImageError,
} from "../../utils/productImage";

import { toast } from "react-toastify";

// ---------------------------------------------
// MOCK API
// ---------------------------------------------

jest.mock("../../api/cartApi", () => ({
  addProductToCart: jest.fn(),
}));

jest.mock("../../api/productApi", () => ({
  getFlashSaleProducts: jest.fn(),
}));

// ---------------------------------------------
// MOCK IMAGE UTILITIES
// ---------------------------------------------

jest.mock("../../utils/productImage", () => ({
  getProductImage: jest.fn(),
  handleProductImageError: jest.fn(),
}));

// ---------------------------------------------
// MOCK TOAST
// ---------------------------------------------

jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// ---------------------------------------------
// MOCK CSS MODULE
// ---------------------------------------------

jest.mock("../FlashSale.module.css", () => ({
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

// ---------------------------------------------
// SYNTHETIC TEST DATA
// ---------------------------------------------

const mockProducts = [
  {
    id: 90001,
    name: "Synthetic Item Alpha",
    brand: "Synthetic Brand A",
    category: "category-alpha",
    image: "synthetic-image-alpha",
    price: 500,
    discount_price: 400,
    rating: 4.5,
  },
  {
    id: 90002,
    name: "Synthetic Item Beta",
    brand: "Synthetic Brand B",
    category: "category-beta",
    image: "synthetic-image-beta",
    price: 300,
    discount_price: 250,
    rating: 4.0,
  },
];

// ---------------------------------------------
// RENDER HELPER
// ---------------------------------------------

const renderComponent = () =>
  render(
    <MemoryRouter>
      <FlashSale />
    </MemoryRouter>
  );

// =============================================
// FLASH SALE TESTS
// =============================================

describe("FlashSale Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    getFlashSaleProducts.mockResolvedValue(mockProducts);

    addProductToCart.mockResolvedValue({
      success: true,
    });

    getProductImage.mockReturnValue(
      "/synthetic-image.png"
    );

    handleProductImageError.mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  // -------------------------------------------
  // 1. BASIC RENDERING
  // -------------------------------------------

  test("renders Flash Sale heading", () => {
    renderComponent();

    expect(
      screen.getByRole("heading", {
        name: /flash sale/i,
      })
    ).toBeInTheDocument();
  });

  test("renders limited time deals text", () => {
    renderComponent();

    expect(
      screen.getByText(/limited time deals/i)
    ).toBeInTheDocument();
  });

  test("renders countdown timer labels", () => {
    renderComponent();

    expect(screen.getByText("Hours")).toBeInTheDocument();
    expect(screen.getByText("Minutes")).toBeInTheDocument();
    expect(screen.getByText("Seconds")).toBeInTheDocument();
  });

  test("renders initial countdown values", () => {
    renderComponent();

    expect(screen.getByText("24")).toBeInTheDocument();
    expect(screen.getAllByText("00")).toHaveLength(2);
  });

  // -------------------------------------------
  // 2. API TESTS
  // -------------------------------------------

  test("calls getFlashSaleProducts API", () => {
    renderComponent();

    expect(getFlashSaleProducts).toHaveBeenCalledTimes(1);
  });

  test("displays products returned by the API", async () => {
    renderComponent();

    expect(
      await screen.findByText("Synthetic Item Alpha")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Synthetic Item Beta")
    ).toBeInTheDocument();
  });

  test("displays product brand", async () => {
    renderComponent();

    expect(
      await screen.findByText("Synthetic Brand A")
    ).toBeInTheDocument();
  });

  test("displays product rating", async () => {
    renderComponent();

    expect(
      await screen.findByText("⭐ 4.5")
    ).toBeInTheDocument();
  });

  test("displays original and discounted prices", async () => {
    renderComponent();

    await screen.findByText("Synthetic Item Alpha");

    expect(screen.getByText("₹500")).toBeInTheDocument();
    expect(screen.getByText("₹400")).toBeInTheDocument();
  });

  test("uses original price when discount price is missing", async () => {
    getFlashSaleProducts.mockResolvedValue([
      {
        id: 90003,
        name: "Synthetic Item Gamma",
        brand: "Synthetic Brand C",
        category: "category-gamma",
        image: "synthetic-image-gamma",
        price: 600,
        rating: 3.5,
      },
    ]);

    renderComponent();

    await screen.findByText("Synthetic Item Gamma");

    expect(screen.getByText("₹600")).toBeInTheDocument();
  });

  test("handles an empty API response", async () => {
    getFlashSaleProducts.mockResolvedValue([]);

    const { container } = renderComponent();

    await waitFor(() => {
      expect(getFlashSaleProducts).toHaveBeenCalledTimes(1);
    });

    expect(
      container.querySelectorAll(".productCard")
    ).toHaveLength(0);
  });

  // -------------------------------------------
  // 3. IMAGE TESTS
  // -------------------------------------------

  test("calls getProductImage with product details", async () => {
    renderComponent();

    await screen.findByText("Synthetic Item Alpha");

    expect(getProductImage).toHaveBeenCalledWith(
      "synthetic-image-alpha",
      "Synthetic Item Alpha",
      "category-alpha"
    );
  });

  test("renders product images with alt text", async () => {
    renderComponent();

    expect(
      await screen.findByAltText("Synthetic Item Alpha")
    ).toBeInTheDocument();

    expect(
      screen.getByAltText("Synthetic Item Beta")
    ).toBeInTheDocument();
  });

  test("calls image error handler when image fails", async () => {
    renderComponent();

    const image = await screen.findByAltText(
      "Synthetic Item Alpha"
    );

    fireEvent.error(image);

    expect(handleProductImageError).toHaveBeenCalledWith(
      expect.any(Object),
      "Synthetic Item Alpha",
      "category-alpha"
    );
  });

  // -------------------------------------------
  // 4. NAVIGATION TESTS
  // -------------------------------------------

  test("renders View Details links", async () => {
    renderComponent();

    await screen.findByText("Synthetic Item Alpha");

    expect(
      screen.getAllByRole("link", {
        name: /view details/i,
      })
    ).toHaveLength(2);
  });

  test("uses the correct product detail URLs", async () => {
    renderComponent();

    await screen.findByText("Synthetic Item Alpha");

    const links = screen.getAllByRole("link", {
      name: /view details/i,
    });

    expect(links[0]).toHaveAttribute(
      "href",
      "/product/90001"
    );

    expect(links[1]).toHaveAttribute(
      "href",
      "/product/90002"
    );
  });

  // -------------------------------------------
  // 5. ADD TO CART TESTS
  // -------------------------------------------

  test("renders Add to Cart buttons", async () => {
    renderComponent();

    await screen.findByText("Synthetic Item Alpha");

    expect(
      screen.getAllByRole("button", {
        name: /add to cart/i,
      })
    ).toHaveLength(2);
  });

  test("calls addProductToCart with selected product", async () => {
    renderComponent();

    await screen.findByText("Synthetic Item Alpha");

    fireEvent.click(
      screen.getAllByRole("button", {
        name: /add to cart/i,
      })[0]
    );

    await waitFor(() => {
      expect(addProductToCart).toHaveBeenCalledWith(
        mockProducts[0]
      );
    });
  });

  test("shows success toast after adding to cart", async () => {
    renderComponent();

    await screen.findByText("Synthetic Item Alpha");

    fireEvent.click(
      screen.getAllByRole("button", {
        name: /add to cart/i,
      })[0]
    );

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Synthetic Item Alpha added to cart!",
        expect.objectContaining({
          position: "top-right",
          autoClose: 2000,
          theme: "colored",
        })
      );
    });
  });

  test("changes button text after successful cart addition", async () => {
    renderComponent();

    await screen.findByText("Synthetic Item Alpha");

    fireEvent.click(
      screen.getAllByRole("button", {
        name: /add to cart/i,
      })[0]
    );

    expect(
      await screen.findByRole("button", {
        name: /added/i,
      })
    ).toBeInTheDocument();
  });

  test("shows error toast when adding to cart fails", async () => {
    addProductToCart.mockRejectedValue(
      new Error("Synthetic cart failure")
    );

    renderComponent();

    await screen.findByText("Synthetic Item Alpha");

    fireEvent.click(
      screen.getAllByRole("button", {
        name: /add to cart/i,
      })[0]
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Synthetic cart failure"
      );
    });
  });

  test("shows fallback error when error message is missing", async () => {
    addProductToCart.mockRejectedValue({});

    renderComponent();

    await screen.findByText("Synthetic Item Alpha");

    fireEvent.click(
      screen.getAllByRole("button", {
        name: /add to cart/i,
      })[0]
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Unable to add this product to your cart."
      );
    });
  });

  // -------------------------------------------
  // 6. BUTTON RESET TIMER
  // -------------------------------------------

  test("resets button text after two seconds", async () => {
    jest.useFakeTimers();

    renderComponent();

    await act(async () => {
      await Promise.resolve();
    });

    const button = screen.getAllByRole("button", {
      name: /add to cart/i,
    })[0];

    await act(async () => {
      fireEvent.click(button);
      await Promise.resolve();
    });

    expect(button).toHaveTextContent("✓ Added");

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    expect(button).toHaveTextContent("Add to Cart");
  });

  // -------------------------------------------
  // 7. COUNTDOWN TIMER
  // -------------------------------------------

  test("updates countdown after one second", async () => {
    jest.useFakeTimers();

    renderComponent();

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText("23")).toBeInTheDocument();
    expect(screen.getByText("59")).toBeInTheDocument();
  });

  // -------------------------------------------
  // 8. API ERROR HANDLING
  // -------------------------------------------

  test("displays error when flash-sale API fails", async () => {
    getFlashSaleProducts.mockRejectedValue(
      new Error("Synthetic API failure")
    );

    renderComponent();

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(
      "Flash-sale products could not be loaded."
    );
  });
});
