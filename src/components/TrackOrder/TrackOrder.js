import React from "react";
import {
    render,
    screen,
    fireEvent,
    waitFor,
    cleanup,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import {
    MemoryRouter,
    Routes,
    Route,
} from "react-router-dom";

import TrackOrder from "./TrackOrder";

// Mock toast notifications
jest.mock("react-toastify", () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
        info: jest.fn(),
    },
}));

import { toast } from "react-toastify";

// Mock browser clipboard
Object.assign(navigator, {
    clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
    },
});

// Mock window.print
beforeAll(() => {
    window.print = jest.fn();
});

beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();

    navigator.clipboard.writeText.mockResolvedValue(undefined);
});

afterEach(() => {
    cleanup();
    localStorage.clear();
});

// Generic order data without personal or product information
const mockOrder = {
    orderId: "TEST-ORDER-001",
    status: "In Transit",
    orderDate: "10 Nov 2026",
    estimatedDelivery: "12 Nov 2026",
    paymentMethod: "Online Payment",
    deliveryCharge: 20,
    discount: 10,
    totalAmount: 110,
    address: {
        address: "Sample Address",
        city: "Sample City",
        state: "Sample State",
        pincode: "000000",
    },
    items: [
        {
            id: 1,
            name: "Sample Item",
            brand: "Sample Brand",
            price: 50,
            quantity: 2,
        },
        {
            id: 2,
            name: "Another Item",
            price: 10,
            quantity: 1,
        },
    ],
};

// Helper function
const renderTrackOrder = (initialEntry = "/track-order") => {
    return render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <Routes>
                <Route
                    path="/track-order"
                    element={<TrackOrder />}
                />
                <Route
                    path="/track-order/:orderId"
                    element={<TrackOrder />}
                />
                <Route
                    path="/shop"
                    element={<div>Shop Page</div>}
                />
            </Routes>
        </MemoryRouter>
    );
};

describe("TrackOrder Component", () => {

    // 1. Basic Rendering

    test("renders Track Order page successfully", () => {
        renderTrackOrder();

        expect(
            screen.getByRole("heading", {
                name: /track your order/i,
            })
        ).toBeInTheDocument();
    });

    test("renders order tracking heading", () => {
        renderTrackOrder();

        expect(
            screen.getByRole("heading", {
                name: /order tracking/i,
            })
        ).toBeInTheDocument();
    });

    test("renders order ID input field", () => {
        renderTrackOrder();

        expect(
            screen.getByPlaceholderText(
                /enter order id/i
            )
        ).toBeInTheDocument();
    });

    test("renders Track Order button", () => {
        renderTrackOrder();

        expect(
            screen.getByRole("button", {
                name: /track order/i,
            })
        ).toBeInTheDocument();
    });

    test("renders back button", () => {
        renderTrackOrder();

        expect(
            screen.getByRole("button", {
                name: /back/i,
            })
        ).toBeInTheDocument();
    });

    // 2. Order Search

    test("allows entering an order ID", () => {
        renderTrackOrder();

        const input = screen.getByPlaceholderText(
            /enter order id/i
        );

        fireEvent.change(input, {
            target: {
                value: "TEST-ORDER-001",
            },
        });

        expect(input).toHaveValue("TEST-ORDER-001");
    });

    test("searches order when Track Order button is clicked", () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([mockOrder])
        );

        renderTrackOrder();

        const input = screen.getByPlaceholderText(
            /enter order id/i
        );

        fireEvent.change(input, {
            target: {
                value: "TEST-ORDER-001",
            },
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: /track order/i,
            })
        );

        expect(
            screen.getByText("TEST-ORDER-001")
        ).toBeInTheDocument();
    });

    test("searches order when Enter key is pressed", () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([mockOrder])
        );

        renderTrackOrder();

        const input = screen.getByPlaceholderText(
            /enter order id/i
        );

        fireEvent.change(input, {
            target: {
                value: "TEST-ORDER-001",
            },
        });

        fireEvent.keyDown(input, {
            key: "Enter",
            code: "Enter",
        });

        expect(
            screen.getByText("TEST-ORDER-001")
        ).toBeInTheDocument();
    });

    test("handles empty order ID without crashing", () => {
        const alertMock = jest
            .spyOn(window, "alert")
            .mockImplementation(() => { });

        renderTrackOrder();

        fireEvent.click(
            screen.getByRole("button", {
                name: /track order/i,
            })
        );

        expect(alertMock).toHaveBeenCalledWith(
            "Please enter your Order ID"
        );

        alertMock.mockRestore();
    });

    test("searches using order ID without hash prefix", () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([mockOrder])
        );

        renderTrackOrder();

        const input = screen.getByPlaceholderText(
            /enter order id/i
        );

        fireEvent.change(input, {
            target: {
                value: "#TEST-ORDER-001",
            },
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: /track order/i,
            })
        );

        expect(
            screen.getByText("TEST-ORDER-001")
        ).toBeInTheDocument();
    });

    // 3. Fallback Order

    test("generates fallback tracking information for an unknown ID", () => {
        renderTrackOrder();

        const input = screen.getByPlaceholderText(
            /enter order id/i
        );

        fireEvent.change(input, {
            target: {
                value: "UNKNOWN-001",
            },
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: /track order/i,
            })
        );

        expect(
            screen.getByText("UNKNOWN-001")
        ).toBeInTheDocument();

        expect(
            screen.getByText("In Transit")
        ).toBeInTheDocument();
    });

    test("displays fallback tracking number", () => {
        renderTrackOrder();

        const input = screen.getByPlaceholderText(
            /enter order id/i
        );

        fireEvent.change(input, {
            target: {
                value: "UNKNOWN-123",
            },
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: /track order/i,
            })
        );

        expect(
            screen.getByText("In Transit")
        ).toBeInTheDocument();
    });

    // 4. Order Details

    test("displays saved order details", () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([mockOrder])
        );

        renderTrackOrder();

        expect(
            screen.getByText("TEST-ORDER-001")
        ).toBeInTheDocument();

        expect(
            screen.getByText("In Transit")
        ).toBeInTheDocument();
    });

    test("displays payment information", () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([mockOrder])
        );

        renderTrackOrder();

        expect(
            screen.getByText("Online Payment")
        ).toBeInTheDocument();
    });

    test("displays estimated delivery information", () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([mockOrder])
        );

        renderTrackOrder();

        expect(
            screen.getByText("12 Nov 2026")
        ).toBeInTheDocument();
    });

    // 5. Tracking Timeline

    test("renders shipment tracking section", () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([mockOrder])
        );

        renderTrackOrder();

        expect(
            screen.getByRole("heading", {
                name: /live shipment tracking/i,
            })
        ).toBeInTheDocument();
    });

    test("renders all tracking steps", () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([mockOrder])
        );

        renderTrackOrder();

        expect(
            screen.getByText("Order Placed")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Packed")
        ).toBeInTheDocument();

        expect(
            screen.getByText("In Transit")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Out for Delivery")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Delivered")
        ).toBeInTheDocument();
    });

    test.each([
        ["Order Confirmed", "In Progress"],
        ["Packed", "In Progress"],
        ["In Transit", "In Progress"],
        ["Out for Delivery", "In Progress"],
        ["Delivered", "In Progress"],
    ])(
        "handles tracking status: %s",
        (status, expectedText) => {
            const order = {
                ...mockOrder,
                status,
            };

            localStorage.setItem(
                "orders",
                JSON.stringify([order])
            );

            renderTrackOrder();

            expect(
                screen.getAllByText(expectedText).length
            ).toBeGreaterThan(0);
        }
    );

    test("handles cancelled order status", () => {
        const order = {
            ...mockOrder,
            status: "Cancelled",
        };

        localStorage.setItem(
            "orders",
            JSON.stringify([order])
        );

        renderTrackOrder();

        expect(
            screen.getByText("Cancelled")
        ).toBeInTheDocument();
    });

    // 6. Products

    test("renders products ordered section", () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([mockOrder])
        );

        renderTrackOrder();

        expect(
            screen.getByRole("heading", {
                name: /products ordered/i,
            })
        ).toBeInTheDocument();
    });

    test("displays saved order items", () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([mockOrder])
        );

        renderTrackOrder();

        expect(
            screen.getByText("Sample Item")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Another Item")
        ).toBeInTheDocument();
    });

    test("displays item quantity", () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([mockOrder])
        );

        renderTrackOrder();

        expect(
            screen.getByText("Quantity:")
        ).toBeInTheDocument();
    });

    test("handles order without product information", () => {
        const order = {
            ...mockOrder,
            items: [],
        };

        localStorage.setItem(
            "orders",
            JSON.stringify([order])
        );

        renderTrackOrder();

        expect(
            screen.getByText(
                "No product details available."
            )
        ).toBeInTheDocument();
    });

    test("handles product information using products property", () => {
        const order = {
            ...mockOrder,
            items: undefined,
            products: [
                {
                    id: 3,
                    name: "Generic Item",
                    price: 25,
                    quantity: 2,
                },
            ],
        };

        localStorage.setItem(
            "orders",
            JSON.stringify([order])
        );

        renderTrackOrder();

        expect(
            screen.getByText("Generic Item")
        ).toBeInTheDocument();
    });

    test("handles product information using product property", () => {
        const order = {
            ...mockOrder,
            items: undefined,
            product: {
                id: 4,
                name: "Single Item",
                price: 30,
                quantity: 1,
            },
        };

        localStorage.setItem(
            "orders",
            JSON.stringify([order])
        );

        renderTrackOrder();

        expect(
            screen.getByText("Single Item")
        ).toBeInTheDocument();
    });

    // 7. Delivery Address

    test("renders delivery address section", () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([mockOrder])
        );

        renderTrackOrder();

        expect(
            screen.getByRole("heading", {
                name: /delivery address/i,
            })
        ).toBeInTheDocument();
    });

    test("displays formatted delivery address", () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([mockOrder])
        );

        renderTrackOrder();

        expect(
            screen.getByText(/Sample Address/)
        ).toBeInTheDocument();

        expect(
            screen.getByText(/Sample City/)
        ).toBeInTheDocument();
    });

    test("handles string delivery address", () => {
        const order = {
            ...mockOrder,
            address: "Generic Delivery Address",
        };

        localStorage.setItem(
            "orders",
            JSON.stringify([order])
        );

        renderTrackOrder();

        expect(
            screen.getByText("Generic Delivery Address")
        ).toBeInTheDocument();
    });

    test("handles missing delivery address", () => {
        const order = {
            ...mockOrder,
            address: null,
            deliveryAddress: null,
            shippingAddress: null,
        };

        localStorage.setItem(
            "orders",
            JSON.stringify([order])
        );

        renderTrackOrder();

        expect(
            screen.getByText(
                "Delivery address not available"
            )
        ).toBeInTheDocument();
    });

    // 8. Payment Summary

    test("renders payment summary section", () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([mockOrder])
        );

        renderTrackOrder();

        expect(
            screen.getByRole("heading", {
                name: /order payment summary/i,
            })
        ).toBeInTheDocument();
    });

    test("displays product subtotal", () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([mockOrder])
        );

        renderTrackOrder();

        expect(
            screen.getByText("Product Subtotal")
        ).toBeInTheDocument();
    });

    test("displays discount when discount is available", () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([mockOrder])
        );

        renderTrackOrder();

        expect(
            screen.getByText("Discount (10%)")
        ).toBeInTheDocument();
    });

    test("displays free delivery when delivery charge is zero", () => {
        const order = {
            ...mockOrder,
            deliveryCharge: 0,
        };

        localStorage.setItem(
            "orders",
            JSON.stringify([order])
        );

        renderTrackOrder();

        expect(
            screen.getByText("FREE")
        ).toBeInTheDocument();
    });

    test("displays total amount", () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([mockOrder])
        );

        renderTrackOrder();

        expect(
            screen.getByText("Total Paid")
        ).toBeInTheDocument();
    });

    // 9. Copy Order ID

    test("copies order ID when copy button is clicked", async () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([mockOrder])
        );

        renderTrackOrder();

        const copyButton = screen.getByTitle(
            "Copy Order ID"
        );

        fireEvent.click(copyButton);

        await waitFor(() => {
            expect(
                navigator.clipboard.writeText
            ).toHaveBeenCalledWith(
                "TEST-ORDER-001"
            );
        });

        expect(toast.success).toHaveBeenCalledWith(
            "Order ID copied to clipboard!"
        );
    });

    // 10. Print Receipt

    test("prints receipt when Print Receipt button is clicked", () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([mockOrder])
        );

        renderTrackOrder();

        fireEvent.click(
            screen.getByRole("button", {
                name: /print receipt/i,
            })
        );

        expect(window.print).toHaveBeenCalled();
    });

    // 11. Recent Orders

    test("loads recent orders from localStorage", () => {
        const secondOrder = {
            ...mockOrder,
            orderId: "TEST-ORDER-002",
        };

        localStorage.setItem(
            "orders",
            JSON.stringify([
                mockOrder,
                secondOrder,
            ])
        );

        renderTrackOrder();

        expect(
            screen.getByText("TEST-ORDER-001")
        ).toBeInTheDocument();
    });

    test("loads latest order automatically", () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([mockOrder])
        );

        renderTrackOrder();

        expect(
            screen.getByText("TEST-ORDER-001")
        ).toBeInTheDocument();
    });

    test("handles empty recent orders", () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([])
        );

        renderTrackOrder();

        expect(
            screen.getByPlaceholderText(
                /enter order id/i
            )
        ).toBeInTheDocument();
    });

    // 12. Route Parameters

    test("loads order ID from route parameter", () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([mockOrder])
        );

        renderTrackOrder(
            "/track-order/TEST-ORDER-001"
        );

        expect(
            screen.getByText("TEST-ORDER-001")
        ).toBeInTheDocument();
    });

    // 13. Query Parameters

    test("loads order ID from id query parameter", () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([mockOrder])
        );

        renderTrackOrder(
            "/track-order?id=TEST-ORDER-001"
        );

        expect(
            screen.getByText("TEST-ORDER-001")
        ).toBeInTheDocument();
    });

    test("loads order ID from orderId query parameter", () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([mockOrder])
        );

        renderTrackOrder(
            "/track-order?orderId=TEST-ORDER-001"
        );

        expect(
            screen.getByText("TEST-ORDER-001")
        ).toBeInTheDocument();
    });

    // 14. Fallback Display Values

    test("displays default payment method when missing", () => {
        const order = {
            ...mockOrder,
            paymentMethod: undefined,
        };

        localStorage.setItem(
            "orders",
            JSON.stringify([order])
        );

        renderTrackOrder();

        expect(
            screen.getByText("Online Payment")
        ).toBeInTheDocument();
    });

    test("displays default order status when missing", () => {
        const order = {
            ...mockOrder,
            status: undefined,
        };

        localStorage.setItem(
            "orders",
            JSON.stringify([order])
        );

        renderTrackOrder();

        expect(
            screen.getByText("Order Confirmed")
        ).toBeInTheDocument();
    });

    test("handles invalid date format", () => {
        const order = {
            ...mockOrder,
            orderDate: "Invalid Date Value",
        };

        localStorage.setItem(
            "orders",
            JSON.stringify([order])
        );

        renderTrackOrder();

        expect(
            screen.getByText("Invalid Date Value")
        ).toBeInTheDocument();
    });

    // 15. Navigation

    test("renders Continue Shopping link", () => {
        renderTrackOrder();

        const input = screen.getByPlaceholderText(
            /enter order id/i
        );

        fireEvent.change(input, {
            target: {
                value: "UNKNOWN-ORDER",
            },
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: /track order/i,
            })
        );

        expect(
            screen.getByRole("link", {
                name: /continue shopping/i,
            })
        ).toHaveAttribute("href", "/shop");
    });

});
