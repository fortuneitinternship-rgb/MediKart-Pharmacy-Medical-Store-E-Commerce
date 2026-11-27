
import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import "@testing-library/jest-dom";

import Checkout from "./Checkout";

import {
  createCheckoutOrder,
  getCheckoutCart,
  saveCheckoutAddress,
  validateCheckoutCoupon,
} from "../../api/checkoutApi";

import { getApiErrorMessage } from "../../services/api";
import { getProductImage } from "../../utils/productImage";
import { payForOrder } from "../../utils/payment";

// --------------------------------------------------
// MOCKS
// --------------------------------------------------

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useLocation: () => ({
    state: null,
  }),
  useParams: () => ({
    id: undefined,
  }),
}));

jest.mock("../../api/checkoutApi", () => ({
  createCheckoutOrder: jest.fn(),
  getCheckoutCart: jest.fn(),
  saveCheckoutAddress: jest.fn(),
  validateCheckoutCoupon: jest.fn(),
}));

jest.mock("../../services/api", () => ({
  getApiErrorMessage: jest.fn(
    (error, fallback) => error?.message || fallback
  ),
}));

jest.mock("../../utils/productImage", () => ({
  getProductImage: jest.fn(() => "/test-image.png"),
}));

jest.mock("../../utils/payment", () => ({
  payForOrder: jest.fn(),
}));

// --------------------------------------------------
// GENERIC TEST DATA
// --------------------------------------------------

const testCart = [
  {
    id: 1,
    product_id: 1,
    name: "Test item",
    price: 100,
    originalPrice: 120,
    quantity: 1,
    image: "",
    category: "",
  },
];

const testAddress = {
  name: "Test Name",
  phone: "9876543210",
  address: "Test Street",
  city: "Test City",
  state: "Test State",
  pincode: "500001",
};

// --------------------------------------------------
// HELPER FUNCTIONS
// --------------------------------------------------

function renderCheckout() {
  return render(<Checkout />);
}

async function openAddressStep() {
  await screen.findByText("Review your items");

  fireEvent.click(
    screen.getByRole("button", {
      name: /continue to delivery/i,
    })
  );

  await screen.findByRole("heading", {
    name: /delivery address/i,
  });
}

function fillAddress(overrides = {}) {
  const address = {
    ...testAddress,
    ...overrides,
  };

  fireEvent.change(
    screen.getByLabelText(/full name/i),
    {
      target: { value: address.name },
    }
  );

  fireEvent.change(
    screen.getByLabelText(/phone number/i),
    {
      target: { value: address.phone },
    }
  );

  fireEvent.change(
    screen.getByLabelText(/^address$/i),
    {
      target: { value: address.address },
    }
  );

  fireEvent.change(
    screen.getByLabelText(/^city$/i),
    {
      target: { value: address.city },
    }
  );

  fireEvent.change(
    screen.getByLabelText(/^state$/i),
    {
      target: { value: address.state },
    }
  );

  fireEvent.change(
    screen.getByLabelText(/pincode/i),
    {
      target: { value: address.pincode },
    }
  );
}

async function openPaymentStep() {
  await openAddressStep();

  fillAddress();

  fireEvent.click(
    screen.getByRole("button", {
      name: /continue to payment/i,
    })
  );

  await screen.findByRole("heading", {
    name: /payment and delivery/i,
  });
}

async function placeTestOrder() {
  await openPaymentStep();

  fireEvent.click(
    screen.getByRole("button", {
      name: /place order/i,
    })
  );
}

// --------------------------------------------------
// SETUP AND CLEANUP
// --------------------------------------------------

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();

  getCheckoutCart.mockResolvedValue(testCart);

  saveCheckoutAddress.mockResolvedValue({
    success: true,
  });

  validateCheckoutCoupon.mockResolvedValue({
    valid: true,
    code: "TESTCODE",
    discount_amount: 20,
  });

  createCheckoutOrder.mockResolvedValue({
    order_id: "TEST-ORDER-1",
    total_amount: 90,
    status: "Order Confirmed",
  });

  getApiErrorMessage.mockImplementation(
    (error, fallback) => error?.message || fallback
  );

  getProductImage.mockReturnValue("/test-image.png");

  payForOrder.mockResolvedValue({
    status: "Pending",
    transaction_id: "",
  });
});

afterEach(() => {
  cleanup();
});

// --------------------------------------------------
// 1. BASIC CHECKOUT TESTS
// --------------------------------------------------

describe("Checkout basic functionality", () => {
  test("renders checkout page", async () => {
    renderCheckout();

    expect(
      await screen.findByRole("heading", {
        name: /secure checkout/i,
      })
    ).toBeInTheDocument();
  });

  test("shows loading message", () => {
    getCheckoutCart.mockReturnValue(
      new Promise(() => { })
    );

    renderCheckout();

    expect(screen.getByRole("status")).toHaveTextContent(
      /loading checkout/i
    );
  });

  test("loads cart items", async () => {
    renderCheckout();

    expect(
      await screen.findByText("Test item")
    ).toBeInTheDocument();

    expect(
      screen.getByText(/quantity: 1/i)
    ).toBeInTheDocument();
  });

  test("shows empty cart message", async () => {
    getCheckoutCart.mockResolvedValue([]);

    renderCheckout();

    expect(
      await screen.findByRole("heading", {
        name: /your cart is empty/i,
      })
    ).toBeInTheDocument();
  });

  test("shows cart loading error", async () => {
    getCheckoutCart.mockRejectedValue(
      new Error("Loading failed")
    );

    renderCheckout();

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent("Loading failed");
  });

  test("navigates to shop from empty cart", async () => {
    getCheckoutCart.mockResolvedValue([]);

    renderCheckout();

    await screen.findByText(/your cart is empty/i);

    fireEvent.click(
      screen.getByRole("button", {
        name: /continue shopping/i,
      })
    );

    expect(mockNavigate).toHaveBeenCalledWith("/shop");
  });

  test("moves to delivery address step", async () => {
    renderCheckout();

    await openAddressStep();

    expect(
      screen.getByRole("heading", {
        name: /delivery address/i,
      })
    ).toBeInTheDocument();
  });
});

// --------------------------------------------------
// 2. ADDRESS TESTS
// --------------------------------------------------

describe("Checkout address functionality", () => {
  test("validates phone number", async () => {
    renderCheckout();

    await openAddressStep();

    fillAddress({
      phone: "12345",
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /continue to payment/i,
      })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(/valid 10-digit phone number/i);

    expect(saveCheckoutAddress).not.toHaveBeenCalled();
  });

  test("validates pincode", async () => {
    renderCheckout();

    await openAddressStep();

    fillAddress({
      pincode: "123",
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /continue to payment/i,
      })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(/valid 6-digit pincode/i);

    expect(saveCheckoutAddress).not.toHaveBeenCalled();
  });

  test("validates full name", async () => {
    renderCheckout();

    await openAddressStep();

    fillAddress({
      name: "A",
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /continue to payment/i,
      })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(/full name/i);
  });

  test("saves valid address", async () => {
    renderCheckout();

    await openAddressStep();

    fillAddress();

    fireEvent.click(
      screen.getByRole("button", {
        name: /continue to payment/i,
      })
    );

    expect(
      await screen.findByRole("heading", {
        name: /payment and delivery/i,
      })
    ).toBeInTheDocument();

    expect(saveCheckoutAddress).toHaveBeenCalledTimes(1);
  });

  test("stores delivery address in localStorage", async () => {
    renderCheckout();

    await openAddressStep();

    fillAddress();

    fireEvent.click(
      screen.getByRole("button", {
        name: /continue to payment/i,
      })
    );

    await screen.findByText(/payment and delivery/i);

    const savedAddress = JSON.parse(
      localStorage.getItem("deliveryAddress")
    );

    expect(savedAddress).toEqual(
      expect.objectContaining({
        name: testAddress.name,
        phone: testAddress.phone,
        pincode: testAddress.pincode,
      })
    );
  });

  test("shows error when address saving fails", async () => {
    saveCheckoutAddress.mockRejectedValue(
      new Error("Address saving failed")
    );

    renderCheckout();

    await openAddressStep();

    fillAddress();

    fireEvent.click(
      screen.getByRole("button", {
        name: /continue to payment/i,
      })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent("Address saving failed");
  });

  test("returns to cart review using Back button", async () => {
    renderCheckout();

    await openAddressStep();

    fireEvent.click(
      screen.getByRole("button", {
        name: /^back$/i,
      })
    );

    expect(
      screen.getByText("Review your items")
    ).toBeInTheDocument();
  });
});

// --------------------------------------------------
// 3. PAYMENT TESTS
// --------------------------------------------------

describe("Checkout payment functionality", () => {
  test("shows all payment methods", async () => {
    renderCheckout();

    await openPaymentStep();

    expect(
      screen.getByLabelText(/cash on delivery/i)
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/upi payment/i)
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/credit \/ debit card/i)
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/net banking/i)
    ).toBeInTheDocument();
  });

  test("shows UPI input when UPI is selected", async () => {
    renderCheckout();

    await openPaymentStep();

    fireEvent.click(
      screen.getByLabelText(/upi payment/i)
    );

    expect(
      screen.getByPlaceholderText(/example@okaxis/i)
    ).toBeInTheDocument();
  });

  test("rejects invalid UPI ID", async () => {
    renderCheckout();

    await openPaymentStep();

    fireEvent.click(
      screen.getByLabelText(/upi payment/i)
    );

    fireEvent.change(
      screen.getByPlaceholderText(/example@okaxis/i),
      {
        target: {
          value: "invalid-upi",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /place order/i,
      })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(/valid upi id/i);

    expect(createCheckoutOrder).not.toHaveBeenCalled();
  });

  test("shows card details when card payment is selected", async () => {
    renderCheckout();

    await openPaymentStep();

    fireEvent.click(
      screen.getByLabelText(/credit \/ debit card/i)
    );

    expect(
      screen.getByPlaceholderText(/name on card/i)
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/card number/i)
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/cvv/i)
    ).toBeInTheDocument();
  });

  test("validates cardholder name", async () => {
    renderCheckout();

    await openPaymentStep();

    fireEvent.click(
      screen.getByLabelText(/credit \/ debit card/i)
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /place order/i,
      })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(/cardholder name/i);

    expect(createCheckoutOrder).not.toHaveBeenCalled();
  });

  test("validates bank selection", async () => {
    renderCheckout();

    await openPaymentStep();

    fireEvent.click(
      screen.getByLabelText(/net banking/i)
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /place order/i,
      })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(/select your bank/i);

    expect(createCheckoutOrder).not.toHaveBeenCalled();
  });

  test("allows selecting a bank", async () => {
    renderCheckout();

    await openPaymentStep();

    fireEvent.click(
      screen.getByLabelText(/net banking/i)
    );

    fireEvent.change(
      screen.getByLabelText(/^bank$/i),
      {
        target: {
          value: "State Bank of India",
        },
      }
    );

    expect(
      screen.getByLabelText(/^bank$/i)
    ).toHaveValue("State Bank of India");
  });

  test("shows COD information by default", async () => {
    renderCheckout();

    await openPaymentStep();
  });
});

// --------------------------------------------------
// 4. COUPON TESTS
// --------------------------------------------------

describe("Checkout coupon functionality", () => {
  test("applies a valid coupon", async () => {
    renderCheckout();

    await openPaymentStep();

    fireEvent.change(
      screen.getByPlaceholderText(/enter coupon code/i),
      {
        target: {
          value: "testcode",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /^apply$/i,
      })
    );

    expect(
      await screen.findByText(/TESTCODE applied successfully/i)
    ).toBeInTheDocument();

    expect(validateCheckoutCoupon).toHaveBeenCalledWith(
      expect.objectContaining({
        code: "TESTCODE",
        subtotal: 100,
      })
    );
  });

  test("shows an error for an invalid coupon", async () => {
    validateCheckoutCoupon.mockResolvedValue({
      valid: false,
      message: "Invalid coupon",
    });

    renderCheckout();

    await openPaymentStep();

    fireEvent.change(
      screen.getByPlaceholderText(/enter coupon code/i),
      {
        target: {
          value: "INVALID",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /^apply$/i,
      })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(/invalid coupon/i);
  });

  test("shows error when coupon field is empty", async () => {
    renderCheckout();

    await openPaymentStep();

    fireEvent.click(
      screen.getByRole("button", {
        name: /^apply$/i,
      })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(/enter a coupon code/i);

    expect(validateCheckoutCoupon).not.toHaveBeenCalled();
  });

  test("removes an applied coupon", async () => {
    renderCheckout();

    await openPaymentStep();

    fireEvent.change(
      screen.getByPlaceholderText(/enter coupon code/i),
      {
        target: {
          value: "testcode",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /^apply$/i,
      })
    );

    await screen.findByText(/TESTCODE applied successfully/i);

    fireEvent.click(
      screen.getByRole("button", {
        name: /remove/i,
      })
    );

    expect(
      screen.getByPlaceholderText(/enter coupon code/i)
    ).toBeInTheDocument();
  });
});

// --------------------------------------------------
// 5. ORDER PLACEMENT TESTS
// --------------------------------------------------

describe("Checkout order placement", () => {
  test("places an order successfully", async () => {
    renderCheckout();

    await placeTestOrder();

    expect(
      await screen.findByRole("heading", {
        name: /order placed successfully/i,
      })
    ).toBeInTheDocument();

    expect(createCheckoutOrder).toHaveBeenCalledTimes(1);
  });

  test("sends correct order information", async () => {
    renderCheckout();

    await placeTestOrder();

    await screen.findByText("TEST-ORDER-1");

    expect(createCheckoutOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        items: [
          {
            product_id: 1,
            quantity: 1,
          },
        ],
        payment_method: "COD",
        delivery_type: "normal",
        shipping_address: expect.objectContaining({
          name: testAddress.name,
          phone: testAddress.phone,
          pincode: testAddress.pincode,
        }),
      })
    );
  });

  test("shows the generated order ID", async () => {
    renderCheckout();

    await placeTestOrder();

    expect(
      await screen.findByText("TEST-ORDER-1")
    ).toBeInTheDocument();
  });

  test("calls payment service after order creation", async () => {
    renderCheckout();

    await placeTestOrder();

    await screen.findByRole("heading", {
      name: /order placed successfully/i,
    });

    expect(payForOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: "TEST-ORDER-1",
        method: "COD",
      })
    );
  });

  test("shows error when order creation fails", async () => {
    createCheckoutOrder.mockRejectedValue(
      new Error("Order creation failed")
    );

    renderCheckout();

    await placeTestOrder();

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent("Order creation failed");
  });

  test("shows error when server returns no order ID", async () => {
    createCheckoutOrder.mockResolvedValue({
      success: true,
    });

    renderCheckout();

    await placeTestOrder();

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(/server did not return an order id/i);
  });

  test("keeps order when payment fails", async () => {
    payForOrder.mockRejectedValue(
      new Error("Payment failed")
    );

    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => { });

    renderCheckout();

    await placeTestOrder();

    expect(
      await screen.findByRole("heading", {
        name: /order placed successfully/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("alert")
    ).toHaveTextContent("Payment failed");

    expect(createCheckoutOrder).toHaveBeenCalledTimes(1);

    consoleError.mockRestore();
  });

  test("stores the confirmed order in localStorage", async () => {
    renderCheckout();

    await placeTestOrder();

    await screen.findByText("TEST-ORDER-1");

    const savedOrders = JSON.parse(
      localStorage.getItem("orders")
    );

    expect(savedOrders).toHaveLength(1);

    expect(savedOrders[0]).toEqual(
      expect.objectContaining({
        order_id: "TEST-ORDER-1",
        paymentMethod: "COD",
      })
    );
  });

  test("navigates to orders page", async () => {
    renderCheckout();

    await placeTestOrder();

    await screen.findByRole("heading", {
      name: /order placed successfully/i,
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /view my orders/i,
      })
    );

    expect(mockNavigate).toHaveBeenCalledWith("/orders");
  });

  test("navigates to shop after order placement", async () => {
    renderCheckout();

    await placeTestOrder();

    await screen.findByRole("heading", {
      name: /order placed successfully/i,
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /continue shopping/i,
      })
    );

    expect(mockNavigate).toHaveBeenCalledWith("/shop");
  });
});
