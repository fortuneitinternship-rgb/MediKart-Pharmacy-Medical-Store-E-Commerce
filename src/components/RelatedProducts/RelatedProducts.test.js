
import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";

import RelatedProducts from "./RelatedProducts";
import { addProductToCart } from "../../api/cartApi";
import { toast } from "react-toastify";
import {
  getProductImage,
  handleProductImageError,
} from "../../utils/productImage";

// Mock CSS module
jest.mock("./RelatedProducts.module.css", () => ({
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

// Mock cart API
jest.mock("../../api/cartApi", () => ({
  addProductToCart: jest.fn(),
}));

// Mock toast notifications
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock image utilities
jest.mock("../../utils/productImage", () => ({
  getProductImage: jest.fn(),
  handleProductImageError: jest.fn(),
}));

// Mock navigation
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Generic mock data
const mockProducts = [
  {
    id: 1,
    name: "Test Item One",
    image: "test-image-one.jpg",
    category: "Test Category",
    price: 100,
    rating: 4.5,
  },
  {
    id: 2,
    name: "Test Item Two",
    image: "test-image-two.jpg",
    category: "Another Category",
    price: 200,
    rating: 4.2,
  },
];

const renderComponent = (products = mockProducts) => {
  return render(
    <MemoryRouter>
      <RelatedProducts products={products} />
    </MemoryRouter>
  );
};

describe("RelatedProducts Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    getProductImage.mockImplementation(
      (image) => image || "fallback-image.jpg"
    );

    addProductToCart.mockResolvedValue({});
  });

  afterEach(() => {
    cleanup();
  });

  // 1. Render component
  test("renders RelatedProducts component", () => {
    renderComponent();

    expect(
      screen.getByRole("heading", { name: /our products/i })
    ).toBeInTheDocument();
  });

  // 2. Display products
  test("renders all supplied products", () => {
    renderComponent();

    expect(screen.getByText("Test Item One")).toBeInTheDocument();
    expect(screen.getByText("Test Item Two")).toBeInTheDocument();
  });

  // 3. Display categories
  test("displays product categories", () => {
    renderComponent();

    expect(screen.getByText("Test Category")).toBeInTheDocument();
    expect(screen.getByText("Another Category")).toBeInTheDocument();
  });

  // 4. Display prices
  test("displays product prices", () => {
    renderComponent();

    expect(screen.getByText(/₹100/)).toBeInTheDocument();
    expect(screen.getByText(/₹200/)).toBeInTheDocument();
  });

  // 5. Display ratings
  test("displays product ratings", () => {
    renderComponent();

    expect(screen.getByText(/4\.5/)).toBeInTheDocument();
    expect(screen.getByText(/4\.2/)).toBeInTheDocument();
  });

  // 6. Display product images
  test("renders product images with correct alt text", () => {
    renderComponent();

    expect(
      screen.getByAltText("Test Item One")
    ).toBeInTheDocument();

    expect(
      screen.getByAltText("Test Item Two")
    ).toBeInTheDocument();
  });

  // 7. Call image utility
  test("calls getProductImage with product image details", () => {
    renderComponent();

    expect(getProductImage).toHaveBeenCalledWith(
      "test-image-one.jpg",
      "Test Item One",
      "Test Category"
    );
  });

  // 8. Navigate using product image
  test("navigates to product details when image is clicked", () => {
    renderComponent();

    fireEvent.click(screen.getByAltText("Test Item One"));

    expect(mockNavigate).toHaveBeenCalledWith("/product/1");
  });

  // 9. Navigate using View Details button
  test("navigates to product details when View Details is clicked", () => {
    renderComponent();

    const buttons = screen.getAllByRole("button", {
      name: /view details/i,
    });

    fireEvent.click(buttons[0]);

    expect(mockNavigate).toHaveBeenCalledWith("/product/1");
  });

  // 10. View Details buttons
  test("renders a View Details button for each product", () => {
    renderComponent();

    expect(
      screen.getAllByRole("button", { name: /view details/i })
    ).toHaveLength(2);
  });

  // 11. Add to Cart buttons
  test("renders an Add to Cart button for each product", () => {
    renderComponent();

    expect(
      screen.getAllByRole("button", { name: /add to cart/i })
    ).toHaveLength(2);
  });

  // 12. Add product to cart
  test("calls addProductToCart when Add to Cart is clicked", async () => {
    renderComponent();

    fireEvent.click(
      screen.getAllByRole("button", { name: /add to cart/i })[0]
    );

    await waitFor(() => {
      expect(addProductToCart).toHaveBeenCalledWith(mockProducts[0]);
    });
  });

  // 13. Success notification
  test("shows success notification after adding a product", async () => {
    renderComponent();

    fireEvent.click(
      screen.getAllByRole("button", { name: /add to cart/i })[0]
    );

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Test Item One added to cart!"
      );
    });
  });

  // 14. Added button state
  test("changes button text after successfully adding a product", async () => {
    renderComponent();

    fireEvent.click(
      screen.getAllByRole("button", { name: /add to cart/i })[0]
    );

    expect(
      await screen.findByRole("button", { name: /added/i })
    ).toBeInTheDocument();
  });

  // 15. Add only selected product
  test("updates only the selected product button", async () => {
    renderComponent();

    const addButtons = screen.getAllByRole("button", {
      name: /add to cart/i,
    });

    fireEvent.click(addButtons[0]);

    expect(
      await screen.findByRole("button", { name: /added/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /add to cart/i })
    ).toBeInTheDocument();
  });

  // 16. API failure
  test("shows error notification when adding a product fails", async () => {
    addProductToCart.mockRejectedValueOnce(
      new Error("Test API error")
    );

    renderComponent();

    fireEvent.click(
      screen.getAllByRole("button", { name: /add to cart/i })[0]
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Test API error");
    });
  });

  // 17. Default API error message
  test("shows default error notification when error has no message", async () => {
    addProductToCart.mockRejectedValueOnce({});

    renderComponent();

    fireEvent.click(
      screen.getAllByRole("button", { name: /add to cart/i })[0]
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Unable to add this product to your cart."
      );
    });
  });

  // 18. Stop event propagation
  test("does not navigate when Add to Cart is clicked", async () => {
    renderComponent();

    fireEvent.click(
      screen.getAllByRole("button", { name: /add to cart/i })[0]
    );

    await waitFor(() => {
      expect(addProductToCart).toHaveBeenCalled();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // 19. Image error handler
  test("calls handleProductImageError when an image fails to load", () => {
    renderComponent();

    const image = screen.getByAltText("Test Item One");

    fireEvent.error(image);

    expect(handleProductImageError).toHaveBeenCalledWith(
      expect.objectContaining({ type: "error" }),
      "Test Item One",
      "Test Category"
    );
  });

  // 20. Empty products
  test("renders correctly when products array is empty", () => {
    renderComponent([]);

    expect(
      screen.getByRole("heading", { name: /our products/i })
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: /add to cart/i })
    ).not.toBeInTheDocument();
  });

  // 21. No API calls on initial render
  test("does not call addProductToCart when component initially renders", () => {
    renderComponent();

    expect(addProductToCart).not.toHaveBeenCalled();
  });

  // 22. No toast notifications on initial render
  test("does not show toast notifications on initial render", () => {
    renderComponent();

    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });

  // 23. Missing optional image
  test("handles a product with a missing image", () => {
    const products = [
      {
        id: 3,
        name: "Test Item Three",
        image: "",
        category: "Test Category",
        price: 150,
        rating: 4.0,
      },
    ];

    renderComponent(products);

    expect(
      screen.getByAltText("Test Item Three")
    ).toBeInTheDocument();

    expect(getProductImage).toHaveBeenCalledWith(
      "",
      "Test Item Three",
      "Test Category"
    );
  });

  // 24. Missing products prop is not supported by the component;
  // this test verifies an empty array instead.
  test("renders no product cards for an empty product list", () => {
    const { container } = renderComponent([]);

    expect(container.querySelectorAll(".relatedCard")).toHaveLength(0);
  });
});
