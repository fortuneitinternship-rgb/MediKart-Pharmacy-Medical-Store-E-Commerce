import React from "react";
import {
  render,
  screen,
  fireEvent,
  within,
  act,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { toast } from "react-toastify";

import TrendingProducts from "./TrendingProducts";

/*
  Mock react-toastify

  TrendingProducts.jsx uses toast.success()
  but does not render ToastContainer.
*/
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
  },
}));

describe("TrendingProducts", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <TrendingProducts />
      </MemoryRouter>
    );
  };

  // ==================================================
  // HEADER
  // ==================================================

  test("renders Trending Products heading", () => {
    renderComponent();

    expect(
      screen.getByRole("heading", {
        name: "Trending Products",
      })
    ).toBeInTheDocument();
  });

  test("renders Trending Products description", () => {
    renderComponent();

    expect(
      screen.getByText(
        "Explore the most popular healthcare products on Medikart"
      )
    ).toBeInTheDocument();
  });

  // ==================================================
  // PRODUCTS
  // ==================================================

  test("renders all trending products", () => {
    renderComponent();

    expect(
      screen.getByText("Cotton Roll")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Amoxycillin 500mg")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Omega-3 Fish Oil")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Johnson's Baby Premium Care Kit")
    ).toBeInTheDocument();
  });

  test("renders exactly four product cards", () => {
    renderComponent();

    const cards =
      document.querySelectorAll(".product-card");

    expect(cards).toHaveLength(4);
  });

  // ==================================================
  // PRODUCT PRICES
  // ==================================================

  test("renders correct product prices", () => {
    renderComponent();

    expect(
      screen.getByText("₹70")
    ).toBeInTheDocument();

    expect(
      screen.getByText("₹95")
    ).toBeInTheDocument();

    expect(
      screen.getByText("₹699")
    ).toBeInTheDocument();

    expect(
      screen.getByText("₹250")
    ).toBeInTheDocument();
  });

  // ==================================================
  // PRODUCT RATINGS
  // ==================================================

  test("renders correct product ratings", () => {
    renderComponent();

    expect(
      screen.getAllByText("⭐ 4.8")
    ).toHaveLength(2);

    expect(
      screen.getByText("⭐ 4.5")
    ).toBeInTheDocument();

    expect(
      screen.getByText("⭐ 4.9")
    ).toBeInTheDocument();
  });

  // ==================================================
  // PRODUCT IMAGES
  // ==================================================

  test("renders all product images", () => {
    renderComponent();

    expect(
      screen.getByAltText("Cotton Roll")
    ).toBeInTheDocument();

    expect(
      screen.getByAltText("Amoxycillin 500mg")
    ).toBeInTheDocument();

    expect(
      screen.getByAltText("Omega-3 Fish Oil")
    ).toBeInTheDocument();

    expect(
      screen.getByAltText(
        "Johnson's Baby Premium Care Kit"
      )
    ).toBeInTheDocument();
  });

  // ==================================================
  // VIEW DETAILS
  // ==================================================

  test("renders four View Details links", () => {
    renderComponent();

    const links = screen.getAllByRole("link", {
      name: "View Details",
    });

    expect(links).toHaveLength(4);
  });

  test("renders correct View Details URLs", () => {
    renderComponent();

    const links = screen.getAllByRole("link", {
      name: "View Details",
    });

    expect(links[0]).toHaveAttribute(
      "href",
      "/product/253"
    );

    expect(links[1]).toHaveAttribute(
      "href",
      "/product/354"
    );

    expect(links[2]).toHaveAttribute(
      "href",
      "/product/16"
    );

    expect(links[3]).toHaveAttribute(
      "href",
      "/product/2014"
    );
  });

  // ==================================================
  // ADD TO CART BUTTONS
  // ==================================================

  test("renders four Add to Cart buttons", () => {
    renderComponent();

    const buttons = screen.getAllByRole("button", {
      name: "Add to Cart",
    });

    expect(buttons).toHaveLength(4);
  });

  // ==================================================
  // COTTON ROLL
  // ==================================================

  test("adds Cotton Roll to cart", () => {
    renderComponent();

    const productName =
      screen.getByText("Cotton Roll");

    const productCard =
      productName.closest(".product-card");

    expect(productCard).not.toBeNull();

    const button = within(productCard).getByRole(
      "button",
      {
        name: "Add to Cart",
      }
    );

    fireEvent.click(button);

    const cart = JSON.parse(
      localStorage.getItem("cart")
    );

    expect(cart).toHaveLength(1);

    expect(cart[0]).toMatchObject({
      id: 253,
      name: "Cotton Roll",
      brand: "Johnson's",
      category: "Healthcare",
      price: 70,
      quantity: 1,
    });
  });

  // ==================================================
  // AMOXYCILLIN
  // ==================================================

  test("adds Amoxycillin 500mg to cart", () => {
    renderComponent();

    const productName =
      screen.getByText("Amoxycillin 500mg");

    const productCard =
      productName.closest(".product-card");

    expect(productCard).not.toBeNull();

    const button = within(productCard).getByRole(
      "button",
      {
        name: "Add to Cart",
      }
    );

    fireEvent.click(button);

    const cart = JSON.parse(
      localStorage.getItem("cart")
    );

    expect(cart).toHaveLength(1);

    expect(cart[0]).toMatchObject({
      id: 354,
      name: "Amoxycillin 500mg",
      brand: "Mankind",
      category: "Medicines",
      price: 95,
      quantity: 1,
    });
  });

  // ==================================================
  // OMEGA-3
  // ==================================================

  test("adds Omega-3 Fish Oil to cart", () => {
    renderComponent();

    const productName =
      screen.getByText("Omega-3 Fish Oil");

    const productCard =
      productName.closest(".product-card");

    expect(productCard).not.toBeNull();

    const button = within(productCard).getByRole(
      "button",
      {
        name: "Add to Cart",
      }
    );

    fireEvent.click(button);

    const cart = JSON.parse(
      localStorage.getItem("cart")
    );

    expect(cart).toHaveLength(1);

    expect(cart[0]).toMatchObject({
      id: 16,
      name: "Omega-3 Fish Oil",
      brand: "HK Vitals",
      category: "Vitamins",
      price: 699,
      quantity: 1,
    });
  });

  // ==================================================
  // BABY CARE KIT
  // ==================================================

  test("adds Johnson's Baby Premium Care Kit to cart", () => {
    renderComponent();

    const productName =
      screen.getByText(
        "Johnson's Baby Premium Care Kit"
      );

    const productCard =
      productName.closest(".product-card");

    expect(productCard).not.toBeNull();

    const button = within(productCard).getByRole(
      "button",
      {
        name: "Add to Cart",
      }
    );

    fireEvent.click(button);

    const cart = JSON.parse(
      localStorage.getItem("cart")
    );

    expect(cart).toHaveLength(1);

    expect(cart[0]).toMatchObject({
      id: 2014,
      name: "Johnson's Baby Premium Care Kit",
      brand: "Johnson & Johnson",
      category: "Premium Healthcare",
      price: 250,
      quantity: 1,
    });
  });

  // ==================================================
  // EXISTING PRODUCT
  // ==================================================

  test("increases quantity when product already exists in cart", () => {
    const existingCart = [
      {
        id: 253,
        name: "Cotton Roll",
        brand: "Johnson's",
        category: "Healthcare",
        price: 70,
        quantity: 1,
      },
    ];

    localStorage.setItem(
      "cart",
      JSON.stringify(existingCart)
    );

    renderComponent();

    const productName =
      screen.getByText("Cotton Roll");

    const productCard =
      productName.closest(".product-card");

    const button = within(productCard).getByRole(
      "button",
      {
        name: "Add to Cart",
      }
    );

    fireEvent.click(button);

    const cart = JSON.parse(
      localStorage.getItem("cart")
    );

    expect(cart).toHaveLength(1);
    expect(cart[0].name).toBe("Cotton Roll");
    expect(cart[0].quantity).toBe(2);
  });

  // ==================================================
  // NO DUPLICATE PRODUCTS
  // ==================================================

  test("does not create duplicate cart entries", () => {
    renderComponent();

    const productName =
      screen.getByText("Cotton Roll");

    const productCard =
      productName.closest(".product-card");

    const button = within(productCard).getByRole(
      "button",
      {
        name: "Add to Cart",
      }
    );

    fireEvent.click(button);
    fireEvent.click(button);

    const cart = JSON.parse(
      localStorage.getItem("cart")
    );

    expect(cart).toHaveLength(1);
    expect(cart[0].id).toBe(253);
    expect(cart[0].quantity).toBe(2);
  });

  // ==================================================
  // MULTIPLE PRODUCTS
  // ==================================================

  test("adds multiple different products to cart", () => {
    renderComponent();

    const cottonCard =
      screen
        .getByText("Cotton Roll")
        .closest(".product-card");

    const amoxycillinCard =
      screen
        .getByText("Amoxycillin 500mg")
        .closest(".product-card");

    const cottonButton =
      within(cottonCard).getByRole("button", {
        name: "Add to Cart",
      });

    const amoxycillinButton =
      within(amoxycillinCard).getByRole("button", {
        name: "Add to Cart",
      });

    fireEvent.click(cottonButton);
    fireEvent.click(amoxycillinButton);

    const cart = JSON.parse(
      localStorage.getItem("cart")
    );

    expect(cart).toHaveLength(2);

    expect(cart[0].name).toBe("Cotton Roll");
    expect(cart[0].quantity).toBe(1);

    expect(cart[1].name).toBe(
      "Amoxycillin 500mg"
    );
    expect(cart[1].quantity).toBe(1);
  });

  // ==================================================
  // ADDED BUTTON
  // ==================================================

  test("changes Add to Cart to Added after clicking", () => {
    renderComponent();

    const productName =
      screen.getByText("Cotton Roll");

    const productCard =
      productName.closest(".product-card");

    const button = within(productCard).getByRole(
      "button",
      {
        name: "Add to Cart",
      }
    );

    fireEvent.click(button);

    expect(
      within(productCard).getByRole("button", {
        name: "✓ Added",
      })
    ).toBeInTheDocument();
  });

  // ==================================================
  // CART UPDATED EVENT
  // ==================================================

  test("dispatches cartUpdated event after adding product", () => {
    const dispatchSpy = jest.spyOn(
      window,
      "dispatchEvent"
    );

    renderComponent();

    const productName =
      screen.getByText("Cotton Roll");

    const productCard =
      productName.closest(".product-card");

    const button = within(productCard).getByRole(
      "button",
      {
        name: "Add to Cart",
      }
    );

    fireEvent.click(button);

    const cartUpdatedCall =
      dispatchSpy.mock.calls.find(
        ([event]) => event.type === "cartUpdated"
      );

    expect(cartUpdatedCall).toBeDefined();

    dispatchSpy.mockRestore();
  });

  // ==================================================
  // TWO SECOND TIMER
  // ==================================================

  test("changes Added back to Add to Cart after 2 seconds", () => {
    jest.useFakeTimers();

    renderComponent();

    const productName =
      screen.getByText("Cotton Roll");

    const productCard =
      productName.closest(".product-card");

    const button = within(productCard).getByRole(
      "button",
      {
        name: "Add to Cart",
      }
    );

    fireEvent.click(button);

    expect(
      within(productCard).getByRole("button", {
        name: "✓ Added",
      })
    ).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(
      within(productCard).getByRole("button", {
        name: "Add to Cart",
      })
    ).toBeInTheDocument();
  });

  // ==================================================
  // TOAST
  // ==================================================

  test("calls success toast when Cotton Roll is added", () => {
    renderComponent();

    const productName =
      screen.getByText("Cotton Roll");

    const productCard =
      productName.closest(".product-card");

    const button = within(productCard).getByRole(
      "button",
      {
        name: "Add to Cart",
      }
    );

    fireEvent.click(button);

    expect(toast.success).toHaveBeenCalledWith(
      "Cotton Roll added to cart!",
      expect.objectContaining({
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
        icon: "🛒",
      })
    );
  });

  // ==================================================
  // TOAST PRODUCT NAME
  // ==================================================

  test("calls toast with the correct selected product name", () => {
    renderComponent();

    const productName =
      screen.getByText("Omega-3 Fish Oil");

    const productCard =
      productName.closest(".product-card");

    const button = within(productCard).getByRole(
      "button",
      {
        name: "Add to Cart",
      }
    );

    fireEvent.click(button);

    expect(toast.success).toHaveBeenCalledWith(
      "Omega-3 Fish Oil added to cart!",
      expect.any(Object)
    );
  });
});