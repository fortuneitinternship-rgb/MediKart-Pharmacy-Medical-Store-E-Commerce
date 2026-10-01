import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import Register from "./Register";
import { registerUser } from "../../api/authApi";

// --------------------------------------------------
// MOCK API
// --------------------------------------------------
jest.mock("../../api/authApi", () => ({
  registerUser: jest.fn(),
}));

// --------------------------------------------------
// MOCK REACT ROUTER
// --------------------------------------------------
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// --------------------------------------------------
// MOCK IMAGE
// --------------------------------------------------
jest.mock("../../assets/register/register.png", () => "register-image.png");

// --------------------------------------------------
// TEST SETUP
// --------------------------------------------------
describe("Register Component", () => {
  const mockOnClose = jest.fn();
  const mockOnSwitchToLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    registerUser.mockResolvedValue({
      message: "Registration successful",
    });

    jest.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const renderRegister = (props = {}) => {
    return render(<Register {...props} />);
  };

  // --------------------------------------------------
  // INITIAL RENDER
  // --------------------------------------------------
  test("renders registration form correctly", () => {
    renderRegister();
    expect(screen.getByLabelText("Full Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create Account" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByAltText("MEDIKART Healthcare")).toBeInTheDocument();
  });

  // --------------------------------------------------
  // INPUT CHANGE
  // --------------------------------------------------
  test("updates form fields when user enters data", () => {
    renderRegister();

    const nameInput = screen.getByLabelText("Full Name");
    const emailInput = screen.getByLabelText("Email Address");
    const passwordInput = screen.getByLabelText("Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm Password");

    fireEvent.change(nameInput, {target: { name: "name", value: "Test" },});
    fireEvent.change(emailInput, {target: { name: "email", value: "test@example.com" },});
    fireEvent.change(passwordInput, {target: { name: "password", value: "password123" },});
    fireEvent.change(confirmPasswordInput, {target: {name: "confirmPassword",value: "password123",},});

    expect(nameInput).toHaveValue("Test");
    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
    expect(confirmPasswordInput).toHaveValue("password123");
  });

  // --------------------------------------------------
  // EMPTY FIELD VALIDATION
  // --------------------------------------------------
  test("shows error when required fields are empty", () => {
    renderRegister();

    fireEvent.click(screen.getByRole("button", { name: "Create Account" }));
    expect(screen.getByText("Please fill in all fields.")).toBeInTheDocument();
    expect(registerUser).not.toHaveBeenCalled();
  });

  // --------------------------------------------------
  // PASSWORD LENGTH VALIDATION
  // --------------------------------------------------
  test("shows error when password is less than 8 characters", () => {
    renderRegister();

    fireEvent.change(screen.getByLabelText("Full Name"), {target: { name: "name", value: "Test" },});

    fireEvent.change(screen.getByLabelText("Email Address"), {target: {name: "email",value: "test@example.com",},});

    fireEvent.change(screen.getByLabelText("Password"), {target: {name: "password",value: "1234567",},});

    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: {
        name: "confirmPassword",
        value: "1234567",
      },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Create Account" })
    );

    expect(
      screen.getByText("Password must be at least 8 characters.")
    ).toBeInTheDocument();

    expect(registerUser).not.toHaveBeenCalled();
  });

  // --------------------------------------------------
  // PASSWORD MATCH VALIDATION
  // --------------------------------------------------
  test("shows error when passwords do not match", () => {
    renderRegister();

    fireEvent.change(screen.getByLabelText("Full Name"), {
      target: { name: "name", value: "Test" },
    });

    fireEvent.change(screen.getByLabelText("Email Address"), {
      target: {
        name: "email",
        value: "test@example.com",
      },
    });

    fireEvent.change(screen.getByLabelText("Password"), {
      target: {
        name: "password",
        value: "password123",
      },
    });

    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: {
        name: "confirmPassword",
        value: "different123",
      },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Create Account" })
    );

    expect(
      screen.getByText("Passwords do not match.")
    ).toBeInTheDocument();

    expect(registerUser).not.toHaveBeenCalled();
  });

  // --------------------------------------------------
  // PASSWORD VISIBILITY
  // --------------------------------------------------
  test("toggles password visibility", () => {
    renderRegister();

    const passwordInput = screen.getByLabelText("Password");

    expect(passwordInput).toHaveAttribute("type", "password");

    fireEvent.click(
      screen.getByRole("button", { name: "Show password" })
    );

    expect(passwordInput).toHaveAttribute("type", "text");

    expect(
      screen.getByRole("button", { name: "Hide password" })
    ).toBeInTheDocument();
  });

  // --------------------------------------------------
  // CONFIRM PASSWORD VISIBILITY
  // --------------------------------------------------
  test("toggles confirm password visibility", () => {
    renderRegister();

    const confirmPasswordInput =
      screen.getByLabelText("Confirm Password");

    expect(confirmPasswordInput).toHaveAttribute(
      "type",
      "password"
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Show confirm password",
      })
    );

    expect(confirmPasswordInput).toHaveAttribute(
      "type",
      "text"
    );

    expect(
      screen.getByRole("button", {
        name: "Hide confirm password",
      })
    ).toBeInTheDocument();
  });

  // --------------------------------------------------
  // SUCCESSFUL REGISTRATION
  // --------------------------------------------------
  test("registers successfully and switches to login", async () => {
    renderRegister({
      onSwitchToLogin: mockOnSwitchToLogin,
    });

    fireEvent.change(screen.getByLabelText("Full Name"), {
      target: { name: "name", value: "Test" },
    });

    fireEvent.change(screen.getByLabelText("Email Address"), {
      target: {
        name: "email",
        value: "test@example.com",
      },
    });

    fireEvent.change(screen.getByLabelText("Password"), {
      target: {
        name: "password",
        value: "password123",
      },
    });

    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: {
        name: "confirmPassword",
        value: "password123",
      },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Create Account" })
    );

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalledTimes(1);
    });

    expect(registerUser).toHaveBeenCalledWith({
      username: "Test",
      email: "test@example.com",
      password: "password123",
      confirm_password: "password123",
    });

    expect(window.alert).toHaveBeenCalledWith(
      "Registration successful! Please login."
    );

    expect(mockOnSwitchToLogin).toHaveBeenCalledTimes(1);
  });

  // --------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------
  test("shows loading state while registration is in progress", async () => {
    let resolveRequest;

    registerUser.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        })
    );

    renderRegister();

    fireEvent.change(screen.getByLabelText("Full Name"), {
      target: { name: "name", value: "Test" },
    });

    fireEvent.change(screen.getByLabelText("Email Address"), {
      target: {
        name: "email",
        value: "test@example.com",
      },
    });

    fireEvent.change(screen.getByLabelText("Password"), {
      target: {
        name: "password",
        value: "password123",
      },
    });

    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: {
        name: "confirmPassword",
        value: "password123",
      },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Create Account" })
    );

    expect(
      await screen.findByText("Creating Account...")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Creating Account...",
      })
    ).toBeDisabled();

    resolveRequest({
      message: "Registration successful",
    });
  });

  // --------------------------------------------------
  // API ERROR
  // --------------------------------------------------
  test("shows API error when registration fails", async () => {
    registerUser.mockRejectedValue(
      new Error("Registration failed")
    );

    renderRegister();

    fireEvent.change(screen.getByLabelText("Full Name"), {
      target: { name: "name", value: "Test" },
    });

    fireEvent.change(screen.getByLabelText("Email Address"), {
      target: {
        name: "email",
        value: "test@example.com",
      },
    });

    fireEvent.change(screen.getByLabelText("Password"), {
      target: {
        name: "password",
        value: "password123",
      },
    });

    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: {
        name: "confirmPassword",
        value: "password123",
      },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Create Account" })
    );

    expect(
      await screen.findByText("Registration failed")
    ).toBeInTheDocument();

    expect(mockOnSwitchToLogin).not.toHaveBeenCalled();
  });

  // --------------------------------------------------
  // CLOSE BUTTON
  // --------------------------------------------------
  test("calls onClose when close button is clicked", () => {
    renderRegister({
      onClose: mockOnClose,
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Close" })
    );

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // --------------------------------------------------
  // CLOSE WITHOUT CALLBACK
  // --------------------------------------------------
  test("navigates to home when onClose is not provided", () => {
    renderRegister();

    fireEvent.click(
      screen.getByRole("button", { name: "Close" })
    );

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  // --------------------------------------------------
  // LOGIN CALLBACK
  // --------------------------------------------------
  test("calls onSwitchToLogin when Login is clicked", () => {
    renderRegister({
      onSwitchToLogin: mockOnSwitchToLogin,
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Login" })
    );

    expect(mockOnSwitchToLogin).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // --------------------------------------------------
  // LOGIN NAVIGATION
  // --------------------------------------------------
  test("navigates to login when onSwitchToLogin is not provided", () => {
    renderRegister();

    fireEvent.click(
      screen.getByRole("button", { name: "Login" })
    );

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  // --------------------------------------------------
  // ERROR CLEARS WHEN INPUT CHANGES
  // --------------------------------------------------
  test("clears validation error when input changes", () => {
    renderRegister();

    fireEvent.click(
      screen.getByRole("button", { name: "Create Account" })
    );

    expect(
      screen.getByText("Please fill in all fields.")
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Full Name"), {
      target: {
        name: "name",
        value: "Test",
      },
    });

    expect(
      screen.queryByText("Please fill in all fields.")
    ).not.toBeInTheDocument();
  });
});
