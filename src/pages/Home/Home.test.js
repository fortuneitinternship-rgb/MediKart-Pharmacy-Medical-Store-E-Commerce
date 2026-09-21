import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import Home from "./Home";

// Mock child components
jest.mock("../../components/HeroBanner/HeroBanner", () => () => (
  <div data-testid="hero-banner">Hero Banner</div>
));

jest.mock("../../components/ShopByCategory/ShopByCategory", () => () => (
  <div data-testid="shop-by-category">Shop By Category</div>
));

jest.mock("../../FeaturedProducts/FeaturedProducts", () => () => (
  <div data-testid="featured-products">Featured Products</div>
));

jest.mock("../../TrendingProducts/TrendingProducts", () => () => (
  <div data-testid="trending-products">Trending Products</div>
));

jest.mock("../../FlashSale/FlashSale", () => () => (
  <div data-testid="flash-sale">Flash Sale</div>
));

jest.mock("../../components/Newsletter/Newsletter", () => () => (
  <div data-testid="newsletter">Newsletter</div>
));

describe("Home Component", () => {
  test("renders Home component successfully", () => {
    render(<Home />);

    expect(screen.getByTestId("hero-banner")).toBeInTheDocument();
    expect(screen.getByTestId("shop-by-category")).toBeInTheDocument();
    expect(screen.getByTestId("featured-products")).toBeInTheDocument();
    expect(screen.getByTestId("trending-products")).toBeInTheDocument();
    expect(screen.getByTestId("flash-sale")).toBeInTheDocument();
    expect(screen.getByTestId("newsletter")).toBeInTheDocument();
  });

  test("renders HeroBanner", () => {
    render(<Home />);

    expect(screen.getByTestId("hero-banner")).toHaveTextContent(
      "Hero Banner"
    );
  });

  test("renders ShopByCategory", () => {
    render(<Home />);

    expect(screen.getByTestId("shop-by-category")).toHaveTextContent(
      "Shop By Category"
    );
  });

  test("renders FeaturedProducts", () => {
    render(<Home />);

    expect(screen.getByTestId("featured-products")).toHaveTextContent(
      "Featured Products"
    );
  });

  test("renders TrendingProducts", () => {
    render(<Home />);

    expect(screen.getByTestId("trending-products")).toHaveTextContent(
      "Trending Products"
    );
  });

  test("renders FlashSale", () => {
    render(<Home />);

    expect(screen.getByTestId("flash-sale")).toHaveTextContent(
      "Flash Sale"
    );
  });

  test("renders Newsletter", () => {
    render(<Home />);

    expect(screen.getByTestId("newsletter")).toHaveTextContent(
      "Newsletter"
    );
  });

  test("renders all Home sections", () => {
    render(<Home />);

    const sections = [
      "hero-banner",
      "shop-by-category",
      "featured-products",
      "trending-products",
      "flash-sale",
      "newsletter",
    ];

    sections.forEach((section) => {
      expect(screen.getByTestId(section)).toBeInTheDocument();
    });
  });
});