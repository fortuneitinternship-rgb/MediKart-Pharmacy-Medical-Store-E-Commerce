import React from "react";
import {
    render,
    screen,
    fireEvent,
} from "@testing-library/react";

import "@testing-library/jest-dom";

import Notifications from "./Notifications";

describe("Notifications Component", () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    // ==========================================
    // RENDERING
    // ==========================================

    test("renders Notifications heading", () => {
        render(<Notifications />);

        expect(
            screen.getByRole("heading", {
                name: /notifications/i,
            })
        ).toBeInTheDocument();
    });

    test("renders notifications page", () => {
        const { container } = render(<Notifications />);

        expect(
            container.querySelector(".notifications-page")
        ).toBeInTheDocument();
    });

    test("renders notifications header", () => {
        const { container } = render(<Notifications />);

        expect(
            container.querySelector(".notifications-header")
        ).toBeInTheDocument();
    });

    // ==========================================
    // NOTIFICATION CARDS
    // ==========================================

    test("renders four notification cards", () => {
        const { container } = render(<Notifications />);

        const cards = container.querySelectorAll(
            ".notification-card"
        );

        expect(cards).toHaveLength(4);
    });

    test("renders notification titles", () => {
        render(<Notifications />);

        expect(
            screen.getByRole("heading", {
                name: "Order Confirmed",
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("heading", {
                name: "Order Shipped",
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("heading", {
                name: "New Offer",
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("heading", {
                name: "Prescription Approved",
            })
        ).toBeInTheDocument();
    });

    test("renders notification messages", () => {
        render(<Notifications />);

        expect(
            screen.getByText(
                "Your order #MK100245 has been confirmed."
            )
        ).toBeInTheDocument();

        expect(
            screen.getByText(
                "Your Digital Thermometer has been shipped."
            )
        ).toBeInTheDocument();

        expect(
            screen.getByText(
                "Flat 20% OFF on medicines. Use code MEDI20."
            )
        ).toBeInTheDocument();

        expect(
            screen.getByText(
                "Your uploaded prescription has been verified."
            )
        ).toBeInTheDocument();
    });

    test("renders notification times", () => {
        render(<Notifications />);

        expect(
            screen.getByText("2 hours ago")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Yesterday")
        ).toBeInTheDocument();

        expect(
            screen.getByText("2 days ago")
        ).toBeInTheDocument();

        expect(
            screen.getByText("3 days ago")
        ).toBeInTheDocument();
    });

    // ==========================================
    // NOTIFICATION ICONS
    // ==========================================

    test("renders notification icon containers", () => {
        const { container } = render(<Notifications />);

        const icons = container.querySelectorAll(
            ".notification-icon"
        );

        expect(icons).toHaveLength(4);
    });

    // ==========================================
    // DELETE BUTTONS
    // ==========================================

    test("renders four delete buttons", () => {
        render(<Notifications />);

        const buttons = screen.getAllByRole("button");

        expect(buttons).toHaveLength(4);
    });

    test("delete buttons are enabled", () => {
        render(<Notifications />);

        const buttons = screen.getAllByRole("button");

        buttons.forEach((button) => {
            expect(button).toBeEnabled();
        });
    });

    test("delete buttons have correct class", () => {
        const { container } = render(<Notifications />);

        const buttons = container.querySelectorAll(
            ".delete-notification"
        );

        expect(buttons).toHaveLength(4);

        buttons.forEach((button) => {
            expect(button).toHaveClass(
                "delete-notification"
            );
        });
    });

    // ==========================================
    // DELETE FUNCTIONALITY
    // ==========================================

    test("deletes the first notification", () => {
        render(<Notifications />);

        const button = screen.getByRole("button", {
            name: /delete order confirmed/i,
        });

        fireEvent.click(button);

        expect(
            screen.queryByRole("heading", {
                name: "Order Confirmed",
            })
        ).not.toBeInTheDocument();
    });

    test("decreases notification count after deletion", () => {
        const { container } = render(<Notifications />);

        expect(
            container.querySelectorAll(".notification-card")
        ).toHaveLength(4);

        const button = screen.getByRole("button", {
            name: /delete order confirmed/i,
        });

        fireEvent.click(button);

        expect(
            container.querySelectorAll(".notification-card")
        ).toHaveLength(3);
    });

    test("deletes the second notification", () => {
        render(<Notifications />);

        const button = screen.getByRole("button", {
            name: /delete order shipped/i,
        });

        fireEvent.click(button);

        expect(
            screen.queryByRole("heading", {
                name: "Order Shipped",
            })
        ).not.toBeInTheDocument();
    });

    test("deletes the third notification", () => {
        render(<Notifications />);

        const button = screen.getByRole("button", {
            name: /delete new offer/i,
        });

        fireEvent.click(button);

        expect(
            screen.queryByRole("heading", {
                name: "New Offer",
            })
        ).not.toBeInTheDocument();
    });

    test("deletes the fourth notification", () => {
        render(<Notifications />);

        const button = screen.getByRole("button", {
            name: /delete prescription approved/i,
        });

        fireEvent.click(button);

        expect(
            screen.queryByRole("heading", {
                name: "Prescription Approved",
            })
        ).not.toBeInTheDocument();
    });

    // ==========================================
    // REMAINING NOTIFICATIONS
    // ==========================================

    test("remaining notifications stay visible", () => {
        render(<Notifications />);

        const button = screen.getByRole("button", {
            name: /delete order confirmed/i,
        });

        fireEvent.click(button);

        expect(
            screen.getByRole("heading", {
                name: "Order Shipped",
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("heading", {
                name: "New Offer",
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("heading", {
                name: "Prescription Approved",
            })
        ).toBeInTheDocument();
    });

    // ==========================================
    // LOCAL STORAGE
    // ==========================================

    test("stores notifications in localStorage after deletion", () => {
        render(<Notifications />);

        const button = screen.getByRole("button", {
            name: /delete order confirmed/i,
        });

        fireEvent.click(button);

        const stored = localStorage.getItem(
            "notifications"
        );

        expect(stored).not.toBeNull();
    });

    test("stores valid JSON in localStorage", () => {
        render(<Notifications />);

        const button = screen.getByRole("button", {
            name: /delete order confirmed/i,
        });

        fireEvent.click(button);

        const stored = localStorage.getItem(
            "notifications"
        );

        expect(() => JSON.parse(stored)).not.toThrow();
    });

    test("stores remaining notifications without React icons", () => {
        render(<Notifications />);

        const button = screen.getByRole("button", {
            name: /delete order confirmed/i,
        });

        fireEvent.click(button);

        const stored = JSON.parse(
            localStorage.getItem("notifications")
        );

        expect(stored).toHaveLength(3);

        stored.forEach((notification) => {
            expect(notification).not.toHaveProperty(
                "icon"
            );
        });
    });

    test("localStorage contains remaining notification data", () => {
        render(<Notifications />);

        const button = screen.getByRole("button", {
            name: /delete order confirmed/i,
        });

        fireEvent.click(button);

        const stored = JSON.parse(
            localStorage.getItem("notifications")
        );

        expect(stored).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: 2,
                }),
                expect.objectContaining({
                    id: 3,
                }),
                expect.objectContaining({
                    id: 4,
                }),
            ])
        );
    });

    // ==========================================
    // MULTIPLE DELETIONS
    // ==========================================

    test("can delete multiple notifications", () => {
        const { container } = render(<Notifications />);

        let buttons = screen.getAllByRole("button");

        fireEvent.click(buttons[0]);

        buttons = screen.getAllByRole("button");

        fireEvent.click(buttons[0]);

        expect(
            container.querySelectorAll(".notification-card")
        ).toHaveLength(2);
    });

    test("localStorage updates after multiple deletions", () => {
        render(<Notifications />);

        let buttons = screen.getAllByRole("button");

        fireEvent.click(buttons[0]);

        buttons = screen.getAllByRole("button");

        fireEvent.click(buttons[0]);

        const stored = JSON.parse(
            localStorage.getItem("notifications")
        );

        expect(stored).toHaveLength(2);
    });

    // ==========================================
    // EMPTY STATE
    // ==========================================

    test("shows empty state after all notifications are deleted", () => {
        render(<Notifications />);

        for (let i = 0; i < 4; i++) {
            const buttons = screen.getAllByRole("button");

            fireEvent.click(buttons[0]);
        }

        expect(
            screen.getByText("No Notifications Found")
        ).toBeInTheDocument();
    });

    test("shows empty notification container", () => {
        const { container } = render(<Notifications />);

        for (let i = 0; i < 4; i++) {
            const buttons = screen.getAllByRole("button");

            fireEvent.click(buttons[0]);
        }

        expect(
            container.querySelector(".empty-notification")
        ).toBeInTheDocument();
    });

    test("does not show notification cards after deleting all", () => {
        const { container } = render(<Notifications />);

        for (let i = 0; i < 4; i++) {
            const buttons = screen.getAllByRole("button");

            fireEvent.click(buttons[0]);
        }

        expect(
            container.querySelectorAll(".notification-card")
        ).toHaveLength(0);
    });

    test("empty state is not shown initially", () => {
        render(<Notifications />);

        expect(
            screen.queryByText("No Notifications Found")
        ).not.toBeInTheDocument();
    });

    // ==========================================
    // FINAL CHECK
    // ==========================================

    test("all initial notifications have delete buttons", () => {
        render(<Notifications />);

        expect(
            screen.getByRole("button", {
                name: /delete order confirmed/i,
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", {
                name: /delete order shipped/i,
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", {
                name: /delete new offer/i,
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", {
                name: /delete prescription approved/i,
            })
        ).toBeInTheDocument();
    });
});