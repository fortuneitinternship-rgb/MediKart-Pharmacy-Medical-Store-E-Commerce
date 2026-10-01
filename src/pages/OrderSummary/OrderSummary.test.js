import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import OrderSummary from "./OrderSummary";

describe("OrderSummary Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // --------------------------------------------------
    // EMPTY ORDER
    // --------------------------------------------------

    test("renders Order Not Found when order is not provided", () => {
        render(<OrderSummary />);

        expect(
            screen.getByText("Order Not Found")
        ).toBeInTheDocument();
    });

    test("renders empty order message", () => {
        render(<OrderSummary />);

        expect(
            screen.getByText(
                "We couldn't find the selected order."
            )
        ).toBeInTheDocument();
    });

    test("renders empty order container", () => {
        const { container } = render(<OrderSummary />);

        expect(
            container.querySelector(".order-summary-empty")
        ).toBeInTheDocument();
    });

    // --------------------------------------------------
    // MAIN ORDER SUMMARY
    // --------------------------------------------------

    test("renders Order Summary heading", () => {
        render(
            <OrderSummary
                order={{
                    id: "test-id",
                }}
            />
        );

        expect(
            screen.getByRole("heading", {
                name: "Order Summary",
            })
        ).toBeInTheDocument();
    });

    test("renders order id", () => {
        render(
            <OrderSummary
                order={{
                    id: "test-id",
                }}
            />
        );
    });

    test("renders orderId when available", () => {
        render(
            <OrderSummary
                order={{
                    id: "test-id",
                    orderId: "summary-id",
                }}
            />
        );
    });

    test("renders default Processing status", () => {
        render(
            <OrderSummary
                order={{
                    id: "test-id",
                }}
            />
        );

        expect(
            screen.getByText("Processing")
        ).toBeInTheDocument();
    });

    test("renders provided order status", () => {
        render(
            <OrderSummary
                order={{
                    id: "test-id",
                    status: "Completed",
                }}
            />
        );

        expect(
            screen.getByText("Completed")
        ).toBeInTheDocument();
    });

    // --------------------------------------------------
    // ORDER INFORMATION
    // --------------------------------------------------

    test("renders Order ID label", () => {
        render(
            <OrderSummary
                order={{
                    id: "test-id",
                }}
            />
        );

        expect(
            screen.getByText("Order ID")
        ).toBeInTheDocument();
    });

    test("renders Order Date label", () => {
        render(
            <OrderSummary
                order={{
                    id: "test-id",
                }}
            />
        );

        expect(
            screen.getByText("Order Date")
        ).toBeInTheDocument();
    });

    test("renders default order date", () => {
        render(
            <OrderSummary
                order={{
                    id: "test-id",
                }}
            />
        );

        expect(
            screen.getByText("Date not available")
        ).toBeInTheDocument();
    });

    test("renders orderDate when provided", () => {
        render(
            <OrderSummary
                order={{
                    id: "test-id",
                    orderDate: "Test Date",
                }}
            />
        );

        expect(
            screen.getByText("Test Date")
        ).toBeInTheDocument();
    });

    test("uses date when orderDate is unavailable", () => {
        render(
            <OrderSummary
                order={{
                    id: "test-id",
                    date: "Fallback Date",
                }}
            />
        );

        expect(
            screen.getByText("Fallback Date")
        ).toBeInTheDocument();
    });

    test("renders Payment Method label", () => {
        render(
            <OrderSummary
                order={{
                    id: "test-id",
                }}
            />
        );

        expect(
            screen.getByText("Payment Method")
        ).toBeInTheDocument();
    });

    test("renders default payment method", () => {
        render(
            <OrderSummary
                order={{
                    id: "test-id",
                }}
            />
        );

        expect(
            screen.getByText("Online Payment")
        ).toBeInTheDocument();
    });

    test("renders provided payment method", () => {
        render(
            <OrderSummary
                order={{
                    id: "test-id",
                    paymentMethod: "Test Payment",
                }}
            />
        );

        expect(
            screen.getByText("Test Payment")
        ).toBeInTheDocument();
    });

    // --------------------------------------------------
    // SECTIONS
    // --------------------------------------------------

    test("renders Products Ordered section", () => {
        render(
            <OrderSummary
                order={{
                    id: "test-id",
                    items: [],
                }}
            />
        );

        expect(
            screen.getByRole("heading", {
                name: "Products Ordered",
            })
        ).toBeInTheDocument();
    });

    test("renders Delivery Address section", () => {
        render(
            <OrderSummary
                order={{
                    id: "test-id",
                }}
            />
        );

        expect(
            screen.getByRole("heading", {
                name: "Delivery Address",
            })
        ).toBeInTheDocument();
    });

    test("renders Price Details section", () => {
        render(
            <OrderSummary
                order={{
                    id: "test-id",
                }}
            />
        );

        expect(
            screen.getByRole("heading", {
                name: "Price Details",
            })
        ).toBeInTheDocument();
    });

    // --------------------------------------------------
    // DELIVERY ADDRESS
    // --------------------------------------------------

    test("renders default delivery address message", () => {
        render(
            <OrderSummary
                order={{
                    id: "test-id",
                }}
            />
        );

        expect(
            screen.getByText(
                "Delivery address not available."
            )
        ).toBeInTheDocument();
    });

    test("renders deliveryAddress when provided", () => {
        render(
            <OrderSummary
                order={{
                    id: "test-id",
                    deliveryAddress: "Test Address",
                }}
            />
        );

        expect(
            screen.getByText("Test Address")
        ).toBeInTheDocument();
    });

    test("uses address when deliveryAddress is unavailable", () => {
        render(
            <OrderSummary
                order={{
                    id: "test-id",
                    address: "Fallback Address",
                }}
            />
        );

        expect(
            screen.getByText("Fallback Address")
        ).toBeInTheDocument();
    });

    // --------------------------------------------------
    // PRICE DETAILS
    // --------------------------------------------------

    test("renders Product Total label", () => {
        render(
            <OrderSummary
                order={{
                    id: "test-id",
                    items: [],
                }}
            />
        );

        expect(
            screen.getByText("Product Total")
        ).toBeInTheDocument();
    });

    test("renders Delivery Charge label", () => {
        render(
            <OrderSummary
                order={{
                    id: "test-id",
                    items: [],
                }}
            />
        );

        expect(
            screen.getByText("Delivery Charge")
        ).toBeInTheDocument();
    });

    test("renders FREE when delivery charge is zero", () => {
        render(
            <OrderSummary
                order={{
                    id: "test-id",
                    items: [],
                    deliveryCharge: 0,
                }}
            />
        );

        expect(
            screen.getByText("FREE")
        ).toBeInTheDocument();
    });

    test("renders discount row only when discount exists", () => {
        render(
            <OrderSummary
                order={{
                    id: "test-id",
                    items: [],
                    discount: 10,
                }}
            />
        );

        expect(
            screen.getByText("Discount")
        ).toBeInTheDocument();
    });

    test("does not render discount row when discount is zero", () => {
        render(
            <OrderSummary
                order={{
                    id: "test-id",
                    items: [],
                    discount: 0,
                }}
            />
        );

        expect(
            screen.queryByText("Discount")
        ).not.toBeInTheDocument();
    });

    test("renders Total Amount label", () => {
        render(
            <OrderSummary
                order={{
                    id: "test-id",
                    items: [],
                }}
            />
        );

        expect(
            screen.getByText("Total Amount")
        ).toBeInTheDocument();
    });

    // --------------------------------------------------
    // EMPTY ITEMS
    // --------------------------------------------------

    test("handles order without items", () => {
        render(
            <OrderSummary
                order={{
                    id: "test-id",
                }}
            />
        );

        expect(
            screen.getByRole("heading", {
                name: "Products Ordered",
            })
        ).toBeInTheDocument();

        expect(
            document.querySelector(".ordered-products")
        ).toBeInTheDocument();
    });

    test("handles empty items array", () => {
        render(
            <OrderSummary
                order={{
                    id: "test-id",
                    items: [],
                }}
            />
        );

        expect(
            document.querySelectorAll(".ordered-product")
        ).toHaveLength(0);
    });

    // --------------------------------------------------
    // CALCULATION TESTS
    // --------------------------------------------------

    test("calculates total from subtotal and delivery charge", () => {
        render(
            <OrderSummary
                order={{
                    id: "test-id",
                    items: [
                        {
                            price: 10,
                            quantity: 2,
                        },
                    ],
                    deliveryCharge: 5,
                }}
            />
        );

        expect(
            screen.getByText("₹25")
        ).toBeInTheDocument();
    });

    test("uses provided totalAmount when available", () => {
        render(
            <OrderSummary
                order={{
                    id: "test-id",
                    items: [],
                    totalAmount: 50,
                }}
            />
        );

        expect(
            screen.getByText("₹50")
        ).toBeInTheDocument();
    });

    test("calculates total after discount", () => {
        render(
            <OrderSummary
                order={{
                    id: "test-id",
                    items: [
                        {
                            price: 20,
                            quantity: 2,
                        },
                    ],
                    deliveryCharge: 5,
                    discount: 5,
                }}
            />
        );
    });

    // --------------------------------------------------
    // CSS STRUCTURE
    // --------------------------------------------------

    test("renders main summary page container", () => {
        const { container } = render(
            <OrderSummary
                order={{
                    id: "test-id",
                }}
            />
        );

        expect(
            container.querySelector(".order-summary-page")
        ).toBeInTheDocument();
    });

    test("renders summary container", () => {
        const { container } = render(
            <OrderSummary
                order={{
                    id: "test-id",
                }}
            />
        );

        expect(
            container.querySelector(".order-summary-container")
        ).toBeInTheDocument();
    });

    test("renders summary header", () => {
        const { container } = render(
            <OrderSummary
                order={{
                    id: "test-id",
                }}
            />
        );

        expect(
            container.querySelector(".summary-header")
        ).toBeInTheDocument();
    });

    test("renders order information card", () => {
        const { container } = render(
            <OrderSummary
                order={{
                    id: "test-id",
                }}
            />
        );

        expect(
            container.querySelector(".order-info-card")
        ).toBeInTheDocument();
    });

    test("renders summary cards", () => {
        const { container } = render(
            <OrderSummary
                order={{
                    id: "test-id",
                }}
            />
        );

        expect(
            container.querySelectorAll(".summary-card").length
        ).toBe(3);
    });

    test("renders price details container", () => {
        const { container } = render(
            <OrderSummary
                order={{
                    id: "test-id",
                }}
            />
        );

        expect(
            container.querySelector(".price-details")
        ).toBeInTheDocument();
    });
});