
import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";

import TrendingProducts from "./TrendingProducts";
import { addProductToCart } from "../api/cartApi";
import { toast } from "react-toastify";

// Mock API
jest.mock("../api/cartApi", () => ({
  addProductToCart: jest.fn(),
}));

// Mock toast
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock catalog
jest.mock("../data/products", () => [
  {
    id: 253,
    name: "Item A",
    category: "Category A",
    image: "image-a.png",
    price: 100,
    rating: 4,
  },
  {
    id: 354,
    name: "Item B",
    category: "Category B",
    image: "image-b.png",
    price: 200,
    rating: 5,
  },
  {
    id: 16,
    name: "Item C",
    category: "Category C",
    image: "image-c.png",
    price: 300,
    rating: 3,
  },
  {
    id: 120,
    name: "Item D",
    category: "Category D",
    image: "image-d.png",
    price: 400,
    rating: 4,
  },
]);

// Mock image utilities
jest.mock("../utils/productImage", () => ({
  getUniqueProductsByImage: jest.fn((items) => items),
  getProductImage: jest.fn(() => "/mock-image.png"),
  handleProductImageError: jest.fn(),
}));

import {
  getUniqueProductsByImage,
  getProductImage,
  handleProductImageError,
} from "../utils/productImage";

const renderComponent = () =>
  render(
    <MemoryRouter>
      <TrendingProducts />
    </MemoryRouter>
  );

describe("TrendingProducts Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    addProductToCart.mockResolvedValue({});
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  // 1. Render component
  test("renders Trending Products heading", () => {
    renderComponent();

    expect(
      screen.getByRole("heading", {
        name: "Trending Products",
      })
    ).toBeInTheDocument();
  });

  // 2. Render description
  test("renders section description", () => {
    renderComponent();

    expect(
      screen.getByText(
        "Explore the most popular healthcare products on Medikart"
      )
    ).toBeInTheDocument();
  });

  // 3. Display products
  test("displays all trending products", () => {
    renderComponent();

    expect(screen.getByText("Item A")).toBeInTheDocument();
    expect(screen.getByText("Item B")).toBeInTheDocument();
    expect(screen.getByText("Item C")).toBeInTheDocument();
    expect(screen.getByText("Item D")).toBeInTheDocument();
  });

  // 4. Display prices
  test("displays product prices", () => {
    renderComponent();

    expect(screen.getByText("₹100")).toBeInTheDocument();
    expect(screen.getByText("₹200")).toBeInTheDocument();
    expect(screen.getByText("₹300")).toBeInTheDocument();
    expect(screen.getByText("₹400")).toBeInTheDocument();
  });

  // 5. Display ratings
  test("displays product ratings", () => {
    renderComponent();
  });

  // 6. Render images
  test("renders product images", () => {
    renderComponent();

    const images = screen.getAllByRole("img");

    expect(images).toHaveLength(4);
  });

  // 7. Image utility
  test("calls getProductImage for each product", () => {
    renderComponent();

    expect(getProductImage).toHaveBeenCalledTimes(4);
  });

  // 9. Image error
  test("handles product image errors", () => {
    renderComponent();

    const images = screen.getAllByRole("img");

    fireEvent.error(images[0]);

    expect(handleProductImageError).toHaveBeenCalledTimes(1);
  });

  // 10. View details
  test("renders View Details links", () => {
    renderComponent();

    expect(
      screen.getAllByRole("link", {
        name: "View Details",
      })
    ).toHaveLength(4);
  });

  // 11. Product navigation
  test("renders correct product detail URL", () => {
    renderComponent();

    const links = screen.getAllByRole("link", {
      name: "View Details",
    });

    expect(links[0]).toHaveAttribute("href", "/product/253");
    expect(links[1]).toHaveAttribute("href", "/product/354");
    expect(links[2]).toHaveAttribute("href", "/product/16");
    expect(links[3]).toHaveAttribute("href", "/product/120");
  });

  // 12. Add to Cart buttons
  test("renders Add to Cart buttons", () => {
    renderComponent();

    expect(
      screen.getAllByRole("button", {
        name: "Add to Cart",
      })
    ).toHaveLength(4);
  });

  // 13. Add product to cart
  test("calls addProductToCart when button is clicked", async () => {
    renderComponent();

    fireEvent.click(
      screen.getAllByRole("button", {
        name: "Add to Cart",
      })[0]
    );

    await waitFor(() => {
      expect(addProductToCart).toHaveBeenCalledTimes(1);
    });
  });

  // 14. Pass selected product
  test("passes the selected product to cart API", async () => {
    renderComponent();

    fireEvent.click(
      screen.getAllByRole("button", {
        name: "Add to Cart",
      })[1]
    );

    await waitFor(() => {
      expect(addProductToCart).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 354,
          name: "Item B",
        })
      );
    });
  });

  // 15. Success notification
  test("shows success toast after adding product", async () => {
    renderComponent();

    fireEvent.click(
      screen.getAllByRole("button", {
        name: "Add to Cart",
      })[0]
    );

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Item A added to cart!",
        expect.objectContaining({
          position: "top-right",
          autoClose: 2000,
          theme: "colored",
          icon: "🛒",
        })
      );
    });
  });

  // 16. Added state
  test("changes button text after successful addition", async () => {
    renderComponent();

    fireEvent.click(
      screen.getAllByRole("button", {
        name: "Add to Cart",
      })[0]
    );

    expect(
      await screen.findByRole("button", {
        name: "✓ Added",
      })
    ).toBeInTheDocument();
  });

  // 17. Error notification
  test("shows error toast when cart API fails", async () => {
    addProductToCart.mockRejectedValue(
      new Error("Cart operation failed")
    );

    renderComponent();

    fireEvent.click(
      screen.getAllByRole("button", {
        name: "Add to Cart",
      })[0]
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Cart operation failed"
      );
    });
  });

  // 18. Default error message
  test("shows default error message when error message is missing", async () => {
    addProductToCart.mockRejectedValue({});

    renderComponent();

    fireEvent.click(
      screen.getAllByRole("button", {
        name: "Add to Cart",
      })[0]
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Unable to add this product to your cart."
      );
    });
  });

  // 19. Failed request does not show Added
  test("does not change button state when API fails", async () => {
    addProductToCart.mockRejectedValue(
      new Error("Request failed")
    );

    renderComponent();

    fireEvent.click(
      screen.getAllByRole("button", {
        name: "Add to Cart",
      })[0]
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });

    expect(
      screen.getAllByRole("button", {
        name: "Add to Cart",
      })
    ).toHaveLength(4);

    expect(
      screen.queryByRole("button", {
        name: "✓ Added",
      })
    ).not.toBeInTheDocument();
  });

  // 20. Add another product
  test("adds the selected product instead of another product", async () => {
    renderComponent();

    const buttons = screen.getAllByRole("button", {
      name: "Add to Cart",
    });

    fireEvent.click(buttons[2]);

    await waitFor(() => {
      expect(addProductToCart).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 16,
          name: "Item C",
        })
      );
    });

    expect(toast.success).toHaveBeenCalledWith(
      "Item C added to cart!",
      expect.any(Object)
    );
  });

  // 21. Independent button states
  test("updates only the selected product button", async () => {
    renderComponent();

    const buttons = screen.getAllByRole("button", {
      name: "Add to Cart",
    });

    fireEvent.click(buttons[0]);

    expect(
      await screen.findByRole("button", {
        name: "✓ Added",
      })
    ).toBeInTheDocument();

    expect(
      screen.getAllByRole("button", {
        name: "Add to Cart",
      })
    ).toHaveLength(3);
  });

  // 22. CSS structure
  test("renders the expected CSS classes", () => {
    const { container } = renderComponent();

    expect(
      container.querySelector(".trending-products")
    ).toBeInTheDocument();

    expect(
      container.querySelector(".container")
    ).toBeInTheDocument();

    expect(
      container.querySelector(".trending-header")
    ).toBeInTheDocument();

    expect(
      container.querySelector(".trending-grid")
    ).toBeInTheDocument();

    expect(
      container.querySelectorAll(".product-card")
    ).toHaveLength(4);
  });

  // 23. Button group
  test("renders view and cart buttons inside each card", () => {
    const { container } = renderComponent();

    const groups = container.querySelectorAll(".button-group");

    expect(groups).toHaveLength(4);

    groups.forEach((group) => {
      expect(
        group.querySelector(".view-btn")
      ).toBeInTheDocument();

      expect(
        group.querySelector(".cart-btn")
      ).toBeInTheDocument();
    });
  });

  // 24. Added state resets after timeout
  test("resets Added button after two seconds", async () => {
    jest.useFakeTimers();

    renderComponent();

    fireEvent.click(
      screen.getAllByRole("button", {
        name: "Add to Cart",
      })[0]
    );

    // Resolve the mocked API promise.
    await React.act(async () => {
      await Promise.resolve();
    });

    expect(
      screen.getByRole("button", {
        name: "✓ Added",
      })
    ).toBeInTheDocument();

    // Advance the timeout.
    await React.act(async () => {
      jest.advanceTimersByTime(2000);
    });

    expect(
      screen.getAllByRole("button", {
        name: "Add to Cart",
      })
    ).toHaveLength(4);
  });
});
