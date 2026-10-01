import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Gallery from "./Gallery";

// Mock gallery images
jest.mock("../../assets/gallery/gallery1.jpg", () => "gallery1.jpg");
jest.mock("../../assets/gallery/gallery2.jpg", () => "gallery2.jpg");
jest.mock("../../assets/gallery/gallery3.jpg", () => "gallery3.jpg");
jest.mock("../../assets/gallery/gallery4.jpg", () => "gallery4.jpg");
jest.mock("../../assets/gallery/gallery5.jpg", () => "gallery5.jpg");
jest.mock("../../assets/gallery/gallery6.jpg", () => "gallery6.jpg");
jest.mock("../../assets/gallery/gallery7.jpg", () => "gallery7.jpg");
jest.mock("../../assets/gallery/gallery8.jpg", () => "gallery8.jpg");

describe("Gallery Component", () => {
  test("renders gallery heading and description", () => {
    render(<Gallery />);

    expect(screen.getByText("MEDIKART Gallery")).toBeInTheDocument();

    expect(
      screen.getByText(
        "Explore our premium healthcare products and services."
      )
    ).toBeInTheDocument();
  });

  test("renders all gallery titles", () => {
    render(<Gallery />);

    expect(screen.getByText("Medicines")).toBeInTheDocument();
    expect(screen.getByText("Healthcare")).toBeInTheDocument();
    expect(screen.getByText("Personal Care")).toBeInTheDocument();
    expect(screen.getByText("Medical Devices")).toBeInTheDocument();
    expect(screen.getByText("Baby Care")).toBeInTheDocument();
    expect(screen.getByText("Eye Care")).toBeInTheDocument();
    expect(screen.getByText("Hair Care")).toBeInTheDocument();
    expect(
      screen.getByText("Premium Healthcare")
    ).toBeInTheDocument();
  });

  test("renders eight gallery images", () => {
    render(<Gallery />);

    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(8);
  });

  test("renders image alt text correctly", () => {
    render(<Gallery />);

    expect(screen.getByAltText("Medicines")).toBeInTheDocument();
    expect(screen.getByAltText("Healthcare")).toBeInTheDocument();
    expect(screen.getByAltText("Personal Care")).toBeInTheDocument();
    expect(screen.getByAltText("Medical Devices")).toBeInTheDocument();
    expect(screen.getByAltText("Baby Care")).toBeInTheDocument();
    expect(screen.getByAltText("Eye Care")).toBeInTheDocument();
    expect(screen.getByAltText("Hair Care")).toBeInTheDocument();
    expect(
      screen.getByAltText("Premium Healthcare")
    ).toBeInTheDocument();
  });
});