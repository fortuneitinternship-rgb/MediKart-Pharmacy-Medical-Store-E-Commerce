import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import Checkout from "./Checkout";

const mocks = vi.hoisted(() => ({
  createCheckoutOrder: vi.fn(),
  getCheckoutCart: vi.fn(),
  saveCheckoutAddress: vi.fn(),
  getApiErrorMessage: vi.fn((error, fallback) => error?.message || fallback),
  isRazorpayMode: vi.fn(),
  isValidUpiId: vi.fn((value) => /^[\w.-]+@[\w.-]+$/.test(value)),
  payForOrder: vi.fn(),
  syncOrdersFromServer: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock("../../api/checkoutApi", () => ({
  createCheckoutOrder: mocks.createCheckoutOrder,
  getCheckoutCart: mocks.getCheckoutCart,
  saveCheckoutAddress: mocks.saveCheckoutAddress,
}));

vi.mock("../../services/api", () => ({
  getApiErrorMessage: mocks.getApiErrorMessage,
}));

vi.mock("../../utils/payment", () => ({
  PAYMENT_OPTIONS: [
    ["COD", "Cash on delivery"],
    ["UPI", "UPI (GPay, PhonePe, Paytm, BHIM)"],
    ["CARD", "Credit / Debit card"],
    ["NET_BANKING", "Net banking"],
  ],
  isRazorpayMode: mocks.isRazorpayMode,
  isValidUpiId: mocks.isValidUpiId,
  payForOrder: mocks.payForOrder,
}));

vi.mock("../../utils/orders", () => ({
  syncOrdersFromServer: mocks.syncOrdersFromServer,
}));

const items = [
  {
    id: 101,
    product_id: 20,
    name: "Pulse Oximeter",
    image: "/images/pulse-oximeter.png",
    price: 999,
    quantity: 1,
  },
  {
    id: 102,
    product_id: 45,
    name: "Antiseptic Liquid",
    image: "/images/antiseptic-liquid.png",
    price: 175,
    quantity: 1,
  },
];

function renderCheckout(initialEntries = ["/checkout"]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout/:id" element={<Checkout />} />
        <Route path="/orders" element={<div>Orders page</div>} />
        <Route path="/shop" element={<div>Shop page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

async function goToPayment() {
  await screen.findByText("Pulse Oximeter");
  fireEvent.click(screen.getByRole("button", { name: "Continue to delivery" }));

  fireEvent.change(screen.getByLabelText("Full name"), {
    target: { value: "Satender Kashyap" },
  });
  fireEvent.change(screen.getByLabelText("Phone number"), {
    target: { value: "9876543210" },
  });
  fireEvent.change(screen.getByLabelText("Address"), {
    target: { value: "12 Main Road, Kukatpally" },
  });
  fireEvent.change(screen.getByLabelText("City"), {
    target: { value: "Hyderabad" },
  });
  fireEvent.change(screen.getByLabelText("State"), {
    target: { value: "Telangana" },
  });
  fireEvent.change(screen.getByLabelText("Pincode"), {
    target: { value: "500072" },
  });

  fireEvent.click(screen.getByRole("button", { name: "Continue to payment" }));
  await screen.findByText("Payment and delivery");
}

describe("Checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mocks.getCheckoutCart.mockResolvedValue(items);
    mocks.saveCheckoutAddress.mockResolvedValue({});
    mocks.isRazorpayMode.mockResolvedValue(false);
    mocks.createCheckoutOrder.mockResolvedValue({
      order_id: "MK-1001",
      total_amount: 1106.60,
    });
    mocks.payForOrder.mockResolvedValue({
      status: "Pending",
      transaction_id: "",
    });
    mocks.isValidUpiId.mockImplementation((value) =>
      /^[\w.-]+@[\w.-]+$/.test(value)
    );
  });

  it("shows a loading message while checkout data is loading", () => {
    mocks.getCheckoutCart.mockReturnValue(new Promise(() => {}));
    renderCheckout();
    expect(screen.getByRole("status")).toHaveTextContent("Loading checkout");
  });

  it("loads and displays cart products with their image URLs", async () => {
    renderCheckout();

    expect(await screen.findByText("Pulse Oximeter")).toBeInTheDocument();
    expect(screen.getByText("Antiseptic Liquid")).toBeInTheDocument();

    const image = screen.getByRole("img", { name: "Pulse Oximeter" });
    expect(image).toHaveAttribute("src", "/images/pulse-oximeter.png");
  });

  it("calculates subtotal, discount and normal delivery", async () => {
    renderCheckout();

    await screen.findByText("Pulse Oximeter");
    expect(screen.getByText("₹1174.00")).toBeInTheDocument();
    expect(screen.getByText("−₹117.40")).toBeInTheDocument();
    expect(screen.getByText("₹0.00")).toBeInTheDocument();
    expect(screen.getByText("₹1056.60")).toBeInTheDocument();
  });

  it("validates delivery address before saving it", async () => {
    renderCheckout();
    await screen.findByText("Pulse Oximeter");
    fireEvent.click(screen.getByRole("button", { name: "Continue to delivery" }));

    fireEvent.click(screen.getByRole("button", { name: "Continue to payment" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Enter your full name"
    );
    expect(mocks.saveCheckoutAddress).not.toHaveBeenCalled();
  });

  it("saves a valid address and advances to payment", async () => {
    renderCheckout();
    await goToPayment();

    await waitFor(() => {
      expect(mocks.saveCheckoutAddress).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Satender Kashyap",
          phone: "9876543210",
          city: "Hyderabad",
          state: "Telangana",
          pincode: "500072",
        })
      );
    });
    expect(screen.getByText("Payment and delivery")).toBeInTheDocument();
  });

  it("shows UPI ID input when UPI is selected", async () => {
    renderCheckout();
    await goToPayment();

    fireEvent.click(
      screen.getByRole("radio", { name: "UPI (GPay, PhonePe, Paytm, BHIM)" })
    );

    expect(screen.getByLabelText("UPI ID")).toBeInTheDocument();
  });

  it("does not create an order with an invalid UPI ID", async () => {
    renderCheckout();
    await goToPayment();

    fireEvent.click(
      screen.getByRole("radio", { name: "UPI (GPay, PhonePe, Paytm, BHIM)" })
    );
    fireEvent.change(screen.getByLabelText("UPI ID"), {
      target: { value: "not-a-valid-upi" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Place order & pay" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Enter a valid UPI ID");
    expect(mocks.createCheckoutOrder).not.toHaveBeenCalled();
  });

  it("creates an order with the selected items and address", async () => {
    renderCheckout();
    await goToPayment();

    fireEvent.click(screen.getByRole("button", { name: "Place order" }));

    await screen.findByText("Order placed successfully!");
    expect(mocks.createCheckoutOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        items: [
          { product_id: 20, quantity: 1 },
          { product_id: 45, quantity: 1 },
        ],
        payment_method: "COD",
        delivery_type: "normal",
        remove_from_cart: true,
        shipping_address: expect.objectContaining({
          name: "Satender Kashyap",
          pincode: "500072",
        }),
      })
    );
    expect(mocks.syncOrdersFromServer).toHaveBeenCalled();
  });

  it("uses Buy Now items instead of loading the cart", async () => {
    renderCheckout([
      {
        pathname: "/checkout",
        state: { buyNowItems: [items[0]] },
      },
    ]);

    expect(await screen.findByText("Pulse Oximeter")).toBeInTheDocument();
    expect(screen.queryByText("Antiseptic Liquid")).not.toBeInTheDocument();
    expect(mocks.getCheckoutCart).not.toHaveBeenCalled();
  });

  it("shows a useful message when cart loading fails", async () => {
    mocks.getCheckoutCart.mockRejectedValue(new Error("Network unavailable"));
    renderCheckout();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Network unavailable"
    );
  });
});
