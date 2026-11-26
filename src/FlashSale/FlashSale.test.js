import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import FlashSale from "./FlashSale";
import { addProductToCart } from "../api/cartApi";
import { toast } from "react-toastify";

jest.mock("../api/cartApi", () => ({ addProductToCart: jest.fn() }));
jest.mock("react-toastify", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock("../data/products", () => [
  { id: 350, name: "Dolo 650 Tablet", category: "Medicines", image: "1.png", price: 35, originalPrice: 42, rating: 4.8 },
  { id: 200, name: "Anti Hair Fall Shampoo", category: "Hair Care", image: "2.png", price: 299, rating: 4.8 },
  { id: 300, name: "Digital Thermometer", category: "Medical Devices", image: "3.png", price: 180, rating: 4.8 },
  { id: 148, name: "Listerine Mouthwash", category: "Personal Care", image: "4.png", price: 260, rating: 4.8 },
  { id: 169, name: "Vision Support Capsules", category: "Eye Care", image: "5.png", price: 520, rating: 4.8 },
  { id: 144, name: "Colgate Toothpaste", category: "Personal Care", image: "6.png", price: 110, rating: 4.8 },
  { id: 120, name: "Baby Gift Care Kit", category: "Baby Care", image: "7.png", price: 799, rating: 4.9 },
  { id: 354, name: "Amoxycillin 500mg", category: "Medicines", image: "8.png", price: 95, rating: 4.5 },
]);
jest.mock("../utils/productImage", () => ({
  getUniqueProductsByImage: (items) => items,
  getProductImage: () => "/product.png",
  handleProductImageError: jest.fn(),
}));

const renderComponent = () => render(<MemoryRouter><FlashSale /></MemoryRouter>);

describe("FlashSale", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    addProductToCart.mockResolvedValue({});
  });

  test("renders eight real catalog products", async () => {
    renderComponent();
    expect(await screen.findByRole("heading", { name: /flash sale/i })).toBeInTheDocument();
    expect(screen.getAllByRole("img")).toHaveLength(8);
    expect(screen.getAllByRole("link", { name: "View Details" })).toHaveLength(8);
    expect(screen.getByText("Dolo 650 Tablet")).toBeInTheDocument();
    expect(screen.getByText("Amoxycillin 500mg")).toBeInTheDocument();
  });

  test("uses the matching product IDs in detail links", async () => {
    renderComponent();
    await screen.findByRole("heading", { name: /flash sale/i });
    const links = screen.getAllByRole("link", { name: "View Details" });
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/product/350", "/product/200", "/product/300", "/product/148",
      "/product/169", "/product/144", "/product/120", "/product/354",
    ]);
  });

  test("adds the selected catalog product to cart", async () => {
    renderComponent();
    await screen.findByRole("heading", { name: /flash sale/i });
    fireEvent.click(screen.getAllByRole("button", { name: "Add to Cart" })[0]);
    await waitFor(() => expect(addProductToCart).toHaveBeenCalledWith(
      expect.objectContaining({ id: 350, name: "Dolo 650 Tablet" })
    ));
    expect(toast.success).toHaveBeenCalledWith("Product added to cart!", expect.any(Object));
  });
});
