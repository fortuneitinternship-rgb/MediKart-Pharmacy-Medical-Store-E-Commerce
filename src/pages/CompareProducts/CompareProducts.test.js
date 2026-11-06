import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import CompareProducts from "./CompareProducts";
import { getProducts } from "../../api/productApi";

jest.mock("../../api/productApi", () => ({
  getProducts: jest.fn(),
}));

const products = [
  {
    id: 11,
    name: "Paracetamol Tablets",
    brand: "Micro Labs",
    category: "Tablets",
    price: 100,
    discount_price: 96,
    rating: 4.8,
    stock: 5,
  },
  {
    id: 12,
    name: "Vitamin D Capsules",
    brand: "HealthVit",
    category: "Supplements",
    price: 559,
    rating: 4.7,
    stock: 2,
  },
  {
    id: 13,
    name: "Blood Pressure Monitor",
    brand: "Omron",
    category: "Medical Device",
    price: 1874,
    rating: 4.9,
    stock: 1,
  },
];

const LocationProbe = () => {
  const location = useLocation();

  return (
    <output data-testid="route-state">
      {JSON.stringify(location.state)}
    </output>
  );
};

const renderCompareProducts = () =>
  render(
    <MemoryRouter>
      <CompareProducts />
      <LocationProbe />
    </MemoryRouter>
  );

describe("CompareProducts Component", () => {
  beforeEach(() => {
    getProducts.mockResolvedValue(products);
  });

  test("renders page heading and description", () => {
    renderCompareProducts();

    expect(screen.getByText("Compare Products")).toBeInTheDocument();
    expect(
      screen.getByText(/Compare product specifications and choose the best one/i)
    ).toBeInTheDocument();
  });

  test("loads product comparison details from the API", async () => {
    renderCompareProducts();

    expect(await screen.findByText("Paracetamol Tablets")).toBeInTheDocument();
    expect(screen.getByText("Vitamin D Capsules")).toBeInTheDocument();
    expect(screen.getByText("Blood Pressure Monitor")).toBeInTheDocument();
    expect(screen.getByText("Micro Labs")).toBeInTheDocument();
    expect(screen.getByText("HealthVit")).toBeInTheDocument();
    expect(screen.getByText("Omron")).toBeInTheDocument();
    expect(screen.getByText("₹96")).toBeInTheDocument();
    expect(screen.getByText("₹559")).toBeInTheDocument();
    expect(screen.getByText("₹1,874")).toBeInTheDocument();
  });

  test("renders comparison feature names", async () => {
    renderCompareProducts();

    await screen.findByText("Paracetamol Tablets");
    ["Feature", "Brand", "Category", "Price", "Rating", "Availability", "Action"]
      .forEach((feature) => {
        expect(screen.getByText(feature)).toBeInTheDocument();
      });
  });

  test("Buy Now sends the selected database product to checkout", async () => {
    renderCompareProducts();

    const buttons = await screen.findAllByRole("button", { name: "Buy Now" });
    fireEvent.click(buttons[0]);

    expect(screen.getByTestId("route-state")).toHaveTextContent(
      JSON.stringify({
        buyNowItems: [
          {
            product_id: 11,
            name: "Paracetamol Tablets",
            category: "Tablets",
            image: "",
            price: 96,
            discountedPrice: 96,
            quantity: 1,
          },
        ],
      })
    );
  });

  test("shows API failures instead of an empty comparison", async () => {
    getProducts.mockRejectedValueOnce(new Error("API unavailable"));
    renderCompareProducts();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Products could not be loaded from the database."
    );
  });
});
