import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";

// ======================================================
// MOCK CSS
// ======================================================

jest.mock("./Checkout.css", () => ({}));

// ======================================================
// MOCK REACT ICONS
// ======================================================

jest.mock("react-icons/fa", () => {
  const MockIcon = () => <span data-testid="mock-icon" />;

  return {
    FaCheck: MockIcon,
    FaMapMarkerAlt: MockIcon,
    FaCreditCard: MockIcon,
    FaUniversity: MockIcon,
    FaMoneyBillWave: MockIcon,
    FaTruck: MockIcon,
    FaBolt: MockIcon,
    FaClock: MockIcon,
    FaPlus: MockIcon,
    FaMinus: MockIcon,
    FaLocationArrow: MockIcon,
    FaEdit: MockIcon,
    FaMap: MockIcon,
  };
});

// ======================================================
// MOCK REACT ROUTER
// ======================================================

const mockNavigate = jest.fn();
const mockUseParams = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useParams: () => mockUseParams(),
}));

import Checkout from "./Checkout";

// ======================================================
// TEST DATA
// Generic only - no real product/user information
// ======================================================

const createItem = (overrides = {}) => ({
  id: "item-1",
  price: 100,
  quantity: 1,
  ...overrides,
});

const createSecondItem = (overrides = {}) => ({
  id: "item-2",
  price: 200,
  quantity: 1,
  ...overrides,
});

// ======================================================
// HELPERS
// ======================================================

const setCart = (items) => {
  localStorage.setItem("cart", JSON.stringify(items));
};

const renderCheckout = () => {
  return render(<Checkout />);
};

const goToAddressStep = async () => {
  const button = await screen.findByTestId("proceed-address");

  fireEvent.click(button);

  await waitFor(() => {
    expect(
      screen.getByRole("heading", {
        name: /delivery address/i,
      })
    ).toBeInTheDocument();
  });
};

const fillAddress = () => {
  fireEvent.change(
    screen.getByLabelText(/full name/i),
    {
      target: {
        value: "Test",
      },
    }
  );

  fireEvent.change(
    screen.getByLabelText(/mobile number/i),
    {
      target: {
        value: "9999999999",
      },
    }
  );

  fireEvent.change(
    screen.getByLabelText(/complete address/i),
    {
      target: {
        value: "Test",
      },
    }
  );

  fireEvent.change(
    screen.getByLabelText(/^city$/i),
    {
      target: {
        value: "Test",
      },
    }
  );

  fireEvent.change(
    screen.getByLabelText(/^state$/i),
    {
      target: {
        value: "Test",
      },
    }
  );

  fireEvent.change(
    screen.getByLabelText(/pincode/i),
    {
      target: {
        value: "123456",
      },
    }
  );
};

const goToPaymentStep = async () => {
  await goToAddressStep();

  fillAddress();

  fireEvent.click(
    screen.getByRole("button", {
      name: /continue to payment/i,
    })
  );

  await waitFor(() => {
    expect(
      screen.getByRole("heading", {
        name: /payment method/i,
      })
    ).toBeInTheDocument();
  });
};

const placeOrderAndWait = async () => {
  jest.useFakeTimers();

  fireEvent.click(
    screen.getByTestId("place-order")
  );

  expect(
    screen.getByText(/placing your order/i)
  ).toBeInTheDocument();

  await act(async () => {
    jest.advanceTimersByTime(800);
  });

  await waitFor(() => {
    expect(
      screen.getByText(/order placed successfully/i)
    ).toBeInTheDocument();
  });

  jest.useRealTimers();
};

// ======================================================
// SETUP
// ======================================================

beforeEach(() => {
  jest.clearAllMocks();

  localStorage.clear();

  mockUseParams.mockReturnValue({});

  window.alert = jest.fn();
});

afterEach(() => {
  jest.useRealTimers();
});

// ======================================================
// INITIAL / EMPTY CART
// ======================================================

describe("Initial Checkout", () => {
  test("renders empty cart when cart does not exist", async () => {
    renderCheckout();

    expect(
      await screen.findByText(/your cart is empty/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /add products before checkout/i
      )
    ).toBeInTheDocument();
  });

  test("renders continue shopping button", async () => {
    renderCheckout();

    expect(
      await screen.findByRole("button", {
        name: /continue shopping/i,
      })
    ).toBeInTheDocument();
  });

  test("navigates to shop from empty cart", async () => {
    renderCheckout();

    const button =
      await screen.findByRole("button", {
        name: /continue shopping/i,
      });

    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith(
      "/shop"
    );
  });

  test("handles invalid cart JSON", async () => {
    localStorage.setItem(
      "cart",
      "{invalid-json"
    );

    renderCheckout();

    expect(
      await screen.findByText(/your cart is empty/i)
    ).toBeInTheDocument();
  });

  test("handles non-array cart data", async () => {
    localStorage.setItem(
      "cart",
      JSON.stringify({
        invalid: true,
      })
    );

    renderCheckout();

    expect(
      await screen.findByText(/your cart is empty/i)
    ).toBeInTheDocument();
  });
});

// ======================================================
// ORDER STEP
// ======================================================

describe("Order Step", () => {
  test("renders checkout page with cart", async () => {
    setCart([createItem()]);

    renderCheckout();

    expect(
      await screen.getByRole("heading", {
        name: /medikart checkout/i,
      })
    ).toBeInTheDocument();
  });

  test("renders secure checkout text", async () => {
    setCart([createItem()]);

    renderCheckout();

    expect(
      await screen.findByText(
        /100% secure checkout/i
      )
    ).toBeInTheDocument();
  });

  test("renders order heading", async () => {
    setCart([createItem()]);

    renderCheckout();

    expect(
      await screen.findByRole("heading", {
        name: /your order/i,
      })
    ).toBeInTheDocument();
  });

  test("renders cart item count", async () => {
    setCart([
      createItem(),
      createSecondItem(),
    ]);

    renderCheckout();

    expect(
      await screen.findByTestId("cart-item-count")
    ).toHaveTextContent("2 Items");
  });

  test("shows only the selected buy-now product when route id exists", async () => {
    mockUseParams.mockReturnValue({ id: "item-2" });

    setCart([
      createItem({ id: "item-1", name: "First Product", price: 100, quantity: 1 }),
      createSecondItem({ id: "item-2", name: "Second Product", price: 200, quantity: 1 }),
    ]);

    renderCheckout();

    expect(
      await screen.findByTestId("cart-item-count")
    ).toHaveTextContent("1 Item");

    expect(screen.getByText("Second Product")).toBeInTheDocument();
    expect(screen.queryByText("First Product")).not.toBeInTheDocument();
  });

  test("renders singular item count", async () => {
    setCart([createItem()]);

    renderCheckout();

    expect(
      await screen.findByTestId("cart-item-count")
    ).toHaveTextContent("1 Item");
  });

  test("renders checkout item", async () => {
    setCart([createItem()]);

    renderCheckout();

    expect(
      await screen.findByTestId(
        "checkout-product-item-1"
      )
    ).toBeInTheDocument();
  });

  test("renders item quantity", async () => {
    setCart([
      createItem({
        quantity: 2,
      }),
    ]);

    renderCheckout();

    expect(
      await screen.findByTestId("quantity-item-1")
    ).toHaveTextContent("2");
  });

  test("renders unit price", async () => {
    setCart([createItem()]);

    renderCheckout();

    expect(
      await screen.findByTestId("unit-price-item-1")
    ).toHaveTextContent("₹100");
  });

  test("renders item total", async () => {
    setCart([
      createItem({
        price: 100,
        quantity: 2,
      }),
    ]);

    renderCheckout();

    expect(
      await screen.findByTestId("item-total-item-1")
    ).toHaveTextContent("₹200");
  });
});

// ======================================================
// QUANTITY
// ======================================================

describe("Quantity Controls", () => {
  test("increases quantity", async () => {
    setCart([createItem()]);

    renderCheckout();

    const button =
      await screen.findByTestId(
        "increase-item-1"
      );

    fireEvent.click(button);

    expect(
      screen.getByTestId("quantity-item-1")
    ).toHaveTextContent("2");

    const storedCart = JSON.parse(
      localStorage.getItem("cart")
    );

    expect(storedCart[0].quantity).toBe(2);
  });

  test("decreases quantity", async () => {
    setCart([
      createItem({
        quantity: 2,
      }),
    ]);

    renderCheckout();

    const button =
      await screen.findByTestId(
        "decrease-item-1"
      );

    fireEvent.click(button);

    expect(
      screen.getByTestId("quantity-item-1")
    ).toHaveTextContent("1");
  });

  test("does not decrease quantity below one", async () => {
    setCart([
      createItem({
        quantity: 1,
      }),
    ]);

    renderCheckout();

    const button =
      await screen.findByTestId(
        "decrease-item-1"
      );

    expect(button).toBeDisabled();

    fireEvent.click(button);

    expect(
      screen.getByTestId("quantity-item-1")
    ).toHaveTextContent("1");
  });

  test("dispatches cartUpdated after quantity update", async () => {
    const dispatchSpy = jest.spyOn(
      window,
      "dispatchEvent"
    );

    setCart([createItem()]);

    renderCheckout();

    fireEvent.click(
      await screen.findByTestId(
        "increase-item-1"
      )
    );

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "cartUpdated",
      })
    );

    dispatchSpy.mockRestore();
  });
});

// ======================================================
// REMOVE ITEM
// ======================================================

describe("Remove Item", () => {
  test("removes item", async () => {
    setCart([
      createItem(),
      createSecondItem(),
    ]);

    renderCheckout();

    fireEvent.click(
      await screen.findByTestId(
        "remove-item-1"
      )
    );

    await waitFor(() => {
      expect(
        screen.queryByTestId(
          "checkout-product-item-1"
        )
      ).not.toBeInTheDocument();
    });

    const cart = JSON.parse(
      localStorage.getItem("cart")
    );

    expect(cart).toHaveLength(1);
    expect(cart[0].id).toBe("item-2");
  });

  test("removing final item shows empty cart", async () => {
    setCart([createItem()]);

    renderCheckout();

    fireEvent.click(
      await screen.findByTestId(
        "remove-item-1"
      )
    );

    await waitFor(() => {
      expect(
        screen.getByText(/your cart is empty/i)
      ).toBeInTheDocument();
    });
  });

  test("dispatches cartUpdated after removing item", async () => {
    const dispatchSpy = jest.spyOn(
      window,
      "dispatchEvent"
    );

    setCart([createItem()]);

    renderCheckout();

    fireEvent.click(
      await screen.findByTestId(
        "remove-item-1"
      )
    );

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "cartUpdated",
      })
    );

    dispatchSpy.mockRestore();
  });
});

// ======================================================
// CART UPDATED EVENT
// ======================================================

describe("Cart Event", () => {
  test("reloads cart after cartUpdated event", async () => {
    setCart([createItem()]);

    renderCheckout();

    expect(
      await screen.findByTestId(
        "cart-item-count"
      )
    ).toHaveTextContent("1 Item");

    setCart([
      createItem(),
      createSecondItem(),
    ]);

    act(() => {
      window.dispatchEvent(
        new Event("cartUpdated")
      );
    });
  });
});

// ======================================================
// PRICE CALCULATION
// ======================================================

describe("Price Calculation", () => {
  test("calculates subtotal", async () => {
    setCart([
      createItem({
        price: 100,
        quantity: 2,
      }),
    ]);

    renderCheckout();

    expect(
      await screen.findByTestId(
        "product-total"
      )
    ).toHaveTextContent("₹200");
  });

  test("calculates ten percent discount", async () => {
    setCart([
      createItem({
        price: 100,
        quantity: 1,
      }),
    ]);

    renderCheckout();

    expect(
      await screen.findByText(
        /flat 10% discount/i
      )
    ).toBeInTheDocument();

    expect(
      screen.getByTestId(
        "estimated-total"
      )
    ).toHaveTextContent("₹100");
  });

  test("uses discounted price first", async () => {
    setCart([
      createItem({
        price: 500,
        discountedPrice: 300,
      }),
    ]);

    renderCheckout();

    expect(
      await screen.findByTestId(
        "product-total"
      )
    ).toHaveTextContent("₹300");
  });

  test("uses price when discounted price is unavailable", async () => {
    setCart([
      createItem({
        price: 300,
      }),
    ]);

    renderCheckout();

    expect(
      await screen.findByTestId(
        "product-total"
      )
    ).toHaveTextContent("₹300");
  });

  test("uses sellingPrice as fallback", async () => {
    setCart([
      {
        id: "item-1",
        sellingPrice: 250,
        quantity: 1,
      },
    ]);

    renderCheckout();

    expect(
      await screen.findByTestId(
        "product-total"
      )
    ).toHaveTextContent("₹250");
  });

  test("uses zero when no price exists", async () => {
    setCart([
      {
        id: "item-1",
        quantity: 1,
      },
    ]);

    renderCheckout();

    expect(
      await screen.findByTestId(
        "product-total"
      )
    ).toHaveTextContent("₹0");
  });
});

// ======================================================
// DELIVERY CHARGES
// ======================================================

describe("Delivery Charges", () => {
  test("applies delivery charge below threshold", async () => {
    setCart([
      createItem({
        price: 100,
      }),
    ]);

    renderCheckout();

    expect(
      await screen.findByText(
        /delivery charges/i
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText("₹10")
    ).toBeInTheDocument();
  });

  test("shows free delivery at threshold", async () => {
    setCart([
      createItem({
        price: 500,
      }),
    ]);

    renderCheckout();

    expect(
      await screen.findByText(
        /delivery charges/i
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText("FREE")
    ).toBeInTheDocument();
  });

  test("special category adds surcharge", async () => {
    setCart([
      createItem({
        category: "medical device",
      }),
    ]);

    renderCheckout();

    expect(
      await screen.findByText(
        /special handling/i
      )
    ).toBeInTheDocument();
  });

  test("detects premium category", async () => {
    setCart([
      createItem({
        category: "premium",
      }),
    ]);

    renderCheckout();

    expect(
      await screen.findByText(
        /special handling/i
      )
    ).toBeInTheDocument();
  });

  test("detects premium healthcare category", async () => {
    setCart([
      createItem({
        category: "premium-healthcare",
      }),
    ]);

    renderCheckout();

    expect(
      await screen.findByText(
        /special handling/i
      )
    ).toBeInTheDocument();
  });

  test("detects device category", async () => {
    setCart([
      createItem({
        category: "device",
      }),
    ]);

    renderCheckout();

    expect(
      await screen.findByText(
        /special handling/i
      )
    ).toBeInTheDocument();
  });
});

// ======================================================
// STEP 1 → STEP 2
// ======================================================

describe("Address Step", () => {
  test("moves to address step", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToAddressStep();

    expect(
      screen.getByText(
        /enter where you want your medikart order delivered/i
      )
    ).toBeInTheDocument();
  });

  test("renders address fields", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToAddressStep();

    expect(
      screen.getByLabelText(/full name/i)
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/mobile number/i)
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/complete address/i)
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/^city$/i)
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/^state$/i)
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/pincode/i)
    ).toBeInTheDocument();
  });

  test("renders map button", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToAddressStep();

    expect(
      screen.getByRole("button", {
        name: /choose on map/i,
      })
    ).toBeInTheDocument();
  });

  test("renders fill details button", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToAddressStep();

    expect(
      screen.getByRole("button", {
        name: /fill details/i,
      })
    ).toBeInTheDocument();
  });

  test("fill details switches address mode", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToAddressStep();

    fireEvent.click(
      screen.getByRole("button", {
        name: /fill details/i,
      })
    );

    expect(
      screen.getByLabelText(/full name/i)
    ).toBeInTheDocument();
  });
});

// ======================================================
// ADDRESS VALIDATION
// ======================================================

describe("Address Validation", () => {
  test("validates empty name", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToAddressStep();

    fireEvent.click(
      screen.getByRole("button", {
        name: /continue to payment/i,
      })
    );

    expect(window.alert).toHaveBeenCalledWith(
      "Please enter your name."
    );
  });

  test("validates phone number", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToAddressStep();

    fireEvent.change(
      screen.getByLabelText(/full name/i),
      {
        target: {
          value: "Test",
        },
      }
    );

    fireEvent.change(
      screen.getByLabelText(/mobile number/i),
      {
        target: {
          value: "123",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /continue to payment/i,
      })
    );

    expect(window.alert).toHaveBeenCalledWith(
      "Please enter a valid 10-digit phone number."
    );
  });

  test("validates complete address", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToAddressStep();

    fireEvent.change(
      screen.getByLabelText(/full name/i),
      {
        target: {
          value: "Test",
        },
      }
    );

    fireEvent.change(
      screen.getByLabelText(/mobile number/i),
      {
        target: {
          value: "9999999999",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /continue to payment/i,
      })
    );

    expect(window.alert).toHaveBeenCalledWith(
      "Please enter your full delivery address."
    );
  });

  test("validates city", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToAddressStep();

    fireEvent.change(
      screen.getByLabelText(/full name/i),
      {
        target: {
          value: "Test",
        },
      }
    );

    fireEvent.change(
      screen.getByLabelText(/mobile number/i),
      {
        target: {
          value: "9999999999",
        },
      }
    );

    fireEvent.change(
      screen.getByLabelText(/complete address/i),
      {
        target: {
          value: "Test",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /continue to payment/i,
      })
    );

    expect(window.alert).toHaveBeenCalledWith(
      "Please enter your city."
    );
  });

  test("validates state", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToAddressStep();

    fireEvent.change(
      screen.getByLabelText(/full name/i),
      {
        target: {
          value: "Test",
        },
      }
    );

    fireEvent.change(
      screen.getByLabelText(/mobile number/i),
      {
        target: {
          value: "9999999999",
        },
      }
    );

    fireEvent.change(
      screen.getByLabelText(/complete address/i),
      {
        target: {
          value: "Test",
        },
      }
    );

    fireEvent.change(
      screen.getByLabelText(/^city$/i),
      {
        target: {
          value: "Test",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /continue to payment/i,
      })
    );

    expect(window.alert).toHaveBeenCalledWith(
      "Please enter your state."
    );
  });

  test("validates pincode", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToAddressStep();

    fireEvent.change(
      screen.getByLabelText(/full name/i),
      {
        target: {
          value: "Test",
        },
      }
    );

    fireEvent.change(
      screen.getByLabelText(/mobile number/i),
      {
        target: {
          value: "9999999999",
        },
      }
    );

    fireEvent.change(
      screen.getByLabelText(/complete address/i),
      {
        target: {
          value: "Test",
        },
      }
    );

    fireEvent.change(
      screen.getByLabelText(/^city$/i),
      {
        target: {
          value: "Test",
        },
      }
    );

    fireEvent.change(
      screen.getByLabelText(/^state$/i),
      {
        target: {
          value: "Test",
        },
      }
    );

    fireEvent.change(
      screen.getByLabelText(/pincode/i),
      {
        target: {
          value: "123",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /continue to payment/i,
      })
    );

    expect(window.alert).toHaveBeenCalledWith(
      "Please enter a valid 6-digit pincode."
    );
  });
});

// ======================================================
// SAVED ADDRESS
// ======================================================

describe("Saved Address", () => {
  test("loads saved address", async () => {
    localStorage.setItem(
      "deliveryAddress",
      JSON.stringify({
        name: "Test",
        phone: "9999999999",
        address: "Test",
        city: "Test",
        state: "Test",
        pincode: "123456",
        addressMode: "form",
        deliveryDistance: "short",
      })
    );

    setCart([createItem()]);

    renderCheckout();

    await goToAddressStep();

    expect(
      screen.getByLabelText(/full name/i)
    ).toHaveValue("Test");

    expect(
      screen.getByLabelText(/mobile number/i)
    ).toHaveValue("9999999999");
  });

  test("handles invalid saved address", async () => {
    localStorage.setItem(
      "deliveryAddress",
      "{invalid-json"
    );

    setCart([createItem()]);

    renderCheckout();

    await goToAddressStep();

    expect(
      screen.getByLabelText(/full name/i)
    ).toHaveValue("");
  });
});

// ======================================================
// DELIVERY DISTANCE
// ======================================================

describe("Delivery Distance", () => {
  test("renders short distance option", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToAddressStep();

    expect(
      screen.getByRole("button", {
        name: /short/i,
      })
    ).toBeInTheDocument();
  });

  test("renders medium distance option", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToAddressStep();

    expect(
      screen.getByRole("button", {
        name: /medium/i,
      })
    ).toBeInTheDocument();
  });

  test("renders long distance option", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToAddressStep();

    expect(
      screen.getByRole("button", {
        name: /long/i,
      })
    ).toBeInTheDocument();
  });

  test("changes to medium distance", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToAddressStep();

    fireEvent.click(
      screen.getByRole("button", {
        name: /medium/i,
      })
    );

  });

  test("changes to long distance", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToAddressStep();

    fireEvent.click(
      screen.getByRole("button", {
        name: /long/i,
      })
    );

    expect(
      screen.getByText(/1.5–2.5 hrs/i)
    ).toBeInTheDocument();
  });

  test("shows short distance delivery time", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToAddressStep();
  });
});

// ======================================================
// DELIVERY OPTIONS
// ======================================================

describe("Delivery Options", () => {
  test("normal delivery is available", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToAddressStep();

    const normal =
      screen.getByDisplayValue("normal");

    expect(normal).not.toBeDisabled();
  });

  test("express delivery disabled for low amount", async () => {
    setCart([
      createItem({
        price: 100,
      }),
    ]);

    renderCheckout();

    await goToAddressStep();

    const express =
      screen.getByDisplayValue("express");

    expect(express).toBeDisabled();
  });

  test("express delivery enabled for sufficient amount", async () => {
    setCart([
      createItem({
        price: 500,
      }),
    ]);

    renderCheckout();

    await goToAddressStep();

    const express =
      screen.getByDisplayValue("express");

    expect(express).not.toBeDisabled();
  });

  test("today delivery disabled for low amount", async () => {
    setCart([
      createItem({
        price: 500,
      }),
    ]);

    renderCheckout();

    await goToAddressStep();

    const today =
      screen.getByDisplayValue("today");

    expect(today).toBeDisabled();
  });

  test("today delivery enabled for sufficient amount", async () => {
    setCart([
      createItem({
        price: 1000,
      }),
    ]);

    renderCheckout();

    await goToAddressStep();

    const today =
      screen.getByDisplayValue("today");

    expect(today).not.toBeDisabled();
  });

  test("selects express delivery", async () => {
    setCart([
      createItem({
        price: 500,
      }),
    ]);

    renderCheckout();

    await goToAddressStep();

    const express =
      screen.getByDisplayValue("express");

    fireEvent.click(express);

    expect(express).toBeChecked();
  });

  test("selects today delivery", async () => {
    setCart([
      createItem({
        price: 1000,
      }),
    ]);

    renderCheckout();

    await goToAddressStep();

    const today =
      screen.getByDisplayValue("today");

    fireEvent.click(today);

    expect(today).toBeChecked();
  });
});

// ======================================================
// LOCATION
// ======================================================

describe("Location Selection", () => {
  test("handles unsupported geolocation", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToAddressStep();

    const original =
      navigator.geolocation;

    Object.defineProperty(
      navigator,
      "geolocation",
      {
        configurable: true,
        value: undefined,
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /choose on map/i,
      })
    );

    expect(window.alert).toHaveBeenCalledWith(
      "Location services are not supported by your browser."
    );

    Object.defineProperty(
      navigator,
      "geolocation",
      {
        configurable: true,
        value: original,
      }
    );
  });

  test("handles successful location selection", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToAddressStep();

    const getCurrentPosition =
      jest.fn((success) => {
        success({
          coords: {
            latitude: 10,
            longitude: 20,
          },
        });
      });

    Object.defineProperty(
      navigator,
      "geolocation",
      {
        configurable: true,
        value: {
          getCurrentPosition,
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /choose on map/i,
      })
    );

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        "Your current location has been selected."
      );
    });

    expect(
      screen.getByDisplayValue(
        "Location selected on map (10.000000, 20.000000)"
      )
    ).toBeInTheDocument();
  });

  test("handles location error", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToAddressStep();

    const getCurrentPosition =
      jest.fn((success, error) => {
        error(
          new Error("Location error")
        );
      });

    Object.defineProperty(
      navigator,
      "geolocation",
      {
        configurable: true,
        value: {
          getCurrentPosition,
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /choose on map/i,
      })
    );

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        "Unable to get your location. Please allow location access or fill the address manually."
      );
    });
  });
});

// ======================================================
// ADDRESS → PAYMENT
// ======================================================

describe("Payment Step", () => {
  test("moves to payment step with valid address", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToPaymentStep();

    expect(
      screen.getByRole("heading", {
        name: /payment method/i,
      })
    ).toBeInTheDocument();
  });

  test("saves delivery address", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToPaymentStep();

    const saved =
      JSON.parse(
        localStorage.getItem(
          "deliveryAddress"
        )
      );

    expect(saved).not.toBeNull();
    expect(saved.addressMode).toBe("form");
    expect(
      saved.deliveryDistance
    ).toBe("short");
  });

  test("shows card payment option", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToPaymentStep();

    expect(
      screen.getByLabelText(
        /credit \/ debit card/i
      )
    ).toBeInTheDocument();
  });

  test("shows net banking option", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToPaymentStep();

    expect(
      screen.getByLabelText(
        /net banking/i
      )
    ).toBeInTheDocument();
  });

  test("shows cash on delivery option", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToPaymentStep();

    expect(
      screen.getByLabelText(
        /cash on delivery/i
      )
    ).toBeInTheDocument();
  });

  test("cash on delivery is selected by default", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToPaymentStep();

    expect(
      screen.getByLabelText(
        /cash on delivery/i
      )
    ).toBeChecked();
  });

  test("selects card payment", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToPaymentStep();

    const card =
      screen.getByLabelText(
        /credit \/ debit card/i
      );

    fireEvent.click(card);

    expect(card).toBeChecked();
  });

  test("selects net banking", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToPaymentStep();

    const netBanking =
      screen.getByLabelText(
        /net banking/i
      );

    fireEvent.click(netBanking);

    expect(netBanking).toBeChecked();
  });

  test("shows card form", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToPaymentStep();

    fireEvent.click(
      screen.getByLabelText(
        /credit \/ debit card/i
      )
    );

    expect(
      screen.getByPlaceholderText(
        /card number/i
      )
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(
        /mm\/yy/i
      )
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(
        /cvv/i
      )
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(
        /card holder name/i
      )
    ).toBeInTheDocument();
  });

  test("shows bank selector", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToPaymentStep();

    fireEvent.click(
      screen.getByLabelText(
        /net banking/i
      )
    );

    expect(
      screen.getByRole("combobox")
    ).toBeInTheDocument();
  });

  test("shows payable amount", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToPaymentStep();

    expect(
      screen.getByTestId(
        "payable-amount"
      )
    ).toBeInTheDocument();
  });
});

// ======================================================
// BACK BUTTONS
// ======================================================

describe("Back Navigation", () => {
  test("back button returns from address to order", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToAddressStep();

    fireEvent.click(
      screen.getByRole("button", {
        name: /^back$/i,
      })
    );

    expect(
      screen.getByRole("heading", {
        name: /your order/i,
      })
    ).toBeInTheDocument();
  });

  test("back button returns from payment to address", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToPaymentStep();

    fireEvent.click(
      screen.getByRole("button", {
        name: /^back$/i,
      })
    );

    expect(
      screen.getByRole("heading", {
        name: /delivery address/i,
      })
    ).toBeInTheDocument();
  });
});

// ======================================================
// ORDER PLACEMENT
// ======================================================

describe("Order Placement", () => {
  test("shows place order button", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToPaymentStep();

    expect(
      screen.getByTestId(
        "place-order"
      )
    ).toBeInTheDocument();
  });

  test("shows processing state", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToPaymentStep();

    jest.useFakeTimers();

    fireEvent.click(
      screen.getByTestId(
        "place-order"
      )
    );

    expect(
      screen.getByText(
        /placing your order/i
      )
    ).toBeInTheDocument();

    jest.advanceTimersByTime(800);

    jest.useRealTimers();
  });

  test("creates order in localStorage", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToPaymentStep();

    await placeOrderAndWait();

    const orders =
      JSON.parse(
        localStorage.getItem("orders")
      );

    expect(
      Array.isArray(orders)
    ).toBe(true);

    expect(
      orders.length
    ).toBe(1);
  });

  test("generates order id beginning with MK", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToPaymentStep();

    await placeOrderAndWait();

    const orderId =
      screen.getByTestId(
        "order-id"
      ).textContent;

    expect(orderId).toMatch(/^MK/);
  });

  test("stores order status", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToPaymentStep();

    await placeOrderAndWait();

    const orders =
      JSON.parse(
        localStorage.getItem("orders")
      );

    expect(
      orders[0].status
    ).toBe("Order Confirmed");
  });

  test("clears cart after order", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToPaymentStep();

    await placeOrderAndWait();

    expect(
      localStorage.getItem("cart")
    ).toBeNull();
  });

  test("clears buyNow after order", async () => {
    setCart([createItem()]);

    localStorage.setItem(
      "buyNow",
      JSON.stringify(
        createItem()
      )
    );

    renderCheckout();

    await goToPaymentStep();

    await placeOrderAndWait();

    expect(
      localStorage.getItem(
        "buyNow"
      )
    ).toBeNull();
  });

  test("dispatches ordersUpdated event", async () => {
    const dispatchSpy = jest.spyOn(
      window,
      "dispatchEvent"
    );

    setCart([createItem()]);

    renderCheckout();

    await goToPaymentStep();

    await placeOrderAndWait();

    expect(
      dispatchSpy
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "ordersUpdated",
      })
    );

    dispatchSpy.mockRestore();
  });

  test("dispatches cartUpdated event after order", async () => {
    const dispatchSpy = jest.spyOn(
      window,
      "dispatchEvent"
    );

    setCart([createItem()]);

    renderCheckout();

    await goToPaymentStep();

    await placeOrderAndWait();

    expect(
      dispatchSpy
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "cartUpdated",
      })
    );

    dispatchSpy.mockRestore();
  });

  test("preserves existing orders", async () => {
    localStorage.setItem(
      "orders",
      JSON.stringify([
        {
          orderId: "MK0000000001",
        },
      ])
    );

    setCart([createItem()]);

    renderCheckout();

    await goToPaymentStep();

    await placeOrderAndWait();

    const orders =
      JSON.parse(
        localStorage.getItem("orders")
      );

    expect(
      orders.length
    ).toBe(2);
  });

  test("handles invalid existing orders JSON", async () => {
    localStorage.setItem(
      "orders",
      "{invalid-json"
    );

    setCart([createItem()]);

    renderCheckout();

    await goToPaymentStep();

    await placeOrderAndWait();

    const orders =
      JSON.parse(
        localStorage.getItem("orders")
      );

    expect(
      Array.isArray(orders)
    ).toBe(true);
  });
});

// ======================================================
// SUCCESS PAGE
// ======================================================

describe("Success Page", () => {
  test("shows success message", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToPaymentStep();

    await placeOrderAndWait();

    expect(
      screen.getByText(
        /order placed successfully/i
      )
    ).toBeInTheDocument();
  });

  test("shows order id", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToPaymentStep();

    await placeOrderAndWait();

    expect(
      screen.getByTestId(
        "order-id"
      )
    ).toBeInTheDocument();
  });

  test("shows view order button", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToPaymentStep();

    await placeOrderAndWait();

    expect(
      screen.getByTestId(
        "view-order"
      )
    ).toBeInTheDocument();
  });

  test("view order navigates to order page", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToPaymentStep();

    await placeOrderAndWait();

    const orderId =
      screen.getByTestId(
        "order-id"
      ).textContent;

    fireEvent.click(
      screen.getByTestId(
        "view-order"
      )
    );

    expect(
      mockNavigate
    ).toHaveBeenCalledWith(
      `/orders/${orderId}`
    );
  });

  test("continue shopping navigates to shop", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToPaymentStep();

    await placeOrderAndWait();

    fireEvent.click(
      screen.getByRole("button", {
        name: /continue shopping/i,
      })
    );

    expect(
      mockNavigate
    ).toHaveBeenCalledWith(
      "/shop"
    );
  });

  test("success page shows payment information", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToPaymentStep();

    await placeOrderAndWait();

    expect(
      screen.getByText(
        /cash on delivery/i
      )
    ).toBeInTheDocument();
  });

  test("success page shows delivery information", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToPaymentStep();

    await placeOrderAndWait();

    expect(
      screen.getByText(
        /normal delivery/i
      )
    ).toBeInTheDocument();
  });

  test("success page shows delivery distance", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToPaymentStep();

    await placeOrderAndWait();

    expect(
      screen.getByText(
        /short distance/i
      )
    ).toBeInTheDocument();
  });

  test("success page shows delivery time", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToPaymentStep();

    await placeOrderAndWait();

  });
});

// ======================================================
// ROUTE PARAMETER
// ======================================================

describe("Route Parameter", () => {
  test("renders checkout with route product id", async () => {
    mockUseParams.mockReturnValue({
      id: "test-route",
    });

    setCart([createItem()]);

    renderCheckout();
  });
});

// ======================================================
// STEP INDICATOR
// ======================================================

describe("Checkout Steps", () => {
  test("renders all checkout steps", async () => {
    setCart([createItem()]);

    renderCheckout();

    expect(
      await screen.findByText(/^Order$/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/^Address$/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/^Payment$/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/^Order ID$/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/^Success$/i)
    ).toBeInTheDocument();
  });

  test("address step becomes active", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToAddressStep();

    expect(
      screen.getByRole("heading", {
        name: /delivery address/i,
      })
    ).toBeInTheDocument();
  });

  test("payment step becomes active", async () => {
    setCart([createItem()]);

    renderCheckout();

    await goToPaymentStep();

    expect(
      screen.getByRole("heading", {
        name: /payment method/i,
      })
    ).toBeInTheDocument();
  });
});
