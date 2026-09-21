import React from "react";
import {render,screen,fireEvent,waitFor,} from "@testing-library/react";
import "@testing-library/jest-dom";
import Profile from "./Profile";

import {getCurrentUser,updateCurrentUser,} from "../../api/authApi";

jest.mock("../../api/authApi", () => ({getCurrentUser: jest.fn(),updateCurrentUser: jest.fn(),}));

describe("Profile Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        getCurrentUser.mockResolvedValue({ name: "", email: "", phone: "", address: "", });

        updateCurrentUser.mockResolvedValue({ name: "", email: "", phone: "", address: "", });

        localStorage.clear();

        jest.spyOn(window, "alert").mockImplementation(() => {});
        jest.spyOn(window, "dispatchEvent").mockImplementation(() => {});
        jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // =====================================================
    // RENDERING
    // =====================================================

    test("renders profile page", () => {
        render(<Profile />);

        expect(document.querySelector(".profile-page")
        ).toBeInTheDocument();

        expect(document.querySelector(".profile-card")
        ).toBeInTheDocument();
    });

    test("renders profile sections", () => {
        render(<Profile />);

        expect(document.querySelector(".profile-top")
        ).toBeInTheDocument();

        expect(document.querySelector(".profile-body")
        ).toBeInTheDocument();

        expect(document.querySelector(".profile-buttons")
        ).toBeInTheDocument();
    });

    test("renders customer label", () => {
        render(<Profile />);

        expect(
            screen.getByText("MEDIKART Customer")
        ).toBeInTheDocument();
    });

    test("renders Edit Profile button", () => {
        render(<Profile />);

        expect(
            screen.getByRole("button", {
                name: /edit profile/i,
            })
        ).toBeInTheDocument();
    });

    // =====================================================
    // API
    // =====================================================

    test("calls getCurrentUser on mount", async () => {
        render(<Profile />);

        await waitFor(() => {
            expect(getCurrentUser).toHaveBeenCalledTimes(1);
        });
    });

    test("handles getCurrentUser error", async () => {
        getCurrentUser.mockRejectedValueOnce(
            new Error("API Error")
        );

        render(<Profile />);

        await waitFor(() => {
            expect(getCurrentUser).toHaveBeenCalledTimes(1);
        });

        expect(console.error).toHaveBeenCalled();
    });

    // =====================================================
    // EDIT MODE
    // =====================================================

    test("opens edit mode", () => {
        render(<Profile />);

        fireEvent.click(
            screen.getByRole("button", {
                name: /edit profile/i,
            })
        );

        expect(
            screen.getByRole("button", {
                name: /save/i,
            })
        ).toBeInTheDocument();
    });

    test("shows four inputs in edit mode", () => {
        render(<Profile />);

        fireEvent.click(
            screen.getByRole("button", {
                name: /edit profile/i,
            })
        );

        const inputs = document.querySelectorAll("input");

        expect(inputs).toHaveLength(4);
    });

    test("shows Save button in edit mode", () => {
        render(<Profile />);

        fireEvent.click(
            screen.getByRole("button", {
                name: /edit profile/i,
            })
        );

        expect(
            screen.getByRole("button", {
                name: /save/i,
            })
        ).toBeInTheDocument();
    });

    // =====================================================
    // INPUT CHANGES
    // =====================================================

    test("name input can be changed", () => {
        render(<Profile />);

        fireEvent.click(
            screen.getByRole("button", {
                name: /edit profile/i,
            })
        );

        const inputs = document.querySelectorAll("input");

        fireEvent.change(inputs[0], {
            target: {
                name: "name",
                value: "value",
            },
        });

        expect(inputs[0]).toHaveValue("value");
    });

    test("email input can be changed", () => {
        render(<Profile />);

        fireEvent.click(
            screen.getByRole("button", {
                name: /edit profile/i,
            })
        );

        const inputs = document.querySelectorAll("input");

        fireEvent.change(inputs[1], {
            target: {
                name: "email",
                value: "value@example.com",
            },
        });

        expect(inputs[1]).toHaveValue("value@example.com");
    });

    test("phone input can be changed", () => {
        render(<Profile />);

        fireEvent.click(
            screen.getByRole("button", {
                name: /edit profile/i,
            })
        );

        const inputs = document.querySelectorAll("input");

        fireEvent.change(inputs[2], {
            target: {
                name: "phone",
                value: "0000000000",
            },
        });

        expect(inputs[2]).toHaveValue("0000000000");
    });

    test("address input can be changed", () => {
        render(<Profile />);

        fireEvent.click(
            screen.getByRole("button", {
                name: /edit profile/i,
            })
        );

        const inputs = document.querySelectorAll("input");

        fireEvent.change(inputs[3], {
            target: {
                name: "address",
                value: "value",
            },
        });

        expect(inputs[3]).toHaveValue("value");
    });

    // =====================================================
    // SAVE
    // =====================================================

    test("calls updateCurrentUser when Save is clicked", async () => {
        render(<Profile />);

        fireEvent.click(
            screen.getByRole("button", {
                name: /edit profile/i,
            })
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: /save/i,
            })
        );

        await waitFor(() => {
            expect(updateCurrentUser).toHaveBeenCalledTimes(1);
        });
    });

    test("passes profile object to updateCurrentUser", async () => {
        render(<Profile />);

        fireEvent.click(
            screen.getByRole("button", {
                name: /edit profile/i,
            })
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: /save/i,
            })
        );

        await waitFor(() => {
            expect(updateCurrentUser).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: expect.any(String),
                    email: expect.any(String),
                    phone: expect.any(String),
                    address: expect.any(String),
                })
            );
        });
    });

    test("leaves edit mode after successful save", async () => {
        render(<Profile />);

        fireEvent.click(
            screen.getByRole("button", {
                name: /edit profile/i,
            })
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: /save/i,
            })
        );

        await waitFor(() => {
            expect(
                screen.getByRole("button", {
                    name: /edit profile/i,
                })
            ).toBeInTheDocument();
        });
    });

    // =====================================================
    // LOCAL STORAGE
    // =====================================================

    test("stores user data in localStorage after save", async () => {
        render(<Profile />);

        fireEvent.click(
            screen.getByRole("button", {
                name: /edit profile/i,
            })
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: /save/i,
            })
        );

        await waitFor(() => {
            expect(
                localStorage.getItem("user")
            ).not.toBeNull();
        });
    });

    test("stores username in localStorage", async () => {
        render(<Profile />);

        fireEvent.click(
            screen.getByRole("button", {
                name: /edit profile/i,
            })
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: /save/i,
            })
        );

        await waitFor(() => {
            expect(
                localStorage.getItem("username")
            ).toBe("");
        });
    });

    // =====================================================
    // EVENT
    // =====================================================

    test("dispatches userUpdated event after save", async () => {
        render(<Profile />);

        fireEvent.click(
            screen.getByRole("button", {
                name: /edit profile/i,
            })
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: /save/i,
            })
        );

        await waitFor(() => {
            expect(window.dispatchEvent).toHaveBeenCalled();
        });
    });

    // =====================================================
    // SUCCESS ALERT
    // =====================================================

    test("shows success alert after save", async () => {
        render(<Profile />);

        fireEvent.click(
            screen.getByRole("button", {
                name: /edit profile/i,
            })
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: /save/i,
            })
        );

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith(
                "Profile Updated Successfully!"
            );
        });
    });

    // =====================================================
    // SAVE ERROR
    // =====================================================

    test("shows API error message", async () => {
        updateCurrentUser.mockRejectedValueOnce(
            new Error("API Error")
        );

        render(<Profile />);

        fireEvent.click(
            screen.getByRole("button", {
                name: /edit profile/i,
            })
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: /save/i,
            })
        );

        await waitFor(() => {expect(window.alert).toHaveBeenCalledWith("API Error");});
    });

    test("shows default error message", async () => {
        updateCurrentUser.mockRejectedValueOnce({});

        render(<Profile />);
        fireEvent.click(screen.getByRole("button", {name: /edit profile/i,}));
        fireEvent.click(screen.getByRole("button", {name: /save/i,}));
        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith("Unable to update profile.");
        });
    });

    // =====================================================
    // CSS / STRUCTURE
    // =====================================================

    test("renders four profile rows", () => {
        render(<Profile />);
        expect(document.querySelectorAll(".profile-row")).toHaveLength(4);
    });

    test("Edit button has correct CSS class", () => {
        render(<Profile />);
        expect(screen.getByRole("button", {name: /edit profile/i,})).toHaveClass("edit-btn");
    });

    test("Save button has correct CSS class", () => {
        render(<Profile />);
        fireEvent.click(screen.getByRole("button", {name: /edit profile/i,}));
        expect(screen.getByRole("button", {name: /save/i,})).toHaveClass("save-btn");
    });
});