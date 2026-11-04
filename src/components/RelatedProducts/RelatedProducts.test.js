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

import RelatedProducts from "../RelatedProducts";

import { addProductToCart } from "../../../api/cartApi";

import {
  getProductImage,
  handleProductImageError,
} from "../../../utils/productImage";

import { toast } from "react-toastify";

// ---------------------------------------------
// MOCK NAVIGATION
// ---------------------------------------------

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// ---------------------------------------------
// MOCK CART API
// ---------------------------------------------

jest.mock("../../../api/cartApi", () => ({
  addProductToCart: jest.fn(),
}));

// ---------------------------------------------
// MOCK IMAGE UTILITIES
// ---------------------------------------------

jest.mock("../../../utils/productImage", () => ({
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

jest.mock("../RelatedProducts.module.css", () => ({
  relatedProducts: "relatedProducts",
  relatedTitle: "relatedTitle",
  relatedGrid: "relatedGrid",
  relatedCard: "relatedCard",
  imageBox: "imageBox",
  productImage: "productImage",
  productInfo: "productInfo",
  category: "category",
  productName: "productName",
  productPrice: "productPrice",
  rating: "rating",
  buttonGroup: "buttonGroup",
  detailsBtn: "detailsBtn",
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
    category: "category-alpha",
    image: "synthetic-image-alpha",
    price: 100,
    rating: 4.5,
  },
  {
    id: 90002,
    name: "Synthetic Item Beta",
    category: "category-beta",
    image: "synthetic-image-beta",
    price: 200,
    rating: 4.0,
  },
];

// ---------------------------------------------
// RENDER HELPER
// ---------------------------------------------

const renderComponent = (products = mockProducts) =>
  render(
    <MemoryRouter>
      <RelatedProducts products={products} />
    </MemoryRouter>
  );

// =============================================
// RELATED PRODUCTS TESTS
// =============================================

describe("RelatedProducts Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    addProductToCart.mockResolvedValue({
      success: true,
    });

    getProductImage.mockReturnValue(
      "/synthetic-image.png"
    );

    handleProductImageError.mockImplementation(() => { });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  // -------------------------------------------
  // 1. BASIC RENDERING
  // -------------------------------------------

  test("renders the Our Products heading", () => {
    renderComponent();

    expect(
      screen.getByRole("heading", {
        name: /our products/i,
      })
    ).toBeInTheDocument();
  });

  test("renders all supplied products", () => {
    renderComponent();

    expect(
      screen.getByText("Synthetic Item Alpha")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Synthetic Item Beta")
    ).toBeInTheDocument();
  });

  test("renders product categories", () => {
    renderComponent();

    expect(
      screen.getByText("category-alpha")
    ).toBeInTheDocument();

    expect(
      screen.getByText("category-beta")
    ).toBeInTheDocument();
  });

  test("renders product prices", () => {
    renderComponent();

    expect(screen.getByText("₹100")).toBeInTheDocument();
    expect(screen.getByText("₹200")).toBeInTheDocument();
  });

  test("renders product ratings", () => {
    renderComponent();

    expect(screen.getByText("⭐ 4.5")).toBeInTheDocument();
    expect(screen.getByText("⭐ 4.0")).toBeInTheDocument();
  });

  test("renders View Details buttons", () => {
    renderComponent();

    expect(
      screen.getAllByRole("button", {
        name: /view details/i,
      })
    ).toHaveLength(2);
  });

  test("renders Add to Cart buttons", () => {
    renderComponent();

    expect(
      screen.getAllByRole("button", {
        name: /add to cart/i,
      })
    ).toHaveLength(2);
  });

  // -------------------------------------------
  // 2. EMPTY PRODUCTS
  // -------------------------------------------

  test("renders heading when products array is empty", () => {
    renderComponent([]);

    expect(
      screen.getByRole("heading", {
        name: /our products/i,
      })
    ).toBeInTheDocument();
  });

  test("does not render product cards when array is empty", () => {
    const { container } = renderComponent([]);

    expect(
      container.querySelectorAll(".relatedCard")
    ).toHaveLength(0);
  });

  // -------------------------------------------
  // 3. PRODUCT IMAGE TESTS
  // -------------------------------------------

  test("calls getProductImage with product information", () => {
    renderComponent();

    expect(getProductImage).toHaveBeenCalledWith(
      "synthetic-image-alpha",
      "Synthetic Item Alpha",
      "category-alpha"
    );

    expect(getProductImage).toHaveBeenCalledWith(
      "synthetic-image-beta",
      "Synthetic Item Beta",
      "category-beta"
    );
  });

  test("renders images with correct alt text", () => {
    renderComponent();

    expect(
      screen.getByAltText("Synthetic Item Alpha")
    ).toBeInTheDocument();

    expect(
      screen.getByAltText("Synthetic Item Beta")
    ).toBeInTheDocument();
  });

  test("calls image error handler when an image fails", () => {
    renderComponent();

    const image = screen.getByAltText(
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

  test("navigates to product details when image is clicked", () => {
    renderComponent();

    const image = screen.getByAltText(
      "Synthetic Item Alpha"
    );

    fireEvent.click(image);

    expect(mockNavigate).toHaveBeenCalledWith(
      "/product/90001"
    );
  });

  test("navigates to product details when View Details is clicked", () => {
    renderComponent();

    const buttons = screen.getAllByRole("button", {
      name: /view details/i,
    });

    fireEvent.click(buttons[0]);

    expect(mockNavigate).toHaveBeenCalledWith(
      "/product/90001"
    );
  });

  test("navigates to the correct product when another details button is clicked", () => {
    renderComponent();

    const buttons = screen.getAllByRole("button", {
      name: /view details/i,
    });

    fireEvent.click(buttons[1]);

    expect(mockNavigate).toHaveBeenCalledWith(
      "/product/90002"
    );
  });

  // -------------------------------------------
  // 5. ADD TO CART TESTS
  // -------------------------------------------

  test("calls addProductToCart with selected product", async () => {
    renderComponent();

    const buttons = screen.getAllByRole("button", {
      name: /add to cart/i,
    });

    fireEvent.click(buttons[0]);

    await waitFor(() => {
      expect(addProductToCart).toHaveBeenCalledWith(
        mockProducts[0]
      );
    });
  });

  test("shows success toast after adding product", async () => {
    renderComponent();

    fireEvent.click(
      screen.getAllByRole("button", {
        name: /add to cart/i,
      })[0]
    );

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Synthetic Item Alpha added to cart!"
      );
    });
  });

  test("changes button text after successful cart addition", async () => {
    renderComponent();

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

  test("shows error toast when cart operation fails", async () => {
    addProductToCart.mockRejectedValue(
      new Error("Synthetic cart failure")
    );

    renderComponent();

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

  test("does not show success toast when cart operation fails", async () => {
    addProductToCart.mockRejectedValue(
      new Error("Synthetic cart failure")
    );

    renderComponent();

    fireEvent.click(
      screen.getAllByRole("button", {
        name: /add to cart/i,
      })[0]
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });

    expect(toast.success).not.toHaveBeenCalled();
  });

  // -------------------------------------------
  // 6. EVENT PROPAGATION
  // -------------------------------------------

  test("stops click propagation when Add to Cart is clicked", async () => {
    const { container } = renderComponent();

    const card = container.querySelector(".relatedCard");

    const parentClick = jest.fn();

    card.addEventListener("click", parentClick);

    fireEvent.click(
      screen.getAllByRole("button", {
        name: /add to cart/i,
      })[0]
    );

    expect(parentClick).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(addProductToCart).toHaveBeenCalled();
    });
  });

  // -------------------------------------------
  // 7. BUTTON RESET TIMER
  // -------------------------------------------

  test("resets Add to Cart button after two seconds", async () => {
    jest.useFakeTimers();

    renderComponent();

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
  // 8. INDEPENDENT PRODUCT BUTTONS
  // -------------------------------------------

  test("updates only the selected product button", async () => {
    renderComponent();

    const buttons = screen.getAllByRole("button", {
      name: /add to cart/i,
    });

    fireEvent.click(buttons[0]);

    expect(
      await screen.findByRole("button", {
        name: /added/i,
      })
    ).toBeInTheDocument();

    expect(buttons[1]).toHaveTextContent("Add to Cart");
  });
});
