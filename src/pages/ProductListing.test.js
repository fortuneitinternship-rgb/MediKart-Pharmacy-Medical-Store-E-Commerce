
import React from "react";
import {
    render,
    screen,
    waitFor,
    fireEvent,
} from "@testing-library/react";

import {
    MemoryRouter,
    Routes,
    Route,
} from "react-router-dom";

import ProductListing from "../ProductListingPage";
import { getProducts } from "../../api/productApi";

jest.mock("../../api/productApi", () => ({
    getProducts: jest.fn(),
}));

jest.mock("../../components/SearchBar/SearchBar", () => {
    return function MockSearchBar({ searchTerm, setSearchTerm }) {
        return (
            <input
                aria-label="Search products"
                placeholder="Search..."
                value={searchTerm}
                onChange={(event) =>
                    setSearchTerm(event.target.value)
                }
            />
        );
    };
});

jest.mock("../../components/ProductCard/ProductCard", () => {
    return function MockProductCard({ product }) {
        return (
            <div data-testid="product-card">
                {product.name || "Unnamed item"}
            </div>
        );
    };
});

describe("ProductListing Page Tests", () => {
    // Synthetic test data only.
    const mockProducts = [
        {
            id: 10001,
            name: "Synthetic Item Alpha",
            category: "medicines",
            description: "Synthetic test description",
        },
        {
            id: 10002,
            name: "Synthetic Item Beta",
            category: "vitamins",
            description: "Synthetic test description",
        },
        {
            id: 10003,
            name: "Synthetic Item Gamma",
            category: "personal care",
            description: "",
        },
    ];

    const renderPage = (path = "/products") => {
        return render(
            <MemoryRouter initialEntries={[path]}>
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

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // --------------------------------
    // PAGE RENDERING TESTS
    // --------------------------------

    test("should display the page heading", async () => {
        getProducts.mockResolvedValue(mockProducts);

        renderPage();

        expect(
            screen.getByRole("heading", {
                name: "MediKart Products",
            })
        ).toBeInTheDocument();

        await waitFor(() => {
            expect(
                screen.getAllByTestId("product-card")
            ).toHaveLength(3);
        });
    });

    test("should display the search input", () => {
        getProducts.mockResolvedValue([]);

        renderPage();

        expect(
            screen.getByRole("textbox", {
                name: "Search products",
            })
        ).toBeInTheDocument();
    });

    test("should display the loading message", () => {
        getProducts.mockReturnValue(new Promise(() => {}));

        renderPage();

        expect(
            screen.getByRole("status")
        ).toHaveTextContent("Loading products...");
    });

    // --------------------------------
    // API TESTS
    // --------------------------------

    test("should load products successfully", async () => {
        getProducts.mockResolvedValue(mockProducts);

        renderPage();

        await waitFor(() => {
            expect(getProducts).toHaveBeenCalledTimes(1);
        });

        expect(
            await screen.findAllByTestId("product-card")
        ).toHaveLength(3);
    });

    test("should display error when API request fails", async () => {
        getProducts.mockRejectedValue(
            new Error("Synthetic API failure")
        );

        renderPage();

        expect(
            await screen.findByRole("alert")
        ).toHaveTextContent(
            "Products could not be loaded from the database."
        );
    });

    test("should handle an empty API response", async () => {
        getProducts.mockResolvedValue([]);

        renderPage();

        expect(
            await screen.findByText("No Products Found")
        ).toBeInTheDocument();
    });

    test("should handle invalid API response", async () => {
        getProducts.mockResolvedValue({
            results: "invalid",
        });

        renderPage();

        expect(
            await screen.findByText("No Products Found")
        ).toBeInTheDocument();
    });

    // --------------------------------
    // SEARCH TESTS
    // --------------------------------

    test("should filter products by name", async () => {
        getProducts.mockResolvedValue(mockProducts);

        renderPage();

        await screen.findAllByTestId("product-card");

        fireEvent.change(
            screen.getByRole("textbox", {
                name: "Search products",
            }),
            {
                target: {
                    value: "Alpha",
                },
            }
        );

        expect(
            screen.getAllByTestId("product-card")
        ).toHaveLength(1);

        expect(
            screen.getByText("Synthetic Item Alpha")
        ).toBeInTheDocument();
    });

    test("should filter products by category", async () => {
        getProducts.mockResolvedValue(mockProducts);

        renderPage();

        await screen.findAllByTestId("product-card");

        fireEvent.change(
            screen.getByRole("textbox", {
                name: "Search products",
            }),
            {
                target: {
                    value: "vitamins",
                },
            }
        );

        expect(
            screen.getAllByTestId("product-card")
        ).toHaveLength(1);

        expect(
            screen.getByText("Synthetic Item Beta")
        ).toBeInTheDocument();
    });

    test("should display no products for unmatched search", async () => {
        getProducts.mockResolvedValue(mockProducts);

        renderPage();

        await screen.findAllByTestId("product-card");

        fireEvent.change(
            screen.getByRole("textbox", {
                name: "Search products",
            }),
            {
                target: {
                    value: "NoMatchingItem",
                },
            }
        );

        expect(
            screen.getByText("No Products Found")
        ).toBeInTheDocument();
    });

    // --------------------------------
    // CATEGORY TESTS
    // --------------------------------

    test("should filter products by category route", async () => {
        getProducts.mockResolvedValue(mockProducts);

        renderPage("/products/vitamins");

        expect(
            screen.getByRole("heading", {
                name: "Category: vitamins",
            })
        ).toBeInTheDocument();

        expect(
            await screen.findAllByTestId("product-card")
        ).toHaveLength(1);

        expect(
            screen.getByText("Synthetic Item Beta")
        ).toBeInTheDocument();
    });

    test("should support hyphenated category routes", async () => {
        getProducts.mockResolvedValue(mockProducts);

        renderPage("/products/personal-care");

        expect(
            await screen.findAllByTestId("product-card")
        ).toHaveLength(1);

        expect(
            screen.getByText("Synthetic Item Gamma")
        ).toBeInTheDocument();
    });

    test("should display no products for an unknown category", async () => {
        getProducts.mockResolvedValue(mockProducts);

        renderPage("/products/unknown-category");

        expect(
            await screen.findByText("No Products Found")
        ).toBeInTheDocument();
    });

    // --------------------------------
    // EDGE CASE TESTS
    // --------------------------------

    test("should handle missing product name", async () => {
        getProducts.mockResolvedValue([
            {
                id: 10004,
                category: "healthcare",
                description: "",
            },
        ]);

        renderPage();

        expect(
            await screen.findByTestId("product-card")
        ).toHaveTextContent("Unnamed item");
    });

    test("should handle missing optional fields", async () => {
        getProducts.mockResolvedValue([
            {
                id: 10005,
            },
        ]);

        renderPage();

        expect(
            await screen.findByTestId("product-card")
        ).toBeInTheDocument();
    });

    test("should ignore search letter case", async () => {
        getProducts.mockResolvedValue(mockProducts);

        renderPage();

        await screen.findAllByTestId("product-card");

        fireEvent.change(
            screen.getByRole("textbox", {
                name: "Search products",
            }),
            {
                target: {
                    value: "SYNTHETIC ITEM ALPHA",
                },
            }
        );

        expect(
            screen.getAllByTestId("product-card")
        ).toHaveLength(1);
    });

    test("should make only one API request on initial render", async () => {
        getProducts.mockResolvedValue(mockProducts);

        renderPage();

        await waitFor(() => {
            expect(getProducts).toHaveBeenCalledTimes(1);
        });
    });
});
