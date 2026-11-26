
import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";

import "@testing-library/jest-dom";

import { MemoryRouter, Route, Routes } from "react-router-dom";

import Checkout from "../Checkout";

import {
  createCheckoutOrder,
  getCheckoutCart,
  saveCheckoutAddress,
  validateCheckoutCoupon,
} from "../../../api/checkoutApi";

import { getApiErrorMessage } from "../../../services/api";
import { getProductImage } from "../../../utils/productImage";

// ============================================================
// MOCK API FUNCTIONS
// ============================================================

jest.mock("../../../api/checkoutApi", () => ({
  createCheckoutOrder: jest.fn(),
  getCheckoutCart: jest.fn(),
  saveCheckoutAddress: jest.fn(),
  validateCheckoutCoupon: jest.fn(),
}));

jest.mock("../../../services/api", () => ({
  getApiErrorMessage: jest.fn(
    (error, fallback) => error?.message || fallback
  ),
}));

jest.mock("../../../utils/productImage", () => ({
  getProductImage: jest.fn(
    (image) => image || "/test-product.jpg"
  ),
}));

// ============================================================
// MOCK PRODUCT DATA
// ============================================================

const mockProduct = {
  id: 101,
  product_id: 101,
  name: "Paracetamol 650 mg",
  brand: "MediKart",
  category: "medicines",
  image: "/images/paracetamol.jpg",
  price: 30,
  originalPrice: 40,
  quantity: 2,
};

// ============================================================
// MOCK ADDRESS
// ============================================================

const validAddress = {
  name: "Test Customer",
  phone: "9876543210",
  address: "Test Street, Hyderabad",
  city: "Hyderabad",
  state: "Telangana",
  pincode: "500001",
};

// ============================================================
// RENDER CHECKOUT
// ============================================================

function renderCheckout(initialEntries = ["/checkout"]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/checkout" element={<Checkout />} />
        <Route
          path="/checkout/:id"
          element={<Checkout />}
        />
      </Routes>
    </MemoryRouter>
  );
}

// ============================================================
// TEST SETUP
// ============================================================

beforeEach(() => {
  jest.clearAllMocks();

  localStorage.clear();

  getCheckoutCart.mockResolvedValue({
    items: [mockProduct],
  });

  saveCheckoutAddress.mockResolvedValue({
    success: true,
  });

  validateCheckoutCoupon.mockResolvedValue({
    valid: true,
    code: "SAVE10",
    discount_amount: 10,
  });

  createCheckoutOrder.mockResolvedValue({
    order: {
      order_id: "MK12345",
      total_amount: 50,
      status: "Confirmed",
    },
  });
});

// ============================================================
// CHECKOUT TESTS
// ============================================================

describe("MEDIKART CHECKOUT TESTING", () => {

  // --------------------------------------------------------
  // 1. RENDER CHECKOUT
  // --------------------------------------------------------

  test("renders checkout page", async () => {
    renderCheckout();

    expect(
      screen.getByRole("status")
    ).toHaveTextContent("Loading checkout");

    expect(
      await screen.findByText("Secure Checkout")
    ).toBeInTheDocument();
  });

  // --------------------------------------------------------
  // 2. LOAD CART PRODUCTS
  // --------------------------------------------------------

  test("loads products from checkout cart API", async () => {
    renderCheckout();

    expect(
      await screen.findByText("Paracetamol 650 mg")
    ).toBeInTheDocument();

    expect(getCheckoutCart).toHaveBeenCalledTimes(1);
  });

  // --------------------------------------------------------
  // 3. DISPLAY PRODUCT PRICE
  // --------------------------------------------------------

  test("displays product price and quantity", async () => {
    renderCheckout();

    expect(
      await screen.findByText("Paracetamol 650 mg")
    ).toBeInTheDocument();

    expect(screen.getByText("Quantity: 2")).toBeInTheDocument();
    expect(screen.getByText("₹60.00")).toBeInTheDocument();
  });

  // --------------------------------------------------------
  // 4. DISPLAY PRODUCT IMAGE
  // --------------------------------------------------------

  test("displays product image", async () => {
    renderCheckout();

    const image = await screen.findByAltText(
      "Paracetamol 650 mg"
    );

    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute(
      "src",
      "/images/paracetamol.jpg"
    );

    expect(getProductImage).toHaveBeenCalled();
  });

  // --------------------------------------------------------
  // 5. MOVE TO ADDRESS STEP
  // --------------------------------------------------------

  test("moves to delivery address step", async () => {
    renderCheckout();

    fireEvent.click(
      await screen.findByRole("button", {
        name: /continue to delivery/i,
      })
    );

    expect(
      screen.getByRole("heading", {
        name: "Delivery address",
      })
    ).toBeInTheDocument();
  });

  // --------------------------------------------------------
  // 6. VALIDATE EMPTY ADDRESS
  // --------------------------------------------------------

  test("does not continue with an empty address", async () => {
    renderCheckout();

    fireEvent.click(
      await screen.findByRole("button", {
        name: /continue to delivery/i,
      })
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /continue to payment/i,
      })
    );

    expect(
      await screen.findByText("Enter your full name.")
    ).toBeInTheDocument();

    expect(saveCheckoutAddress).not.toHaveBeenCalled();
  });

  // --------------------------------------------------------
  // 7. SAVE VALID ADDRESS
  // --------------------------------------------------------

  test("saves valid delivery address", async () => {
    renderCheckout();

    fireEvent.click(
      await screen.findByRole("button", {
        name: /continue to delivery/i,
      })
    );

    fireEvent.change(screen.getByLabelText("Full name"), {
      target: { value: validAddress.name },
    });

    fireEvent.change(screen.getByLabelText("Phone number"), {
      target: { value: validAddress.phone },
    });

    fireEvent.change(screen.getByLabelText("Address"), {
      target: { value: validAddress.address },
    });

    fireEvent.change(screen.getByLabelText("City"), {
      target: { value: validAddress.city },
    });

    fireEvent.change(screen.getByLabelText("State"), {
      target: { value: validAddress.state },
    });

    fireEvent.change(screen.getByLabelText("Pincode"), {
      target: { value: validAddress.pincode },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /continue to payment/i,
      })
    );

    await waitFor(() => {
      expect(saveCheckoutAddress).toHaveBeenCalled();
    });

    expect(
      await screen.findByText("Payment and delivery")
    ).toBeInTheDocument();

    expect(
      JSON.parse(localStorage.getItem("deliveryAddress")).phone
    ).toBe("9876543210");
  });

  // --------------------------------------------------------
  // 8. CHECK PAYMENT METHODS
  // --------------------------------------------------------

  test("displays all payment methods", async () => {
    renderCheckout();

    fireEvent.click(
      await screen.findByRole("button", {
        name: /continue to delivery/i,
      })
    );

    Object.entries(validAddress).forEach(([name, value]) => {
      const labels = {
        name: "Full name",
        phone: "Phone number",
        address: "Address",
        city: "City",
        state: "State",
        pincode: "Pincode",
      };

      fireEvent.change(
        screen.getByLabelText(labels[name]),
        { target: { value } }
      );
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /continue to payment/i,
      })
    );

    expect(
      await screen.findByText("Payment and delivery")
    ).toBeInTheDocument();

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

  // --------------------------------------------------------
  // 9. UPI PAYMENT
  // --------------------------------------------------------

  test("displays UPI input when UPI is selected", async () => {
    await goToPaymentStep();

    fireEvent.click(
      screen.getByLabelText(/upi payment/i)
    );

    expect(
      screen.getByPlaceholderText("example@okaxis")
    ).toBeInTheDocument();
  });

  // --------------------------------------------------------
  // 10. CARD PAYMENT
  // --------------------------------------------------------

  test("displays card details when card is selected", async () => {
    await goToPaymentStep();

    fireEvent.click(
      screen.getByLabelText(/credit \/ debit card/i)
    );

    expect(
      screen.getByPlaceholderText("Name on card")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Card number")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("MMYY")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("CVV")
    ).toBeInTheDocument();
  });

  // --------------------------------------------------------
  // 11. NET BANKING
  // --------------------------------------------------------

  test("displays bank selection for net banking", async () => {
    await goToPaymentStep();

    fireEvent.click(
      screen.getByLabelText(/net banking/i)
    );

    expect(
      screen.getByRole("heading", {
        name: "Select Your Bank",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", {
        name: "State Bank of India",
      })
    ).toBeInTheDocument();
  });

  // --------------------------------------------------------
  // 12. COUPON VALIDATION
  // --------------------------------------------------------

  test("applies a valid coupon", async () => {
    await goToPaymentStep();

    fireEvent.change(
      screen.getByPlaceholderText("Enter coupon code"),
      {
        target: { value: "SAVE10" },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Apply",
      })
    );

    expect(
      await screen.findByText("SAVE10 applied successfully!")
    ).toBeInTheDocument();

    expect(validateCheckoutCoupon).toHaveBeenCalled();
  });

  // --------------------------------------------------------
  // 13. INVALID COUPON
  // --------------------------------------------------------

  test("displays error for invalid coupon", async () => {
    validateCheckoutCoupon.mockResolvedValue({
      valid: false,
      message: "Invalid coupon code.",
    });

    await goToPaymentStep();

    fireEvent.change(
      screen.getByPlaceholderText("Enter coupon code"),
      {
        target: { value: "INVALID" },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Apply",
      })
    );

    expect(
      await screen.findByText("Invalid coupon code.")
    ).toBeInTheDocument();
  });

  // --------------------------------------------------------
  // 14. DELIVERY OPTIONS
  // --------------------------------------------------------

  test("displays delivery options", async () => {
    await goToPaymentStep();

    expect(
      screen.getByLabelText(/normal delivery/i)
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/express delivery/i)
    ).toBeDisabled();

    expect(
      screen.getByLabelText(/priority delivery/i)
    ).toBeDisabled();
  });

  // --------------------------------------------------------
  // 15. PLACE ORDER
  // --------------------------------------------------------

  test("places order successfully using COD", async () => {
    await goToPaymentStep();

    fireEvent.click(
      screen.getByRole("button", {
        name: /place order/i,
      })
    );

    await waitFor(() => {
      expect(createCheckoutOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          payment_method: "COD",
          items: [
            {
              product_id: 101,
              quantity: 2,
            },
          ],
        })
      );
    });

    expect(
      await screen.findByText("Order placed successfully!")
    ).toBeInTheDocument();

    expect(
      screen.getByText("MK12345")
    ).toBeInTheDocument();
  });

  // --------------------------------------------------------
  // 16. SAVE ORDER TO LOCAL STORAGE
  // --------------------------------------------------------

  test("saves successfully placed order in local storage", async () => {
    await goToPaymentStep();

    fireEvent.click(
      screen.getByRole("button", {
        name: /place order/i,
      })
    );

    await waitFor(() => {
      const orders = JSON.parse(
        localStorage.getItem("orders")
      );

      expect(orders).toHaveLength(1);
      expect(orders[0].order_id).toBe("MK12345");
      expect(orders[0].items[0].image).toBe(
        "/images/paracetamol.jpg"
      );
    });
  });

  // --------------------------------------------------------
  // 17. HANDLE ORDER API ERROR
  // --------------------------------------------------------

  test("displays error when order placement fails", async () => {
    createCheckoutOrder.mockRejectedValue(
      new Error("Server error")
    );

    await goToPaymentStep();

    fireEvent.click(
      screen.getByRole("button", {
        name: /place order/i,
      })
    );

    expect(
      await screen.findByText("Server error")
    ).toBeInTheDocument();
  });

  // --------------------------------------------------------
  // 18. EMPTY CART
  // --------------------------------------------------------

  test("displays empty cart message", async () => {
    getCheckoutCart.mockResolvedValue({
      items: [],
    });

    renderCheckout();

    expect(
      await screen.findByText("Your cart is empty")
    ).toBeInTheDocument();
  });

  // --------------------------------------------------------
  // 19. CART API ERROR
  // --------------------------------------------------------

  test("displays error when cart cannot load", async () => {
    getCheckoutCart.mockRejectedValue(
      new Error("Unable to load cart")
    );

    renderCheckout();

    expect(
      await screen.findByText("Unable to load cart")
    ).toBeInTheDocument();
  });

  // --------------------------------------------------------
  // 20. BUY NOW CHECKOUT
  // --------------------------------------------------------

  test("loads Buy Now products from route state", async () => {
    renderCheckout([
      {
        pathname: "/checkout",
        state: {
          buyNowItems: [mockProduct],
        },
      },
    ]);

    expect(
      await screen.findByText("Paracetamol 650 mg")
    ).toBeInTheDocument();

    expect(getCheckoutCart).not.toHaveBeenCalled();
  });
});

// ============================================================
// REUSABLE PAYMENT STEP HELPER
// ============================================================

async function goToPaymentStep() {
  renderCheckout();

  fireEvent.click(
    await screen.findByRole("button", {
      name: /continue to delivery/i,
    })
  );

  const fields = {
    "Full name": validAddress.name,
    "Phone number": validAddress.phone,
    "Address": validAddress.address,
    "City": validAddress.city,
    "State": validAddress.state,
    "Pincode": validAddress.pincode,
  };

  Object.entries(fields).forEach(([label, value]) => {
    fireEvent.change(screen.getByLabelText(label), {
      target: { value },
    });
  });

  fireEvent.click(
    screen.getByRole("button", {
      name: /continue to payment/i,
    })
  );

  await screen.findByText("Payment and delivery");
}
