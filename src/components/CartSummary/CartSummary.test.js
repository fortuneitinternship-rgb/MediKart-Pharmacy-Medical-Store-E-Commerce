import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CartSummary from "./CartSummary";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("CartSummary", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  const renderComponent = (props = {}) => {
    return render(
      <MemoryRouter>
        <CartSummary {...props} />
      </MemoryRouter>
    );
  };

  test("renders Order Summary", () => {
    renderComponent();

    expect(
      screen.getByRole("heading", {
        name: /order summary/i,
      })
    ).toBeInTheDocument();
  });

  test("renders total items", () => {
    renderComponent({
      totalItems: 0,
    });

    expect(
      screen.getByText("Total Items")
    ).toBeInTheDocument();
  });

  test("renders product price", () => {
    renderComponent({
      totalPrice: 0,
    });

    expect(
      screen.getByText(/product price/i)
    ).toBeInTheDocument();
  });

  test("renders delivery charge", () => {
    renderComponent();

    expect(
      screen.getByText(/delivery charge/i)
    ).toBeInTheDocument();
  });

  test("renders total amount", () => {
    renderComponent();

    expect(
      screen.getByText(/total amount/i)
    ).toBeInTheDocument();
  });

  test("renders Continue Shopping button", () => {
    renderComponent();

    expect(
      screen.getByRole("link", {
        name: /continue shopping/i,
      })
    ).toBeInTheDocument();
  });

  test("Continue Shopping links to shop page", () => {
    renderComponent();

    expect(
      screen.getByRole("link", {
        name: /continue shopping/i,
      })
    ).toHaveAttribute("href", "/shop");
  });

  test("renders Proceed to Checkout button", () => {
    renderComponent();

    expect(
      screen.getByRole("button", {
        name: /proceed to checkout/i,
      })
    ).toBeInTheDocument();
  });

  test("navigates to checkout when logged in", () => {
    localStorage.setItem("isLoggedIn", "true");

    renderComponent();

    fireEvent.click(
      screen.getByRole("button", {
        name: /proceed to checkout/i,
      })
    );

    expect(mockNavigate).toHaveBeenCalledWith(
      "/checkout"
    );
  });

  test("shows login alert when user is not logged in", () => {
    const alertMock = jest
      .spyOn(window, "alert")
      .mockImplementation(() => { });

    renderComponent();

    fireEvent.click(
      screen.getByRole("button", {
        name: /proceed to checkout/i,
      })
    );

    expect(alertMock).toHaveBeenCalledWith(
      "Please login first."
    );

    expect(mockNavigate).toHaveBeenCalledWith(
      "/login"
    );

    alertMock.mockRestore();
  });

  test("shows FREE when delivery charge is zero", () => {
    renderComponent({
      subtotal: 0,
      discount: 0,
      delivery: 0,
    });

    expect(
      screen.getByText("FREE")
    ).toBeInTheDocument();
  });

  test("does not show discount when discount is zero", () => {
    renderComponent({
      subtotal: 0,
      discount: 0,
      delivery: 0,
    });

    expect(
      screen.queryByText(/discount/i)
    ).not.toBeInTheDocument();
  });

  test("shows discount when discount is greater than zero", () => {
    renderComponent({
      subtotal: 0,
      discount: 1,
      delivery: 0,
    });

    expect(
      screen.getByText(/discount/i)
    ).toBeInTheDocument();
  });

  test("shows savings message when discount exists", () => {
    renderComponent({
      subtotal: 0,
      discount: 1,
      delivery: 0,
    });

    expect(
      screen.getByText(/you will save/i)
    ).toBeInTheDocument();
  });

  test("does not show savings message when discount is zero", () => {
    renderComponent({
      subtotal: 0,
      discount: 0,
      delivery: 0,
    });

    expect(
      screen.queryByText(/you will save/i)
    ).not.toBeInTheDocument();
  });

  test("accepts custom subtotal", () => {
    renderComponent({
      subtotal: 0,
      discount: 0,
      delivery: 0,
    });

    expect(
      screen.getByText(/product price/i)
    ).toBeInTheDocument();
  });

  test("accepts custom delivery value", () => {
    renderComponent({
      subtotal: 0,
      discount: 0,
      delivery: 0,
    });

    expect(
      screen.getByText("FREE")
    ).toBeInTheDocument();
  });

  test("renders with empty cart", () => {
    renderComponent({
      cartItems: [],
      totalItems: 0,
      totalPrice: 0,
      subtotal: 0,
      discount: 0,
      delivery: 0,
    });

    expect(
      screen.getByRole("heading", {
        name: /order summary/i,
      })
    ).toBeInTheDocument();
  });

  test("checkout button is clickable", () => {
    localStorage.setItem("isLoggedIn", "true");

    renderComponent();

    const button = screen.getByRole("button", {
      name: /proceed to checkout/i,
    });

    expect(button).toBeEnabled();

    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalled();
  });
});