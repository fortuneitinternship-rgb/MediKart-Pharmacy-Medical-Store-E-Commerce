import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Checkout from "./Checkout";
import { createCheckoutOrder, getCheckoutCart, saveCheckoutAddress } from "../../api/checkoutApi";

jest.mock("../../api/checkoutApi", () => ({
  getCheckoutCart: jest.fn(),
  saveCheckoutAddress: jest.fn(),
  createCheckoutOrder: jest.fn(),
}));
jest.mock("../../services/api", () => ({
  getApiErrorMessage: (error, fallback) => error?.response?.data?.detail || error?.message || fallback,
}));

const sampleItem = {
  id: 10,
  product_id: 10,
  name: "Vitamin C",
  price: 100,
  quantity: 2,
  image: "",
};

function renderCheckout(initialEntry = "/checkout") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout/:id" element={<Checkout />} />
        <Route path="/shop" element={<div>Shop page</div>} />
        <Route path="/orders" element={<div>Orders page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  getCheckoutCart.mockResolvedValue({ items: [sampleItem] });
  saveCheckoutAddress.mockResolvedValue({ message: "Delivery address saved." });
  createCheckoutOrder.mockResolvedValue({
    order: { id: 55, order_id: "MK-TEST-55", total_amount: 180, status: "Order Confirmed" },
  });
});

test("shows an empty-cart message when there are no items", async () => {
  getCheckoutCart.mockResolvedValue({ items: [] });
  renderCheckout();
  expect(await screen.findByText("Your cart is empty")).toBeInTheDocument();
});

test("validates address before saving it", async () => {
  renderCheckout();
  fireEvent.click(await screen.findByRole("button", { name: "Continue to delivery" }));
  fireEvent.click(screen.getByRole("button", { name: "Continue to payment" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Enter your full name");
  expect(saveCheckoutAddress).not.toHaveBeenCalled();
});

test("saves a valid address and advances to payment", async () => {
  renderCheckout();
  fireEvent.click(await screen.findByRole("button", { name: "Continue to delivery" }));
  fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "Test Customer" } });
  fireEvent.change(screen.getByLabelText("Phone number"), { target: { value: "9876543210" } });
  fireEvent.change(screen.getByLabelText("Address"), { target: { value: "12 Test Street" } });
  fireEvent.change(screen.getByLabelText("City"), { target: { value: "Hyderabad" } });
  fireEvent.change(screen.getByLabelText("State"), { target: { value: "Telangana" } });
  fireEvent.change(screen.getByLabelText("Pincode"), { target: { value: "500001" } });
  fireEvent.click(screen.getByRole("button", { name: "Continue to payment" }));
  await waitFor(() => expect(saveCheckoutAddress).toHaveBeenCalledWith(expect.objectContaining({
    name: "Test Customer", phone: "9876543210", city: "Hyderabad", pincode: "500001",
  })));
  expect(await screen.findByText("Payment and delivery")).toBeInTheDocument();
});

test("creates an order using the backend request format", async () => {
  renderCheckout();
  fireEvent.click(await screen.findByRole("button", { name: "Continue to delivery" }));
  fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "Test Customer" } });
  fireEvent.change(screen.getByLabelText("Phone number"), { target: { value: "9876543210" } });
  fireEvent.change(screen.getByLabelText("Address"), { target: { value: "12 Test Street" } });
  fireEvent.change(screen.getByLabelText("City"), { target: { value: "Hyderabad" } });
  fireEvent.change(screen.getByLabelText("State"), { target: { value: "Telangana" } });
  fireEvent.change(screen.getByLabelText("Pincode"), { target: { value: "500001" } });
  fireEvent.click(screen.getByRole("button", { name: "Continue to payment" }));
  await screen.findByText("Payment and delivery");
  fireEvent.click(screen.getByRole("button", { name: "Place order" }));

  await waitFor(() => expect(createCheckoutOrder).toHaveBeenCalledWith(expect.objectContaining({
    items: [{ product_id: 10, quantity: 2 }],
    payment_method: "COD",
    delivery_type: "normal",
    delivery_distance: "short",
    remove_from_cart: true,
    shipping_address: expect.objectContaining({ name: "Test Customer", pincode: "500001" }),
  })));
  expect(await screen.findByText("Order placed successfully!")).toBeInTheDocument();
  expect(screen.getByText("MK-TEST-55")).toBeInTheDocument();
});

test("does not submit twice while an order request is pending", async () => {
  let finishOrder;
  createCheckoutOrder.mockReturnValue(new Promise((resolve) => { finishOrder = resolve; }));
  renderCheckout();
  fireEvent.click(await screen.findByRole("button", { name: "Continue to delivery" }));
  fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "Test Customer" } });
  fireEvent.change(screen.getByLabelText("Phone number"), { target: { value: "9876543210" } });
  fireEvent.change(screen.getByLabelText("Address"), { target: { value: "12 Test Street" } });
  fireEvent.change(screen.getByLabelText("City"), { target: { value: "Hyderabad" } });
  fireEvent.change(screen.getByLabelText("State"), { target: { value: "Telangana" } });
  fireEvent.change(screen.getByLabelText("Pincode"), { target: { value: "500001" } });
  fireEvent.click(screen.getByRole("button", { name: "Continue to payment" }));
  await screen.findByText("Payment and delivery");
  fireEvent.click(screen.getByRole("button", { name: "Place order" }));
  await waitFor(() => expect(createCheckoutOrder).toHaveBeenCalledTimes(1));
  finishOrder({ order: { id: 1, order_id: "MK-1", total_amount: 180 } });
  await screen.findByText("Order placed successfully!");
});
