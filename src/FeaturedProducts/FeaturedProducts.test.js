
import React from "react";
import {
    render,
    screen,
    fireEvent,
    waitFor,
    cleanup,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";

import FeaturedProducts from "./FeaturedProducts";

import { addProductToCart } from "../api/cartApi";
import { getFeaturedProducts } from "../api/productApi";
import { toast } from "react-toastify";

import {
    getUniqueProductsByImage,
    getProductImage,
    handleProductImageError,
} from "../utils/productImage";

// Mock cart API
jest.mock("../api/cartApi", () => ({
    addProductToCart: jest.fn(),
}));

// Mock product API
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

// Mock product image utilities
jest.mock("../utils/productImage", () => ({
    getUniqueProductsByImage: jest.fn((products) => products),
    getProductImage: jest.fn(() => "dummy-image.jpg"),
    handleProductImageError: jest.fn(),
}));

// Dummy data for testing only
const dummyProducts = [
    {
        id: 1,
        name: "Sample Item One",
        price: 100,
        rating: 4.5,
        image: "image-one.jpg",
        category: "Sample Category",
    },
    {
        id: 2,
        name: "Sample Item Two",
        price: 200,
        rating: 4.0,
        image: "image-two.jpg",
        category: "Sample Category",
    },
];

// Render component with Router
const renderComponent = () => {
    return render(
        <MemoryRouter>
            <FeaturedProducts />
        </MemoryRouter>
    );
};

describe("FeaturedProducts Component Testing", () => {

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock API response
        getFeaturedProducts.mockResolvedValue(dummyProducts);

        // Mock cart API
        addProductToCart.mockResolvedValue({ success: true });

        // IMPORTANT: Restore utility mock implementations
        getUniqueProductsByImage.mockImplementation((products) => {
            return Array.isArray(products) ? products : [];
        });

        getProductImage.mockReturnValue("dummy-image.jpg");

        handleProductImageError.mockImplementation(() => { });
    });


    afterEach(() => {
        cleanup();
        jest.restoreAllMocks();
    });

    // Test 1: Component rendering
    test("renders Featured Products heading", () => {
        renderComponent();

        expect(
            screen.getByRole("heading", {
                name: "Featured Products",
            })
        ).toBeInTheDocument();
    });

    // Test 2: Description rendering
    test("renders section description", () => {
        renderComponent();

        expect(
            screen.getByText(
                "Discover our most popular healthcare products"
            )
        ).toBeInTheDocument();
    });

    // Test 3: API function call
    test("calls getFeaturedProducts on component load", async () => {
        renderComponent();

        await waitFor(() => {
            expect(getFeaturedProducts).toHaveBeenCalledTimes(1);
        });
    });

    // Test 4: Product display
    test("displays products returned by API", async () => {
        renderComponent();

        expect(
            await screen.findByText("Sample Item One")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Sample Item Two")
        ).toBeInTheDocument();
    });

    // Test 5: Price display
    test("displays product prices", async () => {
        renderComponent();

        expect(await screen.findByText("₹100")).toBeInTheDocument();
        expect(screen.getByText("₹200")).toBeInTheDocument();
    });

    // Test 6: Rating display
    test("displays product ratings", async () => {
        renderComponent();

        expect(
            await screen.findByText("⭐ 4.5")
        ).toBeInTheDocument();

        expect(screen.getByText("⭐ 4")).toBeInTheDocument();
    });

    // Test 7: Product image
    test("displays product image", async () => {
        renderComponent();

        const image = await screen.findByAltText("Sample Item One");

        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute("src", "dummy-image.jpg");
        expect(getProductImage).toHaveBeenCalled();
    });

    // Test 8: Image error handling
    test("calls image error handler when image fails", async () => {
        renderComponent();

        const image = await screen.findByAltText("Sample Item One");

        fireEvent.error(image);

        expect(handleProductImageError).toHaveBeenCalled();
    });

    // Test 9: Unique image utility
    test("calls getUniqueProductsByImage with fetched products", async () => {
        renderComponent();

        await waitFor(() => {
            expect(getUniqueProductsByImage).toHaveBeenCalledWith(
                dummyProducts
            );
        });
    });

    // Test 10: View details links
    test("renders correct product detail links", async () => {
        renderComponent();

        const links = await screen.findAllByRole("link", {
            name: "View Details",
        });

        expect(links).toHaveLength(2);
        expect(links[0]).toHaveAttribute("href", "/product/1");
        expect(links[1]).toHaveAttribute("href", "/product/2");
    });

    // Test 11: Add to Cart buttons
    test("renders Add to Cart buttons", async () => {
        renderComponent();

        const buttons = await screen.findAllByRole("button", {
            name: "Add to Cart",
        });

        expect(buttons).toHaveLength(2);
    });

    // Test 12: Successful cart addition
    test("adds item to cart successfully", async () => {
        renderComponent();

        const buttons = await screen.findAllByRole("button", {
            name: "Add to Cart",
        });

        fireEvent.click(buttons[0]);

        await waitFor(() => {
            expect(addProductToCart).toHaveBeenCalledWith(
                dummyProducts[0]
            );

            expect(toast.success).toHaveBeenCalledWith(
                "Sample Item One added to cart!",
                expect.any(Object)
            );
        });

        expect(
            await screen.findByRole("button", {
                name: "✓ Added",
            })
        ).toBeInTheDocument();
    });

    // Test 13: Cart addition failure
    test("shows error notification when cart addition fails", async () => {
        addProductToCart.mockRejectedValueOnce(
            new Error("Unable to add item")
        );

        renderComponent();

        const buttons = await screen.findAllByRole("button", {
            name: "Add to Cart",
        });

        fireEvent.click(buttons[0]);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(
                "Unable to add item"
            );
        });
    });

    // Test 14: API loading failure
    test("displays error when products fail to load", async () => {
        jest.spyOn(console, "error").mockImplementation(() => { });

        getFeaturedProducts.mockRejectedValueOnce(
            new Error("Test API error")
        );

        renderComponent();

        expect(
            await screen.findByRole("alert")
        ).toHaveTextContent(
            "Featured products could not be loaded."
        );
    });

    // Test 15: Empty product response
    test("handles an empty product list", async () => {
        getFeaturedProducts.mockResolvedValueOnce([]);

        renderComponent();

        await waitFor(() => {
            expect(getFeaturedProducts).toHaveBeenCalled();
        });

        expect(
            screen.queryByText("Sample Item One")
        ).not.toBeInTheDocument();

        expect(
            screen.queryByRole("button", {
                name: "Add to Cart",
            })
        ).not.toBeInTheDocument();
    });
});
