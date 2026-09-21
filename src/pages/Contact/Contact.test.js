import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import Contact from "./Contact";

describe("Contact Component", () => {
  beforeEach(() => {
    render(<Contact />);
  });

  test("renders contact page", () => {
    expect(screen.getByText("Contact MEDIKART")).toBeInTheDocument();
    expect(
      screen.getByText("We're here to help you 24×7")
    ).toBeInTheDocument();
  });

  test("renders Get In Touch section", () => {
    expect(screen.getByText("Get In Touch")).toBeInTheDocument();
  });

  test("renders contact information headings", () => {
    expect(screen.getByText("Phone")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Address")).toBeInTheDocument();
    expect(screen.getByText("Working Hours")).toBeInTheDocument();
  });

  test("renders Send a Message section", () => {
    expect(screen.getByText("Send a Message")).toBeInTheDocument();
  });

  test("renders all form fields", () => {
    expect(screen.getByPlaceholderText("Your Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email Address")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Mobile Number")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Your Message")).toBeInTheDocument();
  });

  test("renders Send Message button", () => {
    expect(
      screen.getByRole("button", { name: "Send Message" })
    ).toBeInTheDocument();
  });

  test("allows entering values into form fields", () => {
    const nameInput = screen.getByPlaceholderText("Your Name");
    const emailInput = screen.getByPlaceholderText("Email Address");
    const mobileInput = screen.getByPlaceholderText("Mobile Number");
    const messageInput = screen.getByPlaceholderText("Your Message");

    fireEvent.change(nameInput, {
      target: { value: "Test Name" },
    });

    fireEvent.change(emailInput, {
      target: { value: "test@example.com" },
    });

    fireEvent.change(mobileInput, {
      target: { value: "0000000000" },
    });

    fireEvent.change(messageInput, {
      target: { value: "Test message" },
    });

    expect(nameInput).toHaveValue("Test Name");
    expect(emailInput).toHaveValue("test@example.com");
    expect(mobileInput).toHaveValue("0000000000");
    expect(messageInput).toHaveValue("Test message");
  });

  test("submits the form successfully", () => {
    const nameInput = screen.getByPlaceholderText("Your Name");
    const emailInput = screen.getByPlaceholderText("Email Address");
    const mobileInput = screen.getByPlaceholderText("Mobile Number");
    const messageInput = screen.getByPlaceholderText("Your Message");

    fireEvent.change(nameInput, {
      target: { value: "Test Name" },
    });

    fireEvent.change(emailInput, {
      target: { value: "test@example.com" },
    });

    fireEvent.change(mobileInput, {
      target: { value: "0000000000" },
    });

    fireEvent.change(messageInput, {
      target: { value: "Test message" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Send Message" })
    );

    expect(
      screen.getByText("✅ Message sent successfully!")
    ).toBeInTheDocument();
  });

  test("resets the form after submission", () => {
    const nameInput = screen.getByPlaceholderText("Your Name");
    const emailInput = screen.getByPlaceholderText("Email Address");
    const mobileInput = screen.getByPlaceholderText("Mobile Number");
    const messageInput = screen.getByPlaceholderText("Your Message");

    fireEvent.change(nameInput, {
      target: { value: "Test Name" },
    });

    fireEvent.change(emailInput, {
      target: { value: "test@example.com" },
    });

    fireEvent.change(mobileInput, {
      target: { value: "0000000000" },
    });

    fireEvent.change(messageInput, {
      target: { value: "Test message" },
    });

    fireEvent.submit(nameInput.closest("form"));

    expect(nameInput).toHaveValue("");
    expect(emailInput).toHaveValue("");
    expect(mobileInput).toHaveValue("");
    expect(messageInput).toHaveValue("");
  });

  test("does not show success message before submission", () => {
    expect(
      screen.queryByText("✅ Message sent successfully!")
    ).not.toBeInTheDocument();
  });
});