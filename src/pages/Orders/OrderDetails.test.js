import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import OrderDetails from "./OrderDetails";

const mockNavigate = jest.fn();

let mockId = "test-order-id";

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useParams: () => ({
        id: mockId,
    }),
    useNavigate: () => mockNavigate,
}));

describe("OrderDetails Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        mockId = "test-order-id";
    });

    afterEach(() => {
        localStorage.clear();
    });

    // -----------------------------
    // NOT FOUND
    // -----------------------------

    test("renders Order Not Found when order does not exist", async () => {
        localStorage.setItem("orders", JSON.stringify([]));

        render(<OrderDetails />);

        expect(
            await screen.findByText("Order Not Found")
        ).toBeInTheDocument();
    });

    test("renders order not found message", async () => {
        localStorage.setItem("orders", JSON.stringify([]));

        render(<OrderDetails />);

        expect(
            await screen.findByText("We couldn't find this order.")
        ).toBeInTheDocument();
    });

    test("renders Go to My Orders button", async () => {
        localStorage.setItem("orders", JSON.stringify([]));

        render(<OrderDetails />);

        expect(
            await screen.findByRole("button", {
                name: /go to my orders/i,
            })
        ).toBeInTheDocument();
    });

    test("Go to My Orders button navigates to orders", async () => {
        localStorage.setItem("orders", JSON.stringify([]));

        render(<OrderDetails />);

        const button = await screen.findByRole("button", {
            name: /go to my orders/i,
        });

        fireEvent.click(button);

        expect(mockNavigate).toHaveBeenCalledWith("/orders");
    });

    // -----------------------------
    // BASIC RENDER
    // -----------------------------

    test("renders order details when order exists", async () => {
        const order = {
            id: "test-order-id",
        };

        localStorage.setItem("orders", JSON.stringify([order]));

        render(<OrderDetails />);

        expect(
            await screen.findByText("Order #test-order-id")
        ).toBeInTheDocument();
    });

    test("renders Order Details heading", async () => {
        const order = {
            id: "test-order-id",
        };

        localStorage.setItem("orders", JSON.stringify([order]));

        render(<OrderDetails />);

        expect(
            await screen.findByText("Order Details")
        ).toBeInTheDocument();
    });

    test("renders Ordered Products section", async () => {
        const order = {
            id: "test-order-id",
            items: [],
        };

        localStorage.setItem("orders", JSON.stringify([order]));

        render(<OrderDetails />);

        expect(
            await screen.findByText("Ordered Products")
        ).toBeInTheDocument();
    });

    test("renders Delivery Address section", async () => {
        const order = {
            id: "test-order-id",
        };

        localStorage.setItem("orders", JSON.stringify([order]));

        render(<OrderDetails />);

        expect(
            await screen.findByText("Delivery Address")
        ).toBeInTheDocument();
    });

    test("renders Payment Information section", async () => {
        const order = {
            id: "test-order-id",
        };

        localStorage.setItem("orders", JSON.stringify([order]));

        render(<OrderDetails />);

        expect(
            await screen.findByText("Payment Information")
        ).toBeInTheDocument();
    });

    test("renders Price Details section", async () => {
        const order = {
            id: "test-order-id",
        };

        localStorage.setItem("orders", JSON.stringify([order]));

        render(<OrderDetails />);

        expect(
            await screen.findByText("Price Details")
        ).toBeInTheDocument();
    });

    // -----------------------------
    // FALLBACK VALUES
    // -----------------------------

    test("renders default order date", async () => {
        const order = {
            id: "test-order-id",
        };

        localStorage.setItem("orders", JSON.stringify([order]));

        render(<OrderDetails />);

        expect(
            await screen.findByText("Placed on Recently")
        ).toBeInTheDocument();
    });

    test("renders custom order date", async () => {
        const order = {
            id: "test-order-id",
            date: "Test Date",
        };

        localStorage.setItem("orders", JSON.stringify([order]));

        render(<OrderDetails />);

        expect(
            await screen.findByText("Placed on Test Date")
        ).toBeInTheDocument();
    });

    test("renders default Processing status", async () => {
        const order = {
            id: "test-order-id",
        };

        localStorage.setItem("orders", JSON.stringify([order]));

        render(<OrderDetails />);

        expect(
            await screen.findByText("Processing")
        ).toBeInTheDocument();
    });

    test("renders custom order status", async () => {
        const order = {
            id: "test-order-id",
            status: "Test Status",
        };

        localStorage.setItem("orders", JSON.stringify([order]));

        render(<OrderDetails />);

        expect(
            await screen.findByText("Test Status")
        ).toBeInTheDocument();
    });

    test("renders default customer text", async () => {
        const order = {
            id: "test-order-id",
        };

        localStorage.setItem("orders", JSON.stringify([order]));

        render(<OrderDetails />);

        expect(
            await screen.findByText("Customer")
        ).toBeInTheDocument();
    });

    test("renders default delivery address text", async () => {
        const order = {
            id: "test-order-id",
        };

        localStorage.setItem("orders", JSON.stringify([order]));

        render(<OrderDetails />);

        expect(
            await screen.findByText("Delivery address")
        ).toBeInTheDocument();
    });

    test("renders default payment method", async () => {
        const order = {
            id: "test-order-id",
        };

        localStorage.setItem("orders", JSON.stringify([order]));

        render(<OrderDetails />);

        expect(
            await screen.findByText("Cash on Delivery")
        ).toBeInTheDocument();
    });

    test("renders default delivery type", async () => {
        const order = {
            id: "test-order-id",
        };

        localStorage.setItem("orders", JSON.stringify([order]));

        render(<OrderDetails />);

        expect(
            await screen.findByText("Standard Delivery")
        ).toBeInTheDocument();
    });

    test("renders default payment status", async () => {
        const order = {
            id: "test-order-id",
        };

        localStorage.setItem("orders", JSON.stringify([order]));

        render(<OrderDetails />);

        expect(
            await screen.findByText("Pending")
        ).toBeInTheDocument();
    });

    // -----------------------------
    // BUTTONS
    // -----------------------------

    test("renders Back to Orders button", async () => {
        const order = {
            id: "test-order-id",
        };

        localStorage.setItem("orders", JSON.stringify([order]));

        render(<OrderDetails />);

        expect(
            await screen.findByRole("button", {
                name: /back to orders/i,
            })
        ).toBeInTheDocument();
    });

    test("Back to Orders navigates to orders", async () => {
        const order = {
            id: "test-order-id",
        };

        localStorage.setItem("orders", JSON.stringify([order]));

        render(<OrderDetails />);

        const button = await screen.findByRole("button", {
            name: /back to orders/i,
        });

        fireEvent.click(button);

        expect(mockNavigate).toHaveBeenCalledWith("/orders");
    });

    test("renders Buy Now button", async () => {
        const order = {
            id: "test-order-id",
            items: [],
        };

        localStorage.setItem("orders", JSON.stringify([order]));

        render(<OrderDetails />);

        expect(
            await screen.findByRole("button", {
                name: /buy now/i,
            })
        ).toBeInTheDocument();
    });

    test("renders Continue Shopping button", async () => {
        const order = {
            id: "test-order-id",
        };

        localStorage.setItem("orders", JSON.stringify([order]));

        render(<OrderDetails />);

        expect(
            await screen.findByRole("button", {
                name: /continue shopping/i,
            })
        ).toBeInTheDocument();
    });

    test("Continue Shopping navigates to shop", async () => {
        const order = {
            id: "test-order-id",
        };

        localStorage.setItem("orders", JSON.stringify([order]));

        render(<OrderDetails />);

        const button = await screen.findByRole("button", {
            name: /continue shopping/i,
        });

        fireEvent.click(button);

        expect(mockNavigate).toHaveBeenCalledWith("/shop");
    });

    // -----------------------------
    // BUY NOW
    // -----------------------------

    test("Buy Now stores checkout items", async () => {
        const order = {
            id: "test-order-id",
            items: [],
        };

        localStorage.setItem("orders", JSON.stringify([order]));

        render(<OrderDetails />);

        const button = await screen.findByRole("button", {
            name: /buy now/i,
        });

        fireEvent.click(button);

        expect(
            localStorage.getItem("checkoutItems")
        ).toBe("[]");
    });

    test("Buy Now navigates correctly", async () => {
        const order = {
            id: "test-order-id",
            items: [],
        };

        localStorage.setItem("orders", JSON.stringify([order]));

        render(<OrderDetails />);

        const button = await screen.findByRole("button", {
            name: /buy now/i,
        });

        fireEvent.click(button);

        expect(mockNavigate).toHaveBeenCalledWith(
            "/orders/test-order-id"
        );
    });

    // -----------------------------
    // EMPTY ITEMS
    // -----------------------------

    test("handles order with no items", async () => {
        const order = {
            id: "test-order-id",
            items: [],
        };

        localStorage.setItem("orders", JSON.stringify([order]));

        render(<OrderDetails />);

        expect(
            await screen.findByText("Ordered Products")
        ).toBeInTheDocument();

        expect(
            document.querySelectorAll(".details-product")
        ).toHaveLength(0);
    });

    // -----------------------------
    // ORDER SELECTION
    // -----------------------------

    test("selects the order matching the URL id", async () => {
        const orders = [
            {
                id: "another-order",
                status: "Other Status",
            },
            {
                id: "test-order-id",
                status: "Selected Status",
            },
        ];

        localStorage.setItem(
            "orders",
            JSON.stringify(orders)
        );

        render(<OrderDetails />);

        expect(
            await screen.findByText("Order #test-order-id")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Selected Status")
        ).toBeInTheDocument();
    });

    // -----------------------------
    // CSS CONTAINERS
    // -----------------------------

    test("renders main order details container", async () => {
        const order = {
            id: "test-order-id",
        };

        localStorage.setItem("orders", JSON.stringify([order]));

        render(<OrderDetails />);

        await screen.findByText("Order Details");

        expect(
            document.querySelector(".order-details-page")
        ).toBeInTheDocument();

        expect(
            document.querySelector(".order-details-container")
        ).toBeInTheDocument();
    });

    test("renders details cards", async () => {
        const order = {
            id: "test-order-id",
        };

        localStorage.setItem("orders", JSON.stringify([order]));

        render(<OrderDetails />);

        await screen.findByText("Order Details");

        expect(
            document.querySelectorAll(".details-card").length
        ).toBeGreaterThan(0);
    });

    test("renders buy again section", async () => {
        const order = {
            id: "test-order-id",
        };

        localStorage.setItem("orders", JSON.stringify([order]));

        render(<OrderDetails />);

        await screen.findByText("Order Details");

        expect(
            document.querySelector(".buy-again-section")
        ).toBeInTheDocument();
    });
});