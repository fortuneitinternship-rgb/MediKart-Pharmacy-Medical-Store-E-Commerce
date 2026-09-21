import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import RelatedProducts from "./RelatedProducts";

// Mock useNavigate
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("RelatedProducts Component", () => {
  const products = [
    {
      id: 1,
      name: "Paracetamol",
      category: "Medicine",
      price: 99,
      rating: 4.8,
      image: "/test-image.png",
    },
    {
      id: 2,
      name: "Vitamin D",
      category: "Supplements",
      price: 249,
      rating: 4.6,
      image: "/test-image2.png",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders heading", () => {
    render(
      <MemoryRouter>
        <RelatedProducts products={products} />
      </MemoryRouter>
    );

    expect(screen.getByText("Our Products")).toBeInTheDocument();
  });

  test("renders all products", () => {
    render(
      <MemoryRouter>
        <RelatedProducts products={products} />
      </MemoryRouter>
    );

    expect(screen.getByText("Paracetamol")).toBeInTheDocument();
    expect(screen.getByText("Vitamin D")).toBeInTheDocument();
  });

  test("renders product prices", () => {
    render(
      <MemoryRouter>
        <RelatedProducts products={products} />
      </MemoryRouter>
    );

    expect(screen.getByText("₹99")).toBeInTheDocument();
    expect(screen.getByText("₹249")).toBeInTheDocument();
  });

  test("renders View Details buttons", () => {
    render(
      <MemoryRouter>
        <RelatedProducts products={products} />
      </MemoryRouter>
    );

    const buttons = screen.getAllByText("View Details");
    expect(buttons).toHaveLength(2);
  });

  test("renders Add to Cart buttons", () => {
    render(
      <MemoryRouter>
        <RelatedProducts products={products} />
      </MemoryRouter>
    );

    const buttons = screen.getAllByText("Add to Cart");
    expect(buttons).toHaveLength(2);
  });

  test("navigates when View Details is clicked", () => {
    render(
      <MemoryRouter>
        <RelatedProducts products={products} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getAllByText("View Details")[0]);

    expect(mockNavigate).toHaveBeenCalledWith("/product/1");
  });

  test("navigates when image is clicked", () => {
    render(
      <MemoryRouter>
        <RelatedProducts products={products} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getAllByRole("img")[0]);

    expect(mockNavigate).toHaveBeenCalledWith("/product/1");
  });

  test("changes Add to Cart button text after click", () => {
    jest.useFakeTimers();

    render(
      <MemoryRouter>
        <RelatedProducts products={products} />
      </MemoryRouter>
    );

    const button = screen.getAllByText("Add to Cart")[0];

    fireEvent.click(button);

    expect(screen.getByText("✓ Added")).toBeInTheDocument();

    jest.runAllTimers();

    expect(screen.getAllByText("Add to Cart")[0]).toBeInTheDocument();

    jest.useRealTimers();
  });

  test("renders correct number of product images", () => {
    render(
      <MemoryRouter>
        <RelatedProducts products={products} />
      </MemoryRouter>
    );

    expect(screen.getAllByRole("img")).toHaveLength(2);
  });

  test("renders product categories", () => {
    render(
      <MemoryRouter>
        <RelatedProducts products={products} />
      </MemoryRouter>
    );

    expect(screen.getByText("Medicine")).toBeInTheDocument();
    expect(screen.getByText("Supplements")).toBeInTheDocument();
  });
});