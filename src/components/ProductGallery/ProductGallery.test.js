import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ProductGallery from "./ProductGallery";

// Mock images
jest.mock("../../assets/products/product1.png", () => "product1.png");
jest.mock("../../assets/products/product2.png", () => "product2.png");
jest.mock("../../assets/products/product3.png", () => "product3.png");
jest.mock("../../assets/products/product4.png", () => "product4.png");
jest.mock("../../assets/products/product5.png", () => "product5.png");
jest.mock("../../assets/products/product6.png", () => "product6.png");
jest.mock("../../assets/products/product7.png", () => "product7.png");
jest.mock("../../assets/products/product8.png", () => "product8.png");

describe("ProductGallery Component", () => {
  test("renders gallery container", () => {
    render(<ProductGallery />);

    // eslint-disable-next-line testing-library/no-node-access
    expect(document.querySelector(".gallery")).toBeInTheDocument();
  });

  test("renders main image", () => {
    render(<ProductGallery />);

    const image = screen.getByAltText("Product");

    expect(image).toBeInTheDocument();
  });

  test("uses first custom image when images prop is passed", () => {
    const customImages = [
      "custom1.png",
      "custom2.png",
      "custom3.png",
    ];

    render(<ProductGallery images={customImages} />);

    const image = screen.getByAltText("Product");

    expect(image).toHaveAttribute("src", "custom1.png");
  });

  test("uses default image when images prop is empty", () => {
    render(<ProductGallery images={[]} />);

    const image = screen.getByAltText("Product");

    expect(image).toBeInTheDocument();
  });

  test("image has correct class", () => {
    render(<ProductGallery />);

    const image = screen.getByAltText("Product");

    expect(image).toHaveClass("main-image");
  });

  test("main image container exists", () => {
    render(<ProductGallery />);

    expect(
      // eslint-disable-next-line testing-library/no-node-access
      document.querySelector(".main-image-container")
    ).toBeInTheDocument();
  });
});