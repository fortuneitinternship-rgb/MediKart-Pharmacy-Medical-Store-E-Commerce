import React from "react";
import {
    render,
    screen,
    fireEvent,
    waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom";

import Payments from "./Payments";

import {
    addCard,
    deleteCard,
    getCards,
} from "../../api/cardApi";

import { getApiErrorMessage } from "../../services/api";


// --------------------------------------------------
// MOCK CARD API
// --------------------------------------------------

jest.mock("../../api/cardApi", () => ({
    addCard: jest.fn(),
    deleteCard: jest.fn(),
    getCards: jest.fn(),
}));


// --------------------------------------------------
// MOCK ERROR HANDLER
// --------------------------------------------------

jest.mock("../../services/api", () => ({
    getApiErrorMessage: jest.fn(),
}));


// --------------------------------------------------
// TEST SUITE
// --------------------------------------------------

describe("Payments", () => {

    beforeEach(() => {
        jest.clearAllMocks();

        // Default GET API response
        getCards.mockResolvedValue([]);

        // Default ADD API response
        addCard.mockResolvedValue({
            id: 1,
            card_type: "Visa",
            card_holder_name: "Test User",
            last4: "1111",
            expiry_month: 10,
            expiry_year: 2030,
        });

        // Default DELETE API response
        deleteCard.mockResolvedValue({
            message: "Card deleted successfully",
        });

        // Default error message
        getApiErrorMessage.mockImplementation(
            (error, fallback) => fallback
        );
    });


    // --------------------------------------------------
    // 1. RENDER PAGE
    // --------------------------------------------------

    test("renders Saved Payment Methods heading", async () => {

        render(<Payments />);

        expect(
            screen.getByRole("heading", {
                level: 2,
                name: "Saved Payment Methods",
            })
        ).toBeInTheDocument();

        await waitFor(() => {
            expect(getCards).toHaveBeenCalledTimes(1);
        });
    });


    // --------------------------------------------------
    // 2. EMPTY STATE
    // --------------------------------------------------

    test("shows empty payment methods message", async () => {

        getCards.mockResolvedValue([]);

        render(<Payments />);

        expect(
            await screen.findByRole("heading", {
                level: 3,
                name: "No Payment Methods Found",
            })
        ).toBeInTheDocument();
    });


    // --------------------------------------------------
    // 3. OPEN ADD PAYMENT FORM
    // --------------------------------------------------

    test("opens add payment method form", async () => {

        render(<Payments />);

        await screen.findByRole("heading", {
            level: 3,
            name: "No Payment Methods Found",
        });

        const addButton = screen.getByRole("button", {
            name: /add payment method/i,
        });

        fireEvent.click(addButton);

        expect(
            screen.getByPlaceholderText("Cardholder name")
        ).toBeInTheDocument();

        expect(
            screen.getByPlaceholderText("Card number")
        ).toBeInTheDocument();

        expect(
            screen.getByPlaceholderText("Expiry month")
        ).toBeInTheDocument();

        expect(
            screen.getByPlaceholderText("Expiry year")
        ).toBeInTheDocument();

        expect(
            screen.getByPlaceholderText("CVV (not stored)")
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", {
                name: "Save Card",
            })
        ).toBeInTheDocument();
    });


    // --------------------------------------------------
    // 4. CLOSE FORM
    // --------------------------------------------------

    test("closes add payment method form", async () => {

        render(<Payments />);

        await screen.findByRole("heading", {
            level: 3,
            name: "No Payment Methods Found",
        });

        const addButton = screen.getByRole("button", {
            name: /add payment method/i,
        });

        fireEvent.click(addButton);

        expect(
            screen.getByPlaceholderText("Cardholder name")
        ).toBeInTheDocument();

        fireEvent.click(addButton);

        expect(
            screen.queryByPlaceholderText("Cardholder name")
        ).not.toBeInTheDocument();
    });


    // --------------------------------------------------
    // 5. ENTER CARD DETAILS
    // --------------------------------------------------

    test("allows user to enter card details", async () => {

        render(<Payments />);

        await screen.findByRole("heading", {
            level: 3,
            name: "No Payment Methods Found",
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: /add payment method/i,
            })
        );

        const cardholderInput =
            screen.getByPlaceholderText("Cardholder name");

        const cardNumberInput =
            screen.getByPlaceholderText("Card number");

        const expiryMonthInput =
            screen.getByPlaceholderText("Expiry month");

        const expiryYearInput =
            screen.getByPlaceholderText("Expiry year");

        const cvvInput =
            screen.getByPlaceholderText("CVV (not stored)");

        fireEvent.change(cardholderInput, {
            target: {
                value: "Test User",
            },
        });

        fireEvent.change(cardNumberInput, {
            target: {
                value: "4111111111111111",
            },
        });

        fireEvent.change(expiryMonthInput, {
            target: {
                value: "10",
            },
        });

        fireEvent.change(expiryYearInput, {
            target: {
                value: "2030",
            },
        });

        fireEvent.change(cvvInput, {
            target: {
                value: "123",
            },
        });

        expect(cardholderInput).toHaveValue("Test User");

        expect(cardNumberInput).toHaveValue(
            "4111111111111111"
        );

        expect(expiryMonthInput).toHaveValue(10);

        expect(expiryYearInput).toHaveValue(2030);

        expect(cvvInput).toHaveValue("123");
    });


    // --------------------------------------------------
    // 6. SAVE CARD SUCCESSFULLY
    // --------------------------------------------------

    test("saves payment method successfully", async () => {

        const savedCard = {
            id: 10,
            card_type: "Visa",
            card_holder_name: "Test User",
            last4: "1111",
            expiry_month: 10,
            expiry_year: 2030,
        };

        addCard.mockResolvedValue(savedCard);

        render(<Payments />);

        await screen.findByRole("heading", {
            level: 3,
            name: "No Payment Methods Found",
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: /add payment method/i,
            })
        );

        fireEvent.change(
            screen.getByPlaceholderText("Cardholder name"),
            {
                target: {
                    value: "Test User",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText("Card number"),
            {
                target: {
                    value: "4111111111111111",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText("Expiry month"),
            {
                target: {
                    value: "10",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText("Expiry year"),
            {
                target: {
                    value: "2030",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText("CVV (not stored)"),
            {
                target: {
                    value: "123",
                },
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Save Card",
            })
        );

        await waitFor(() => {
            expect(addCard).toHaveBeenCalledTimes(1);
        });

        expect(addCard).toHaveBeenCalledWith({
            card_holder_name: "Test User",
            card_number: "4111111111111111",
            expiry_month: 10,
            expiry_year: 2030,
            cvv: "123",
            card_type: "Visa",
        });

        expect(
            await screen.findByRole("heading", {
                level: 3,
                name: "Visa Card",
            })
        ).toBeInTheDocument();

        expect(
            screen.getByText("•••• •••• •••• 1111")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Expires 10/2030")
        ).toBeInTheDocument();
    });


    // --------------------------------------------------
    // 7. DISPLAYS EXISTING CARD
    // --------------------------------------------------

    test("displays existing payment method", async () => {

        getCards.mockResolvedValue([
            {
                id: 5,
                card_type: "Visa",
                card_holder_name: "Test User",
                last4: "1111",
                expiry_month: 10,
                expiry_year: 2030,
            },
        ]);

        render(<Payments />);

        expect(
            await screen.findByRole("heading", {
                level: 3,
                name: "Visa Card",
            })
        ).toBeInTheDocument();

        expect(
            screen.getByText("Test User")
        ).toBeInTheDocument();

        expect(
            screen.getByText("•••• •••• •••• 1111")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Expires 10/2030")
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", {
                name: "Remove",
            })
        ).toBeInTheDocument();
    });


    // --------------------------------------------------
    // 8. DELETE CARD SUCCESSFULLY
    // --------------------------------------------------

    test("deletes payment method successfully", async () => {

        getCards.mockResolvedValue([
            {
                id: 5,
                card_type: "Visa",
                card_holder_name: "Test User",
                last4: "1111",
                expiry_month: 10,
                expiry_year: 2030,
            },
        ]);

        render(<Payments />);

        expect(
            await screen.findByRole("heading", {
                level: 3,
                name: "Visa Card",
            })
        ).toBeInTheDocument();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Remove",
            })
        );

        await waitFor(() => {
            expect(deleteCard).toHaveBeenCalledTimes(1);
        });

        expect(deleteCard).toHaveBeenCalledWith(5);

        expect(
            await screen.findByRole("heading", {
                level: 3,
                name: "No Payment Methods Found",
            })
        ).toBeInTheDocument();

        expect(
            screen.queryByRole("heading", {
                level: 3,
                name: "Visa Card",
            })
        ).not.toBeInTheDocument();
    });


    // --------------------------------------------------
    // 9. LOAD ERROR
    // --------------------------------------------------

    test("shows error when loading payment methods fails", async () => {

        getCards.mockRejectedValue(
            new Error("Load error")
        );

        getApiErrorMessage.mockReturnValue(
            "Unable to load payment methods."
        );

        render(<Payments />);

        const errorMessage =
            await screen.findByRole("alert");

        expect(errorMessage).toHaveTextContent(
            "Unable to load payment methods."
        );

        expect(getApiErrorMessage).toHaveBeenCalled();
    });


    // --------------------------------------------------
    // 10. SAVE ERROR
    // --------------------------------------------------

    test("shows error when saving card fails", async () => {

        addCard.mockRejectedValue(
            new Error("Save error")
        );

        getApiErrorMessage.mockReturnValue(
            "Unable to save this card."
        );

        render(<Payments />);

        await screen.findByRole("heading", {
            level: 3,
            name: "No Payment Methods Found",
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: /add payment method/i,
            })
        );

        fireEvent.change(
            screen.getByPlaceholderText("Cardholder name"),
            {
                target: {
                    value: "Test User",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText("Card number"),
            {
                target: {
                    value: "4111111111111111",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText("Expiry month"),
            {
                target: {
                    value: "10",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText("Expiry year"),
            {
                target: {
                    value: "2030",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText("CVV (not stored)"),
            {
                target: {
                    value: "123",
                },
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Save Card",
            })
        );

        expect(
            await screen.findByRole("alert")
        ).toHaveTextContent(
            "Unable to save this card."
        );

        expect(getApiErrorMessage).toHaveBeenCalled();
    });


    // --------------------------------------------------
    // 11. DELETE ERROR
    // --------------------------------------------------

    test("shows error when deleting card fails", async () => {

        getCards.mockResolvedValue([
            {
                id: 5,
                card_type: "Visa",
                card_holder_name: "Test User",
                last4: "1111",
                expiry_month: 10,
                expiry_year: 2030,
            },
        ]);

        deleteCard.mockRejectedValue(
            new Error("Delete error")
        );

        getApiErrorMessage.mockReturnValue(
            "Unable to delete this card."
        );

        render(<Payments />);

        expect(
            await screen.findByRole("heading", {
                level: 3,
                name: "Visa Card",
            })
        ).toBeInTheDocument();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Remove",
            })
        );

        expect(
            await screen.findByRole("alert")
        ).toHaveTextContent(
            "Unable to delete this card."
        );

        // Card should still be displayed because deletion failed
        expect(
            screen.getByRole("heading", {
                level: 3,
                name: "Visa Card",
            })
        ).toBeInTheDocument();
    });


    // --------------------------------------------------
    // 12. SAVE BUTTON SHOWS SAVING STATE
    // --------------------------------------------------

    test("shows Saving while card is being saved", async () => {

        let resolveAddCard;

        addCard.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveAddCard = resolve;
                })
        );

        render(<Payments />);

        await screen.findByRole("heading", {
            level: 3,
            name: "No Payment Methods Found",
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: /add payment method/i,
            })
        );

        fireEvent.change(
            screen.getByPlaceholderText("Cardholder name"),
            {
                target: {
                    value: "Test User",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText("Card number"),
            {
                target: {
                    value: "4111111111111111",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText("Expiry month"),
            {
                target: {
                    value: "10",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText("Expiry year"),
            {
                target: {
                    value: "2030",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText("CVV (not stored)"),
            {
                target: {
                    value: "123",
                },
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Save Card",
            })
        );

        expect(
            await screen.findByRole("button", {
                name: "Saving...",
            })
        ).toBeDisabled();

        resolveAddCard({
            id: 20,
            card_type: "Visa",
            card_holder_name: "Test User",
            last4: "1111",
            expiry_month: 10,
            expiry_year: 2030,
        });

        await waitFor(() => {
            expect(
                screen.queryByRole("button", {
                    name: "Saving...",
                })
            ).not.toBeInTheDocument();
        });
    });
});