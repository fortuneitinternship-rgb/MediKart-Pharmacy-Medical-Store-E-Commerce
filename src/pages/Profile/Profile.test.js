import React from "react";
import {
    render,
    screen,
    fireEvent,
    waitFor,
} from "@testing-library/react";

import Profile from "./Profile";

import {
    getUserProfile,
    updateCurrentUser,
} from "../../api/authApi";

// ============================================================
// MOCK AUTH API
// ============================================================

jest.mock("../../api/authApi", () => ({
    getUserProfile: jest.fn(),
    updateCurrentUser: jest.fn(),
}));


// ============================================================
// TESTS
// ============================================================

describe("Profile Component", () => {

    // --------------------------------------------------------
    // Default mock profile
    // --------------------------------------------------------

    const mockProfile = {
        full_name: "Test User",
        email: "test@example.com",
        phone: "",
        profile_image: "",
    };


    // --------------------------------------------------------
    // Before every test
    // --------------------------------------------------------

    beforeEach(() => {
        jest.clearAllMocks();

        getUserProfile.mockResolvedValue(mockProfile);
    });


    // --------------------------------------------------------
    // 1. Loading state
    // --------------------------------------------------------

    test("shows loading message", () => {

        getUserProfile.mockImplementation(
            () => new Promise(() => {})
        );

        render(<Profile />);

        expect(
            screen.getByRole("status")
        ).toHaveTextContent(
            "Loading profile..."
        );
    });


    // --------------------------------------------------------
    // 2. Loads profile successfully
    // --------------------------------------------------------

    test("loads and displays profile information", async () => {

        render(<Profile />);

        // Wait until loading finishes
        await waitFor(() => {
            expect(
                screen.queryByText("Loading profile...")
            ).not.toBeInTheDocument();
        });

        // Use heading so duplicate "Test User" does not cause error
        expect(
            screen.getByRole("heading", {
                name: "Test User",
            })
        ).toBeInTheDocument();

        expect(
            screen.getByText("test@example.com")
        ).toBeInTheDocument();

        expect(
            screen.getByText("MEDIKART Customer")
        ).toBeInTheDocument();

        expect(
            getUserProfile
        ).toHaveBeenCalledTimes(1);
    });


    // --------------------------------------------------------
    // 3. Profile loading error
    // --------------------------------------------------------

    test("shows error when profile loading fails", async () => {

        getUserProfile.mockRejectedValue(
            new Error("Unable to load profile.")
        );

        render(<Profile />);

        expect(
            await screen.findByRole("alert")
        ).toHaveTextContent(
            "Unable to load profile."
        );
    });


    // --------------------------------------------------------
    // 4. Opens edit mode
    // --------------------------------------------------------

    test("opens edit mode", async () => {

        render(<Profile />);

        // Wait for profile to load
        await waitFor(() => {
            expect(
                screen.getByRole("heading", {
                    name: "Test User",
                })
            ).toBeInTheDocument();
        });

        // Click Edit Profile
        fireEvent.click(
            screen.getByRole("button", {
                name: /edit profile/i,
            })
        );

        // Full name input
        expect(
            screen.getByRole("textbox", {
                name: /full name/i,
            })
        ).toBeInTheDocument();

        // Phone input
        expect(
            screen.getByRole("textbox", {
                name: /phone number/i,
            })
        ).toBeInTheDocument();

        // Profile image input
        expect(
            screen.getByRole("textbox", {
                name: /profile image url/i,
            })
        ).toBeInTheDocument();

        // Save button
        expect(
            screen.getByRole("button", {
                name: /^save$/i,
            })
        ).toBeInTheDocument();

        // Cancel button
        expect(
            screen.getByRole("button", {
                name: /cancel/i,
            })
        ).toBeInTheDocument();
    });


    // --------------------------------------------------------
    // 5. Cancels edit mode
    // --------------------------------------------------------

    test("cancels edit mode", async () => {

        render(<Profile />);

        // Wait for profile
        await waitFor(() => {
            expect(
                screen.getByRole("heading", {
                    name: "Test User",
                })
            ).toBeInTheDocument();
        });

        // Enter edit mode
        fireEvent.click(
            screen.getByRole("button", {
                name: /edit profile/i,
            })
        );

        // Confirm input exists
        const nameInput =
            screen.getByRole("textbox", {
                name: /full name/i,
            });

        expect(nameInput).toBeInTheDocument();

        // Click Cancel
        fireEvent.click(
            screen.getByRole("button", {
                name: /cancel/i,
            })
        );

        // Input should disappear
        expect(
            screen.queryByRole("textbox", {
                name: /full name/i,
            })
        ).not.toBeInTheDocument();

        // Edit Profile button should return
        expect(
            screen.getByRole("button", {
                name: /edit profile/i,
            })
        ).toBeInTheDocument();
    });


    // --------------------------------------------------------
    // 6. Updates profile successfully
    // --------------------------------------------------------

    test("updates profile successfully", async () => {

        const updatedProfile = {
            full_name: "Updated User",
            email: "test@example.com",
            phone: "",
            profile_image: "",
        };

        updateCurrentUser.mockResolvedValue(
            updatedProfile
        );

        render(<Profile />);

        // Wait for profile to load
        await waitFor(() => {
            expect(
                screen.getByRole("heading", {
                    name: "Test User",
                })
            ).toBeInTheDocument();
        });

        // Enter edit mode
        fireEvent.click(
            screen.getByRole("button", {
                name: /edit profile/i,
            })
        );

        // Get input BEFORE using it
        const nameInput =
            screen.getByRole("textbox", {
                name: /full name/i,
            });

        const phoneInput =
            screen.getByRole("textbox", {
                name: /phone number/i,
            });

        const imageInput =
            screen.getByRole("textbox", {
                name: /profile image url/i,
            });

        // Change name
        fireEvent.change(nameInput, {
            target: {
                name: "full_name",
                value: "Updated User",
            },
        });

        // Change phone
        fireEvent.change(phoneInput, {
            target: {
                name: "phone",
                value: "1234567890",
            },
        });

        // Change profile image
        fireEvent.change(imageInput, {
            target: {
                name: "profile_image",
                value: "https://example.com/profile.jpg",
            },
        });

        // Verify values
        expect(nameInput).toHaveValue(
            "Updated User"
        );

        expect(phoneInput).toHaveValue(
            "1234567890"
        );

        expect(imageInput).toHaveValue(
            "https://example.com/profile.jpg"
        );

        // Click Save
        fireEvent.click(
            screen.getByRole("button", {
                name: /^save$/i,
            })
        );

        // Wait for API call
        await waitFor(() => {
            expect(
                updateCurrentUser
            ).toHaveBeenCalledTimes(1);
        });

        // Verify API payload
        expect(
            updateCurrentUser
        ).toHaveBeenCalledWith({
            full_name: "Updated User",
            phone: "1234567890",
            profile_image:
                "https://example.com/profile.jpg",
        });

        // Verify success message
        expect(
            await screen.findByRole("status")
        ).toHaveTextContent(
            "Profile updated successfully."
        );

        // Verify edit mode closed
        expect(
            screen.queryByRole("textbox", {
                name: /full name/i,
            })
        ).not.toBeInTheDocument();
    });
});
