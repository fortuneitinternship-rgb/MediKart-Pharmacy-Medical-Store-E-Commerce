
import React from "react";
import {
  render,
  screen,
  fireEvent,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import TrackOrder from "./TrackOrder";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const renderComponent = (path = "/track-order") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/track-order" element={<TrackOrder />} />
        <Route path="/track-order/:orderId" element={<TrackOrder />} />
      </Routes>
    </MemoryRouter>
  );

describe("TrackOrder Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    });

    jest.spyOn(window, "alert").mockImplementation(() => {});
    jest.spyOn(window, "print").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("renders the tracking page", () => {
    renderComponent();

    expect(
      screen.getByRole("heading", { name: "Track Your Order" })
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/enter order id/i)
    ).toBeInTheDocument();
  });

  test("shows an alert when the order ID is empty", () => {
    renderComponent();

    fireEvent.click(
      screen.getByRole("button", { name: /track order/i })
    );

    expect(window.alert).toHaveBeenCalledWith(
      "Please enter your Order ID"
    );
  });

  test("searches when Enter is pressed", () => {
    renderComponent();

    const input = screen.getByPlaceholderText(/enter order id/i);

    fireEvent.change(input, {
      target: { value: "MK12345" },
    });

    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(
      screen.getByRole("heading", { name: "#MK12345" })
    ).toBeInTheDocument();
  });

  test("shows demo tracking when an order ID is searched", () => {
    renderComponent();

    const input = screen.getByPlaceholderText(/enter order id/i);

    fireEvent.change(input, {
      target: { value: "MK7721605963" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /track order/i })
    );

    expect(
      screen.getByRole("heading", { name: "#MK7721605963" })
    ).toBeInTheDocument();

    expect(
      screen.getByText("Live Shipment Tracking")
    ).toBeInTheDocument();
  });

  test("loads demo tracking using Quick Track", () => {
    renderComponent();

    fireEvent.click(
      screen.getByRole("button", { name: "MK7721605963" })
    );

    expect(
      screen.getByRole("heading", { name: "#MK7721605963" })
    ).toBeInTheDocument();
  });

  test("navigates back when Back is clicked", () => {
    renderComponent();

    fireEvent.click(
      screen.getByRole("button", { name: /back/i })
    );

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test("prints the receipt", () => {
    renderComponent();

    const input = screen.getByPlaceholderText(/enter order id/i);

    fireEvent.change(input, {
      target: { value: "MK7721605963" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /track order/i })
    );

    fireEvent.click(
      screen.getByRole("button", { name: /print receipt/i })
    );

    expect(window.print).toHaveBeenCalledTimes(1);
  });

  test("displays the tracking stages", () => {
    renderComponent();

    const input = screen.getByPlaceholderText(/enter order id/i);

    fireEvent.change(input, {
      target: { value: "MK7721605963" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /track order/i })
    );

    expect(screen.getByText("Order Placed")).toBeInTheDocument();
    expect(screen.getByText("Packed")).toBeInTheDocument();
    expect(screen.getByText("Out for Delivery")).toBeInTheDocument();
    expect(screen.getByText("Delivered")).toBeInTheDocument();
  });
});
