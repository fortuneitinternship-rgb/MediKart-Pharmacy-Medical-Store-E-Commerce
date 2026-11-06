
import React from "react";
import {
    render,
    screen,
    fireEvent,
    waitFor,
    act,
} from "@testing-library/react";

import { MemoryRouter } from "react-router-dom";

import FeaturedProducts from "./FeaturedProducts";

import { addProductToCart } from "../api/cartApi";
import { getFeaturedProducts } from "../api/productApi";

import {
    getProductImage,
    handleProductImageError,
} from "../utils/productImage";

import { toast } from "react-toastify";

// Mock API functions
jest.mock("../api/cartApi", () => ({
    addProductToCart: jest.fn(),
}));

jest.mock("../api/productApi", () => ({
    getFeaturedProducts: jest.fn(),
}));

// Mock toast notifications
jest.mock("react-toastify", () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

// Mock image utilities
jest.mock("../utils/productImage", () => ({
    getUniqueProductsByImage: jest.fn((items) => items),
    getProductImage: jest.fn(),
    handleProductImageError: jest.fn(),
}));

// Mock CSS
jest.mock("react-toastify/dist/ReactToastify.css", () => ({}));

jest.mock("./FeaturedProducts.css", () => ({}));

describe("FeaturedProducts Component Tests", () => {
    // Synthetic test data only.
    const mockProducts = [
        {
            id: 10001,
            name: "Synthetic Item Alpha",
            price: 100,
            rating: 4,
            category: "category-alpha",
            image: "synthetic-image-alpha",
        },
        {
            id: 10002,
            name: "Synthetic Item Beta",
            price: 200,
            rating: 5,
            category: "category-beta",
            image: "synthetic-image-beta",
        },
    ];

    const renderComponent = () =>
        render(
            <MemoryRouter>
                <FeaturedProducts />
            </MemoryRouter>
        );

    beforeEach(() => {
        jest.clearAllMocks();

        jest.useRealTimers();

        getFeaturedProducts.mockResolvedValue(mockProducts);

        addProductToCart.mockResolvedValue({
            success: true,
        });

        getProductImage.mockReturnValue(
            "synthetic-placeholder-image"
        );
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    // --------------------------------
    // RENDERING TESTS
    // --------------------------------

    test("should render Featured Products heading", async () => {
        renderComponent();

        expect(
            screen.getByRole("heading", {
                name: "Featured Products",
            })
        ).toBeInTheDocument();

        expect(
            await screen.findByText("Synthetic Item Alpha")
        ).toBeInTheDocument();
    });

    test("should display featured products description", () => {
        renderComponent();

        expect(
            screen.getByText(
                "Discover our most popular healthcare products"
            )
        ).toBeInTheDocument();
    });

    test("should call featured products API", async () => {
        renderComponent();

        await screen.findByText("Synthetic Item Alpha");

        expect(getFeaturedProducts).toHaveBeenCalledTimes(1);
    });

    test("should render all featured products", async () => {
        renderComponent();

        const products = await screen.findAllByRole("heading", {
            level: 3,
        });

        expect(products).toHaveLength(2);
    });

    test("should display product prices", async () => {
        renderComponent();

        expect(
            await screen.findByText("₹100")
        ).toBeInTheDocument();

        expect(screen.getByText("₹200")).toBeInTheDocument();
    });

    test("should display product ratings", async () => {
        renderComponent();

        expect(
            await screen.findByText("⭐ 4")
        ).toBeInTheDocument();

        expect(screen.getByText("⭐ 5")).toBeInTheDocument();
    });

    // --------------------------------
    // IMAGE TESTS
    // --------------------------------

    test("should call getProductImage for each product", async () => {
        renderComponent();

        await screen.findByText("Synthetic Item Alpha");

        expect(getProductImage).toHaveBeenCalledTimes(2);

        expect(getProductImage).toHaveBeenCalledWith(
            "synthetic-image-alpha",
            "Synthetic Item Alpha",
            "category-alpha"
        );
    });

    test("should render product images", async () => {
        renderComponent();

        const images = await screen.findAllByRole("img");

        expect(images).toHaveLength(2);

        expect(images[0]).toHaveAttribute(
            "src",
            "synthetic-placeholder-image"
        );
    });

    test("should handle broken product images", async () => {
        renderComponent();

        const images = await screen.findAllByRole("img");

        fireEvent.error(images[0]);

        expect(handleProductImageError).toHaveBeenCalledWith(
            expect.any(Object),
            "Synthetic Item Alpha",
            "category-alpha"
        );
    });

    // --------------------------------
    // PRODUCT NAVIGATION TESTS
    // --------------------------------

    test("should display View Details links", async () => {
        renderComponent();

        const links = await screen.findAllByRole("link", {
            name: "View Details",
        });

        expect(links).toHaveLength(2);
    });

    test("should navigate to the correct product details route", async () => {
        renderComponent();

        const link = await screen.findByRole("link", {
            name: "View Details",
        });

        expect(link).toHaveAttribute(
            "href",
            "/product/10001"
        );
    });

    // --------------------------------
    // ADD TO CART TESTS
    // --------------------------------

    test("should display Add to Cart buttons", async () => {
        renderComponent();

        const buttons = await screen.findAllByRole("button", {
            name: "Add to Cart",
        });

        expect(buttons).toHaveLength(2);
    });

    test("should call addProductToCart when clicked", async () => {
        renderComponent();

        const button = await screen.findAllByRole("button", {
            name: "Add to Cart",
        });

        fireEvent.click(button[0]);

        await waitFor(() => {
            expect(addProductToCart).toHaveBeenCalledWith(
                mockProducts[0]
            );
        });
    });

    test("should show success notification after adding to cart", async () => {
        renderComponent();

        const buttons = await screen.findAllByRole("button", {
            name: "Add to Cart",
        });

        fireEvent.click(buttons[0]);

        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith(
                "Synthetic Item Alpha added to cart!",
                expect.objectContaining({
                    position: "top-right",
                    autoClose: 2000,
                    theme: "colored",
                })
            );
        });
    });

    test("should change button text after successful cart addition", async () => {
        renderComponent();

        const buttons = await screen.findAllByRole("button", {
            name: "Add to Cart",
        });

        fireEvent.click(buttons[0]);

        expect(
            await screen.findByRole("button", {
                name: "✓ Added",
            })
        ).toBeInTheDocument();
    });

    test("should apply added CSS class after successful addition", async () => {
        renderComponent();

        const buttons = await screen.findAllByRole("button", {
            name: "Add to Cart",
        });

        fireEvent.click(buttons[0]);

        await waitFor(() => {
            expect(buttons[0]).toHaveClass("added");
        });
    });

    test("should display error notification when cart API fails", async () => {
        addProductToCart.mockRejectedValue(
            new Error("Synthetic cart failure")
        );

        renderComponent();

        const buttons = await screen.findAllByRole("button", {
            name: "Add to Cart",
        });

        fireEvent.click(buttons[0]);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(
                "Synthetic cart failure"
            );
        });
    });

    test("should display fallback error when cart API error has no message", async () => {
        addProductToCart.mockRejectedValue({});

        renderComponent();

        const buttons = await screen.findAllByRole("button", {
            name: "Add to Cart",
        });

        fireEvent.click(buttons[0]);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(
                "Unable to add this product to your cart."
            );
        });
    });

    test("should not show success notification when cart API fails", async () => {
        addProductToCart.mockRejectedValue(
            new Error("Synthetic failure")
        );

        renderComponent();

        const buttons = await screen.findAllByRole("button", {
            name: "Add to Cart",
        });

        fireEvent.click(buttons[0]);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalled();
        });

        expect(toast.success).not.toHaveBeenCalled();
    });

    // --------------------------------
    // TIMER TESTS
    // --------------------------------

    test("should reset added button after two seconds", async () => {
        jest.useFakeTimers();

        renderComponent();

        await act(async () => {
            await Promise.resolve();
        });

        const button = screen.getAllByRole("button", {
            name: "Add to Cart",
        })[0];

        await act(async () => {
            fireEvent.click(button);
            await Promise.resolve();
        });

        expect(button).toHaveTextContent("✓ Added");

        await act(async () => {
            jest.advanceTimersByTime(2000);
        });

        expect(button).toHaveTextContent("Add to Cart");
    });

    // --------------------------------
    // EMPTY AND ERROR TESTS
    // --------------------------------

    test("should handle empty featured products response", async () => {
        getFeaturedProducts.mockResolvedValue([]);

        renderComponent();

        expect(
            screen.getByRole("heading", {
                name: "Featured Products",
            })
        ).toBeInTheDocument();

        expect(
            screen.queryByTestId("product-card")
        ).not.toBeInTheDocument();
    });

    test("should display error when featured products API fails", async () => {
        getFeaturedProducts.mockRejectedValue(
            new Error("Synthetic API failure")
        );

        renderComponent();

        expect(
            await screen.findByRole("alert")
        ).toHaveTextContent(
            "Featured products could not be loaded."
        );
    });

    test("should not render product cards when API fails", async () => {
        getFeaturedProducts.mockRejectedValue(
            new Error("Synthetic API failure")
        );

        renderComponent();

        await screen.findByRole("alert");

        expect(
            screen.queryByRole("link", {
                name: "View Details",
            })
        ).not.toBeInTheDocument();
    });
});
