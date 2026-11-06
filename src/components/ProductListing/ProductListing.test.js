import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import ProductListing from "./ProductListing";
import { getProducts } from "../../api/productApi";

jest.mock("../../api/productApi", () => ({
    getProducts: jest.fn(),
}));

jest.mock("../ProductCard/ProductCard", () => function MockProductCard({ product }) {
    return <article data-testid="product-card">{product.name}</article>;
});

jest.mock("../SortDropdown/SortDropdown", () => function MockSortDropdown() {
    return <div aria-label="Product sorting" />;
});

describe("ProductListing", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("loads products from the API", async () => {
        getProducts.mockResolvedValue([
            { id: 1, name: "Vitamin C", category: "Vitamins" },
            { id: 2, name: "First Aid Kit", category: "Healthcare" },
        ]);

        render(<ProductListing />);

        expect(screen.getByRole("status")).toHaveTextContent("Loading Products");
        expect(await screen.findAllByTestId("product-card")).toHaveLength(2);
    });

    test("filters loaded products by name and category", async () => {
        getProducts.mockResolvedValue([
            { id: 1, name: "Vitamin C", category: "Vitamins" },
            { id: 2, name: "First Aid Kit", category: "Healthcare" },
        ]);

        render(<ProductListing />);

        await screen.findAllByTestId("product-card");
        fireEvent.change(screen.getByRole("textbox", { name: "Search products" }), {
            target: { value: "health" },
        });

        expect(screen.getAllByTestId("product-card")).toHaveLength(1);
        expect(screen.getByText("First Aid Kit")).toBeInTheDocument();
    });

    test("shows a useful error when products cannot be loaded", async () => {
        getProducts.mockRejectedValue(new Error("API unavailable"));

        render(<ProductListing />);

        await waitFor(() => {
            expect(screen.getByRole("alert")).toHaveTextContent(
                "Products could not be loaded from the database."
            );
        });
    });
});
