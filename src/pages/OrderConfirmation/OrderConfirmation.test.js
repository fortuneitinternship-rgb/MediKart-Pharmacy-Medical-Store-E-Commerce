import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import OrderConfirmation from "./OrderConfirmation";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useLocation: jest.fn(),
}));

const { useLocation } = require("react-router-dom");

const mockOrder = {
  orderId: "MK123456",
  orderDate: "05 Aug 2026",
  deliveryDate: "08 Aug 2026",
  paymentMethod: "Cash on Delivery",
  address: {
    name: "John Doe",
    address: "123 Street",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500001",
    phone: "9876543210",
  },
  items: [
    {
      id: 1,
      name: "Paracetamol",
      image: "test-image.jpg",
      quantity: 2,
      price: 100,
    },
  ],
  subtotal: 200,
  discount: 20,
  gst: 18,
  total: 198,
};

describe("OrderConfirmation", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    localStorage.clear();
  });

  test("shows 'No Order Found' when order is unavailable", () => {
    useLocation.mockReturnValue({ state: null });

    render(
      <MemoryRouter>
        <OrderConfirmation />
      </MemoryRouter>
    );

    expect(screen.getByText(/No Order Found/i)).toBeInTheDocument();
  });

  test("renders order confirmation details", () => {
    useLocation.mockReturnValue({
      state: { order: mockOrder },
    });

    render(
      <MemoryRouter>
        <OrderConfirmation />
      </MemoryRouter>
    );

    expect(
      screen.getByText(/Order Placed Successfully!/i)
    ).toBeInTheDocument();

    expect(screen.getByText("MK123456")).toBeInTheDocument();
    expect(screen.getByText("05 Aug 2026")).toBeInTheDocument();
    expect(screen.getByText("08 Aug 2026")).toBeInTheDocument();
    expect(
      screen.getByText("Cash on Delivery")
    ).toBeInTheDocument();
  });

  test("renders delivery address", () => {
    useLocation.mockReturnValue({
      state: { order: mockOrder },
    });

    render(
      <MemoryRouter>
        <OrderConfirmation />
      </MemoryRouter>
    );

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("123 Street")).toBeInTheDocument();
    expect(screen.getByText(/Hyderabad/i)).toBeInTheDocument();
    expect(screen.getByText("500001")).toBeInTheDocument();
    expect(screen.getByText("9876543210")).toBeInTheDocument();
  });

  test("renders ordered item", () => {
    useLocation.mockReturnValue({
      state: { order: mockOrder },
    });

    render(
      <MemoryRouter>
        <OrderConfirmation />
      </MemoryRouter>
    );
  });

  test("renders price details", () => {
    useLocation.mockReturnValue({
      state: { order: mockOrder },
    });

    render(
      <MemoryRouter>
        <OrderConfirmation />
      </MemoryRouter>
    );

    expect(screen.getByText("₹198")).toBeInTheDocument();
    expect(screen.getByText("₹18")).toBeInTheDocument();
    expect(screen.getByText("FREE")).toBeInTheDocument();
  });

  test("Track Order button navigates to orders page", () => {
    useLocation.mockReturnValue({
      state: { order: mockOrder },
    });

    render(
      <MemoryRouter>
        <OrderConfirmation />
      </MemoryRouter>
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Track Order/i })
    );

    expect(mockNavigate).toHaveBeenCalledWith("/orders");
  });

  test("Continue Shopping button navigates to home", () => {
    useLocation.mockReturnValue({
      state: { order: mockOrder },
    });

    render(
      <MemoryRouter>
        <OrderConfirmation />
      </MemoryRouter>
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /Continue Shopping/i,
      })
    );

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  test("Go to Home button navigates to home", () => {
    useLocation.mockReturnValue({ state: null });

    render(
      <MemoryRouter>
        <OrderConfirmation />
      </MemoryRouter>
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Go to Home/i })
    );

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});