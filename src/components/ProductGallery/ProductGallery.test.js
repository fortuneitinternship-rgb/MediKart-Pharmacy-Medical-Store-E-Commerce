import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ProductGallery from "./ProductGallery";

jest.mock("../../utils/productImage", () => ({
  fallbackProductImage: "fallback.png",
  getProductImage: (image) => image || "fallback.png",
  handleProductImageError: jest.fn(),
}));

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

  test("uses a single fallback image when images prop is empty", () => {
    render(<ProductGallery images={[]} />);

    expect(screen.getByAltText("Product")).toHaveAttribute(
      "src",
      "fallback.png"
    );
    expect(screen.queryByAltText("Thumbnail 0")).not.toBeInTheDocument();
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