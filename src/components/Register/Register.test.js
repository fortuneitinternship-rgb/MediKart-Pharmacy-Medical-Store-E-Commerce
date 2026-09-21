import React from "react";
import {
    render,
    screen,
    fireEvent,
    waitFor,
} from "@testing-library/react";

import "@testing-library/jest-dom";

import Register from "./Register";

import { registerUser } from "../../api/authApi";

// ======================================================
// MOCK API
// ======================================================

jest.mock("../../api/authApi", () => ({
    registerUser: jest.fn(),
}));


// ======================================================
// MOCK REACT ROUTER
// ======================================================

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate,
}));


// ======================================================
// MOCK IMAGE
// ======================================================

jest.mock(
    "../../assets/register/register.png",
    () => "register-image.png"
);


// ======================================================
// TEST SUITE
// ======================================================

describe("Register Component", () => {
    const mockOnClose = jest.fn();
    const mockOnSwitchToLogin = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        registerUser.mockReset();

        jest.spyOn(window, "alert").mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });


    // ==================================================
    // RENDERING
    // ==================================================

    test("renders register page", () => {
        render(<Register />);

        expect(
            document.querySelector(".register-page")
        ).toBeInTheDocument();
    });


    test("renders register container", () => {
        render(<Register />);

        expect(
            document.querySelector(".register-container")
        ).toBeInTheDocument();
    });


    test("renders Create Account heading", () => {
        render(<Register />);

        expect(
            screen.getByRole("heading", {
                name: "Create Account",
            })
        ).toBeInTheDocument();
    });


    test("renders registration subtitle", () => {
        render(<Register />);

        expect(
            screen.getByText(
                /Join MEDIKART and manage your healthcare easily/i
            )
        ).toBeInTheDocument();
    });


    test("renders registration form", () => {
        render(<Register />);

        expect(
            document.querySelector(".register-form")
        ).toBeInTheDocument();
    });


    // ==================================================
    // INPUT TESTS
    // ==================================================

    test("renders Full Name input", () => {
        render(<Register />);

        expect(
            screen.getByPlaceholderText(
                "Enter your full name"
            )
        ).toBeInTheDocument();
    });


    test("renders Email Address input", () => {
        render(<Register />);

        expect(
            screen.getByPlaceholderText(
                "Enter your email"
            )
        ).toBeInTheDocument();
    });


    test("renders Password input", () => {
        render(<Register />);

        expect(
            screen.getByPlaceholderText(
                "Create a password"
            )
        ).toBeInTheDocument();
    });


    test("renders Confirm Password input", () => {
        render(<Register />);

        expect(
            screen.getByPlaceholderText(
                "Confirm your password"
            )
        ).toBeInTheDocument();
    });


    test("name input accepts text", () => {
        render(<Register />);

        const input =
            screen.getByPlaceholderText(
                "Enter your full name"
            );

        fireEvent.change(input, {
            target: {
                value: "Test User",
            },
        });

        expect(input).toHaveValue("Test User");
    });


    test("email input accepts text", () => {
        render(<Register />);

        const input =
            screen.getByPlaceholderText(
                "Enter your email"
            );

        fireEvent.change(input, {
            target: {
                value: "test@example.com",
            },
        });

        expect(input).toHaveValue(
            "test@example.com"
        );
    });


    test("password input accepts text", () => {
        render(<Register />);

        const input =
            screen.getByPlaceholderText(
                "Create a password"
            );

        fireEvent.change(input, {
            target: {
                value: "test-password",
            },
        });

        expect(input).toHaveValue(
            "test-password"
        );
    });


    test("confirm password input accepts text", () => {
        render(<Register />);

        const input =
            screen.getByPlaceholderText(
                "Confirm your password"
            );

        fireEvent.change(input, {
            target: {
                value: "test-password",
            },
        });

        expect(input).toHaveValue(
            "test-password"
        );
    });


    // ==================================================
    // PASSWORD VISIBILITY
    // ==================================================

    test("password is hidden initially", () => {
        render(<Register />);

        const password =
            screen.getByPlaceholderText(
                "Create a password"
            );

        expect(password).toHaveAttribute(
            "type",
            "password"
        );
    });


    test("confirm password is hidden initially", () => {
        render(<Register />);

        const confirmPassword =
            screen.getByPlaceholderText(
                "Confirm your password"
            );

        expect(confirmPassword).toHaveAttribute(
            "type",
            "password"
        );
    });


    test("shows password when password toggle is clicked", () => {
        render(<Register />);

        const password =
            screen.getByPlaceholderText(
                "Create a password"
            );

        const toggles =
            document.querySelectorAll(
                ".password-toggle"
            );

        fireEvent.click(toggles[0]);

        expect(password).toHaveAttribute(
            "type",
            "text"
        );
    });


    test("hides password after clicking toggle again", () => {
        render(<Register />);

        const password =
            screen.getByPlaceholderText(
                "Create a password"
            );

        const toggles =
            document.querySelectorAll(
                ".password-toggle"
            );

        fireEvent.click(toggles[0]);

        expect(password).toHaveAttribute(
            "type",
            "text"
        );

        fireEvent.click(toggles[0]);

        expect(password).toHaveAttribute(
            "type",
            "password"
        );
    });


    test("shows confirm password when toggle is clicked", () => {
        render(<Register />);

        const confirmPassword =
            screen.getByPlaceholderText(
                "Confirm your password"
            );

        const toggles =
            document.querySelectorAll(
                ".password-toggle"
            );

        fireEvent.click(toggles[1]);

        expect(confirmPassword).toHaveAttribute(
            "type",
            "text"
        );
    });


    test("hides confirm password after clicking toggle again", () => {
        render(<Register />);

        const confirmPassword =
            screen.getByPlaceholderText(
                "Confirm your password"
            );

        const toggles =
            document.querySelectorAll(
                ".password-toggle"
            );

        fireEvent.click(toggles[1]);

        fireEvent.click(toggles[1]);

        expect(confirmPassword).toHaveAttribute(
            "type",
            "password"
        );
    });


    // ==================================================
    // INITIAL STATE
    // ==================================================

    test("does not show error initially", () => {
        render(<Register />);

        expect(
            document.querySelector(".register-error")
        ).not.toBeInTheDocument();
    });


    // ==================================================
    // VALIDATION
    // ==================================================

    test("shows error when all fields are empty", () => {
        render(<Register />);

        fireEvent.click(
            screen.getByRole("button", {
                name: "Create Account",
            })
        );

        expect(
            screen.getByText(
                "Please fill in all fields."
            )
        ).toBeInTheDocument();

        expect(
            registerUser
        ).not.toHaveBeenCalled();
    });


    test("shows error when name is empty", () => {
        render(<Register />);

        fireEvent.change(
            screen.getByPlaceholderText(
                "Enter your email"
            ),
            {
                target: {
                    value: "test@example.com",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText(
                "Create a password"
            ),
            {
                target: {
                    value: "test-password",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText(
                "Confirm your password"
            ),
            {
                target: {
                    value: "test-password",
                },
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Create Account",
            })
        );

        expect(
            screen.getByText(
                "Please fill in all fields."
            )
        ).toBeInTheDocument();
    });


    test("shows error when password is less than 8 characters", () => {
        render(<Register />);

        fireEvent.change(
            screen.getByPlaceholderText(
                "Enter your full name"
            ),
            {
                target: {
                    value: "Test User",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText(
                "Enter your email"
            ),
            {
                target: {
                    value: "test@example.com",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText(
                "Create a password"
            ),
            {
                target: {
                    value: "1234567",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText(
                "Confirm your password"
            ),
            {
                target: {
                    value: "1234567",
                },
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Create Account",
            })
        );

        expect(
            screen.getByText(
                "Password must be at least 8 characters."
            )
        ).toBeInTheDocument();

        expect(
            registerUser
        ).not.toHaveBeenCalled();
    });


    test("shows error when passwords do not match", () => {
        render(<Register />);

        fireEvent.change(
            screen.getByPlaceholderText(
                "Enter your full name"
            ),
            {
                target: {
                    value: "Test User",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText(
                "Enter your email"
            ),
            {
                target: {
                    value: "test@example.com",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText(
                "Create a password"
            ),
            {
                target: {
                    value: "test-password",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText(
                "Confirm your password"
            ),
            {
                target: {
                    value: "different-password",
                },
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Create Account",
            })
        );

        expect(
            screen.getByText(
                "Passwords do not match."
            )
        ).toBeInTheDocument();

        expect(
            registerUser
        ).not.toHaveBeenCalled();
    });


    // ==================================================
    // ERROR CLEARING
    // ==================================================

    test("clears error when input is changed", () => {
        render(<Register />);

        fireEvent.click(
            screen.getByRole("button", {
                name: "Create Account",
            })
        );

        expect(
            screen.getByText(
                "Please fill in all fields."
            )
        ).toBeInTheDocument();

        fireEvent.change(
            screen.getByPlaceholderText(
                "Enter your full name"
            ),
            {
                target: {
                    value: "Test User",
                },
            }
        );

        expect(
            screen.queryByText(
                "Please fill in all fields."
            )
        ).not.toBeInTheDocument();
    });


    // ==================================================
    // SUCCESSFUL REGISTRATION
    // ==================================================

    test("calls registerUser with form data", async () => {
        registerUser.mockResolvedValue({
            success: true,
        });

        render(<Register />);

        fireEvent.change(
            screen.getByPlaceholderText(
                "Enter your full name"
            ),
            {
                target: {
                    value: "Test User",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText(
                "Enter your email"
            ),
            {
                target: {
                    value: "test@example.com",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText(
                "Create a password"
            ),
            {
                target: {
                    value: "test-password",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText(
                "Confirm your password"
            ),
            {
                target: {
                    value: "test-password",
                },
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Create Account",
            })
        );

        await waitFor(() => {
            expect(registerUser).toHaveBeenCalledWith({
                name: "Test User",
                email: "test@example.com",
                password: "test-password",
            });
        });
    });


    test("shows success alert after registration", async () => {
        registerUser.mockResolvedValue({
            success: true,
        });

        render(<Register />);

        fireEvent.change(
            screen.getByPlaceholderText(
                "Enter your full name"
            ),
            {
                target: {
                    value: "Test User",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText(
                "Enter your email"
            ),
            {
                target: {
                    value: "test@example.com",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText(
                "Create a password"
            ),
            {
                target: {
                    value: "test-password",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText(
                "Confirm your password"
            ),
            {
                target: {
                    value: "test-password",
                },
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Create Account",
            })
        );

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith(
                "Registration successful! Please login."
            );
        });
    });


    test("calls login callback after successful registration", async () => {
        registerUser.mockResolvedValue({
            success: true,
        });

        render(
            <Register
                onSwitchToLogin={
                    mockOnSwitchToLogin
                }
            />
        );

        fireEvent.change(
            screen.getByPlaceholderText(
                "Enter your full name"
            ),
            {
                target: {
                    value: "Test User",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText(
                "Enter your email"
            ),
            {
                target: {
                    value: "test@example.com",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText(
                "Create a password"
            ),
            {
                target: {
                    value: "test-password",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText(
                "Confirm your password"
            ),
            {
                target: {
                    value: "test-password",
                },
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Create Account",
            })
        );

        await waitFor(() => {
            expect(
                mockOnSwitchToLogin
            ).toHaveBeenCalledTimes(1);
        });
    });


    test("navigates to login after successful registration", async () => {
        registerUser.mockResolvedValue({
            success: true,
        });

        render(<Register />);

        fireEvent.change(
            screen.getByPlaceholderText(
                "Enter your full name"
            ),
            {
                target: {
                    value: "Test User",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText(
                "Enter your email"
            ),
            {
                target: {
                    value: "test@example.com",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText(
                "Create a password"
            ),
            {
                target: {
                    value: "test-password",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText(
                "Confirm your password"
            ),
            {
                target: {
                    value: "test-password",
                },
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Create Account",
            })
        );

        await waitFor(() => {
            expect(
                mockNavigate
            ).toHaveBeenCalledWith("/login");
        });
    });


    // ==================================================
    // LOGIN LINK
    // ==================================================

    test("renders Login button", () => {
        render(<Register />);

        expect(
            screen.getByRole("button", {
                name: "Login",
            })
        ).toBeInTheDocument();
    });


    test("calls onSwitchToLogin when Login is clicked", () => {
        render(
            <Register
                onSwitchToLogin={
                    mockOnSwitchToLogin
                }
            />
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Login",
            })
        );

        expect(
            mockOnSwitchToLogin
        ).toHaveBeenCalledTimes(1);
    });


    test("navigates to login when callback is not provided", () => {
        render(<Register />);

        fireEvent.click(
            screen.getByRole("button", {
                name: "Login",
            })
        );

        expect(
            mockNavigate
        ).toHaveBeenCalledWith("/login");
    });


    // ==================================================
    // CLOSE BUTTON
    // ==================================================

    test("renders close button", () => {
        render(<Register />);

        expect(
            screen.getByRole("button", {
                name: "Close",
            })
        ).toBeInTheDocument();
    });


    test("calls onClose when close button is clicked", () => {
        render(
            <Register
                onClose={mockOnClose}
            />
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Close",
            })
        );

        expect(
            mockOnClose
        ).toHaveBeenCalledTimes(1);
    });


    test("navigates home when close callback is not provided", () => {
        render(<Register />);

        fireEvent.click(
            screen.getByRole("button", {
                name: "Close",
            })
        );

        expect(
            mockNavigate
        ).toHaveBeenCalledWith("/");
    });


    // ==================================================
    // IMAGE TESTS
    // ==================================================

    test("renders healthcare image", () => {
        render(<Register />);

        const image =
            screen.getByAltText(
                "MEDIKART Healthcare"
            );

        expect(image).toBeInTheDocument();
    });


    test("healthcare image has correct source", () => {
        render(<Register />);

        const image =
            screen.getByAltText(
                "MEDIKART Healthcare"
            );

        expect(image).toHaveAttribute(
            "src",
            "register-image.png"
        );
    });


    test("healthcare image has correct CSS class", () => {
        render(<Register />);

        const image =
            screen.getByAltText(
                "MEDIKART Healthcare"
            );

        expect(image).toHaveClass(
            "register-image"
        );
    });


    // ==================================================
    // IMAGE OVERLAY
    // ==================================================

    test("renders image overlay heading", () => {
        render(<Register />);

        expect(
            screen.getByRole("heading", {
                name: "Your Health, Our Priority",
            })
        ).toBeInTheDocument();
    });


    test("renders image overlay description", () => {
        render(<Register />);

        expect(
            screen.getByText(
                /Get medicines, healthcare products and wellness essentials/i
            )
        ).toBeInTheDocument();
    });


    // ==================================================
    // CSS CLASS TESTS
    // ==================================================

    test("renders registration form section", () => {
        render(<Register />);

        expect(
            document.querySelector(
                ".register-form-section"
            )
        ).toBeInTheDocument();
    });


    test("renders registration image section", () => {
        render(<Register />);

        expect(
            document.querySelector(
                ".register-image-section"
            )
        ).toBeInTheDocument();
    });


    test("renders register button with correct CSS class", () => {
        render(<Register />);

        const button =
            screen.getByRole("button", {
                name: "Create Account",
            });

        expect(button).toHaveClass(
            "register-button"
        );
    });


    test("renders login link with correct CSS class", () => {
        render(<Register />);

        const button =
            screen.getByRole("button", {
                name: "Login",
            });

        expect(button).toHaveClass(
            "login-link-button"
        );
    });


    // ==================================================
    // FORM SUBMIT
    // ==================================================

    test("does not call API for invalid form", () => {
        render(<Register />);

        fireEvent.click(
            screen.getByRole("button", {
                name: "Create Account",
            })
        );

        expect(
            registerUser
        ).not.toHaveBeenCalled();
    });


    test("does not navigate after validation failure", () => {
        render(<Register />);

        fireEvent.click(
            screen.getByRole("button", {
                name: "Create Account",
            })
        );

        expect(
            mockNavigate
        ).not.toHaveBeenCalled();
    });


    // ==================================================
    // API ERROR
    // ==================================================

    test("shows API error message when registration fails", async () => {
        registerUser.mockRejectedValue(
            new Error("Registration failed")
        );

        render(<Register />);

        fireEvent.change(
            screen.getByPlaceholderText(
                "Enter your full name"
            ),
            {
                target: {
                    value: "Test User",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText(
                "Enter your email"
            ),
            {
                target: {
                    value: "test@example.com",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText(
                "Create a password"
            ),
            {
                target: {
                    value: "test-password",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText(
                "Confirm your password"
            ),
            {
                target: {
                    value: "test-password",
                },
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Create Account",
            })
        );

        await waitFor(() => {
            expect(
                screen.getByText(
                    "Registration failed"
                )
            ).toBeInTheDocument();
        });
    });


    test("shows default error when API error has no message", async () => {
        registerUser.mockRejectedValue({});

        render(<Register />);

        fireEvent.change(
            screen.getByPlaceholderText(
                "Enter your full name"
            ),
            {
                target: {
                    value: "Test User",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText(
                "Enter your email"
            ),
            {
                target: {
                    value: "test@example.com",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText(
                "Create a password"
            ),
            {
                target: {
                    value: "test-password",
                },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText(
                "Confirm your password"
            ),
            {
                target: {
                    value: "test-password",
                },
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Create Account",
            })
        );

        await waitFor(() => {
            expect(
                screen.getByText(
                    "Unable to create account. Please try again."
                )
            ).toBeInTheDocument();
        });
    });
});