import React from "react";
import {
  render,
  screen,
  cleanup,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import Payments from "./Payments";

describe("Payments Component", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });

  test("renders the saved payment methods heading", () => {
    render(<Payments />);

    expect(
      screen.getByRole("heading", {
        name: /saved payment methods/i,
      })
    ).toBeInTheDocument();
  });

  test("displays the default payment methods", () => {
    render(<Payments />);

    expect(
      screen.getByRole("heading", { name: "Credit Card" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "UPI" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Net Banking" })
    ).toBeInTheDocument();
  });

  test("displays dummy payment information", () => {
    render(<Payments />);

    expect(screen.getByText("Test Holder")).toBeInTheDocument();
    expect(screen.getByText("test@upi")).toBeInTheDocument();
    expect(screen.getByText("Test Bank")).toBeInTheDocument();

    expect(
      screen.getByText("**** **** **** 0000")
    ).toBeInTheDocument();
  });

  test("displays the Add Payment Method button", () => {
    render(<Payments />);

    expect(
      screen.getByRole("button", {
        name: /add payment method/i,
      })
    ).toBeInTheDocument();
  });

  test("removes a payment method when clicked", async () => {
    const user = userEvent.setup();

    render(<Payments />);

    await user.click(
      screen.getAllByRole("button", { name: /remove/i })[0]
    );

    expect(
      screen.queryByRole("heading", { name: "Credit Card" })
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "UPI" })
    ).toBeInTheDocument();
  });

  test("saves the remaining methods in localStorage", async () => {
    const user = userEvent.setup();

    render(<Payments />);

    await user.click(
      screen.getAllByRole("button", { name: /remove/i })[0]
    );

    const savedPayments = JSON.parse(
      localStorage.getItem("payments")
    );

    expect(savedPayments).toHaveLength(2);
    expect(
      savedPayments.some(
        (payment) => payment.type === "Credit Card"
      )
    ).toBe(false);
  });

  test("shows the empty state after removing all methods", async () => {
    const user = userEvent.setup();

    render(<Payments />);

    while (screen.queryAllByRole("button", { name: /remove/i }).length) {
      await user.click(
        screen.getAllByRole("button", { name: /remove/i })[0]
      );
    }

    expect(
      screen.getByRole("heading", {
        name: /no payment methods found/i,
      })
    ).toBeInTheDocument();
  });

  test("does not show the empty state when methods exist", () => {
    render(<Payments />);

    expect(
      screen.queryByRole("heading", {
        name: /no payment methods found/i,
      })
    ).not.toBeInTheDocument();
  });
});
