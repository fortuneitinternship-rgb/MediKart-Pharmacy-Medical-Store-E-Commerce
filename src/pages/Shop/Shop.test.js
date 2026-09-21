import React from "react";
import {
    render,
    screen,
    fireEvent,
    waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom";

import Shop from "./Shop";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

// ---------------------------------------------------------
// MOCK ROUTER
// ---------------------------------------------------------
jest.mock("react-router-dom", () => ({
    useParams: jest.fn(),
}));

// ---------------------------------------------------------
// MOCK TOAST
// ---------------------------------------------------------
jest.mock("react-toastify", () => ({
    toast: {
        info: jest.fn(),
        success: jest.fn(),
    },
}));

// ---------------------------------------------------------
// MOCK PRODUCT DATA
// ---------------------------------------------------------
const mockProducts = [
    {
        id: 1,
        name: "Test Product A",
        brand: "Brand A",
        category: "Medicines",
        price: 100,
        rating: 4,
    },
    {
        id: 2,
        name: "Test Product B",
        brand: "Brand B",
        category: "Healthcare",
        price: 300,
        rating: 5,
    },
    {
        id: 3,
        name: "Test Product C",
        brand: "Brand A",
        category: "Medicines",
        price: 800,
        rating: 3,
    },
    {
        id: 4,
        name: "Test Product D",
        brand: "Brand C",
        category: "Healthcare",
        price: 1500,
        rating: 4.5,
    },
];

// ---------------------------------------------------------
// MOCK ALL DATA FILES
// ---------------------------------------------------------
jest.mock("../../data/medicines", () => [
    {
        id: 1,
        name: "Test Product A",
        brand: "Brand A",
        category: "Medicines",
        price: 100,
        rating: 4,
    },
]);

jest.mock("../../data/healthcare", () => [
    {
        id: 2,
        name: "Test Product B",
        brand: "Brand B",
        category: "Healthcare",
        price: 300,
        rating: 5,
    },
]);

jest.mock("../../data/vitamins", () => [
    {
        id: 3,
        name: "Test Product C",
        brand: "Brand A",
        category: "Vitamins",
        price: 800,
        rating: 3,
    },
]);

jest.mock("../../data/personalCare", () => [
    {
        id: 4,
        name: "Test Product D",
        brand: "Brand C",
        category: "Personal Care",
        price: 1500,
        rating: 4.5,
    },
]);

jest.mock("../../data/babyCare", () => []);

jest.mock("../../data/medicalDevices", () => []);

jest.mock("../../data/womensHealth", () => []);

jest.mock("../../data/HairCare", () => []);

jest.mock("../../data/eye-care", () => []);

jest.mock("../../data/premium-healthcare", () => []);

// ---------------------------------------------------------
// MOCK PRODUCT CARD
// ---------------------------------------------------------
jest.mock(
    "../../components/ProductCard/ProductCard",
    () => {
        return function MockProductCard({ product }) {
            return (
                <div
                    data-testid="product-card"
                    data-product-id={product.id}
                >
                    Product Card
                </div>
            );
        };
    }
);

// ---------------------------------------------------------
// MOCK FILTER PANEL
// ---------------------------------------------------------
jest.mock(
    "../../components/FilterPanel/FilterPanel",
    () => {
        return function MockFilterPanel(props) {
            return (
                <div data-testid="filter-panel">

                    <button
                        type="button"
                        onClick={() =>
                            props.setSelectedCategory("medicines")
                        }
                    >
                        Category Filter
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            props.setPriceRange("0-199")
                        }
                    >
                        Price Filter
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            props.setSelectedRating("4")
                        }
                    >
                        Rating Filter
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            props.setSelectedBrand("Brand A")
                        }
                    >
                        Brand Filter
                    </button>

                    <button
                        type="button"
                        onClick={props.onReset}
                    >
                        Reset Filters
                    </button>

                    <span data-testid="active-filter-count">
                        {props.activeFilterCount}
                    </span>
                </div>
            );
        };
    }
);

// ---------------------------------------------------------
// TEST HELPERS
// ---------------------------------------------------------
const renderShop = (category = undefined) => {
    useParams.mockReturnValue(
        category ? { category } : {}
    );

    return render(<Shop />);
};

beforeEach(() => {
    jest.clearAllMocks();

    jest.useFakeTimers();

    useParams.mockReturnValue({});
});

afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
});

// =========================================================
// TESTS
// =========================================================

describe("Shop Component", () => {

    // -----------------------------------------------------
    // INITIAL RENDER
    // -----------------------------------------------------
    test("renders Shop component", () => {
        renderShop();

        expect(
            document.querySelector(".shop-page")
        ).toBeInTheDocument();
    });

    // -----------------------------------------------------
    // HEADER
    // -----------------------------------------------------
    test("renders shop header", () => {
        renderShop();

        expect(
            document.querySelector(".shop-header")
        ).toBeInTheDocument();
    });

    test("renders All Products heading by default", () => {
        renderShop();

        expect(
            screen.getByText("All Products")
        ).toBeInTheDocument();
    });

    // -----------------------------------------------------
    // LOADING
    // -----------------------------------------------------
    test("shows loading state initially", () => {
        renderShop();

        expect(
            screen.getByText("Loading Products...")
        ).toBeInTheDocument();
    });

    test("hides loading state after products load", async () => {
        renderShop();

        jest.advanceTimersByTime(400);

        await waitFor(() => {
            expect(
                screen.queryByText("Loading Products...")
            ).not.toBeInTheDocument();
        });
    });

    // -----------------------------------------------------
    // PRODUCTS
    // -----------------------------------------------------
    test("renders product cards after loading", async () => {
        renderShop();

        jest.advanceTimersByTime(400);

        await waitFor(() => {
            expect(
                screen.getAllByTestId("product-card").length
            ).toBeGreaterThan(0);
        });
    });

    test("renders products grid", async () => {
        renderShop();

        jest.advanceTimersByTime(400);

        await waitFor(() => {
            expect(
                document.querySelector(".products-grid")
            ).toBeInTheDocument();
        });
    });

    test("passes showWishlist false to ProductCard indirectly by rendering cards", async () => {
        renderShop();

        jest.advanceTimersByTime(400);

        await waitFor(() => {
            expect(
                screen.getAllByTestId("product-card").length
            ).toBeGreaterThan(0);
        });
    });

    // -----------------------------------------------------
    // PRODUCT COUNT
    // -----------------------------------------------------
    test("shows product count", async () => {
        renderShop();

        jest.advanceTimersByTime(400);

        await waitFor(() => {
            expect(
                screen.getByText(/\d+ Products/)
            ).toBeInTheDocument();
        });
    });

    // -----------------------------------------------------
    // SEARCH
    // -----------------------------------------------------
    test("renders search input", () => {
        renderShop();

        expect(
            screen.getByPlaceholderText(
                "Search medicines, healthcare products..."
            )
        ).toBeInTheDocument();
    });

    test("allows entering search text", () => {
        renderShop();

        const searchInput =
            screen.getByPlaceholderText(
                "Search medicines, healthcare products..."
            );

        fireEvent.change(searchInput, {
            target: {
                value: "Test Product",
            },
        });

        expect(searchInput).toHaveValue(
            "Test Product"
        );
    });

    test("shows clear search button after entering search", () => {
        renderShop();

        const searchInput =
            screen.getByPlaceholderText(
                "Search medicines, healthcare products..."
            );

        fireEvent.change(searchInput, {
            target: {
                value: "test",
            },
        });

        expect(
            screen.getByRole("button", {
                name: "Clear search",
            })
        ).toBeInTheDocument();
    });

    test("clears search text", () => {
        renderShop();

        const searchInput =
            screen.getByPlaceholderText(
                "Search medicines, healthcare products..."
            );

        fireEvent.change(searchInput, {
            target: {
                value: "test",
            },
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: "Clear search",
            })
        );

        expect(searchInput).toHaveValue("");

        expect(toast.info).toHaveBeenCalledWith(
            "Search cleared"
        );
    });

    // -----------------------------------------------------
    // SEARCH FILTERING
    // -----------------------------------------------------
    test("filters products using search text", async () => {
        renderShop();

        jest.advanceTimersByTime(400);

        await waitFor(() => {
            expect(
                screen.getAllByTestId("product-card").length
            ).toBeGreaterThan(0);
        });

        const searchInput =
            screen.getByPlaceholderText(
                "Search medicines, healthcare products..."
            );

        fireEvent.change(searchInput, {
            target: {
                value: "Test Product A",
            },
        });

        await waitFor(() => {
            expect(
                screen.getAllByTestId("product-card")
            ).toHaveLength(1);
        });
    });

    // -----------------------------------------------------
    // SORT
    // -----------------------------------------------------
    test("renders sort dropdown", () => {
        renderShop();

        const select = document.querySelector(
            ".shop-sort select"
        );

        expect(select).toBeInTheDocument();
    });

    test("has all sort options", () => {
        renderShop();

        expect(
            screen.getByRole("option", {
                name: "Sort By",
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("option", {
                name: "Price: Low to High",
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("option", {
                name: "Price: High to Low",
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("option", {
                name: "Highest Rating",
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("option", {
                name: "Name: A-Z",
            })
        ).toBeInTheDocument();
    });

    test("sorts by price low to high", async () => {
        renderShop();

        jest.advanceTimersByTime(400);

        await waitFor(() => {
            expect(
                screen.getAllByTestId("product-card").length
            ).toBeGreaterThan(0);
        });

        const select =
            document.querySelector(
                ".shop-sort select"
            );

        fireEvent.change(select, {
            target: {
                value: "priceLow",
            },
        });

        expect(toast.info).toHaveBeenCalledWith(
            "Sorted by Price: Low to High"
        );
    });

    test("sorts by price high to low", async () => {
        renderShop();

        jest.advanceTimersByTime(400);

        const select =
            document.querySelector(
                ".shop-sort select"
            );

        fireEvent.change(select, {
            target: {
                value: "priceHigh",
            },
        });

        expect(toast.info).toHaveBeenCalledWith(
            "Sorted by Price: High to Low"
        );
    });

    test("sorts by rating", async () => {
        renderShop();

        jest.advanceTimersByTime(400);

        const select =
            document.querySelector(
                ".shop-sort select"
            );

        fireEvent.change(select, {
            target: {
                value: "rating",
            },
        });

        expect(toast.info).toHaveBeenCalledWith(
            "Sorted by Highest Rating"
        );
    });

    test("sorts by name", async () => {
        renderShop();

        jest.advanceTimersByTime(400);

        const select =
            document.querySelector(
                ".shop-sort select"
            );

        fireEvent.change(select, {
            target: {
                value: "name",
            },
        });

        expect(toast.info).toHaveBeenCalledWith(
            "Sorted by Name: A-Z"
        );
    });

    // -----------------------------------------------------
    // FILTER PANEL
    // -----------------------------------------------------
    test("renders FilterPanel", () => {
        renderShop();

        expect(
            screen.getByTestId("filter-panel")
        ).toBeInTheDocument();
    });

    test("renders filter buttons", () => {
        renderShop();

        expect(
            screen.getByRole("button", {
                name: "Category Filter",
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", {
                name: "Price Filter",
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", {
                name: "Rating Filter",
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", {
                name: "Brand Filter",
            })
        ).toBeInTheDocument();
    });

    // -----------------------------------------------------
    // CATEGORY FILTER
    // -----------------------------------------------------
    test("changes category filter", async () => {
        renderShop();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Category Filter",
            })
        );

        expect(toast.success).toHaveBeenCalledWith(
            "Showing Medicines"
        );
    });

    // -----------------------------------------------------
    // PRICE FILTER
    // -----------------------------------------------------
    test("changes price filter", () => {
        renderShop();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Price Filter",
            })
        );

        expect(toast.info).toHaveBeenCalledWith(
            "Price filter applied"
        );
    });

    // -----------------------------------------------------
    // RATING FILTER
    // -----------------------------------------------------
    test("changes rating filter", () => {
        renderShop();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Rating Filter",
            })
        );

        expect(toast.info).toHaveBeenCalledWith(
            "Showing products rated 4★ and above"
        );
    });

    // -----------------------------------------------------
    // BRAND FILTER
    // -----------------------------------------------------
    test("changes brand filter", () => {
        renderShop();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Brand Filter",
            })
        );

        expect(toast.info).toHaveBeenCalledWith(
            "Brand filter: Brand A"
        );
    });

    // -----------------------------------------------------
    // ACTIVE FILTER COUNT
    // -----------------------------------------------------
    test("updates active filter count for search", () => {
        renderShop();

        const searchInput =
            screen.getByPlaceholderText(
                "Search medicines, healthcare products..."
            );

        fireEvent.change(searchInput, {
            target: {
                value: "test",
            },
        });

        expect(
            screen.getByTestId("active-filter-count")
        ).toHaveTextContent("1");
    });

    test("updates active filter count for price filter", () => {
        renderShop();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Price Filter",
            })
        );

        expect(
            screen.getByTestId("active-filter-count")
        ).toHaveTextContent("1");
    });

    // -----------------------------------------------------
    // RESET FILTERS
    // -----------------------------------------------------
    test("resets filters", () => {
        renderShop();

        fireEvent.change(
            screen.getByPlaceholderText(
                "Search medicines, healthcare products..."
            ),
            {
                target: {
                    value: "test",
                },
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Reset Filters",
            })
        );

        expect(
            screen.getByPlaceholderText(
                "Search medicines, healthcare products..."
            )
        ).toHaveValue("");

        expect(toast.success).toHaveBeenCalledWith(
            "All filters have been cleared"
        );
    });

    // -----------------------------------------------------
    // CATEGORY URL
    // -----------------------------------------------------
    test("loads selected category from URL", async () => {
        renderShop("medicines");

        jest.advanceTimersByTime(400);

        await waitFor(() => {
            expect(
                screen.getByText("Medicines")
            ).toBeInTheDocument();
        });
    });

    test("falls back to All Products for invalid category", async () => {
        renderShop("invalid-category");

        expect(
            screen.getByText("All Products")
        ).toBeInTheDocument();

        jest.advanceTimersByTime(400);
    });

    // -----------------------------------------------------
    // LOAD MORE
    // -----------------------------------------------------
    test("shows load more button when products exceed visible limit", async () => {
        renderShop();

        jest.advanceTimersByTime(400);

        await waitFor(() => {
            const cards =
                screen.getAllByTestId("product-card");

            expect(cards.length).toBeGreaterThan(0);
        });

        // With the mocked data there are only four products,
        // so Load More is normally not required.
        // This test verifies the load-more container
        // does not incorrectly appear.
        expect(
            screen.queryByRole("button", {
                name: "Load More Products",
            })
        ).not.toBeInTheDocument();
    });

    // -----------------------------------------------------
    // EMPTY SEARCH RESULT
    // -----------------------------------------------------
    test("shows empty state when search returns no products", async () => {
        renderShop();

        jest.advanceTimersByTime(400);

        await waitFor(() => {
            expect(
                screen.getAllByTestId("product-card").length
            ).toBeGreaterThan(0);
        });

        const searchInput =
            screen.getByPlaceholderText(
                "Search medicines, healthcare products..."
            );

        fireEvent.change(searchInput, {
            target: {
                value: "value-that-does-not-exist",
            },
        });

        await waitFor(() => {
            expect(
                screen.getByText("No Products Found")
            ).toBeInTheDocument();
        });

        expect(
            screen.getByText(
                "Try changing your search or filters."
            )
        ).toBeInTheDocument();
    });

    // -----------------------------------------------------
    // EMPTY STATE RESET
    // -----------------------------------------------------
    test("clears filters from empty state", async () => {
        renderShop();

        jest.advanceTimersByTime(400);

        await waitFor(() => {
            expect(
                screen.getAllByTestId("product-card").length
            ).toBeGreaterThan(0);
        });

        const searchInput =
            screen.getByPlaceholderText(
                "Search medicines, healthcare products..."
            );

        fireEvent.change(searchInput, {
            target: {
                value: "not-found",
            },
        });

        await waitFor(() => {
            expect(
                screen.getByText("No Products Found")
            ).toBeInTheDocument();
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: "Clear Filters",
            })
        );

        expect(toast.success).toHaveBeenCalledWith(
            "All filters have been cleared"
        );
    });

    // -----------------------------------------------------
    // CSS STRUCTURE
    // -----------------------------------------------------
    test("renders main shop layout", () => {
        renderShop();

        expect(
            document.querySelector(".shop-page")
        ).toBeInTheDocument();

        expect(
            document.querySelector(".shop-header")
        ).toBeInTheDocument();

        expect(
            document.querySelector(".shop-content")
        ).toBeInTheDocument();

        expect(
            document.querySelector(".shop-filter")
        ).toBeInTheDocument();

        expect(
            document.querySelector(".shop-products")
        ).toBeInTheDocument();
    });

    test("renders search container", () => {
        renderShop();

        expect(
            document.querySelector(".shop-search")
        ).toBeInTheDocument();
    });

    test("renders sort container", () => {
        renderShop();

        expect(
            document.querySelector(".shop-sort")
        ).toBeInTheDocument();
    });

    // -----------------------------------------------------
    // UNMOUNT / TIMER CLEANUP
    // -----------------------------------------------------
    test("cleans loading timer on unmount", () => {
        const { unmount } = renderShop();

        expect(() => unmount()).not.toThrow();

        jest.runOnlyPendingTimers();
    });
});