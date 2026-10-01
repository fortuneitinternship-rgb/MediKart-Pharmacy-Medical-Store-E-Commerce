import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { toast } from "react-toastify";
import ProductCard from "./ProductCard";

jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
  },
}));

afterEach(() => {
  cleanup();
  localStorage.clear();
});

const product = {
  id: 9001,
  name: "Paracetamol",
  category: "Tablets",
  price: 96,
  rating: 4.8,
  image: "/images/product1.png",
};

const renderProductCard = (props = {}) => {
  return render(
    <BrowserRouter>
      <ProductCard product={product} {...props} />
    </BrowserRouter>
  );
};

describe("ProductCard Component", () => {
  test("renders product name", () => {
    renderProductCard();

    expect(
      screen.getByText("Paracetamol")
    ).toBeInTheDocument();
  });

  test("renders product category", () => {
    renderProductCard();

    expect(
      screen.getByText("Tablets")
    ).toBeInTheDocument();
  });

  test("renders product price", () => {
    renderProductCard();

    expect(
      screen.getByText("₹96")
    ).toBeInTheDocument();
  });

  test("renders product rating", () => {
    renderProductCard();

    expect(
      screen.getByText("⭐ 4.8")
    ).toBeInTheDocument();
  });

  test("renders View Details button", () => {
    renderProductCard();

    expect(
      screen.getByText("View Details")
    ).toBeInTheDocument();
  });

  test("View Details has correct link", () => {
    renderProductCard();

    const link = screen.getByText("View Details");

    expect(link).toHaveAttribute(
      "href",
      "/product/9001"
    );
  });

  test("renders Add to Cart button", () => {
    renderProductCard();

    expect(
      screen.getByRole("button", {
        name: "Add to Cart",
      })
    ).toBeInTheDocument();
  });

  test("adds product to cart", () => {
    renderProductCard();

    const cartButton = screen.getByRole("button", {
      name: "Add to Cart",
    });

    fireEvent.click(cartButton);

    const cart = JSON.parse(
      localStorage.getItem("cart")
    );

    expect(cart).toHaveLength(1);
    expect(cart[0].id).toBe(9001);
    expect(cart[0].name).toBe("Paracetamol");
    expect(cart[0].quantity).toBe(1);

    expect(toast.success).toHaveBeenCalledWith(
      "Paracetamol added to cart!"
    );
  });

  test("increases quantity when product already exists in cart", () => {
    window.alert = jest.fn();

    localStorage.setItem(
      "cart",
      JSON.stringify([
        {
          ...product,
          quantity: 2,
        },
      ])
    );

    renderProductCard();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Add to Cart",
      })
    );

    const cart = JSON.parse(
      localStorage.getItem("cart")
    );

    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(3);
  });

  test("adds product to wishlist", () => {
    renderProductCard();

    const wishlistButton = screen.getByRole(
      "button",
      {
        name: "Add to wishlist",
      }
    );

    fireEvent.click(wishlistButton);

    const wishlist = JSON.parse(
      localStorage.getItem("wishlist")
    );

    expect(wishlist).toHaveLength(1);
    expect(wishlist[0].id).toBe(9001);

    expect(
      screen.getByRole("button", {
        name: "Remove from wishlist",
      })
    ).toBeInTheDocument();
  });

  test("removes product from wishlist", () => {
    localStorage.setItem(
      "wishlist",
      JSON.stringify([product])
    );

    renderProductCard();

    const wishlistButton = screen.getByRole(
      "button",
      {
        name: "Remove from wishlist",
      }
    );

    fireEvent.click(wishlistButton);

    const wishlist = JSON.parse(
      localStorage.getItem("wishlist")
    );

    expect(wishlist).toHaveLength(0);

    expect(
      screen.getByRole("button", {
        name: "Add to wishlist",
      })
    ).toBeInTheDocument();
  });

  test("does not show wishlist button when showWishlist is false", () => {
    renderProductCard({
      showWishlist: false,
    });

    expect(
      screen.queryByRole("button", {
        name: "Add to wishlist",
      })
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: "Remove from wishlist",
      })
    ).not.toBeInTheDocument();
  });
});