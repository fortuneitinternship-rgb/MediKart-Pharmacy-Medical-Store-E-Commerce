import React from "react";
import {
    render,
    screen,
    fireEvent,
    waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom";

import Orders from "./Orders";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
    Link: ({ children, to, ...props }) => (
        <a href={to} {...props}>
            {children}
        </a>
    ),
}));

jest.mock("react-toastify", () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
        info: jest.fn(),
    },
}));

import { toast } from "react-toastify";


// =====================================================
// TEST DATA
// =====================================================

const createOrder = (overrides = {}) => ({
    id: "test-order",
    status: "Processing",
    ...overrides,
});


// =====================================================
// TEST SUITE
// =====================================================

describe("Orders Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();

        Object.defineProperty(navigator, "clipboard", {
            value: {
                writeText: jest.fn().mockResolvedValue(undefined),
            },
            configurable: true,
        });

        jest.spyOn(console, "error").mockImplementation(() => { });
    });

    afterEach(() => {
        localStorage.clear();
        jest.restoreAllMocks();
    });


    // =====================================================
    // BASIC RENDERING
    // =====================================================

    test("renders My Orders heading", async () => {
        render(<Orders />);

        expect(
            await screen.findByRole("heading", {
                name: /my orders/i,
            })
        ).toBeInTheDocument();
    });


    test("renders page description", async () => {
        render(<Orders />);

        expect(
            await screen.findByText(
                /track shipments, cancel orders, or review your complete purchase history/i
            )
        ).toBeInTheDocument();
    });


    test("renders Back button", async () => {
        render(<Orders />);

        expect(
            await screen.findByRole("button", {
                name: /^back$/i,
            })
        ).toBeInTheDocument();
    });


    test("renders Track by ID link", async () => {
        render(<Orders />);

        const link = await screen.findByRole("link", {
            name: /track by id/i,
        });

        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute(
            "href",
            "/track-order"
        );
    });


    // =====================================================
    // EMPTY STATE
    // =====================================================

    test("renders empty state when there are no orders", async () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([])
        );

        render(<Orders />);

        expect(
            await screen.findByText("No Orders Found")
        ).toBeInTheDocument();
    });


    test("renders empty orders message", async () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([])
        );

        render(<Orders />);

        expect(
            await screen.findByText(
                /you don't have any orders in this category/i
            )
        ).toBeInTheDocument();
    });


    test("renders Start Shopping button", async () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([])
        );

        render(<Orders />);

        expect(
            await screen.findByRole("button", {
                name: /start shopping/i,
            })
        ).toBeInTheDocument();
    });


    test("Start Shopping navigates to shop", async () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([])
        );

        render(<Orders />);

        const button = await screen.findByRole(
            "button",
            {
                name: /start shopping/i,
            }
        );

        fireEvent.click(button);

        expect(mockNavigate).toHaveBeenCalledWith(
            "/shop"
        );
    });


    // =====================================================
    // FILTER TABS
    // =====================================================

    test("renders all filter tabs", async () => {
        render(<Orders />);

        expect(
            await screen.findByRole("button", {
                name: /all orders/i,
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", {
                name: /active/i,
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", {
                name: /delivered/i,
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", {
                name: /cancelled/i,
            })
        ).toBeInTheDocument();
    });


    test("All Orders tab is active initially", async () => {
        render(<Orders />);

        const button = await screen.findByRole(
            "button",
            {
                name: /all orders/i,
            }
        );

        expect(button).toHaveClass("active");
    });


    test("Active tab becomes active when clicked", async () => {
        render(<Orders />);

        const button = await screen.findByRole(
            "button",
            {
                name: /active/i,
            }
        );

        fireEvent.click(button);

        expect(button).toHaveClass("active");
    });


    test("Delivered tab becomes active when clicked", async () => {
        render(<Orders />);

        const button = await screen.findByRole(
            "button",
            {
                name: /delivered/i,
            }
        );

        fireEvent.click(button);

        expect(button).toHaveClass("active");
    });


    test("Cancelled tab becomes active when clicked", async () => {
        render(<Orders />);

        const button = await screen.findByRole(
            "button",
            {
                name: /cancelled/i,
            }
        );

        fireEvent.click(button);

        expect(button).toHaveClass("active");
    });


    // =====================================================
    // ORDER RENDERING
    // =====================================================

    test("renders generic order", async () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([
                createOrder(),
            ])
        );

        render(<Orders />);

        expect(
            await screen.findByText("#test-order")
        ).toBeInTheDocument();
    });


    test("renders order card", async () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([
                createOrder(),
            ])
        );

        render(<Orders />);

        await screen.findByText("#test-order");

        expect(
            document.querySelector(".order-card")
        ).toBeInTheDocument();
    });


    test("renders orders list", async () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([
                createOrder(),
            ])
        );

        render(<Orders />);

        await screen.findByText("#test-order");

        expect(
            document.querySelector(".orders-list")
        ).toBeInTheDocument();
    });


    test("renders order id", async () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([
                createOrder(),
            ])
        );

        render(<Orders />);

        expect(
            await screen.findByText("#test-order")
        ).toBeInTheDocument();
    });


    // =====================================================
    // STATUS TESTS
    // =====================================================

    test("renders processing status", async () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([
                createOrder({
                    status: "Processing",
                }),
            ])
        );

        render(<Orders />);

        expect(
            await screen.findByText("Processing")
        ).toBeInTheDocument();
    });


    test("renders default confirmed status", async () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([
                {
                    id: "test-order",
                },
            ])
        );

        render(<Orders />);

        expect(
            await screen.findByText("Order Confirmed")
        ).toBeInTheDocument();
    });


    test("renders delivered status", async () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([
                createOrder({
                    status: "Delivered",
                }),
            ])
        );

        render(<Orders />);

        const statuses =
            await screen.findAllByText("Delivered");

        expect(statuses.length).toBeGreaterThan(0);
    });


    test("renders cancelled status", async () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([
                createOrder({
                    status: "Cancelled",
                }),
            ])
        );

        render(<Orders />);

        const statuses =
            await screen.findAllByText("Cancelled");

        expect(statuses.length).toBeGreaterThan(0);
    });


    test("renders in transit status", async () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([
                createOrder({
                    status: "In Transit",
                }),
            ])
        );

        render(<Orders />);

        expect(
            await screen.findByText("In Transit")
        ).toBeInTheDocument();
    });


    test("renders packed status", async () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([
                createOrder({
                    status: "Packed",
                }),
            ])
        );

        render(<Orders />);

        expect(
            await screen.findByText("Packed")
        ).toBeInTheDocument();
    });


    test("renders out for delivery status", async () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([
                createOrder({
                    status: "Out for Delivery",
                }),
            ])
        );

        render(<Orders />);
    });


    // =====================================================
    // SEARCH
    // =====================================================

    test("renders search input", async () => {
        render(<Orders />);

        expect(
            await screen.findByPlaceholderText(
                "Search by Order ID or Product..."
            )
        ).toBeInTheDocument();
    });


    test("search input accepts text", async () => {
        render(<Orders />);

        const input =
            await screen.findByPlaceholderText(
                "Search by Order ID or Product..."
            );

        fireEvent.change(input, {
            target: {
                value: "test",
            },
        });

        expect(input).toHaveValue("test");
    });


    test("search filters orders by order id", async () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([
                createOrder({
                    id: "first-order",
                }),
                createOrder({
                    id: "second-order",
                }),
            ])
        );

        render(<Orders />);

        const input =
            await screen.findByPlaceholderText(
                "Search by Order ID or Product..."
            );

        fireEvent.change(input, {
            target: {
                value: "first",
            },
        });

        expect(
            await screen.findByText("#first-order")
        ).toBeInTheDocument();

        expect(
            screen.queryByText("#second-order")
        ).not.toBeInTheDocument();
    });


    test("search shows empty state when there is no match", async () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([
                createOrder(),
            ])
        );

        render(<Orders />);

        const input =
            await screen.findByPlaceholderText(
                "Search by Order ID or Product..."
            );

        fireEvent.change(input, {
            target: {
                value: "not-found",
            },
        });

        expect(
            await screen.findByText("No Orders Found")
        ).toBeInTheDocument();
    });


    // =====================================================
    // BACK BUTTON
    // =====================================================

    test("Back button navigates backwards", async () => {
        render(<Orders />);

        const button = await screen.findByRole(
            "button",
            {
                name: /^back$/i,
            }
        );

        fireEvent.click(button);

        expect(mockNavigate).toHaveBeenCalledWith(-1);
    });


    // =====================================================
    // TRACK SHIPMENT
    // =====================================================

    test("renders Track Shipment for active order", async () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([
                createOrder(),
            ])
        );

        render(<Orders />);

        expect(
            await screen.findByRole("button", {
                name: /track shipment/i,
            })
        ).toBeInTheDocument();
    });


    test("Track Shipment navigates correctly", async () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([
                createOrder(),
            ])
        );

        render(<Orders />);

        const button =
            await screen.findByRole("button", {
                name: /track shipment/i,
            });

        fireEvent.click(button);

        expect(mockNavigate).toHaveBeenCalledWith(
            "/track-order?id=test-order"
        );
    });


    test("cancelled order does not show Track Shipment", async () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([
                createOrder({
                    status: "Cancelled",
                }),
            ])
        );

        render(<Orders />);

        await screen.findAllByText("Cancelled");

        expect(
            screen.queryByRole("button", {
                name: /track shipment/i,
            })
        ).not.toBeInTheDocument();
    });


    // =====================================================
    // CANCEL ORDER
    // =====================================================

    test("active order shows Cancel Order button", async () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([
                createOrder(),
            ])
        );

        render(<Orders />);

        expect(
            await screen.findByRole("button", {
                name: /cancel order/i,
            })
        ).toBeInTheDocument();
    });


    test("clicking Cancel Order opens modal", async () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([
                createOrder(),
            ])
        );

        render(<Orders />);

        const button =
            await screen.findByRole("button", {
                name: /cancel order/i,
            });

        fireEvent.click(button);

        expect(
            await screen.findByText(
                /are you sure you want to cancel this order/i
            )
        ).toBeInTheDocument();
    });


    test("cancel modal renders close button", async () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([
                createOrder(),
            ])
        );

        render(<Orders />);

        fireEvent.click(
            await screen.findByRole("button", {
                name: /cancel order/i,
            })
        );

        expect(
            await screen.findByRole("button", {
                name: /close/i,
            })
        ).toBeInTheDocument();
    });


    test("cancel modal renders Keep Order button", async () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([
                createOrder(),
            ])
        );

        render(<Orders />);

        fireEvent.click(
            await screen.findByRole("button", {
                name: /cancel order/i,
            })
        );

        expect(
            await screen.findByRole("button", {
                name: /keep order/i,
            })
        ).toBeInTheDocument();
    });


    test("cancel modal renders confirmation button", async () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([
                createOrder(),
            ])
        );

        render(<Orders />);

        fireEvent.click(
            await screen.findByRole("button", {
                name: /cancel order/i,
            })
        );

        expect(
            await screen.findByRole("button", {
                name: /yes, cancel order/i,
            })
        ).toBeInTheDocument();
    });


    // =====================================================
    // CANCEL REASONS
    // =====================================================

    test("renders cancellation radio buttons", async () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([
                createOrder(),
            ])
        );

        render(<Orders />);

        fireEvent.click(
            await screen.findByRole("button", {
                name: /cancel order/i,
            })
        );

        const radios =
            await screen.findAllByRole("radio");

        expect(radios).toHaveLength(8);
    });


    test("first cancellation reason is selected by default", async () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([
                createOrder(),
            ])
        );

        render(<Orders />);

        fireEvent.click(
            await screen.findByRole("button", {
                name: /cancel order/i,
            })
        );

        const radios =
            await screen.findAllByRole("radio");

        expect(radios[0]).toBeChecked();
    });


    test("user can select another cancellation reason", async () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([
                createOrder(),
            ])
        );

        render(<Orders />);

        fireEvent.click(
            await screen.findByRole("button", {
                name: /cancel order/i,
            })
        );

        const radios =
            await screen.findAllByRole("radio");

        fireEvent.click(radios[1]);

        expect(radios[1]).toBeChecked();
        expect(radios[0]).not.toBeChecked();
    });


    // =====================================================
    // KEEP ORDER
    // =====================================================

    test("Keep Order closes modal", async () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([
                createOrder(),
            ])
        );

        render(<Orders />);

        fireEvent.click(
            await screen.findByRole("button", {
                name: /cancel order/i,
            })
        );

        const keepButton =
            await screen.findByRole("button", {
                name: /keep order/i,
            });

        fireEvent.click(keepButton);

        await waitFor(() => {
            expect(
                screen.queryByText(
                    /are you sure you want to cancel this order/i
                )
            ).not.toBeInTheDocument();
        });
    });


    // =====================================================
    // CLOSE MODAL
    // =====================================================

    test("Close button closes modal", async () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([
                createOrder(),
            ])
        );

        render(<Orders />);

        fireEvent.click(
            await screen.findByRole("button", {
                name: /cancel order/i,
            })
        );

        const closeButton =
            await screen.findByRole("button", {
                name: /close/i,
            });

        fireEvent.click(closeButton);

        await waitFor(() => {
            expect(
                screen.queryByText(
                    /are you sure you want to cancel this order/i
                )
            ).not.toBeInTheDocument();
        });
    });


    // =====================================================
    // CONFIRM CANCELLATION
    // =====================================================

    test("confirm cancellation updates order status", async () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([
                createOrder(),
            ])
        );

        render(<Orders />);

        fireEvent.click(
            await screen.findByRole("button", {
                name: /cancel order/i,
            })
        );

        fireEvent.click(
            await screen.findByRole("button", {
                name: /yes, cancel order/i,
            })
        );

        const savedOrders =
            JSON.parse(
                localStorage.getItem("orders")
            );

        expect(
            savedOrders[0].status
        ).toBe("Cancelled");
    });


    test("confirm cancellation closes modal", async () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([
                createOrder(),
            ])
        );

        render(<Orders />);

        fireEvent.click(
            await screen.findByRole("button", {
                name: /cancel order/i,
            })
        );

        fireEvent.click(
            await screen.findByRole("button", {
                name: /yes, cancel order/i,
            })
        );

        await waitFor(() => {
            expect(
                screen.queryByText(
                    /are you sure you want to cancel this order/i
                )
            ).not.toBeInTheDocument();
        });
    });


    test("confirm cancellation shows toast", async () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([
                createOrder(),
            ])
        );

        render(<Orders />);

        fireEvent.click(
            await screen.findByRole("button", {
                name: /cancel order/i,
            })
        );

        fireEvent.click(
            await screen.findByRole("button", {
                name: /yes, cancel order/i,
            })
        );

        await waitFor(() => {
            expect(
                toast.info
            ).toHaveBeenCalled();
        });
    });


    // =====================================================
    // COPY ORDER ID
    // =====================================================

    test("renders copy button", async () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([
                createOrder(),
            ])
        );

        render(<Orders />);

        expect(
            await screen.findByTitle(
                "Copy Order ID"
            )
        ).toBeInTheDocument();
    });


    test("copy button uses clipboard", async () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([
                createOrder(),
            ])
        );

        render(<Orders />);

        const button =
            await screen.findByTitle(
                "Copy Order ID"
            );

        fireEvent.click(button);

        await waitFor(() => {
            expect(
                navigator.clipboard.writeText
            ).toHaveBeenCalled();
        });
    });


    test("copy button shows success toast", async () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([
                createOrder(),
            ])
        );

        render(<Orders />);

        const button =
            await screen.findByTitle(
                "Copy Order ID"
            );

        fireEvent.click(button);

        await waitFor(() => {
            expect(
                toast.success
            ).toHaveBeenCalled();
        });
    });


    // =====================================================
    // FILTER TESTS
    // =====================================================

    test("Active filter excludes cancelled orders", async () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([
                createOrder({
                    id: "active-order",
                    status: "Processing",
                }),
                createOrder({
                    id: "cancelled-order",
                    status: "Cancelled",
                }),
            ])
        );

        render(<Orders />);

        fireEvent.click(
            await screen.findByRole("button", {
                name: /active/i,
            })
        );

        expect(
            await screen.findByText(
                "#active-order"
            )
        ).toBeInTheDocument();

        expect(
            screen.queryByText(
                "#cancelled-order"
            )
        ).not.toBeInTheDocument();
    });


    test("Delivered filter shows delivered order", async () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([
                createOrder({
                    id: "active-order",
                    status: "Processing",
                }),
                createOrder({
                    id: "delivered-order",
                    status: "Delivered",
                }),
            ])
        );

        render(<Orders />);

        fireEvent.click(
            await screen.findByRole("button", {
                name: /delivered/i,
            })
        );

        expect(
            await screen.findByText(
                "#delivered-order"
            )
        ).toBeInTheDocument();

        expect(
            screen.queryByText(
                "#active-order"
            )
        ).not.toBeInTheDocument();
    });


    test("Cancelled filter shows cancelled order", async () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([
                createOrder({
                    id: "active-order",
                    status: "Processing",
                }),
                createOrder({
                    id: "cancelled-order",
                    status: "Cancelled",
                }),
            ])
        );

        render(<Orders />);

        fireEvent.click(
            await screen.findByRole("button", {
                name: /cancelled/i,
            })
        );

        expect(
            await screen.findByText(
                "#cancelled-order"
            )
        ).toBeInTheDocument();

        expect(
            screen.queryByText(
                "#active-order"
            )
        ).not.toBeInTheDocument();
    });


    // =====================================================
    // CANCELLED ORDER
    // =====================================================

    test("cancelled order does not show Cancel Order button", async () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([
                createOrder({
                    status: "Cancelled",
                }),
            ])
        );

        render(<Orders />);

        await screen.findAllByText("Cancelled");

        expect(
            screen.queryByRole("button", {
                name: /cancel order/i,
            })
        ).not.toBeInTheDocument();
    });


    test("cancelled order does not show Track Shipment", async () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([
                createOrder({
                    status: "Cancelled",
                }),
            ])
        );

        render(<Orders />);

        await screen.findAllByText("Cancelled");

        expect(
            screen.queryByRole("button", {
                name: /track shipment/i,
            })
        ).not.toBeInTheDocument();
    });


    test("cancelled order renders cancelled text", async () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([
                createOrder({
                    status: "Cancelled",
                }),
            ])
        );

        render(<Orders />);

        const cancelled =
            await screen.findAllByText(
                "Cancelled"
            );

        expect(
            cancelled.length
        ).toBeGreaterThan(0);
    });


    // =====================================================
    // DELIVERED ORDER
    // =====================================================

    test("delivered order does not show Cancel Order", async () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([
                createOrder({
                    status: "Delivered",
                }),
            ])
        );

        render(<Orders />);

        await screen.findAllByText(
            "Delivered"
        );

        expect(
            screen.queryByRole("button", {
                name: /cancel order/i,
            })
        ).not.toBeInTheDocument();
    });


    test("delivered order still shows Track Shipment", async () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([
                createOrder({
                    status: "Delivered",
                }),
            ])
        );

        render(<Orders />);

        await screen.findAllByText(
            "Delivered"
        );

        expect(
            screen.getByRole("button", {
                name: /track shipment/i,
            })
        ).toBeInTheDocument();
    });


    // =====================================================
    // EVENT LISTENER
    // =====================================================

    test("reloads orders after ordersUpdated event", async () => {
        localStorage.setItem(
            "orders",
            JSON.stringify([])
        );

        render(<Orders />);

        expect(
            await screen.findByText(
                "No Orders Found"
            )
        ).toBeInTheDocument();

        localStorage.setItem(
            "orders",
            JSON.stringify([
                createOrder({
                    id: "updated-order",
                }),
            ])
        );

        fireEvent(
            window,
            new Event("ordersUpdated")
        );

        expect(
            await screen.findByText(
                "#updated-order"
            )
        ).toBeInTheDocument();
    });


    // =====================================================
    // INVALID LOCAL STORAGE
    // =====================================================

    test("handles invalid JSON safely", async () => {
        localStorage.setItem(
            "orders",
            "invalid-json"
        );

        render(<Orders />);

        expect(
            await screen.findByText(
                "No Orders Found"
            )
        ).toBeInTheDocument();
    });


    test("handles non-array orders safely", async () => {
        localStorage.setItem(
            "orders",
            JSON.stringify({})
        );

        render(<Orders />);

        expect(
            await screen.findByText(
                "No Orders Found"
            )
        ).toBeInTheDocument();
    });


    // =====================================================
    // COMPONENT STRUCTURE
    // =====================================================

    test("renders main order page", async () => {
        render(<Orders />);

        await screen.findByText(
            "No Orders Found"
        );

        expect(
            document.querySelector(".order-page")
        ).toBeInTheDocument();
    });


    test("renders order header", async () => {
        render(<Orders />);

        await screen.findByText(
            "My Orders"
        );

        expect(
            document.querySelector(".order-header")
        ).toBeInTheDocument();
    });


    test("renders filter box", async () => {
        render(<Orders />);

        await screen.findByText(
            "My Orders"
        );

        expect(
            document.querySelector(
                ".order-filter-box"
            )
        ).toBeInTheDocument();
    });


    test("renders search container", async () => {
        render(<Orders />);

        await screen.findByText(
            "My Orders"
        );

        expect(
            document.querySelector(
                ".order-search"
            )
        ).toBeInTheDocument();
    });
});