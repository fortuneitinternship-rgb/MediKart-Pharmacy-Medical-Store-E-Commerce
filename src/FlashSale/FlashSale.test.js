
import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
  cleanup,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";

import FlashSale from "./FlashSale";

import { addProductToCart } from "../api/cartApi";
import { getFlashSaleProducts } from "../api/productApi";
import { toast } from "react-toastify";

import {
  getProductImage,
  handleProductImageError,
} from "../utils/productImage";

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

// Mock cart API
jest.mock("../api/cartApi", () => ({
  addProductToCart: jest.fn(),
}));

// Mock product API
jest.mock("../api/productApi", () => ({
  getFlashSaleProducts: jest.fn(),
}));

// Mock toast notifications
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock image utilities
jest.mock("../utils/productImage", () => ({
  getProductImage: jest.fn(),
  handleProductImageError: jest.fn(),
}));

// Generic test data
const mockProducts = [
  {
    id: 101,
    name: "Test Item One",
    image: "test-image-one.jpg",
    category: "Test Category",
    brand: "Test Brand",
    rating: 4.5,
    price: 200,
    discount_price: 150,
  },
  {
    id: 102,
    name: "Test Item Two",
    image: "test-image-two.jpg",
    category: "Another Category",
    brand: "Another Brand",
    rating: 4.2,
    price: 300,
    discount_price: 250,
  },
];

const renderComponent = () => {
  return render(
    <MemoryRouter>
      <FlashSale />
    </MemoryRouter>
  );
};

describe("FlashSale Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    getFlashSaleProducts.mockResolvedValue(mockProducts);

    addProductToCart.mockResolvedValue({
      success: true,
    });

    getProductImage.mockImplementation(
      (image) => image || "fallback-image.jpg"
    );
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  // 1. Render component
  test("renders FlashSale component", async () => {
    renderComponent();

    expect(
      screen.getByRole("heading", { name: /flash sale/i })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(getFlashSaleProducts).toHaveBeenCalledTimes(1);
    });
  });

  // 2. Display section title
  test("displays Flash Sale heading", () => {
    renderComponent();

    expect(
      screen.getByRole("heading", { name: /flash sale/i })
    ).toBeInTheDocument();
  });

  // 3. Display subtitle
  test("displays limited time deals subtitle", () => {
    renderComponent();

    expect(
      screen.getByText(/limited time deals/i)
    ).toBeInTheDocument();
  });

  // 4. Fetch products
  test("calls getFlashSaleProducts when component mounts", async () => {
    renderComponent();

    await waitFor(() => {
      expect(getFlashSaleProducts).toHaveBeenCalledTimes(1);
    });
  });

  // 5. Display fetched products
  test("renders fetched products", async () => {
    renderComponent();

    expect(
      await screen.findByText("Test Item One")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Test Item Two")
    ).toBeInTheDocument();
  });

  // 6. Display product brand
  test("displays product brands", async () => {
    renderComponent();

    expect(
      await screen.findByText("Test Brand")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Another Brand")
    ).toBeInTheDocument();
  });

  // 7. Display product ratings
  test("displays product ratings", async () => {
    renderComponent();

    expect(
      await screen.findByText(/4\.5/)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/4\.2/)
    ).toBeInTheDocument();
  });

  // 8. Display original prices
  test("displays original prices", async () => {
    renderComponent();

    expect(
      await screen.findByText("₹200")
    ).toBeInTheDocument();

    expect(
      screen.getByText("₹300")
    ).toBeInTheDocument();
  });

  // 9. Display discounted prices
  test("displays discounted prices", async () => {
    renderComponent();

    expect(
      await screen.findByText("₹150")
    ).toBeInTheDocument();

    expect(
      screen.getByText("₹250")
    ).toBeInTheDocument();
  });

  // 10. Display product images
  test("renders product images with correct alt text", async () => {
    renderComponent();

    expect(
      await screen.findByAltText("Test Item One")
    ).toBeInTheDocument();

    expect(
      screen.getByAltText("Test Item Two")
    ).toBeInTheDocument();
  });

  // 11. Image utility
  test("calls getProductImage with product image details", async () => {
    renderComponent();

    await screen.findByAltText("Test Item One");

    expect(getProductImage).toHaveBeenCalledWith(
      "test-image-one.jpg",
      "Test Item One",
      "Test Category"
    );
  });

  // 12. View Details link
  test("renders View Details links for products", async () => {
    renderComponent();

    const links = await screen.findAllByRole("link", {
      name: /view details/i,
    });

    expect(links).toHaveLength(2);
  });

  // 13. View Details navigation
  test("links to the correct product details page", async () => {
    renderComponent();

    const link = await screen.findByRole("link", {
      name: /view details/i,
    });

    expect(link).toHaveAttribute("href", "/product/101");
  });

  // 14. Add to Cart buttons
  test("renders Add to Cart buttons for products", async () => {
    renderComponent();

    const buttons = await screen.findAllByRole("button", {
      name: /add to cart/i,
    });

    expect(buttons).toHaveLength(2);
  });

  // 15. Add product to cart
  test("calls addProductToCart with selected product", async () => {
    renderComponent();

    const buttons = await screen.findAllByRole("button", {
      name: /add to cart/i,
    });

    fireEvent.click(buttons[0]);

    await waitFor(() => {
      expect(addProductToCart).toHaveBeenCalledWith(
        mockProducts[0]
      );
    });
  });

  // 16. Success notification
  test("shows success toast after adding an item", async () => {
    renderComponent();

    const buttons = await screen.findAllByRole("button", {
      name: /add to cart/i,
    });

    fireEvent.click(buttons[0]);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Test Item One added to cart!",
        expect.objectContaining({
          position: "top-right",
          autoClose: 2000,
          theme: "colored",
        })
      );
    });
  });

  // 17. Added button state
  test("changes button text after successful add to cart", async () => {
    renderComponent();

    const buttons = await screen.findAllByRole("button", {
      name: /add to cart/i,
    });

    fireEvent.click(buttons[0]);

    expect(
      await screen.findByRole("button", {
        name: /added/i,
      })
    ).toBeInTheDocument();
  });

  // 18. Only selected item changes
  test("updates only the selected product button", async () => {
    renderComponent();

    const buttons = await screen.findAllByRole("button", {
      name: /add to cart/i,
    });

    fireEvent.click(buttons[0]);

    expect(
      await screen.findByRole("button", {
        name: /added/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /add to cart/i,
      })
    ).toBeInTheDocument();
  });

  // 19. API error
  test("shows error toast when add to cart fails", async () => {
    addProductToCart.mockRejectedValueOnce(
      new Error("Test API error")
    );

    renderComponent();

    const buttons = await screen.findAllByRole("button", {
      name: /add to cart/i,
    });

    fireEvent.click(buttons[0]);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Test API error"
      );
    });
  });

  // 20. Default error message
  test("shows default error message when error has no message", async () => {
    addProductToCart.mockRejectedValueOnce({});

    renderComponent();

    const buttons = await screen.findAllByRole("button", {
      name: /add to cart/i,
    });

    fireEvent.click(buttons[0]);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Unable to add this product to your cart."
      );
    });
  });

  // 21. Image error handler
  test("calls handleProductImageError when an image fails", async () => {
    renderComponent();

    const image = await screen.findByAltText("Test Item One");

    fireEvent.error(image);

    expect(handleProductImageError).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "error",
      }),
      "Test Item One",
      "Test Category"
    );
  });

  // 22. Empty product list
  test("renders correctly when API returns an empty array", async () => {
    getFlashSaleProducts.mockResolvedValueOnce([]);

    renderComponent();

    await waitFor(() => {
      expect(getFlashSaleProducts).toHaveBeenCalled();
    });

    expect(
      screen.queryByRole("button", {
        name: /add to cart/i,
      })
    ).not.toBeInTheDocument();
  });

  // 23. API loading error
  test("displays error message when product loading fails", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => { });

    getFlashSaleProducts.mockRejectedValueOnce(
      new Error("Test loading error")
    );

    renderComponent();

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(
      "Flash-sale products could not be loaded."
    );

    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  // 24. Initial countdown
  test("displays the initial countdown values", () => {
    renderComponent();

    expect(screen.getByText("24")).toBeInTheDocument();
    expect(screen.getByText("00")).toBeInTheDocument();

    expect(screen.getByText("Hours")).toBeInTheDocument();
    expect(screen.getByText("Minutes")).toBeInTheDocument();
    expect(screen.getByText("Seconds")).toBeInTheDocument();
  });

  // 25. Countdown updates
  test("updates countdown after one second", () => {
    jest.useFakeTimers();

    renderComponent();

    act(() => {
      jest.advanceTimersByTime(1000);
    });
  });

  // 26. Timer cleanup
  test("clears countdown interval when component unmounts", () => {
    jest.useFakeTimers();

    const clearIntervalSpy = jest.spyOn(
      global,
      "clearInterval"
    );

    const { unmount } = renderComponent();

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();

    clearIntervalSpy.mockRestore();
  });

  // 27. No cart API call on initial render
  test("does not add any item to cart on initial render", async () => {
    renderComponent();

    await screen.findByText("Test Item One");

    expect(addProductToCart).not.toHaveBeenCalled();
  });

  // 28. No toast on initial render
  test("does not show toast notifications on initial render", async () => {
    renderComponent();

    await screen.findByText("Test Item One");

    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });
});
