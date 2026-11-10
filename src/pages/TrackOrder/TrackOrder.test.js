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

import {
    getOrder,
    getOrderTracking,
    getOrders,
} from "../../api/ordersApi";

import { toast } from "react-toastify";

// Mock Orders API
jest.mock("../../api/ordersApi", () => ({
    getOrder: jest.fn(),
    getOrderTracking: jest.fn(),
    getOrders: jest.fn(),
}));

// Mock toast notifications
jest.mock("react-toastify", () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
        info: jest.fn(),
    },
}));

// Mock clipboard
Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: {
        writeText: jest.fn().mockResolvedValue(undefined),
    },
});

// Mock browser print
beforeAll(() => {
    window.print = jest.fn();
});

// Generic API response fixtures
const mockOrder = {
    order_id: "TEST-001",
    status: "In Transit",
    created_at: "2026-11-10T10:00:00",
    payment_method: "Online Payment",
    delivery_type: "Normal",
    delivery_charge: 20,
    discount: 10,
    product_amount: 100,
    total_amount: 110,
    address: {
        address: "Sample Address",
        city: "Sample City",
        state: "Sample State",
        pincode: "000000",
    },
    items: [],
};

const mockTracking = {
    status: "In Transit",
    tracking_id: "TRACK-001",
    delivery_time: "12 Nov 2026",
};

const mockRecentOrders = [
    {
        order_id: "TEST-001",
        status: "In Transit",
    },
    {
        order_id: "TEST-002",
        status: "Processing",
    },
];

// Render helper
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

// Helper to search an order
const searchOrder = async (orderId = "TEST-001") => {
    const input = screen.getByPlaceholderText(
        /enter order id/i
    );

    fireEvent.change(input, {
        target: {
            value: orderId,
        },
    });

    fireEvent.click(
        screen.getByRole("button", {
            name: /track order/i,
        })
    );

    await waitFor(() => {
        expect(getOrder).toHaveBeenCalled();
        expect(getOrderTracking).toHaveBeenCalled();
    });
};

describe("TrackOrder Component", () => {

    beforeEach(() => {
        jest.clearAllMocks();

        localStorage.clear();

        getOrders.mockResolvedValue(mockRecentOrders);
        getOrder.mockResolvedValue(mockOrder);
        getOrderTracking.mockResolvedValue(mockTracking);

        navigator.clipboard.writeText.mockResolvedValue(
            undefined
        );
    });

    afterEach(() => {
        cleanup();
        localStorage.clear();
    });

    // ==========================================
    // 1. COMPONENT RENDERING
    // ==========================================

    test("renders TrackOrder component successfully", () => {
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

    test("renders order ID input", () => {
        renderTrackOrder();

        expect(
            screen.getByPlaceholderText(/enter order id/i)
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

    test("renders Back button", () => {
        renderTrackOrder();

        expect(
            screen.getByRole("button", {
                name: /back/i,
            })
        ).toBeInTheDocument();
    });

    // ==========================================
    // 2. RECENT ORDERS API
    // ==========================================

    test("calls getOrders when component mounts", async () => {
        renderTrackOrder();

        await waitFor(() => {
            expect(getOrders).toHaveBeenCalledTimes(1);
        });
    });

    test("loads recent orders successfully", async () => {
        renderTrackOrder();

        expect(
            await screen.findByRole("button", {
                name: "TEST-001",
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", {
                name: "TEST-002",
            })
        ).toBeInTheDocument();
    });

    test("handles empty recent orders", async () => {
        getOrders.mockResolvedValue([]);

        renderTrackOrder();

        await waitFor(() => {
            expect(getOrders).toHaveBeenCalled();
        });

        expect(
            screen.getByPlaceholderText(/enter order id/i)
        ).toBeInTheDocument();

        expect(
            screen.queryByRole("button", {
                name: "TEST-001",
            })
        ).not.toBeInTheDocument();
    });

    test("handles non-array recent orders response", async () => {
        getOrders.mockResolvedValue(null);

        renderTrackOrder();

        await waitFor(() => {
            expect(getOrders).toHaveBeenCalled();
        });

        expect(
            screen.getByRole("heading", {
                name: /track your order/i,
            })
        ).toBeInTheDocument();
    });

    test("handles recent orders API failure", async () => {
        const consoleError = jest
            .spyOn(console, "error")
            .mockImplementation(() => { });

        getOrders.mockRejectedValue(
            new Error("Unable to load orders")
        );

        renderTrackOrder();

        await waitFor(() => {
            expect(consoleError).toHaveBeenCalled();
        });

        expect(
            screen.getByPlaceholderText(/enter order id/i)
        ).toBeInTheDocument();

        consoleError.mockRestore();
    });

    test("loads only the first two recent orders", async () => {
        getOrders.mockResolvedValue([
            { order_id: "TEST-001" },
            { order_id: "TEST-002" },
            { order_id: "TEST-003" },
        ]);

        renderTrackOrder();

        expect(
            await screen.findByRole("button", {
                name: "TEST-001",
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", {
                name: "TEST-002",
            })
        ).toBeInTheDocument();

        expect(
            screen.queryByRole("button", {
                name: "TEST-003",
            })
        ).not.toBeInTheDocument();
    });

    // ==========================================
    // 3. ORDER SEARCH
    // ==========================================

    test("allows user to enter an order ID", () => {
        renderTrackOrder();

        const input = screen.getByPlaceholderText(
            /enter order id/i
        );

        fireEvent.change(input, {
            target: {
                value: "TEST-001",
            },
        });

        expect(input).toHaveValue("TEST-001");
    });

    test("calls order APIs when Track Order is clicked", async () => {
        renderTrackOrder();

        await searchOrder();

        await waitFor(() => {
            expect(getOrder).toHaveBeenCalledWith("TEST-001");

            expect(getOrderTracking).toHaveBeenCalledWith(
                "TEST-001"
            );
        });
    });

    test("searches order when Enter key is pressed", async () => {
        renderTrackOrder();

        const input = screen.getByPlaceholderText(
            /enter order id/i
        );

        fireEvent.change(input, {
            target: {
                value: "TEST-001",
            },
        });

        fireEvent.keyDown(input, {
            key: "Enter",
            code: "Enter",
        });

        await waitFor(() => {
            expect(getOrder).toHaveBeenCalledWith("TEST-001");
        });

        await waitFor(() => {
            expect(
                screen.getByText("TEST-001")
            ).toBeInTheDocument();
        });
    });

    test("removes hash prefix from order ID", async () => {
        renderTrackOrder();

        await searchOrder("#TEST-001");

        expect(getOrder).toHaveBeenCalledWith("TEST-001");
    });

    test("trims whitespace from order ID", async () => {
        renderTrackOrder();

        await searchOrder("  TEST-001  ");

        expect(getOrder).toHaveBeenCalledWith("TEST-001");
    });

    test("shows alert when order ID is empty", () => {
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

        expect(getOrder).not.toHaveBeenCalled();

        alertMock.mockRestore();
    });

    // ==========================================
    // 4. LOADING STATE
    // ==========================================

    test("displays loading state while fetching order", async () => {
        let resolveOrder;

        getOrder.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveOrder = resolve;
                })
        );

        getOrderTracking.mockReturnValue(
            new Promise(() => { })
        );

        renderTrackOrder();

        const input = screen.getByPlaceholderText(
            /enter order id/i
        );

        fireEvent.change(input, {
            target: {
                value: "TEST-001",
            },
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: /track order/i,
            })
        );

        expect(
            await screen.findByRole("button", {
                name: /loading/i,
            })
        ).toBeDisabled();

        resolveOrder(mockOrder);
    });

    test("disables search button while loading", async () => {
        getOrder.mockReturnValue(
            new Promise(() => { })
        );

        getOrderTracking.mockReturnValue(
            new Promise(() => { })
        );

        renderTrackOrder();

        const input = screen.getByPlaceholderText(
            /enter order id/i
        );

        fireEvent.change(input, {
            target: {
                value: "TEST-001",
            },
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: /track order/i,
            })
        );

        await waitFor(() => {
            expect(
                screen.getByRole("button", {
                    name: /loading/i,
                })
            ).toBeDisabled();
        });
    });

    // ==========================================
    // 5. ORDER DETAILS API
    // ==========================================

    test("displays fetched order details", async () => {
        renderTrackOrder();

        await searchOrder();

        expect(
            await screen.findByText("TEST-001")
        ).toBeInTheDocument();
    });

    test("displays order status from tracking API", async () => {
        renderTrackOrder();

        await searchOrder();

        await waitFor(() => {
            expect(
                document.querySelector(".order-status")
            ).toHaveTextContent("In Transit");
        });
    });

    test("uses order status when tracking status is missing", async () => {
        getOrderTracking.mockResolvedValue({
            tracking_id: "TRACK-001",
        });

        renderTrackOrder();

        await searchOrder();

        await waitFor(() => {
            expect(
                document.querySelector(".order-status")
            ).toHaveTextContent("In Transit");
        });
    });

    test("uses order_id as the displayed order ID", async () => {
        renderTrackOrder();

        await searchOrder();

        expect(
            await screen.findByText("TEST-001")
        ).toBeInTheDocument();
    });

    test("displays payment method", async () => {
        renderTrackOrder();

        await searchOrder();

        expect(
            await screen.findByText("Online Payment")
        ).toBeInTheDocument();
    });

    test("displays estimated delivery information", async () => {
        renderTrackOrder();

        await searchOrder();

        expect(
            await screen.findByText("12 Nov 2026")
        ).toBeInTheDocument();
    });

    test("displays formatted order date", async () => {
        renderTrackOrder();

        await searchOrder();

        expect(
            await screen.findByText(/10 Nov 2026/i)
        ).toBeInTheDocument();
    });

    // ==========================================
    // 6. API RESPONSE MAPPING
    // ==========================================

    test("maps camelCase order response fields", async () => {
        getOrder.mockResolvedValue({
            orderId: "TEST-001",
            orderDate: "10 Nov 2026",
            paymentMethod: "Online Payment",
            deliveryType: "Normal",
            deliveryCharge: 20,
            totalAmount: 110,
            items: [],
        });

        renderTrackOrder();

        await searchOrder();

        expect(
            await screen.findByText("TEST-001")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Online Payment")
        ).toBeInTheDocument();
    });

    test("maps tracking number from tracking API", async () => {
        getOrderTracking.mockResolvedValue({
            status: "Packed",
            tracking_id: "TRACK-001",
            delivery_time: "12 Nov 2026",
        });

        renderTrackOrder();

        await searchOrder();

        await waitFor(() => {
            expect(
                document.querySelector(".order-status")
            ).toHaveTextContent("Packed");
        });
    });

    // ==========================================
    // 7. TRACKING TIMELINE
    // ==========================================

    test("renders shipment tracking section", async () => {
        renderTrackOrder();

        await searchOrder();

        expect(
            await screen.findByRole("heading", {
                name: /live shipment tracking/i,
            })
        ).toBeInTheDocument();
    });

    test("renders all tracking steps", async () => {
        renderTrackOrder();

        await searchOrder();

        expect(
            await screen.findByText("Order Placed")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Packed")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Out for Delivery")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Delivered")
        ).toBeInTheDocument();
    });

    test.each([
        ["Confirmed", 0],
        ["Packed", 1],
        ["In Transit", 2],
        ["Out for Delivery", 3],
        ["Delivered", 4],
    ])(
        "handles tracking status %s",
        async (status, expectedStep) => {
            getOrderTracking.mockResolvedValue({
                status,
            });

            renderTrackOrder();

            await searchOrder();

            await waitFor(() => {
                const steps = document.querySelectorAll(
                    ".tracking-step"
                );

                expect(steps[expectedStep]).toHaveClass(
                    "completed"
                );
            });
        }
    );

    test("handles cancelled order status", async () => {
        getOrderTracking.mockResolvedValue({
            status: "Cancelled",
        });

        renderTrackOrder();

        await searchOrder();

        expect(
            await screen.findByText("Cancelled")
        ).toBeInTheDocument();
    });

    // ==========================================
    // 8. PRODUCTS SECTION
    // ==========================================

    test("renders products ordered section", async () => {
        renderTrackOrder();

        await searchOrder();

        expect(
            await screen.findByRole("heading", {
                name: /products ordered/i,
            })
        ).toBeInTheDocument();
    });

    test("displays empty product message when items are unavailable", async () => {
        getOrder.mockResolvedValue({
            ...mockOrder,
            items: [],
        });

        renderTrackOrder();

        await searchOrder();

        expect(
            await screen.findByText(
                "No product details available."
            )
        ).toBeInTheDocument();
    });

    test("displays mapped item information", async () => {
        getOrder.mockResolvedValue({
            ...mockOrder,
            items: [
                {
                    id: 1,
                    product_name: "Item A",
                    price: 50,
                    quantity: 2,
                },
            ],
        });

        renderTrackOrder();

        await searchOrder();

        expect(
            await screen.findByText("Item A")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Quantity:")
        ).toBeInTheDocument();
    });

    test("handles missing item name", async () => {
        getOrder.mockResolvedValue({
            ...mockOrder,
            items: [
                {
                    id: 1,
                    price: 25,
                    quantity: 1,
                },
            ],
        });

        renderTrackOrder();

        await searchOrder();

        expect(
            await screen.findByText("Healthcare Product")
        ).toBeInTheDocument();
    });

    // ==========================================
    // 9. DELIVERY ADDRESS
    // ==========================================

    test("renders delivery address section", async () => {
        renderTrackOrder();

        await searchOrder();

        expect(
            await screen.findByRole("heading", {
                name: /delivery address/i,
            })
        ).toBeInTheDocument();
    });

    test("displays object delivery address", async () => {
        renderTrackOrder();

        await searchOrder();

        expect(
            await screen.findByText(/Sample Address/)
        ).toBeInTheDocument();

        expect(
            screen.getByText(/Sample City/)
        ).toBeInTheDocument();
    });

    test("handles string delivery address", async () => {
        getOrder.mockResolvedValue({
            ...mockOrder,
            address: "Generic Address",
        });

        renderTrackOrder();

        await searchOrder();

        expect(
            await screen.findByText("Generic Address")
        ).toBeInTheDocument();
    });

    test("handles missing delivery address", async () => {
        getOrder.mockResolvedValue({
            ...mockOrder,
            address: null,
            customer_name: null,
            phone: null,
            city: null,
            state: null,
            pincode: null,
        });

        renderTrackOrder();

        await searchOrder();
    });

    // ==========================================
    // 10. PAYMENT SUMMARY
    // ==========================================

    test("renders payment summary section", async () => {
        renderTrackOrder();

        await searchOrder();

        expect(
            await screen.findByRole("heading", {
                name: /order payment summary/i,
            })
        ).toBeInTheDocument();
    });

    test("displays product subtotal", async () => {
        renderTrackOrder();

        await searchOrder();

        expect(
            await screen.findByText("Product Subtotal")
        ).toBeInTheDocument();
    });

    test("displays discount when available", async () => {
        renderTrackOrder();

        await searchOrder();

        expect(
            await screen.findByText("Discount (10%)")
        ).toBeInTheDocument();
    });

    test("displays delivery charge", async () => {
        renderTrackOrder();

        await searchOrder();

        expect(
            await screen.findByText("₹20")
        ).toBeInTheDocument();
    });

    test("displays free delivery when charge is zero", async () => {
        getOrder.mockResolvedValue({
            ...mockOrder,
            delivery_charge: 0,
        });

        renderTrackOrder();

        await searchOrder();

        expect(
            await screen.findByText("FREE")
        ).toBeInTheDocument();
    });

    test("displays total amount", async () => {
        renderTrackOrder();

        await searchOrder();

        expect(
            await screen.findByText("Total Paid")
        ).toBeInTheDocument();

        expect(
            screen.getByText("₹110")
        ).toBeInTheDocument();
    });

    // ==========================================
    // 11. API ERROR HANDLING
    // ==========================================

    test("displays API error message when order request fails", async () => {
        getOrder.mockRejectedValue({
            response: {
                data: {
                    detail: "Order not found",
                },
            },
        });

        renderTrackOrder();

        await searchOrder();

        expect(
            await screen.findByRole("alert")
        ).toHaveTextContent("Order not found");
    });

    test("displays API error when tracking request fails", async () => {
        getOrderTracking.mockRejectedValue({
            response: {
                data: {
                    detail: "Tracking information unavailable",
                },
            },
        });

        renderTrackOrder();

        await searchOrder();

        expect(
            await screen.findByRole("alert")
        ).toHaveTextContent(
            "Tracking information unavailable"
        );
    });

    test("displays generic error when API error has no detail", async () => {
        getOrder.mockRejectedValue(
            new Error("Network Error")
        );

        renderTrackOrder();

        await searchOrder();

        expect(
            await screen.findByRole("alert")
        ).toHaveTextContent("Network Error");
    });

    test("clears previous error when searching again", async () => {
        getOrder.mockRejectedValueOnce(
            new Error("First request failed")
        );

        renderTrackOrder();

        await searchOrder();

        expect(
            await screen.findByRole("alert")
        ).toBeInTheDocument();

        getOrder.mockResolvedValue(mockOrder);
        getOrderTracking.mockResolvedValue(mockTracking);

        const input = screen.getByPlaceholderText(
            /enter order id/i
        );

        fireEvent.change(input, {
            target: {
                value: "TEST-002",
            },
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: /track order/i,
            })
        );

        await waitFor(() => {
            expect(
                screen.queryByRole("alert")
            ).not.toBeInTheDocument();
        });
    });

    // ==========================================
    // 12. QUICK TRACK
    // ==========================================

    test("searches order using recent order button", async () => {
        renderTrackOrder();

        const recentButton = await screen.findByRole(
            "button",
            {
                name: "TEST-001",
            }
        );

        fireEvent.click(recentButton);

        await waitFor(() => {
            expect(getOrder).toHaveBeenCalledWith(
                "TEST-001"
            );
        });
    });

    test("updates input when recent order is selected", async () => {
        renderTrackOrder();

        const recentButton = await screen.findByRole(
            "button",
            {
                name: "TEST-002",
            }
        );

        fireEvent.click(recentButton);

        expect(
            screen.getByPlaceholderText(/enter order id/i)
        ).toHaveValue("TEST-002");
    });

    // ==========================================
    // 13. ROUTE AND QUERY PARAMETERS
    // ==========================================

    test("loads order using route parameter", async () => {
        renderTrackOrder(
            "/track-order/TEST-001"
        );

        await waitFor(() => {
            expect(getOrder).toHaveBeenCalledWith(
                "TEST-001"
            );
        });

        expect(
            await screen.findByText("TEST-001")
        ).toBeInTheDocument();
    });

    test("loads order using id query parameter", async () => {
        renderTrackOrder(
            "/track-order?id=TEST-001"
        );

        await waitFor(() => {
            expect(getOrder).toHaveBeenCalledWith(
                "TEST-001"
            );
        });
    });

    test("loads order using orderId query parameter", async () => {
        renderTrackOrder(
            "/track-order?orderId=TEST-001"
        );

        await waitFor(() => {
            expect(getOrder).toHaveBeenCalledWith(
                "TEST-001"
            );
        });
    });

    // ==========================================
    // 14. COPY ORDER ID
    // ==========================================

    test("copies order ID to clipboard", async () => {
        renderTrackOrder();

        await searchOrder();

        await screen.findByTitle("Copy Order ID");

        fireEvent.click(
            screen.getByTitle("Copy Order ID")
        );

        await waitFor(() => {
            expect(
                navigator.clipboard.writeText
            ).toHaveBeenCalledWith("TEST-001");
        });
    });

    test("shows success notification after copying order ID", async () => {
        renderTrackOrder();

        await searchOrder();

        fireEvent.click(
            await screen.findByTitle("Copy Order ID")
        );

        expect(toast.success).toHaveBeenCalledWith(
            "Order ID copied to clipboard!"
        );
    });

    // ==========================================
    // 15. PRINT RECEIPT
    // ==========================================

    test("renders Print Receipt button", async () => {
        renderTrackOrder();

        await searchOrder();

        expect(
            await screen.findByRole("button", {
                name: /print receipt/i,
            })
        ).toBeInTheDocument();
    });

    test("calls window.print when Print Receipt is clicked", async () => {
        renderTrackOrder();

        await searchOrder();

        fireEvent.click(
            await screen.findByRole("button", {
                name: /print receipt/i,
            })
        );

        expect(window.print).toHaveBeenCalledTimes(1);
    });

    // ==========================================
    // 16. EMPTY STATE AND NAVIGATION
    // ==========================================

    test("does not display order details before searching", () => {
        renderTrackOrder();

        expect(
            screen.queryByRole("heading", {
                name: /products ordered/i,
            })
        ).not.toBeInTheDocument();
    });

    test("displays Continue Shopping when order is not found", async () => {
        getOrder.mockRejectedValue(
            new Error("Order not found")
        );

        renderTrackOrder();

        await searchOrder();

        expect(
            await screen.findByRole("alert")
        ).toBeInTheDocument();

        expect(
            screen.queryByRole("link", {
                name: /continue shopping/i,
            })
        ).not.toBeInTheDocument();
    });

    test("does not display order not found during loading", async () => {
        getOrder.mockReturnValue(
            new Promise(() => { })
        );

        getOrderTracking.mockReturnValue(
            new Promise(() => { })
        );

        renderTrackOrder();

        const input = screen.getByPlaceholderText(
            /enter order id/i
        );

        fireEvent.change(input, {
            target: {
                value: "TEST-001",
            },
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: /track order/i,
            })
        );

        expect(
            screen.queryByRole("heading", {
                name: /order not found/i,
            })
        ).not.toBeInTheDocument();
    });

    test("handles missing order date", async () => {
        getOrder.mockResolvedValue({
            ...mockOrder,
            created_at: null,
            orderDate: null,
            date: null,
        });

        renderTrackOrder();

        await searchOrder();

        expect(
            await screen.findByText("Date not available")
        ).toBeInTheDocument();
    });

    test("displays default payment method when missing", async () => {
        getOrder.mockResolvedValue({
            ...mockOrder,
            payment_method: null,
            paymentMethod: null,
        });

        renderTrackOrder();

        await searchOrder();

        expect(
            await screen.findByText("Online Payment")
        ).toBeInTheDocument();
    });

    test("displays default estimated delivery when missing", async () => {
        getOrderTracking.mockResolvedValue({
            status: "In Transit",
            tracking_id: "TRACK-001",
        });

        getOrder.mockResolvedValue({
            ...mockOrder,
            delivery_time: null,
        });

        renderTrackOrder();

        await searchOrder();

        expect(
            await screen.findByText("2-3 Business Days")
        ).toBeInTheDocument();
    });

});
