import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SearchBar from "./SearchBar";

// Mock products so the test does not depend on your full products.js file
jest.mock("../../data/products", () => [
  {
    id: 1,
    name: "Paracetamol",
    price: 99,
    image: "/test-image.png",
  },
  {
    id: 2,
    name: "Dolo 650",
    price: 120,
    image: "/test-image.png",
  },
  {
    id: 3,
    name: "Vitamin D Capsules",
    price: 399,
    image: "/test-image.png",
  },
]);

describe("SearchBar Component", () => {
  test("renders search input", () => {
    render(
      <MemoryRouter>
        <SearchBar />
      </MemoryRouter>
    );

    expect(
      screen.getByPlaceholderText("Search Medicines...")
    ).toBeInTheDocument();
  });

  test("allows user to type in search box", () => {
    render(
      <MemoryRouter>
        <SearchBar />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(
      "Search Medicines..."
    );

    fireEvent.change(input, {
      target: { value: "Paracetamol" },
    });

    expect(input).toHaveValue("Paracetamol");
  });

  test("shows matching product", () => {
    render(
      <MemoryRouter>
        <SearchBar />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(
      "Search Medicines..."
    );

    fireEvent.change(input, {
      target: { value: "Paracetamol" },
    });

    expect(
      screen.getByText("Paracetamol")
    ).toBeInTheDocument();

    expect(
      screen.getByText("₹99")
    ).toBeInTheDocument();
  });

  test("shows multiple matching products", () => {
    render(
      <MemoryRouter>
        <SearchBar />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(
      "Search Medicines..."
    );

    fireEvent.change(input, {
      target: { value: "Dolo" },
    });

    expect(
      screen.getByText("Dolo 650")
    ).toBeInTheDocument();

    expect(
      screen.getByText("₹120")
    ).toBeInTheDocument();
  });

  test("shows no products found for invalid search", () => {
    render(
      <MemoryRouter>
        <SearchBar />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(
      "Search Medicines..."
    );

    fireEvent.change(input, {
      target: { value: "xyz123" },
    });

    expect(
      screen.getByText("No products found")
    ).toBeInTheDocument();
  });

  test("search is case insensitive", () => {
    render(
      <MemoryRouter>
        <SearchBar />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(
      "Search Medicines..."
    );

    fireEvent.change(input, {
      target: { value: "paracetamol" },
    });

    expect(
      screen.getByText("Paracetamol")
    ).toBeInTheDocument();
  });

  test("clear button clears the search", () => {
    render(
      <MemoryRouter>
        <SearchBar />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(
      "Search Medicines..."
    );

    fireEvent.change(input, {
      target: { value: "Paracetamol" },
    });

    expect(input).toHaveValue("Paracetamol");

    const clearButton = document.querySelector(
      ".search-close-icon"
    );

    expect(clearButton).toBeInTheDocument();

    fireEvent.click(clearButton);

    expect(input).toHaveValue("");

    expect(
      screen.queryByText("Paracetamol")
    ).not.toBeInTheDocument();
  });

  test("product link has correct URL", () => {
    render(
      <MemoryRouter>
        <SearchBar />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(
      "Search Medicines..."
    );

    fireEvent.change(input, {
      target: { value: "Paracetamol" },
    });

    const productLink = screen.getByRole("link", {
      name: /Paracetamol/i,
    });

    expect(productLink).toHaveAttribute(
      "href",
      "/product/1"
    );
  });
});