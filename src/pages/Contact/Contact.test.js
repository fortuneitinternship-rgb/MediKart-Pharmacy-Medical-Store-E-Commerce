import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Contact from "./Contact";

import { submitContactMessage } from "../../api/submissionsApi";
import { getApiErrorMessage } from "../../services/api";

jest.mock("../../api/submissionsApi", () => ({
  submitContactMessage: jest.fn(),
}));

jest.mock("../../services/api", () => ({
  getApiErrorMessage: jest.fn(),
}));

describe("Contact Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    getApiErrorMessage.mockImplementation(
      (error, fallback) => error?.message || fallback
    );
  });

  test("renders contact page", () => {
    render(<Contact />);

    expect(
      screen.getByText("Contact MEDIKART")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Get In Touch")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Send a Message")
    ).toBeInTheDocument();
  });

  test("renders all form fields", () => {
    render(<Contact />);

    expect(
      screen.getByPlaceholderText("Your Name")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Email Address")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Mobile Number")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Your Message")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Send Message",
      })
    ).toBeInTheDocument();
  });

  test("allows user to enter name", () => {
    render(<Contact />);

    const input =
      screen.getByPlaceholderText("Your Name");

    fireEvent.change(input, {
      target: {
        value: "Test User",
      },
    });

    expect(input).toHaveValue("Test User");
  });

  test("allows user to enter email", () => {
    render(<Contact />);

    const input =
      screen.getByPlaceholderText("Email Address");

    fireEvent.change(input, {
      target: {
        value: "test@example.com",
      },
    });

    expect(input).toHaveValue(
      "test@example.com"
    );
  });

  test("allows user to enter phone", () => {
    render(<Contact />);

    const input =
      screen.getByPlaceholderText("Mobile Number");

    fireEvent.change(input, {
      target: {
        value: "0000000000",
      },
    });

    expect(input).toHaveValue(
      "0000000000"
    );
  });

  test("allows user to enter message", () => {
    render(<Contact />);

    const textarea =
      screen.getByPlaceholderText("Your Message");

    fireEvent.change(textarea, {
      target: {
        value: "Test message",
      },
    });

    expect(textarea).toHaveValue(
      "Test message"
    );
  });

  test("submits the form successfully", async () => {
    submitContactMessage.mockResolvedValue({
      success: true,
    });

    render(<Contact />);

    fireEvent.change(
      screen.getByPlaceholderText("Your Name"),
      {
        target: {
          value: "Test User",
        },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText("Email Address"),
      {
        target: {
          value: "test@example.com",
        },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText("Mobile Number"),
      {
        target: {
          value: "0000000000",
        },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText("Your Message"),
      {
        target: {
          value: "Test message",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Send Message",
      })
    );

    await waitFor(() => {
      expect(
        submitContactMessage
      ).toHaveBeenCalledTimes(1);
    });

    expect(
      submitContactMessage
    ).toHaveBeenCalledWith({
      name: "Test User",
      email: "test@example.com",
      phone: "0000000000",
      message: "Test message",
    });

    expect(
      await screen.findByText(
        "Message sent successfully!"
      )
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Your Name")
    ).toHaveValue("");

    expect(
      screen.getByPlaceholderText("Email Address")
    ).toHaveValue("");

    expect(
      screen.getByPlaceholderText("Mobile Number")
    ).toHaveValue("");

    expect(
      screen.getByPlaceholderText("Your Message")
    ).toHaveValue("");
  });

  test("shows sending text while submitting", async () => {
    let resolvePromise;

    submitContactMessage.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        })
    );

    render(<Contact />);

    fireEvent.change(
      screen.getByPlaceholderText("Your Name"),
      {
        target: {
          value: "Test User",
        },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText("Email Address"),
      {
        target: {
          value: "test@example.com",
        },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText("Mobile Number"),
      {
        target: {
          value: "0000000000",
        },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText("Your Message"),
      {
        target: {
          value: "Test message",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Send Message",
      })
    );

    expect(
      screen.getByRole("button", {
        name: "Sending...",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Sending...",
      })
    ).toBeDisabled();

    resolvePromise({
      success: true,
    });

    await waitFor(() => {
      expect(
        screen.getByText(
          "Message sent successfully!"
        )
      ).toBeInTheDocument();
    });
  });

  test("shows error when API fails", async () => {
    submitContactMessage.mockRejectedValue(
      new Error("Test error")
    );

    getApiErrorMessage.mockReturnValue(
      "Unable to send your message."
    );

    render(<Contact />);

    fireEvent.change(
      screen.getByPlaceholderText("Your Name"),
      {
        target: {
          value: "Test User",
        },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText("Email Address"),
      {
        target: {
          value: "test@example.com",
        },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText("Mobile Number"),
      {
        target: {
          value: "0000000000",
        },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText("Your Message"),
      {
        target: {
          value: "Test message",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Send Message",
      })
    );

    await waitFor(() => {
      expect(
        screen.getByRole("alert")
      ).toHaveTextContent(
        "Unable to send your message."
      );
    });

    expect(
      screen.queryByText(
        "Message sent successfully!"
      )
    ).not.toBeInTheDocument();
  });
});