import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import ProductListing from "./ProductListingPage";

// Mock useParams
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn(),
}));

const { useParams } = require("react-router-dom");

// Mock products
jest.mock("../data/products", () => [
  {
    id: 1,
    name: "Paracetamol",
    category: "Medicine",
    price: 50,
  },
  {
    id: 2,
    name: "Vitamin C",
    category: "Vitamin",
    price: 100,
  },
  {
    id: 3,
    name: "Thermometer",
    category: "Equipment",
    price: 300,
  },
]);

// Mock SearchBar
jest.mock("../components/SearchBar/SearchBar", () => (props) => (
  <input
    data-testid="search-input"
    value={props.searchTerm}
    onChange={(e) => props.setSearchTerm(e.target.value)}
  />
));

// Mock ProductCard
jest.mock("../components/ProductCard/ProductCard", () => ({ product }) => (
  <div data-testid="product-card">{product.name}</div>
));

describe("ProductListing", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders page title when no category", () => {
    useParams.mockReturnValue({});

    render(
      <MemoryRouter>
        <ProductListing />
      </MemoryRouter>
    );

    expect(screen.getByText("MediKart Products")).toBeInTheDocument();
  });

  test("renders category title", () => {
    useParams.mockReturnValue({
      category: "medicine",
    });

    render(
      <MemoryRouter>
        <ProductListing />
      </MemoryRouter>
    );

    expect(
      screen.getByText("Category: medicine")
    ).toBeInTheDocument();
  });

  test("renders all products", () => {
    useParams.mockReturnValue({});

    render(
      <MemoryRouter>
        <ProductListing />
      </MemoryRouter>
    );

    expect(screen.getByText("Paracetamol")).toBeInTheDocument();
    expect(screen.getByText("Vitamin C")).toBeInTheDocument();
    expect(screen.getByText("Thermometer")).toBeInTheDocument();
  });

  test("filters products by search", () => {
    useParams.mockReturnValue({});

    render(
      <MemoryRouter>
        <ProductListing />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByTestId("search-input"), {
      target: {
        value: "Vitamin",
      },
    });

    expect(screen.getByText("Vitamin C")).toBeInTheDocument();
    expect(screen.queryByText("Paracetamol")).not.toBeInTheDocument();
    expect(screen.queryByText("Thermometer")).not.toBeInTheDocument();
  });

  test("filters by category", () => {
    useParams.mockReturnValue({
      category: "medicine",
    });

    render(
      <MemoryRouter>
        <ProductListing />
      </MemoryRouter>
    );

    expect(screen.getByText("Paracetamol")).toBeInTheDocument();
    expect(screen.queryByText("Vitamin C")).not.toBeInTheDocument();
    expect(screen.queryByText("Thermometer")).not.toBeInTheDocument();
  });

  test("maps shop category slugs to matching products", () => {
    useParams.mockReturnValue({
      category: "medicines",
    });

    render(
      <MemoryRouter>
        <ProductListing />
      </MemoryRouter>
    );

    expect(screen.getByText("Paracetamol")).toBeInTheDocument();
    expect(screen.queryByText("Vitamin C")).not.toBeInTheDocument();
  });

  test("shows no products found", () => {
    useParams.mockReturnValue({});

    render(
      <MemoryRouter>
        <ProductListing />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByTestId("search-input"), {
      target: {
        value: "xyz",
      },
    });

    expect(
      screen.getByText("No Products Found")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Try another keyword.")
    ).toBeInTheDocument();
  });

  test("renders SearchBar", () => {
    useParams.mockReturnValue({});

    render(
      <MemoryRouter>
        <ProductListing />
      </MemoryRouter>
    );

    expect(
      screen.getByTestId("search-input")
    ).toBeInTheDocument();
  });

  test("renders correct number of ProductCards", () => {
    useParams.mockReturnValue({});

    render(
      <MemoryRouter>
        <ProductListing />
      </MemoryRouter>
    );

    expect(
      screen.getAllByTestId("product-card")
    ).toHaveLength(3);
  });
});