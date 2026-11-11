
import React from "react";
import {
    render,
    screen,
    fireEvent,
    waitFor,
    cleanup,
} from "@testing-library/react";
import "@testing-library/jest-dom";

import ProductListing from "./ProductListing";
import { getProducts } from "../../api/productApi";

// Mock ProductCard
jest.mock("../ProductCard/ProductCard", () => {
    return function MockProductCard({ product }) {
        return (
            <div data-testid="product-card">
                <h3>{product.name}</h3>
                <span>{product.category}</span>
                <span>{product.price}</span>
                <span>{product.rating}</span>
            </div>
        );
    };
});

// Mock SortDropdown
jest.mock("../SortDropdown/SortDropdown", () => {
    return function MockSortDropdown({ sortBy, setSortBy }) {
        return (
            <select
                aria-label="Sort products"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
            >
                <option value="">Default</option>
                <option value="priceLowHigh">Price Low to High</option>
                <option value="priceHighLow">Price High to Low</option>
                <option value="nameAZ">Name A-Z</option>
                <option value="nameZA">Name Z-A</option>
                <option value="rating">Rating</option>
                <option value="newest">Newest</option>
            </select>
        );
    };
});

// Mock product API
jest.mock("../../api/productApi", () => ({
    getProducts: jest.fn(),
}));

// Mock CSS module
jest.mock("./ProductListing.module.css", () => ({
    loading: "loading",
    empty: "empty",
    container: "container",
    topBar: "topBar",
    leftControls: "leftControls",
    rightControls: "rightControls",
    searchBox: "searchBox",
    searchIcon: "searchIcon",
    clearIcon: "clearIcon",
    grid: "grid",
    center: "center",
    load: "load",
}));

// Generic mock data
const mockProducts = [
    {
        id: 101,
        name: "Test Item Alpha",
        category: "Category Alpha",
        price: 100,
        rating: 4.5,
    },
    {
        id: 102,
        name: "Test Item Beta",
        category: "Category Beta",
        price: 200,
        rating: 4.2,
    },
    {
        id: 103,
        name: "Test Item Gamma",
        category: "Category Alpha",
        price: 300,
        rating: 4.8,
    },
    {
        id: 104,
        name: "Test Item Delta",
        category: "Category Gamma",
        price: 400,
        rating: 3.9,
    },
    {
        id: 105,
        name: "Test Item Epsilon",
        category: "Category Beta",
        price: 500,
        rating: 4.6,
    },
    {
        id: 106,
        name: "Test Item Zeta",
        category: "Category Gamma",
        price: 600,
        rating: 4.1,
    },
];

const renderComponent = (props = {}) => {
    return render(
        <ProductListing {...props} />
    );
};

const loadProducts = async (products = mockProducts) => {
    getProducts.mockResolvedValueOnce(products);

    renderComponent();

    await waitFor(() => {
        expect(getProducts).toHaveBeenCalledTimes(1);
    });

    await screen.findByText("Our Products");
};

describe("ProductListing Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        getProducts.mockResolvedValue(mockProducts);
    });

    afterEach(() => {
        cleanup();
    });

    // 1. Loading state
    test("displays loading message initially", () => {
        getProducts.mockReturnValue(new Promise(() => { }));

        renderComponent();

        expect(
            screen.getByText("Loading Products...")
        ).toBeInTheDocument();
    });

    // 2. Fetch products
    test("calls getProducts when component mounts", async () => {
        await loadProducts();

        expect(getProducts).toHaveBeenCalledTimes(1);
    });

    // 3. Display heading
    test("displays Our Products heading after loading", async () => {
        await loadProducts();

        expect(
            screen.getByRole("heading", {
                name: "Our Products",
            })
        ).toBeInTheDocument();
    });

    // 4. Display first four products
    test("displays the first four products by default", async () => {
        await loadProducts();

        expect(screen.getAllByTestId("product-card")).toHaveLength(4);

        expect(screen.getByText("Test Item Alpha")).toBeInTheDocument();
        expect(screen.getByText("Test Item Beta")).toBeInTheDocument();
        expect(screen.getByText("Test Item Gamma")).toBeInTheDocument();
        expect(screen.getByText("Test Item Delta")).toBeInTheDocument();

        expect(screen.queryByText("Test Item Epsilon")).not.toBeInTheDocument();
    });

    // 5. Product data
    test("passes product data to ProductCard", async () => {
        await loadProducts();

        expect(screen.getByText("Category Alpha")).toBeInTheDocument();
        expect(screen.getByText("100")).toBeInTheDocument();
        expect(screen.getByText("4.5")).toBeInTheDocument();
    });

    // 6. Search input
    test("renders the search input", async () => {
        await loadProducts();

        expect(
            screen.getByRole("textbox", {
                name: /search products/i,
            })
        ).toBeInTheDocument();
    });

    // 7. Search by product name
    test("filters products by product name", async () => {
        await loadProducts();

        fireEvent.change(
            screen.getByRole("textbox", {
                name: /search products/i,
            }),
            {
                target: {
                    value: "Alpha",
                },
            }
        );

        expect(screen.getByText("Test Item Alpha")).toBeInTheDocument();

        expect(screen.queryByText("Test Item Beta")).not.toBeInTheDocument();
        expect(screen.queryByText("Test Item Gamma")).not.toBeInTheDocument();
    });

    // 8. Search by category
    test("filters products by category", async () => {
        await loadProducts();

        fireEvent.change(
            screen.getByRole("textbox", {
                name: /search products/i,
            }),
            {
                target: {
                    value: "Category Beta",
                },
            }
        );

        expect(screen.getByText("Test Item Beta")).toBeInTheDocument();
        expect(screen.getByText("Test Item Epsilon")).toBeInTheDocument();

        expect(screen.queryByText("Test Item Alpha")).not.toBeInTheDocument();
    });

    // 9. Case-insensitive search
    test("supports case-insensitive search", async () => {
        await loadProducts();

        fireEvent.change(
            screen.getByRole("textbox", {
                name: /search products/i,
            }),
            {
                target: {
                    value: "alpha",
                },
            }
        );

        expect(screen.getByText("Test Item Alpha")).toBeInTheDocument();
    });

    // 10. Search with no matching results
    test("displays No Products Found when search has no matches", async () => {
        await loadProducts();

        fireEvent.change(
            screen.getByRole("textbox", {
                name: /search products/i,
            }),
            {
                target: {
                    value: "NoMatchingValue",
                },
            }
        );

        expect(
            screen.getByRole("heading", {
                name: /no products found/i,
            })
        ).toBeInTheDocument();

        expect(
            screen.getByText("Try another search keyword.")
        ).toBeInTheDocument();
    });

    // 11. Clear search
    test("clears search when clear icon is clicked", async () => {
        await loadProducts();

        const searchInput = screen.getByRole("textbox", {
            name: /search products/i,
        });

        fireEvent.change(searchInput, {
            target: {
                value: "Alpha",
            },
        });

        expect(searchInput).toHaveValue("Alpha");

        const clearIcon = document.querySelector(".clearIcon");

        expect(clearIcon).toBeInTheDocument();

        fireEvent.click(clearIcon);

        expect(searchInput).toHaveValue("");
        expect(screen.getAllByTestId("product-card")).toHaveLength(4);
    });

    // 12. Clear icon visibility
    test("does not display clear icon when search is empty", async () => {
        await loadProducts();

        expect(
            document.querySelector(".clearIcon")
        ).not.toBeInTheDocument();
    });

    // 13. Load More button
    test("displays Load More when more than four products exist", async () => {
        await loadProducts();

        expect(
            screen.getByRole("button", {
                name: /load more/i,
            })
        ).toBeInTheDocument();
    });

    // 14. Load more products
    test("loads additional products when Load More is clicked", async () => {
        await loadProducts();

        fireEvent.click(
            screen.getByRole("button", {
                name: /load more/i,
            })
        );

        expect(screen.getAllByTestId("product-card")).toHaveLength(6);

        expect(screen.getByText("Test Item Epsilon")).toBeInTheDocument();
        expect(screen.getByText("Test Item Zeta")).toBeInTheDocument();
    });

    // 15. Hide Load More
    test("hides Load More when all products are visible", async () => {
        await loadProducts();

        fireEvent.click(
            screen.getByRole("button", {
                name: /load more/i,
            })
        );

        expect(
            screen.queryByRole("button", {
                name: /load more/i,
            })
        ).not.toBeInTheDocument();
    });

    // 16. Reset visible count after searching
    test("resets visible product count when search changes", async () => {
        await loadProducts();

        fireEvent.click(
            screen.getByRole("button", {
                name: /load more/i,
            })
        );

        expect(screen.getAllByTestId("product-card")).toHaveLength(6);

        fireEvent.change(
            screen.getByRole("textbox", {
                name: /search products/i,
            }),
            {
                target: {
                    value: "Category Beta",
                },
            }
        );

        expect(screen.getAllByTestId("product-card")).toHaveLength(2);
    });

    // 17. Price low to high sorting
    test("sorts products by price from low to high", async () => {
        const setSortBy = jest.fn();

        await loadProducts({
            setSortBy,
            sortBy: "priceLowHigh",
        });

        const cards = screen.getAllByTestId("product-card");

        expect(cards[0]).toHaveTextContent("Test Item Alpha");
        expect(cards[1]).toHaveTextContent("Test Item Beta");
    });

    // 18. Price high to low sorting
    test("sorts products by price from high to low", async () => {
        await loadProductsForSorting("priceHighLow");

        const cards = screen.getAllByTestId("product-card");

        expect(cards[0]).toHaveTextContent("Test Item Delta");
        expect(cards[1]).toHaveTextContent("Test Item Gamma");
    });

    // 19. Name A-Z sorting
    test("sorts products by name A-Z", async () => {
        await loadProductsForSorting("nameAZ");

        const cards = screen.getAllByTestId("product-card");

        expect(cards[0]).toHaveTextContent("Test Item Alpha");
        expect(cards[1]).toHaveTextContent("Test Item Beta");
    });

    // 20. Name Z-A sorting
    test("sorts products by name Z-A", async () => {
        await loadProductsForSorting("nameZA");

        const cards = screen.getAllByTestId("product-card");

        expect(cards[0]).toHaveTextContent("Test Item Zeta");
        expect(cards[1]).toHaveTextContent("Test Item Gamma");
    });

    // 21. Rating sorting
    test("sorts products by rating from highest to lowest", async () => {
        await loadProductsForSorting("rating");

        const cards = screen.getAllByTestId("product-card");

        expect(cards[0]).toHaveTextContent("Test Item Gamma");
        expect(cards[1]).toHaveTextContent("Test Item Epsilon");
    });

    // 22. Newest sorting
    test("sorts products by newest first", async () => {
        await loadProductsForSorting("newest");

        const cards = screen.getAllByTestId("product-card");

        expect(cards[0]).toHaveTextContent("Test Item Zeta");
        expect(cards[1]).toHaveTextContent("Test Item Epsilon");
    });

    // 23. Empty API response
    test("displays No Products Available when API returns an empty array", async () => {
        getProducts.mockResolvedValueOnce([]);

        renderComponent();

        expect(
            await screen.findByText("No Products Available")
        ).toBeInTheDocument();
    });

    // 24. API error
    test("displays error message when product API fails", async () => {
        const consoleErrorSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => { });

        getProducts.mockRejectedValueOnce(
            new Error("Test API error")
        );

        renderComponent();

        expect(
            await screen.findByText(
                "Products could not be loaded from the database."
            )
        ).toBeInTheDocument();

        expect(consoleErrorSpy).toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
    });

    // 25. Default sort
    test("renders products in original order when no sorting is selected", async () => {
        await loadProducts();

        const cards = screen.getAllByTestId("product-card");

        expect(cards[0]).toHaveTextContent("Test Item Alpha");
        expect(cards[1]).toHaveTextContent("Test Item Beta");
    });

    // 26. SortDropdown callback
    test("calls setSortBy when sort option changes", async () => {
        const setSortBy = jest.fn();

        await loadProducts({
            setSortBy,
            sortBy: "",
        });

        fireEvent.change(
            screen.getByRole("combobox", {
                name: /sort products/i,
            }),
            {
                target: {
                    value: "priceLowHigh",
                },
            }
        );

        expect(setSortBy).toHaveBeenCalledWith("priceLowHigh");
    });

    // 27. Search with empty results
    test("does not display Load More when search returns no results", async () => {
        await loadProducts();

        fireEvent.change(
            screen.getByRole("textbox", {
                name: /search products/i,
            }),
            {
                target: {
                    value: "NoMatchingValue",
                },
            }
        );

        expect(
            screen.queryByRole("button", {
                name: /load more/i,
            })
        ).not.toBeInTheDocument();
    });

    // 28. API called only once
    test("does not call getProducts again when component rerenders", async () => {
        const { rerender } = renderComponent();

        await screen.findByText("Our Products");

        rerender(<ProductListing />);

        expect(getProducts).toHaveBeenCalledTimes(1);
    });
});

// Helper for sorting tests
async function loadProductsForSorting(sortBy) {
    getProducts.mockResolvedValueOnce(mockProducts);

    renderComponent({
        sortBy,
        setSortBy: jest.fn(),
    });

    await screen.findByText("Our Products");
}
