import React from "react";
import {
    render,
    screen,
    fireEvent,
} from "@testing-library/react";
import "@testing-library/jest-dom";

import Addresses from "./Addresses";

describe("Addresses Component", () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    // ======================================================
    // BASIC RENDERING
    // ======================================================

    test("renders Saved Addresses heading", () => {
        render(<Addresses />);

        expect(
            screen.getByRole("heading", {
                name: "Saved Addresses",
            })
        ).toBeInTheDocument();
    });

    // ======================================================
    // ADD ADDRESS BUTTON
    // ======================================================

    test("renders Add Address button", () => {
        render(<Addresses />);

        expect(
            screen.getByRole("button", {
                name: /add address/i,
            })
        ).toBeInTheDocument();
    });

    // ======================================================
    // ADDRESS CARDS
    // ======================================================

    test("renders saved address cards", () => {
        render(<Addresses />);

        expect(
            screen.getByRole("heading", {
                name: "Home",
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("heading", {
                name: "Office",
            })
        ).toBeInTheDocument();
    });

    // ======================================================
    // DELETE BUTTONS
    // ======================================================

    test("renders delete buttons for saved addresses", () => {
        render(<Addresses />);

        const deleteButtons = screen.getAllByRole(
            "button",
            {
                name: /delete/i,
            }
        );

        expect(deleteButtons).toHaveLength(2);
    });

    // ======================================================
    // DELETE FIRST ADDRESS
    // ======================================================

    test("removes an address when Delete is clicked", () => {
        render(<Addresses />);

        const deleteButtons = screen.getAllByRole(
            "button",
            {
                name: /delete/i,
            }
        );

        fireEvent.click(deleteButtons[0]);

        expect(
            screen.queryByRole("heading", {
                name: "Home",
            })
        ).not.toBeInTheDocument();

        expect(
            screen.getByRole("heading", {
                name: "Office",
            })
        ).toBeInTheDocument();
    });

    // ======================================================
    // DELETE SECOND ADDRESS
    // ======================================================

    test("removes the second address when Delete is clicked", () => {
        render(<Addresses />);

        const deleteButtons = screen.getAllByRole(
            "button",
            {
                name: /delete/i,
            }
        );

        fireEvent.click(deleteButtons[1]);

        expect(
            screen.queryByRole("heading", {
                name: "Office",
            })
        ).not.toBeInTheDocument();

        expect(
            screen.getByRole("heading", {
                name: "Home",
            })
        ).toBeInTheDocument();
    });

    // ======================================================
    // LOCAL STORAGE AFTER DELETE
    // ======================================================

    test("updates localStorage after deleting an address", () => {
        render(<Addresses />);

        const deleteButtons = screen.getAllByRole(
            "button",
            {
                name: /delete/i,
            }
        );

        fireEvent.click(deleteButtons[0]);

        const savedAddresses = JSON.parse(
            localStorage.getItem("addresses")
        );

        expect(savedAddresses).toHaveLength(1);

        expect(savedAddresses[0].name).toBe(
            "Office"
        );
    });

    // ======================================================
    // DELETE ALL ADDRESSES
    // ======================================================

    test("shows empty state after deleting all addresses", () => {
        render(<Addresses />);

        let deleteButtons = screen.getAllByRole(
            "button",
            {
                name: /delete/i,
            }
        );

        fireEvent.click(deleteButtons[0]);

        deleteButtons = screen.getAllByRole(
            "button",
            {
                name: /delete/i,
            }
        );

        fireEvent.click(deleteButtons[0]);

        expect(
            screen.getByRole("heading", {
                name: "No Address Found",
            })
        ).toBeInTheDocument();
    });

    // ======================================================
    // EMPTY STATE
    // ======================================================

    test("displays No Address Found when address list is empty", () => {
        render(<Addresses />);

        const deleteButtons = screen.getAllByRole(
            "button",
            {
                name: /delete/i,
            }
        );

        fireEvent.click(deleteButtons[0]);
        fireEvent.click(
            screen.getByRole("button", {
                name: /delete/i,
            })
        );

        expect(
            screen.getByText("No Address Found")
        ).toBeInTheDocument();
    });

    // ======================================================
    // ADDRESS COUNT
    // ======================================================

    test("initially renders two saved addresses", () => {
        render(<Addresses />);

        const deleteButtons = screen.getAllByRole(
            "button",
            {
                name: /delete/i,
            }
        );

        expect(deleteButtons).toHaveLength(2);
    });

    // ======================================================
    // LOCAL STORAGE CONTENT
    // ======================================================

    test("stores remaining address data in localStorage", () => {
        render(<Addresses />);

        const deleteButtons = screen.getAllByRole(
            "button",
            {
                name: /delete/i,
            }
        );

        fireEvent.click(deleteButtons[0]);

        const storedData = JSON.parse(
            localStorage.getItem("addresses")
        );

        expect(storedData).toEqual([
            {
                id: 2,
                name: "Office",
                person: "Satender Kashyap",
                phone: "+91 9876543210",
                address:
                    "Medikart Pvt. Ltd., Sector 62, Noida, Uttar Pradesh - 201309",
            },
        ]);
    });

    // ======================================================
    // ADD ADDRESS BUTTON
    // ======================================================

    test("Add Address button is enabled", () => {
        render(<Addresses />);

        const addButton = screen.getByRole(
            "button",
            {
                name: /add address/i,
            }
        );

        expect(addButton).toBeEnabled();
    });
});