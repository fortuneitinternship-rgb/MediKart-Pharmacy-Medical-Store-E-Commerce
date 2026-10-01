import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProductDetails from "./ProductDetails";

// Mock child components
jest.mock("../../components/ProductGallery/ProductGallery", () => () => (
  <div>Product Gallery</div>
));

jest.mock("../../components/QuantitySelector/QuantitySelector", () => () => (
  <div>Quantity Selector</div>
));

jest.mock(
  "../../components/ProductSpecifications/ProductSpecifications",
  () => () => <div>Product Specifications</div>
);

jest.mock("../../components/RelatedProducts/RelatedProducts", () => () => (
  <div>Related Products</div>
));

jest.mock("../../components/Footer/Footer", () => () => (
  <div>Footer</div>
));

// Mock product data
jest.mock("../../data/products", () => [
  {
    id: 1,
    name: "Paracetamol",
    price: 100,
    discount: 10,
    rating: 4.5,
    reviews: 120,
    description: "Medicine for fever",
    image: "/test.png",
  },
]);

test("renders ProductDetails page", () => {
  render(
    <MemoryRouter initialEntries={["/product/1"]}>
      <Routes>
        <Route
          path="/product/:id"
          element={<ProductDetails />}
        />
      </Routes>
    </MemoryRouter>
  );

  // Loading text appears first
  expect(
    screen.getByText(/Loading Product/i)
  ).toBeInTheDocument();
});