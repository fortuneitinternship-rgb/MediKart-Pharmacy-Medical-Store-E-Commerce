import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import TrendingProducts from "./TrendingProducts";
import { addProductToCart } from "../api/cartApi";
import { toast } from "react-toastify";

jest.mock("../api/cartApi", () => ({ addProductToCart: jest.fn() }));
jest.mock("react-toastify", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock("../data/products", () => [
  { id: 350, name: "Dolo 650 Tablet", category: "Medicines", image: "a.png", price: 35, rating: 4.8 },
  { id: 354, name: "Amoxycillin 500mg", category: "Medicines", image: "b.png", price: 95, rating: 4.5 },
  { id: 144, name: "Colgate Toothpaste", category: "Personal Care", image: "c.png", price: 110, rating: 4.8 },
  { id: 148, name: "Listerine Mouthwash", category: "Personal Care", image: "d.png", price: 260, rating: 4.8 },
]);
jest.mock("../utils/productImage", () => ({
  getUniqueProductsByImage: (items) => items,
  getProductImage: () => "/product.png",
  handleProductImageError: jest.fn(),
}));

const renderComponent = () => render(<MemoryRouter><TrendingProducts /></MemoryRouter>);

describe("TrendingProducts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    addProductToCart.mockResolvedValue({});
  });

  test("renders exactly four catalog products", () => {
    renderComponent();
    expect(screen.getByRole("heading", { name: "Trending Products" })).toBeInTheDocument();
    expect(screen.getAllByRole("img")).toHaveLength(4);
    expect(screen.getAllByRole("link", { name: "View Details" })).toHaveLength(4);
    expect(screen.getByText("Dolo 650 Tablet")).toBeInTheDocument();
    expect(screen.getByText("Listerine Mouthwash")).toBeInTheDocument();
  });

  test("links each trending product to its matching detail page", () => {
    renderComponent();
    const links = screen.getAllByRole("link", { name: "View Details" });
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/product/350", "/product/354", "/product/144", "/product/148",
    ]);
  });

  test("adds the selected trending product to cart", async () => {
    renderComponent();
    fireEvent.click(screen.getAllByRole("button", { name: "Add to Cart" })[1]);
    await waitFor(() => expect(addProductToCart).toHaveBeenCalledWith(
      expect.objectContaining({ id: 354, name: "Amoxycillin 500mg" })
    ));
    expect(toast.success).toHaveBeenCalledWith("Amoxycillin 500mg added to cart!");
  });

  test("shows an error if adding to cart fails", async () => {
    addProductToCart.mockRejectedValueOnce(new Error("Cart operation failed"));
    renderComponent();
    fireEvent.click(screen.getAllByRole("button", { name: "Add to Cart" })[0]);
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Cart operation failed"));
  });
});
