import React from "react";
import {
    render,
    screen,
    fireEvent,
    waitFor,
    within,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { toast } from "react-toastify";

import Shop from "./Shop";
import { getProducts } from "../../api/productApi";

// ---------- Mocks (no real network, no real data) ----------
jest.mock("../../api/productApi", () => ({
    getProducts: jest.fn(),
}));

jest.mock("../../utils/productImage", () => ({
    getUniqueProductsByImage: jest.fn((items) => items),
}));

jest.mock("react-toastify", () => ({
    toast: { success: jest.fn(), info: jest.fn(), error: jest.fn() },
}));

jest.mock("../../components/ProductCard/ProductCard", () => {
    const React = require("react");
    return function MockProductCard({ product }) {
        return React.createElement(
            "div",
            { "data-testid": "product-card" },
            product.name
        );
    };
});

jest.mock("../../components/FilterPanel/FilterPanel", () => {
    const React = require("react");
    const h = React.createElement;
    return function MockFilterPanel(props) {
        return h(
            "div",
            { "data-testid": "filter-panel" },
            h("button", { onClick: () => props.setPriceRange("0-199") }, "Mock Price"),
            h("button", { onClick: () => props.setSelectedRating("4") }, "Mock Rating"),
            h(
                "button",
                { onClick: () => props.setSelectedBrand(props.brands[0]) },
                "Mock Brand"
            ),
            h(
                "button",
                { onClick: () => props.setSelectedCategory("medicines") },
                "Mock Category"
            ),
            h("button", { onClick: props.onReset }, "Mock Reset"),
            h("span", { "data-testid": "filter-count" }, String(props.activeFilterCount)),
            h("span", { "data-testid": "brand-count" }, String(props.brands.length))
        );
    };
});

// ---------- Generic placeholder data: 14 items ----------
// Price = n * 50, rating = 3 (items 1-7) or 4.5 (items 8-14),
// brand alternates between "Brand A" (odd) and "Brand B" (even).
const buildProducts = () =>
    Array.from({ length: 14 }, (_, index) => {
        const n = index + 1;
        return {
            id: n,
            name: `Sample Item ${String(n).padStart(2, "0")}`,
            brand: n % 2 === 1 ? "Brand A" : "Brand B",
            category: "Sample Category",
            price: n * 50,
            discount_price: null,
            rating: n <= 7 ? 3 : 4.5,
        };
    });

const renderShop = (path = "/shop") =>
    render(
        <MemoryRouter initialEntries={[path]}>
            <Routes>
                <Route path="/shop" element={<Shop />} />
                <Route path="/shop/:category" element={<Shop />} />
            </Routes>
        </MemoryRouter>
    );

const waitForProducts = () => screen.findAllByTestId("product-card");

describe("Shop", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        getProducts.mockResolvedValue(buildProducts());
    });

    test("shows a loading message while products load", () => {
        getProducts.mockReturnValue(new Promise(() => { }));
        renderShop();

        expect(screen.getByText("Loading Products...")).toBeInTheDocument();
    });

    test("shows the default heading, total count and first 12 products", async () => {
        renderShop();

        const cards = await waitForProducts();

        expect(
            screen.getByRole("heading", { level: 1, name: "All Products" })
        ).toBeInTheDocument();
        expect(screen.getByText("14 Products")).toBeInTheDocument();
        expect(cards).toHaveLength(12);
        expect(getProducts).toHaveBeenCalledTimes(1);
    });

    test("shows an error message when products fail to load", async () => {
        const consoleSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => { });
        getProducts.mockRejectedValue(new Error("fail"));

        renderShop();

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Products could not be loaded from the database."
        );
        expect(screen.queryByTestId("product-card")).not.toBeInTheDocument();

        consoleSpy.mockRestore();
    });

    test("search filters products and can be cleared", async () => {
        renderShop();
        await waitForProducts();

        const input = screen.getByPlaceholderText(/search medicines/i);
        fireEvent.change(input, { target: { value: "Item 03" } });

        expect(screen.getAllByTestId("product-card")).toHaveLength(1);
        expect(screen.getByText("Sample Item 03")).toBeInTheDocument();
        expect(screen.getByText("1 Products")).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: /clear search/i }));

        expect(input).toHaveValue("");
        expect(toast.info).toHaveBeenCalledWith("Search cleared");
        expect(screen.getByText("14 Products")).toBeInTheDocument();
    });

    test("shows the empty state and clears filters from it", async () => {
        renderShop();
        await waitForProducts();

        fireEvent.change(screen.getByPlaceholderText(/search medicines/i), {
            target: { value: "no-such-item" },
        });

        expect(screen.getByText("No Products Found")).toBeInTheDocument();
        expect(screen.queryByTestId("product-card")).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "Clear Filters" }));

        expect(toast.success).toHaveBeenCalledWith("All filters have been cleared");
        expect(await waitForProducts()).toHaveLength(12);
    });

    test("price filter narrows the list", async () => {
        renderShop();
        await waitForProducts();

        fireEvent.click(screen.getByRole("button", { name: "Mock Price" }));

        expect(screen.getByText("3 Products")).toBeInTheDocument();
        expect(toast.info).toHaveBeenCalledWith("Price filter applied");
        expect(screen.getByTestId("filter-count")).toHaveTextContent("1");
    });

    test("rating filter narrows the list", async () => {
        renderShop();
        await waitForProducts();

        fireEvent.click(screen.getByRole("button", { name: "Mock Rating" }));

        expect(screen.getByText("7 Products")).toBeInTheDocument();
        expect(toast.info).toHaveBeenCalledWith(
            "Showing products rated 4★ and above"
        );
    });

    test("brand filter narrows the list and brands are listed once each", async () => {
        renderShop();
        await waitForProducts();

        expect(screen.getByTestId("brand-count")).toHaveTextContent("2");

        fireEvent.click(screen.getByRole("button", { name: "Mock Brand" }));

        expect(screen.getByText("7 Products")).toBeInTheDocument();
        expect(toast.info).toHaveBeenCalledWith("Brand filter: Brand A");
    });

    test("sorting by price high to low puts the most expensive item first", async () => {
        renderShop();
        await waitForProducts();

        fireEvent.change(screen.getByRole("combobox"), {
            target: { value: "priceHigh" },
        });

        const cards = screen.getAllByTestId("product-card");
        expect(cards[0]).toHaveTextContent("Sample Item 14");
        expect(toast.info).toHaveBeenCalledWith("Sorted by Price: High to Low");
    });

    test("sorting by price low to high puts the cheapest item first", async () => {
        renderShop();
        await waitForProducts();

        fireEvent.change(screen.getByRole("combobox"), {
            target: { value: "priceLow" },
        });

        expect(screen.getAllByTestId("product-card")[0]).toHaveTextContent(
            "Sample Item 01"
        );
        expect(toast.info).toHaveBeenCalledWith("Sorted by Price: Low to High");
    });

    test("Load More shows the remaining products", async () => {
        renderShop();
        await waitForProducts();

        fireEvent.click(screen.getByRole("button", { name: "Load More Products" }));

        expect(screen.getAllByTestId("product-card")).toHaveLength(14);
        expect(toast.success).toHaveBeenCalledWith("All products loaded!");
        expect(
            screen.queryByRole("button", { name: "Load More Products" })
        ).not.toBeInTheDocument();
    });

    test("Show All Products displays every product", async () => {
        renderShop();
        await waitForProducts();

        fireEvent.click(screen.getByRole("button", { name: "Show All Products" }));

        expect(screen.getAllByTestId("product-card")).toHaveLength(14);
    });

    test("category change updates the heading and shows the empty state", async () => {
        renderShop();
        await waitForProducts();

        fireEvent.click(screen.getByRole("button", { name: "Mock Category" }));

        expect(
            screen.getByRole("heading", { level: 1, name: "Medicines" })
        ).toBeInTheDocument();
        expect(toast.success).toHaveBeenCalledWith("Showing Medicines");
        // None of the placeholder products belong to this category
        expect(screen.getByText("No Products Found")).toBeInTheDocument();
    });

    test("a known category in the URL sets the heading", async () => {
        renderShop("/shop/medicines");

        expect(
            await screen.findByRole("heading", { level: 1, name: "Medicines" })
        ).toBeInTheDocument();
    });

    test("an unknown category in the URL falls back to All Products", async () => {
        renderShop("/shop/not-a-category");

        await waitForProducts();
        expect(
            screen.getByRole("heading", { level: 1, name: "All Products" })
        ).toBeInTheDocument();
    });

    test("reset button clears applied filters", async () => {
        renderShop();
        await waitForProducts();

        fireEvent.click(screen.getByRole("button", { name: "Mock Price" }));
        expect(screen.getByText("3 Products")).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "Mock Reset" }));

        await waitFor(() =>
            expect(screen.getByText("14 Products")).toBeInTheDocument()
        );
        expect(toast.success).toHaveBeenCalledWith("All filters have been cleared");
        expect(screen.getByTestId("filter-count")).toHaveTextContent("0");
    });

    test("the filter panel is rendered inside the sidebar", async () => {
        renderShop();
        await waitForProducts();

        const panel = screen.getByTestId("filter-panel");
        expect(within(panel).getByRole("button", { name: "Mock Reset" })).toBeInTheDocument();
    });
});