import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ProductSpecifications from "./ProductSpecifications";

describe("ProductSpecifications Component", () => {
  const product = {
    name: "Dolo 650 Tablet",
    brand: "Micro Labs",
    packSize: "15 Tablets",
    expiry: "Dec 2027",
    stock: true,
    delivery: "2-3 Business Days",
    returnPolicy: "7 Days Return",
  };

  test("renders Product Specifications heading", () => {
    render(<ProductSpecifications product={product} />);

    expect(
      screen.getByText("Product Specifications")
    ).toBeInTheDocument();
  });

  test("renders product name", () => {
    render(<ProductSpecifications product={product} />);

    expect(screen.getByText("Product Name")).toBeInTheDocument();
    expect(screen.getByText("Dolo 650 Tablet")).toBeInTheDocument();
  });

  test("renders brand", () => {
    render(<ProductSpecifications product={product} />);

    expect(screen.getByText("Brand")).toBeInTheDocument();
    expect(screen.getByText("Micro Labs")).toBeInTheDocument();
  });

  test("renders pack size", () => {
    render(<ProductSpecifications product={product} />);

    expect(screen.getByText("Pack Size")).toBeInTheDocument();
    expect(screen.getByText("15 Tablets")).toBeInTheDocument();
  });

  test("renders expiry date", () => {
    render(<ProductSpecifications product={product} />);

    expect(screen.getByText("Expiry Date")).toBeInTheDocument();
    expect(screen.getByText("Dec 2027")).toBeInTheDocument();
  });

  test("shows In Stock when stock is true", () => {
    render(<ProductSpecifications product={product} />);

    expect(screen.getByText("In Stock")).toBeInTheDocument();
  });

  test("shows Out of Stock when stock is false", () => {
    const outOfStockProduct = {
      ...product,
      stock: false,
    };

    render(
      <ProductSpecifications product={outOfStockProduct} />
    );

    expect(screen.getByText("Out of Stock")).toBeInTheDocument();
  });

  test("renders delivery time", () => {
    render(<ProductSpecifications product={product} />);

    expect(screen.getByText("Delivery Time")).toBeInTheDocument();
    expect(
      screen.getByText("2-3 Business Days")
    ).toBeInTheDocument();
  });

  test("renders return policy", () => {
    render(<ProductSpecifications product={product} />);

    expect(screen.getByText("Return Policy")).toBeInTheDocument();
    expect(
      screen.getByText("7 Days Return")
    ).toBeInTheDocument();
  });

  test("renders all specification labels", () => {
    render(<ProductSpecifications product={product} />);

    expect(screen.getByText("Product Name")).toBeInTheDocument();
    expect(screen.getByText("Brand")).toBeInTheDocument();
    expect(screen.getByText("Pack Size")).toBeInTheDocument();
    expect(screen.getByText("Expiry Date")).toBeInTheDocument();
    expect(screen.getByText("Availability")).toBeInTheDocument();
    expect(screen.getByText("Delivery Time")).toBeInTheDocument();
    expect(screen.getByText("Return Policy")).toBeInTheDocument();
  });
});