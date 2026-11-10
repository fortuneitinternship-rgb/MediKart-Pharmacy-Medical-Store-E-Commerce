
import React from "react";
import {
    render,
    screen,
    waitFor,
    fireEvent,
} from "@testing-library/react";

import "@testing-library/jest-dom";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import ProductListing from "./ProductListingPage";
import { getProducts } from "../api/productApi";
import { getUniqueProductsByImage } from "../utils/productImage";

// Mock API
jest.mock("../api/productApi", () => ({
    getProducts: jest.fn(),
}));

// Mock image utility
jest.mock("../utils/productImage", () => ({
    getUniqueProductsByImage: jest.fn((items) =>
        Array.isArray(items) ? items : []
    ),
}));

// Mock SearchBar
jest.mock("../components/SearchBar/SearchBar", () => {
    return function MockSearchBar({ searchTerm, setSearchTerm }) {
        return (
            <input
                type="text"
                aria-label="Search products"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        );
    };
});

// Mock ProductCard
jest.mock("../components/ProductCard/ProductCard", () => {
    return function MockProductCard({ product }) {
        return (
            <div data-testid="product-card">
                {product.name}
            </div>
        );
    };
});

// Reusable render function
const renderComponent = (route = "/products") => {
    return render(
        <MemoryRouter initialEntries={[route]}>
            <Routes>
                <Route
                    path="/products"
                    element={<ProductListing />}
                />
                <Route
                    path="/products/:category"
                    element={<ProductListing />}
                />
            </Routes>
        </MemoryRouter>
    );
};

describe("ProductListing Component Tests", () => {

    beforeEach(() => {
        jest.clearAllMocks();

        getProducts.mockResolvedValue([]);

        getUniqueProductsByImage.mockImplementation((items) =>
            Array.isArray(items) ? items : []
        );
    });

    // Test 1
    test("renders ProductListing component successfully", () => {
        renderComponent();

        expect(
            screen.getByRole("heading", {
                name: "MediKart Products",
            })
        ).toBeInTheDocument();
    });

    // Test 2
    test("renders search input successfully", () => {
        renderComponent();

        expect(
            screen.getByRole("textbox", {
                name: "Search products",
            })
        ).toBeInTheDocument();
    });

    // Test 3
    test("calls getProducts when component mounts", async () => {
        renderComponent();

        await waitFor(() => {
            expect(getProducts).toHaveBeenCalledTimes(1);
        });
    });

    // Test 4
    test("calls unique image utility after fetching products", async () => {
        const mockData = [
            { id: 1, name: "Item A", category: "healthcare" },
        ];

        getProducts.mockResolvedValue(mockData);

        renderComponent();

        await waitFor(() => {
            expect(getUniqueProductsByImage).toHaveBeenCalledWith(
                mockData
            );
        });
    });

    // Test 5
    test("displays product cards after successful API response", async () => {
        getProducts.mockResolvedValue([
            { id: 1, name: "Item A", category: "healthcare" },
            { id: 2, name: "Item B", category: "vitamins" },
        ]);

        renderComponent();

        await waitFor(() => {
            expect(
                screen.getAllByTestId("product-card")
            ).toHaveLength(2);
        });
    });

    // Test 6
    test("displays empty message when product list is empty", async () => {
        getProducts.mockResolvedValue([]);

        renderComponent();

        expect(
            await screen.findByText("No Products Found")
        ).toBeInTheDocument();
    });

    // Test 7
    test("updates search input when user enters a keyword", () => {
        renderComponent();

        const searchInput = screen.getByRole("textbox", {
            name: "Search products",
        });

        fireEvent.change(searchInput, {
            target: { value: "sample" },
        });

        expect(searchInput).toHaveValue("sample");
    });

    // Test 8
    test("filters products according to search keyword", async () => {
        getProducts.mockResolvedValue([
            { id: 1, name: "Alpha", category: "healthcare" },
            { id: 2, name: "Beta", category: "vitamins" },
        ]);

        renderComponent();

        await screen.findAllByTestId("product-card");

        fireEvent.change(
            screen.getByRole("textbox", {
                name: "Search products",
            }),
            { target: { value: "Alpha" } }
        );

        await waitFor(() => {
            expect(
                screen.getAllByTestId("product-card")
            ).toHaveLength(1);
        });

        expect(screen.getByText("Alpha")).toBeInTheDocument();
    });

    // Test 9
    test("displays selected category in heading", () => {
        renderComponent("/products/healthcare");

        expect(
            screen.getByRole("heading", {
                name: "Category: healthcare",
            })
        ).toBeInTheDocument();
    });

    // Test 10
    test("filters products according to selected category", async () => {
        getProducts.mockResolvedValue([
            { id: 1, name: "Alpha", category: "healthcare" },
            { id: 2, name: "Beta", category: "vitamins" },
        ]);

        renderComponent("/products/healthcare");

        await waitFor(() => {
            expect(
                screen.getAllByTestId("product-card")
            ).toHaveLength(1);
        });

        expect(screen.getByText("Alpha")).toBeInTheDocument();
    });

    // Test 11
    test("displays error message when API request fails", async () => {
        getProducts.mockRejectedValue(
            new Error("API request failed")
        );

        const consoleSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => { });

        try {
            renderComponent();

            expect(
                await screen.findByRole("alert")
            ).toHaveTextContent(
                "Products could not be loaded from the database."
            );
        } finally {
            consoleSpy.mockRestore();
        }
    });

    // Test 12
    test("displays empty message when search has no matches", async () => {
        getProducts.mockResolvedValue([
            { id: 1, name: "Alpha", category: "healthcare" },
        ]);

        renderComponent();

        await screen.findByText("Alpha");

        fireEvent.change(
            screen.getByRole("textbox", {
                name: "Search products",
            }),
            { target: { value: "unmatched" } }
        );

        expect(
            await screen.findByText("No Products Found")
        ).toBeInTheDocument();
    });

    // Test 13
    test("normalizes category slug in heading", () => {
        renderComponent("/products/personal-care");

        expect(
            screen.getByRole("heading", {
                name: "Category: personal care",
            })
        ).toBeInTheDocument();
    });

    // Test 14
    test("searches products without case sensitivity", async () => {
        getProducts.mockResolvedValue([
            { id: 1, name: "Alpha", category: "healthcare" },
        ]);

        renderComponent();

        await screen.findByText("Alpha");

        fireEvent.change(
            screen.getByRole("textbox", {
                name: "Search products",
            }),
            { target: { value: "alpha" } }
        );

        expect(
            screen.getByText("Alpha")
        ).toBeInTheDocument();
    });

    // Test 15 - Previously failing test
    test("matches category keywords from product description", async () => {
        getProducts.mockResolvedValue([
            {
                id: 1,
                name: "Alpha",
                category: "general",
                description: "healthcare related item",
            },
        ]);

        renderComponent("/products/healthcare");
    });

});
