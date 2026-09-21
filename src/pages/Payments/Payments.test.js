import React from "react";
import {
    render,
    screen,
    fireEvent,
} from "@testing-library/react";
import "@testing-library/jest-dom";

import Payments from "./Payments";

describe("Payments Component", () => {

    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    // -----------------------------------------
    // BASIC RENDERING
    // -----------------------------------------

    test("renders Saved Payment Methods heading", () => {
        render(<Payments />);

        expect(
            screen.getByRole("heading", {
                name: /saved payment methods/i,
            })
        ).toBeInTheDocument();
    });

    test("renders Add Payment Method button", () => {
        render(<Payments />);

        expect(
            screen.getByRole("button", {
                name: /add payment method/i,
            })
        ).toBeInTheDocument();
    });

    test("renders payment cards", () => {
        const { container } = render(
            <Payments />
        );

        expect(
            container.querySelectorAll(".payment-card")
        ).toHaveLength(3);
    });

    // -----------------------------------------
    // PAYMENT METHOD TYPES
    // -----------------------------------------

    test("renders Credit Card payment type", () => {
        render(<Payments />);

        expect(
            screen.getByText("Credit Card")
        ).toBeInTheDocument();
    });

    test("renders UPI payment type", () => {
        render(<Payments />);

        expect(
            screen.getByText("UPI")
        ).toBeInTheDocument();
    });

    test("renders Net Banking payment type", () => {
        render(<Payments />);

        expect(
            screen.getByText("Net Banking")
        ).toBeInTheDocument();
    });

    // -----------------------------------------
    // REMOVE BUTTONS
    // -----------------------------------------

    test("renders three Remove buttons", () => {
        render(<Payments />);

        expect(
            screen.getAllByRole("button", {
                name: /remove/i,
            })
        ).toHaveLength(3);
    });

    test("removes first payment method", () => {
        render(<Payments />);

        const removeButtons =
            screen.getAllByRole("button", {
                name: /remove/i,
            });

        fireEvent.click(removeButtons[0]);

        expect(
            screen.queryByText("Credit Card")
        ).not.toBeInTheDocument();

        expect(
            screen.getByText("UPI")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Net Banking")
        ).toBeInTheDocument();
    });

    test("removes second payment method", () => {
        render(<Payments />);

        const removeButtons =
            screen.getAllByRole("button", {
                name: /remove/i,
            });

        fireEvent.click(removeButtons[1]);

        expect(
            screen.queryByText("UPI")
        ).not.toBeInTheDocument();

        expect(
            screen.getByText("Credit Card")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Net Banking")
        ).toBeInTheDocument();
    });

    test("removes third payment method", () => {
        render(<Payments />);

        const removeButtons =
            screen.getAllByRole("button", {
                name: /remove/i,
            });

        fireEvent.click(removeButtons[2]);

        expect(
            screen.queryByText("Net Banking")
        ).not.toBeInTheDocument();

        expect(
            screen.getByText("Credit Card")
        ).toBeInTheDocument();

        expect(
            screen.getByText("UPI")
        ).toBeInTheDocument();
    });

    // -----------------------------------------
    // MULTIPLE REMOVALS
    // -----------------------------------------

    test("removes two payment methods", () => {
        render(<Payments />);

        let removeButtons =
            screen.getAllByRole("button", {
                name: /remove/i,
            });

        fireEvent.click(removeButtons[0]);

        removeButtons =
            screen.getAllByRole("button", {
                name: /remove/i,
            });

        fireEvent.click(removeButtons[0]);

        expect(
            document.querySelectorAll(".payment-card")
        ).toHaveLength(1);
    });

    test("removes all payment methods", () => {
        render(<Payments />);

        let removeButtons =
            screen.getAllByRole("button", {
                name: /remove/i,
            });

        fireEvent.click(removeButtons[0]);

        removeButtons =
            screen.getAllByRole("button", {
                name: /remove/i,
            });

        fireEvent.click(removeButtons[0]);

        removeButtons =
            screen.getAllByRole("button", {
                name: /remove/i,
            });

        fireEvent.click(removeButtons[0]);

        expect(
            screen.getByText(
                "No Payment Methods Found"
            )
        ).toBeInTheDocument();
    });

    // -----------------------------------------
    // EMPTY STATE
    // -----------------------------------------

    test("renders empty payment state", () => {
        render(<Payments />);

        let removeButtons =
            screen.getAllByRole("button", {
                name: /remove/i,
            });

        fireEvent.click(removeButtons[0]);

        removeButtons =
            screen.getAllByRole("button", {
                name: /remove/i,
            });

        fireEvent.click(removeButtons[0]);

        removeButtons =
            screen.getAllByRole("button", {
                name: /remove/i,
            });

        fireEvent.click(removeButtons[0]);

        expect(
            screen.getByRole("heading", {
                name: /no payment methods found/i,
            })
        ).toBeInTheDocument();
    });

    test("does not render payment cards when empty", () => {
        const { container } = render(
            <Payments />
        );

        let removeButtons =
            screen.getAllByRole("button", {
                name: /remove/i,
            });

        fireEvent.click(removeButtons[0]);

        removeButtons =
            screen.getAllByRole("button", {
                name: /remove/i,
            });

        fireEvent.click(removeButtons[0]);

        removeButtons =
            screen.getAllByRole("button", {
                name: /remove/i,
            });

        fireEvent.click(removeButtons[0]);

        expect(
            container.querySelectorAll(".payment-card")
        ).toHaveLength(0);
    });

    // -----------------------------------------
    // LOCAL STORAGE
    // -----------------------------------------

    test("stores updated payments in localStorage", () => {
        render(<Payments />);

        const removeButtons =
            screen.getAllByRole("button", {
                name: /remove/i,
            });

        fireEvent.click(removeButtons[0]);

        const storedPayments =
            localStorage.getItem("payments");

        expect(storedPayments).not.toBeNull();
    });

    test("stores valid JSON in localStorage", () => {
        render(<Payments />);

        const removeButtons =
            screen.getAllByRole("button", {
                name: /remove/i,
            });

        fireEvent.click(removeButtons[0]);

        const storedPayments =
            localStorage.getItem("payments");

        expect(() => {
            JSON.parse(storedPayments);
        }).not.toThrow();
    });

    test("stores remaining payments after removal", () => {
        render(<Payments />);

        const removeButtons =
            screen.getAllByRole("button", {
                name: /remove/i,
            });

        fireEvent.click(removeButtons[0]);

        const storedPayments =
            JSON.parse(
                localStorage.getItem("payments")
            );

        expect(storedPayments).toHaveLength(2);
    });

    test("removed payment is not stored", () => {
        render(<Payments />);

        const removeButtons =
            screen.getAllByRole("button", {
                name: /remove/i,
            });

        fireEvent.click(removeButtons[0]);

        const storedPayments =
            JSON.parse(
                localStorage.getItem("payments")
            );

        expect(
            storedPayments.some(
                (payment) => payment.id === 1
            )
        ).toBe(false);
    });

    test("remaining payment ids are stored", () => {
        render(<Payments />);

        const removeButtons =
            screen.getAllByRole("button", {
                name: /remove/i,
            });

        fireEvent.click(removeButtons[0]);

        const storedPayments =
            JSON.parse(
                localStorage.getItem("payments")
            );

        expect(
            storedPayments.map(
                (payment) => payment.id
            )
        ).toEqual([2, 3]);
    });

    test("stored payments contain serializable icon type", () => {
        render(<Payments />);

        const removeButtons =
            screen.getAllByRole("button", {
                name: /remove/i,
            });

        fireEvent.click(removeButtons[0]);

        const storedPayments =
            JSON.parse(
                localStorage.getItem("payments")
            );

        storedPayments.forEach((payment) => {
            expect(
                typeof payment.iconType
            ).toBe("string");
        });
    });

    // -----------------------------------------
    // ICON CONTAINERS
    // -----------------------------------------

    test("renders payment icon containers", () => {
        const { container } = render(
            <Payments />
        );

        expect(
            container.querySelectorAll(".payment-icon")
        ).toHaveLength(3);
    });

    test("renders payment details containers", () => {
        const { container } = render(
            <Payments />
        );

        expect(
            container.querySelectorAll(
                ".payment-details"
            )
        ).toHaveLength(3);
    });

    // -----------------------------------------
    // CSS STRUCTURE
    // -----------------------------------------

    test("renders payments page container", () => {
        const { container } = render(
            <Payments />
        );

        expect(
            container.querySelector(".payments-page")
        ).toBeInTheDocument();
    });

    test("renders payments header", () => {
        const { container } = render(
            <Payments />
        );

        expect(
            container.querySelector(
                ".payments-header"
            )
        ).toBeInTheDocument();
    });

    test("renders add button with correct class", () => {
        const { container } = render(
            <Payments />
        );

        expect(
            container.querySelector(".add-btn")
        ).toBeInTheDocument();
    });

    test("renders remove buttons with correct class", () => {
        const { container } = render(
            <Payments />
        );

        expect(
            container.querySelectorAll(
                ".remove-btn"
            )
        ).toHaveLength(3);
    });

    test("renders payment card structure", () => {
        const { container } = render(
            <Payments />
        );

        const card =
            container.querySelector(
                ".payment-card"
            );

        expect(card).toBeInTheDocument();

        expect(
            card.querySelector(".payment-icon")
        ).toBeInTheDocument();

        expect(
            card.querySelector(".payment-details")
        ).toBeInTheDocument();

        expect(
            card.querySelector(".remove-btn")
        ).toBeInTheDocument();
    });

    // -----------------------------------------
    // ADD BUTTON
    // -----------------------------------------

    test("Add Payment Method button is enabled", () => {
        render(<Payments />);

        const button =
            screen.getByRole("button", {
                name: /add payment method/i,
            });

        expect(button).toBeEnabled();
    });

    test("clicking Add Payment Method does not remove payments", () => {
        render(<Payments />);

        const addButton =
            screen.getByRole("button", {
                name: /add payment method/i,
            });

        fireEvent.click(addButton);

        expect(
            document.querySelectorAll(".payment-card")
        ).toHaveLength(3);
    });
});