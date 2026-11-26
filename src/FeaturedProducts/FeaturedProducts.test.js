import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import FeaturedProducts from "./FeaturedProducts";
import { addProductToCart } from "../api/cartApi";
import { toast } from "react-toastify";

jest.mock("../api/cartApi", () => ({ addProductToCart: jest.fn() }));
jest.mock("react-toastify", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock("../data/products", () => [
  { id: 16, name: "Omega-3 Fish Oil", category: "Vitamins", image: "a.png", price: 699, rating: 4.5 },
  { id: 150, name: "Refresh Tears Eye Drops", category: "Eye Care", image: "b.png", price: 180, rating: 4.4 },
  { id: 151, name: "Lubricating Eye Drops", category: "Eye Care", image: "c.png", price: 220, rating: 4.3 },
  { id: 157, name: "Eye Vitamin Capsules", category: "Eye Care", image: "d.png", price: 399, rating: 4.5 },
  { id: 200, name: "Anti Hair Fall Shampoo", category: "Hair Care", image: "e.png", price: 299, rating: 4.6 },
  { id: 201, name: "Hair Growth Oil", category: "Hair Care", image: "f.png", price: 399, rating: 4.2 },
  { id: 253, name: "Cotton Roll", category: "Healthcare", image: "g.png", price: 70, rating: 4.1 },
  { id: 300, name: "Digital Thermometer", category: "Medical Devices", image: "h.png", price: 180, rating: 4.8 },
]);
jest.mock("../utils/productImage", () => ({
  getUniqueProductsByImage: (items) => items,
  getProductImage: () => "/product.png",
  handleProductImageError: jest.fn(),
}));

const renderComponent = () => render(<MemoryRouter><FeaturedProducts /></MemoryRouter>);

describe("FeaturedProducts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    addProductToCart.mockResolvedValue({});
  });

  test("shows exactly eight catalog products with matching detail links", () => {
    renderComponent();
    expect(screen.getByRole("heading", { name: "Featured Products" })).toBeInTheDocument();
    expect(screen.getAllByRole("img")).toHaveLength(8);
    expect(screen.getAllByRole("link", { name: "View Details" })).toHaveLength(8);
    expect(screen.getByText("Omega-3 Fish Oil")).toBeInTheDocument();
    expect(screen.getByText("Digital Thermometer")).toBeInTheDocument();
  });

  test("links each featured product to its own product ID", () => {
    renderComponent();
    const links = screen.getAllByRole("link", { name: "View Details" });
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/product/16", "/product/150", "/product/151", "/product/157",
      "/product/200", "/product/201", "/product/253", "/product/300",
    ]);
  });

  test("adds the selected featured product to cart", async () => {
    renderComponent();
    fireEvent.click(screen.getAllByRole("button", { name: "Add to Cart" })[0]);
    await waitFor(() => expect(addProductToCart).toHaveBeenCalledWith(
      expect.objectContaining({ id: 16, name: "Omega-3 Fish Oil" })
    ));
    expect(toast.success).toHaveBeenCalledWith("Omega-3 Fish Oil added to cart!");
  });

  test("shows an error if adding to cart fails", async () => {
    addProductToCart.mockRejectedValueOnce(new Error("Cart unavailable"));
    renderComponent();
    fireEvent.click(screen.getAllByRole("button", { name: "Add to Cart" })[0]);
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Cart unavailable"));
  });
});
