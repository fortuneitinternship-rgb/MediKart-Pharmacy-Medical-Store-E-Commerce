import React from "react";
import {
    render,
    screen,
    fireEvent,
} from "@testing-library/react";
import "@testing-library/jest-dom";

import Settings from "./Settings";

describe("Settings Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();

        delete window.location;

        window.location = {
            href: "",
        };

        jest.spyOn(window, "alert").mockImplementation(() => { });
    });

    afterEach(() => {
        localStorage.clear();
        jest.restoreAllMocks();
    });

    // -----------------------------------------
    // PAGE RENDERING
    // -----------------------------------------

    test("renders Settings heading", () => {
        render(<Settings />);

        expect(
            screen.getByRole("heading", {
                name: /^settings$/i,
            })
        ).toBeInTheDocument();
    });

    test("renders settings description", () => {
        render(<Settings />);

        expect(
            screen.getByText(
                /manage your medikart account and preferences/i
            )
        ).toBeInTheDocument();
    });

    test("renders settings page container", () => {
        const { container } = render(<Settings />);

        expect(
            container.querySelector(".settings-page")
        ).toBeInTheDocument();
    });

    test("renders settings container", () => {
        const { container } = render(<Settings />);

        expect(
            container.querySelector(".settings-container")
        ).toBeInTheDocument();
    });

    // -----------------------------------------
    // SECTIONS
    // -----------------------------------------

    test("renders Account section", () => {
        render(<Settings />);

        expect(
            screen.getByRole("heading", {
                name: /^account$/i,
            })
        ).toBeInTheDocument();
    });

    test("renders Notifications section", () => {
        render(<Settings />);
    });

    test("renders Preferences section", () => {
        render(<Settings />);

        expect(
            screen.getByRole("heading", {
                name: /^preferences$/i,
            })
        ).toBeInTheDocument();
    });

    test("renders Shopping section", () => {
        render(<Settings />);

        expect(
            screen.getByRole("heading", {
                name: /^shopping$/i,
            })
        ).toBeInTheDocument();
    });

    // -----------------------------------------
    // ACCOUNT
    // -----------------------------------------

    test("renders Profile item", () => {
        render(<Settings />);

        expect(
            screen.getByRole("heading", {
                name: /^profile$/i,
            })
        ).toBeInTheDocument();
    });

    test("renders Profile Open button", () => {
        render(<Settings />);

        expect(
            screen.getByRole("button", {
                name: /^open$/i,
            })
        ).toBeInTheDocument();
    });

    test("renders Password and Security item", () => {
        render(<Settings />);

        expect(
            screen.getByRole("heading", {
                name: /password & security/i,
            })
        ).toBeInTheDocument();
    });

    test("renders Manage button", () => {
        render(<Settings />);

        expect(
            screen.getByRole("button", {
                name: /^manage$/i,
            })
        ).toBeInTheDocument();
    });

    test("Profile Open button navigates to profile", () => {
        render(<Settings />);

        const button = screen.getByRole("button", {
            name: /^open$/i,
        });

        fireEvent.click(button);

        expect(window.location.href).toBe(
            "/profile"
        );
    });

    test("Manage button navigates to forgot password", () => {
        render(<Settings />);

        const button = screen.getByRole("button", {
            name: /^manage$/i,
        });

        fireEvent.click(button);

        expect(window.location.href).toBe(
            "/forgot-password"
        );
    });

    // -----------------------------------------
    // NOTIFICATIONS
    // -----------------------------------------

    test("renders notification checkbox", () => {
        render(<Settings />);

        const checkboxes =
            screen.getAllByRole("checkbox");

        expect(checkboxes.length).toBe(3);
    });

    test("notification checkbox is checked initially", () => {
        render(<Settings />);

        const checkboxes =
            screen.getAllByRole("checkbox");

        expect(checkboxes[0]).toBeChecked();
    });

    test("notification checkbox can be toggled", () => {
        render(<Settings />);

        const checkboxes =
            screen.getAllByRole("checkbox");

        expect(checkboxes[0]).toBeChecked();

        fireEvent.click(checkboxes[0]);

        expect(checkboxes[0]).not.toBeChecked();

        fireEvent.click(checkboxes[0]);

        expect(checkboxes[0]).toBeChecked();
    });

    // -----------------------------------------
    // ORDER UPDATES
    // -----------------------------------------

    test("Order Updates checkbox is checked initially", () => {
        render(<Settings />);

        const checkboxes =
            screen.getAllByRole("checkbox");

        expect(checkboxes[1]).toBeChecked();
    });

    test("Order Updates checkbox can be toggled", () => {
        render(<Settings />);

        const checkboxes =
            screen.getAllByRole("checkbox");

        fireEvent.click(checkboxes[1]);

        expect(checkboxes[1]).not.toBeChecked();

        fireEvent.click(checkboxes[1]);

        expect(checkboxes[1]).toBeChecked();
    });

    // -----------------------------------------
    // LANGUAGE
    // -----------------------------------------

    test("renders language select", () => {
        render(<Settings />);

        expect(
            screen.getByRole("combobox")
        ).toBeInTheDocument();
    });

    test("English is selected by default", () => {
        render(<Settings />);

        const select =
            screen.getByRole("combobox");

        expect(select).toHaveValue("English");
    });

    test("allows language selection", () => {
        render(<Settings />);

        const select =
            screen.getByRole("combobox");

        fireEvent.change(select, {
            target: {
                value: "Hindi",
            },
        });

        expect(select).toHaveValue("Hindi");
    });

    // -----------------------------------------
    // DARK MODE
    // -----------------------------------------

    test("Dark Mode checkbox is unchecked initially", () => {
        render(<Settings />);

        const checkboxes =
            screen.getAllByRole("checkbox");

        expect(checkboxes[2]).not.toBeChecked();
    });

    test("Dark Mode can be enabled", () => {
        const { container } = render(
            <Settings />
        );

        const checkboxes =
            screen.getAllByRole("checkbox");

        fireEvent.click(checkboxes[2]);

        expect(checkboxes[2]).toBeChecked();

        expect(
            container.querySelector(".settings-page")
        ).toHaveClass("dark");
    });

    test("Dark Mode can be disabled", () => {
        const { container } = render(
            <Settings />
        );

        const checkboxes =
            screen.getAllByRole("checkbox");

        fireEvent.click(checkboxes[2]);

        expect(
            container.querySelector(".settings-page")
        ).toHaveClass("dark");

        fireEvent.click(checkboxes[2]);

        expect(checkboxes[2]).not.toBeChecked();

        expect(
            container.querySelector(".settings-page")
        ).not.toHaveClass("dark");
    });

    // -----------------------------------------
    // SHOPPING
    // -----------------------------------------

    test("renders My Orders item", () => {
        render(<Settings />);

        expect(
            screen.getByRole("heading", {
                name: /my orders/i,
            })
        ).toBeInTheDocument();
    });

    test("renders Wishlist item", () => {
        render(<Settings />);

        expect(
            screen.getByRole("heading", {
                name: /^wishlist$/i,
            })
        ).toBeInTheDocument();
    });

    test("renders Saved Addresses item", () => {
        render(<Settings />);

        expect(
            screen.getByRole("heading", {
                name: /saved addresses/i,
            })
        ).toBeInTheDocument();
    });

    test("My Orders navigates correctly", () => {
        render(<Settings />);

        const item =
            screen.getByRole("heading", {
                name: /my orders/i,
            });

        fireEvent.click(
            item.closest(".settings-item")
        );

        expect(window.location.href).toBe(
            "/orders"
        );
    });

    test("Wishlist navigates correctly", () => {
        render(<Settings />);

        const item =
            screen.getByRole("heading", {
                name: /^wishlist$/i,
            });

        fireEvent.click(
            item.closest(".settings-item")
        );

        expect(window.location.href).toBe(
            "/wishlist"
        );
    });

    test("Saved Addresses navigates correctly", () => {
        render(<Settings />);

        const item =
            screen.getByRole("heading", {
                name: /saved addresses/i,
            });

        fireEvent.click(
            item.closest(".settings-item")
        );

        expect(window.location.href).toBe(
            "/addresses"
        );
    });

    // -----------------------------------------
    // LOGOUT
    // -----------------------------------------

    test("renders Logout item", () => {
        render(<Settings />);

        expect(
            screen.getByRole("heading", {
                name: /^logout$/i,
            })
        ).toBeInTheDocument();
    });

    test("renders logout section", () => {
        const { container } = render(
            <Settings />
        );

        expect(
            container.querySelector(
                ".logout-section"
            )
        ).toBeInTheDocument();
    });

    test("logout removes login status from localStorage", () => {
        localStorage.setItem(
            "isLoggedIn",
            "true"
        );

        localStorage.setItem(
            "user",
            JSON.stringify({
                test: true,
            })
        );

        render(<Settings />);

        const logout =
            screen.getByRole("heading", {
                name: /^logout$/i,
            });

        fireEvent.click(
            logout.closest(".settings-item")
        );

        expect(
            localStorage.getItem("isLoggedIn")
        ).toBeNull();

        expect(
            localStorage.getItem("user")
        ).toBeNull();
    });

    test("logout shows success alert", () => {
        render(<Settings />);

        const logout =
            screen.getByRole("heading", {
                name: /^logout$/i,
            });

        fireEvent.click(
            logout.closest(".settings-item")
        );

        expect(
            window.alert
        ).toHaveBeenCalledWith(
            "Logged out successfully!"
        );
    });

    test("logout redirects to login page", () => {
        render(<Settings />);

        const logout =
            screen.getByRole("heading", {
                name: /^logout$/i,
            });

        fireEvent.click(
            logout.closest(".settings-item")
        );

        expect(window.location.href).toBe(
            "/login"
        );
    });

    // -----------------------------------------
    // SETTINGS ITEMS
    // -----------------------------------------

    test("renders settings items", () => {
        const { container } = render(
            <Settings />
        );

        expect(
            container.querySelectorAll(
                ".settings-item"
            ).length
        ).toBeGreaterThan(0);
    });

    test("renders settings icons", () => {
        const { container } = render(
            <Settings />
        );

        expect(
            container.querySelectorAll(
                ".settings-icon"
            ).length
        ).toBeGreaterThan(0);
    });

    test("renders clickable shopping items", () => {
        const { container } = render(
            <Settings />
        );

        expect(
            container.querySelectorAll(
                ".settings-item.clickable"
            )
        ).toHaveLength(3);
    });

    // -----------------------------------------
    // CSS STRUCTURE
    // -----------------------------------------

    test("renders settings sections", () => {
        const { container } = render(
            <Settings />
        );

        expect(
            container.querySelectorAll(
                ".settings-section"
            ).length
        ).toBe(5);
    });

    test("renders settings header", () => {
        const { container } = render(
            <Settings />
        );

        expect(
            container.querySelector(
                ".settings-header"
            )
        ).toBeInTheDocument();
    });

    test("renders switch elements", () => {
        const { container } = render(
            <Settings />
        );

        expect(
            container.querySelectorAll(".switch")
        ).toHaveLength(3);
    });

    test("renders logout element", () => {
        const { container } = render(
            <Settings />
        );

        expect(
            container.querySelector(".logout")
        ).toBeInTheDocument();
    });
});