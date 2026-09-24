import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import ForgotPassword from "./ForgotPassword";

import {
  forgotPassword,
  verifyOTP,
  resetPassword,
} from "../../api/authApi";

// =====================================================
// MOCK API
// =====================================================

jest.mock("../../api/authApi", () => ({
  forgotPassword: jest.fn(),
  verifyOTP: jest.fn(),
  resetPassword: jest.fn(),
}));

// =====================================================
// MOCK REACT ROUTER
// =====================================================

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// =====================================================
// HELPERS
// =====================================================

const renderForgotPassword = (props = {}) => {
  const defaultProps = {
    onClose: jest.fn(),
    onSwitchToLogin: jest.fn(),
  };

  return render(
    <ForgotPassword
      {...defaultProps}
      {...props}
    />
  );
};

// =====================================================
// TEST SETUP
// =====================================================

beforeEach(() => {
  jest.clearAllMocks();

  forgotPassword.mockResolvedValue({
    message: "OTP sent successfully",
  });

  verifyOTP.mockResolvedValue({
    message: "OTP verified successfully",
  });

  resetPassword.mockResolvedValue({
    message: "Password reset successfully",
  });
});

// =====================================================
// INITIAL EMAIL STEP
// =====================================================

describe("ForgotPassword - Email Step", () => {
  test("renders forgot password page", () => {
    renderForgotPassword();

    expect(
      screen.getByRole("heading", {
        name: /forgot password/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/enter your email/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /send otp/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /back to login/i,
      })
    ).toBeInTheDocument();
  });

  test("shows validation error when email is empty", async () => {
    renderForgotPassword();

    const button = screen.getByRole("button", {
      name: /send otp/i,
    });

    fireEvent.click(button);

    await waitFor(() => {
      expect(
        screen.getByText(/please enter your email address/i)
      ).toBeInTheDocument();
    });

    expect(forgotPassword).not.toHaveBeenCalled();
  });

  test("sends OTP successfully", async () => {
    renderForgotPassword();

    const emailInput = screen.getByPlaceholderText(
      /enter your email/i
    );

    fireEvent.change(emailInput, {
      target: {
        value: "test@example.com",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /send otp/i,
      })
    );

    expect(forgotPassword).toHaveBeenCalledWith(
      "test@example.com"
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", {
          name: /verify otp/i,
        })
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText("test@example.com")
    ).toBeInTheDocument();
  });

  test("shows loading state while sending OTP", async () => {
    let resolveRequest;

    forgotPassword.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        })
    );

    renderForgotPassword();

    fireEvent.change(
      screen.getByPlaceholderText(/enter your email/i),
      {
        target: {
          value: "test@example.com",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /send otp/i,
      })
    );

    expect(
      screen.getByRole("button", {
        name: /sending otp/i,
      })
    ).toBeDisabled();

    resolveRequest({
      message: "OTP sent",
    });

    await waitFor(() => {
      expect(
        screen.getByRole("heading", {
          name: /verify otp/i,
        })
      ).toBeInTheDocument();
    });
  });

  test("shows API error when sending OTP fails", async () => {
    forgotPassword.mockRejectedValue(
      new Error("Email is not registered")
    );

    renderForgotPassword();

    fireEvent.change(
      screen.getByPlaceholderText(/enter your email/i),
      {
        target: {
          value: "wrong@example.com",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /send otp/i,
      })
    );

    await waitFor(() => {
      expect(
        screen.getByText(/email is not registered/i)
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole("heading", {
        name: /forgot password/i,
      })
    ).toBeInTheDocument();
  });

  test("shows server connection error when fetch fails", async () => {
    forgotPassword.mockRejectedValue(
      new Error("Failed to fetch")
    );

    renderForgotPassword();

    fireEvent.change(
      screen.getByPlaceholderText(/enter your email/i),
      {
        target: {
          value: "test@example.com",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /send otp/i,
      })
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          /cannot connect to server/i
        )
      ).toBeInTheDocument();
    });
  });
});

// =====================================================
// OTP STEP
// =====================================================

describe("ForgotPassword - OTP Step", () => {
  const goToOTPStep = async () => {
    renderForgotPassword();

    fireEvent.change(
      screen.getByPlaceholderText(/enter your email/i),
      {
        target: {
          value: "test@example.com",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /send otp/i,
      })
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", {
          name: /verify otp/i,
        })
      ).toBeInTheDocument();
    });
  };

  test("moves to OTP step after sending email", async () => {
    await goToOTPStep();

    expect(
      screen.getByPlaceholderText(/enter otp/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /verify otp/i,
      })
    ).toBeInTheDocument();
  });

  test("accepts only numeric OTP", async () => {
    await goToOTPStep();

    const otpInput =
      screen.getByPlaceholderText(/enter otp/i);

    fireEvent.change(otpInput, {
      target: {
        value: "12abc34",
      },
    });

    expect(otpInput).toHaveValue("1234");
  });

  test("rejects OTP shorter than 6 digits", async () => {
    await goToOTPStep();

    const otpInput =
      screen.getByPlaceholderText(/enter otp/i);

    fireEvent.change(otpInput, {
      target: {
        value: "12345",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /verify otp/i,
      })
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          /please enter a valid 6-digit otp/i
        )
      ).toBeInTheDocument();
    });

    expect(verifyOTP).not.toHaveBeenCalled();
  });

  test("verifies valid OTP successfully", async () => {
    await goToOTPStep();

    fireEvent.change(
      screen.getByPlaceholderText(/enter otp/i),
      {
        target: {
          value: "123456",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /verify otp/i,
      })
    );

    expect(verifyOTP).toHaveBeenCalledWith(
      "test@example.com",
      "123456"
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", {
          name: /reset password/i,
        })
      ).toBeInTheDocument();
    });
  });

  test("shows error when OTP verification fails", async () => {
    verifyOTP.mockRejectedValue(
      new Error("Invalid OTP")
    );

    await goToOTPStep();

    fireEvent.change(
      screen.getByPlaceholderText(/enter otp/i),
      {
        target: {
          value: "123456",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /verify otp/i,
      })
    );

    await waitFor(() => {
      expect(
        screen.getByText(/invalid otp/i)
      ).toBeInTheDocument();
    });
  });

  test("shows server connection error during OTP verification", async () => {
    verifyOTP.mockRejectedValue(
      new Error("Failed to fetch")
    );

    await goToOTPStep();

    fireEvent.change(
      screen.getByPlaceholderText(/enter otp/i),
      {
        target: {
          value: "123456",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /verify otp/i,
      })
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          /cannot connect to server/i
        )
      ).toBeInTheDocument();
    });
  });

  test("back button returns from OTP to email", async () => {
    await goToOTPStep();

    fireEvent.click(
      screen.getByRole("button", {
        name: /^back$/i,
      })
    );

    expect(
      screen.getByRole("heading", {
        name: /forgot password/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/enter your email/i)
    ).toBeInTheDocument();
  });
});

// =====================================================
// RESET PASSWORD STEP
// =====================================================

describe("ForgotPassword - Reset Password Step", () => {
  const goToResetStep = async () => {
    renderForgotPassword();

    fireEvent.change(
      screen.getByPlaceholderText(/enter your email/i),
      {
        target: {
          value: "test@example.com",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /send otp/i,
      })
    );

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(/enter otp/i)
      ).toBeInTheDocument();
    });

    fireEvent.change(
      screen.getByPlaceholderText(/enter otp/i),
      {
        target: {
          value: "123456",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /verify otp/i,
      })
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", {
          name: /reset password/i,
        })
      ).toBeInTheDocument();
    });
  };

  test("renders password fields", async () => {
    await goToResetStep();

    expect(
      screen.getByPlaceholderText(/new password/i)
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/confirm password/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /reset password/i,
      })
    ).toBeInTheDocument();
  });

  test("shows error when passwords are empty", async () => {
    await goToResetStep();

    fireEvent.click(
      screen.getByRole("button", {
        name: /reset password/i,
      })
    );

    await waitFor(() => {
      expect(
        screen.getByText(/please enter your password/i)
      ).toBeInTheDocument();
    });

    expect(resetPassword).not.toHaveBeenCalled();
  });

  test("rejects password shorter than 8 characters", async () => {
    await goToResetStep();

    fireEvent.change(
      screen.getByPlaceholderText(/new password/i),
      {
        target: {
          value: "1234567",
        },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText(/confirm password/i),
      {
        target: {
          value: "1234567",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /reset password/i,
      })
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          /password must be at least 8 characters/i
        )
      ).toBeInTheDocument();
    });

    expect(resetPassword).not.toHaveBeenCalled();
  });

  test("rejects mismatched passwords", async () => {
    await goToResetStep();

    fireEvent.change(
      screen.getByPlaceholderText(/new password/i),
      {
        target: {
          value: "Password123",
        },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText(/confirm password/i),
      {
        target: {
          value: "Different123",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /reset password/i,
      })
    );

    await waitFor(() => {
      expect(
        screen.getByText(/passwords do not match/i)
      ).toBeInTheDocument();
    });

    expect(resetPassword).not.toHaveBeenCalled();
  });

  test("resets password successfully", async () => {
    await goToResetStep();

    fireEvent.change(
      screen.getByPlaceholderText(/new password/i),
      {
        target: {
          value: "Password123",
        },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText(/confirm password/i),
      {
        target: {
          value: "Password123",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /reset password/i,
      })
    );

    expect(resetPassword).toHaveBeenCalledWith(
      "test@example.com",
      "123456",
      "Password123"
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", {
          name: /password reset successfully/i,
        })
      ).toBeInTheDocument();
    });
  });

  test("shows reset password API error", async () => {
    resetPassword.mockRejectedValue(
      new Error("Unable to reset password")
    );

    await goToResetStep();

    fireEvent.change(
      screen.getByPlaceholderText(/new password/i),
      {
        target: {
          value: "Password123",
        },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText(/confirm password/i),
      {
        target: {
          value: "Password123",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /reset password/i,
      })
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          /unable to reset password/i
        )
      ).toBeInTheDocument();
    });
  });

  test("shows connection error when reset password fetch fails", async () => {
    resetPassword.mockRejectedValue(
      new Error("Failed to fetch")
    );

    await goToResetStep();

    fireEvent.change(
      screen.getByPlaceholderText(/new password/i),
      {
        target: {
          value: "Password123",
        },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText(/confirm password/i),
      {
        target: {
          value: "Password123",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /reset password/i,
      })
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          /cannot connect to server/i
        )
      ).toBeInTheDocument();
    });
  });

  test("back button returns from reset to OTP", async () => {
    await goToResetStep();

    fireEvent.click(
      screen.getByRole("button", {
        name: /^back$/i,
      })
    );

    expect(
      screen.getByRole("heading", {
        name: /verify otp/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/enter otp/i)
    ).toBeInTheDocument();
  });
});

// =====================================================
// SUCCESS STEP
// =====================================================

describe("ForgotPassword - Success Step", () => {
  const completePasswordReset = async () => {
    renderForgotPassword();

    // Email
    fireEvent.change(
      screen.getByPlaceholderText(/enter your email/i),
      {
        target: {
          value: "test@example.com",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /send otp/i,
      })
    );

    // OTP
    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(/enter otp/i)
      ).toBeInTheDocument();
    });

    fireEvent.change(
      screen.getByPlaceholderText(/enter otp/i),
      {
        target: {
          value: "123456",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /verify otp/i,
      })
    );

    // Reset
    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(/new password/i)
      ).toBeInTheDocument();
    });

    fireEvent.change(
      screen.getByPlaceholderText(/new password/i),
      {
        target: {
          value: "Password123",
        },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText(/confirm password/i),
      {
        target: {
          value: "Password123",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /reset password/i,
      })
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", {
          name: /password reset successfully/i,
        })
      ).toBeInTheDocument();
    });
  };

  test("displays success message after password reset", async () => {
    await completePasswordReset();

    expect(
      screen.getByText(
        /your password has been changed successfully/i
      )
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /back to login/i,
      })
    ).toBeInTheDocument();
  });

  test("back to login calls onSwitchToLogin", async () => {
    const onSwitchToLogin = jest.fn();

    renderForgotPassword({
      onSwitchToLogin,
    });

    fireEvent.change(
      screen.getByPlaceholderText(/enter your email/i),
      {
        target: {
          value: "test@example.com",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /send otp/i,
      })
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", {
          name: /verify otp/i,
        })
      ).toBeInTheDocument();
    });

    // Go back to email first
    fireEvent.click(
      screen.getByRole("button", {
        name: /^back$/i,
      })
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /back to login/i,
      })
    );

    expect(onSwitchToLogin).toHaveBeenCalledTimes(1);
  });
});

// =====================================================
// CLOSE BUTTON
// =====================================================

describe("ForgotPassword - Close", () => {
  test("calls onClose when close button is clicked", () => {
    const onClose = jest.fn();

    renderForgotPassword({
      onClose,
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /close/i,
      })
    );

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("uses onSwitchToLogin when onClose is not provided", () => {
    const onSwitchToLogin = jest.fn();

    render(
      <ForgotPassword
        onSwitchToLogin={onSwitchToLogin}
      />
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /close/i,
      })
    );

    expect(
      onSwitchToLogin
    ).toHaveBeenCalledTimes(1);
  });

  test("uses navigate when neither callback is provided", () => {
    render(<ForgotPassword />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /close/i,
      })
    );

    expect(mockNavigate).toHaveBeenCalledWith(
      "/login"
    );
  });
});

// =====================================================
// BACK TO LOGIN
// =====================================================

describe("ForgotPassword - Back to Login", () => {
  test("calls onSwitchToLogin from email step", () => {
    const onSwitchToLogin = jest.fn();

    renderForgotPassword({
      onSwitchToLogin,
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /back to login/i,
      })
    );

    expect(
      onSwitchToLogin
    ).toHaveBeenCalledTimes(1);
  });

  test("calls onClose when onSwitchToLogin is unavailable", () => {
    const onClose = jest.fn();

    render(
      <ForgotPassword onClose={onClose} />
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /back to login/i,
      })
    );

    expect(
      onClose
    ).toHaveBeenCalledTimes(1);
  });

  test("navigates to login when callbacks are unavailable", () => {
    render(<ForgotPassword />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /back to login/i,
      })
    );

    expect(mockNavigate).toHaveBeenCalledWith(
      "/login"
    );
  });
});
