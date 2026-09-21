import React from "react";
import {
  render,
  screen,
  fireEvent,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";

import Cart from "./Cart";

// Mock CSS module
jest.mock("./Cart.module.css", () => ({
  cartPage: "cartPage",
  cartHeader: "cartHeader",
  itemCount: "itemCount",
  cartContainer: "cartContainer",
  leftSection: "leftSection",
  rightSection: "rightSection",
}));

// Mock image
jest.mock("../../assets/empty-cart.png", () => "empty-cart.png");

// Mock CartItem
jest.mock("../../components/CartItem/CartItem", () => {
  return function MockCartItem({
    item,
    onIncrease,
    onDecrease,
    onRemove,
  }) {
    return (
      <div data-testid={`cart-item-${item.id}`}>
        <span data-testid={`item-id-${item.id}`}>{item.id}</span>

        <span data-testid={`item-quantity-${item.id}`}>
          {item.quantity || 1}
        </span>

        <button
          type="button"
          data-testid={`increase-${item.id}`}
          onClick={() => onIncrease(item.id)}
        >
          Increase
        </button>

        <button
          type="button"
          data-testid={`decrease-${item.id}`}
          onClick={() => onDecrease(item.id)}
        >
          Decrease
        </button>

        <button
          type="button"
          data-testid={`remove-${item.id}`}
          onClick={() => onRemove(item.id)}
        >
          Remove
        </button>
      </div>
    );
  };
});

// Mock CartSummary
jest.mock("../../components/CartSummary/CartSummary", () => {
  return function MockCartSummary({
    cartItems,
    totalItems,
    subtotal,
    discount,
    delivery,
    totalPrice,
  }) {
    return (
      <div data-testid="cart-summary">
        <span data-testid="summary-item-count">{totalItems}</span>

        <span data-testid="summary-subtotal">{subtotal}</span>

        <span data-testid="summary-discount">{discount}</span>

        <span data-testid="summary-delivery">{delivery}</span>

        <span data-testid="summary-total">{totalPrice}</span>

        <span data-testid="summary-cart-length">
          {cartItems.length}
        </span>
      </div>
    );
  };
});

// Mock EmptyState
jest.mock("../../components/EmptyState/EmptyState", () => {
  return function MockEmptyState({
    image,
    title,
    description,
    buttonText,
    buttonLink,
  }) {
    return (
      <div data-testid="empty-state">
        <img src={image} alt="empty cart" />

        <h2>{title}</h2>

        <p>{description}</p>

        <a href={buttonLink}>{buttonText}</a>
      </div>
    );
  };
});

const firstItem = {
  id: "test-item-1",
  price: 100,
  quantity: 1,
};

const secondItem = {
  id: "test-item-2",
  price: 200,
  quantity: 2,
};

const renderCart = () => {
  return render(<Cart />);
};

const setCart = (items) => {
  localStorage.setItem("cart", JSON.stringify(items));
};

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("Cart Component", () => {
  // ---------------------------------------------------
  // EMPTY CART
  // ---------------------------------------------------

  test("renders empty cart when localStorage has no cart", () => {
    renderCart();

    expect(screen.getByTestId("empty-state")).toBeInTheDocument();

    expect(
      screen.getByText("Your Cart is Empty")
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Looks like you haven't added any products yet."
      )
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: /continue shopping/i,
      })
    ).toHaveAttribute("href", "/shop");
  });

  test("renders empty cart when cart contains an empty array", () => {
    setCart([]);

    renderCart();

    expect(
      screen.getByText("Your Cart is Empty")
    ).toBeInTheDocument();
  });

  test("handles invalid cart JSON", () => {
    localStorage.setItem("cart", "invalid-json");

    expect(() => renderCart()).toThrow();
  });

  // ---------------------------------------------------
  // CART RENDERING
  // ---------------------------------------------------

  test("renders cart page when items exist", () => {
    setCart([firstItem]);

    renderCart();

    expect(
      screen.getByRole("heading", { name: /my cart/i })
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("cart-item-test-item-1")
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("cart-summary")
    ).toBeInTheDocument();
  });

  test("renders all cart items", () => {
    setCart([firstItem, secondItem]);

    renderCart();

    expect(
      screen.getByTestId("cart-item-test-item-1")
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("cart-item-test-item-2")
    ).toBeInTheDocument();
  });

  test("displays correct total item count", () => {
    setCart([
      {
        id: "item-a",
        price: 100,
        quantity: 1,
      },
      {
        id: "item-b",
        price: 200,
        quantity: 2,
      },
    ]);

    renderCart();

    expect(
      screen.getByText("3 Items")
    ).toBeInTheDocument();
  });

  test("uses quantity 1 when item quantity is missing", () => {
    setCart([
      {
        id: "item-a",
        price: 100,
      },
    ]);

    renderCart();

    expect(
      screen.getByText("1 Items")
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("item-quantity-item-a")
    ).toHaveTextContent("1");
  });

  // ---------------------------------------------------
  // INCREASE QUANTITY
  // ---------------------------------------------------

  test("increases item quantity", () => {
    setCart([
      {
        id: "item-a",
        price: 100,
        quantity: 1,
      },
    ]);

    renderCart();

    fireEvent.click(
      screen.getByTestId("increase-item-a")
    );

    expect(
      screen.getByTestId("item-quantity-item-a")
    ).toHaveTextContent("2");

    const cart = JSON.parse(
      localStorage.getItem("cart")
    );

    expect(cart[0].quantity).toBe(2);
  });

  test("increases only the selected item quantity", () => {
    setCart([
      {
        id: "item-a",
        price: 100,
        quantity: 1,
      },
      {
        id: "item-b",
        price: 200,
        quantity: 3,
      },
    ]);

    renderCart();

    fireEvent.click(
      screen.getByTestId("increase-item-a")
    );

    expect(
      screen.getByTestId("item-quantity-item-a")
    ).toHaveTextContent("2");

    expect(
      screen.getByTestId("item-quantity-item-b")
    ).toHaveTextContent("3");
  });

  test("dispatches cartUpdated event after increasing quantity", () => {
    const dispatchSpy = jest.spyOn(
      window,
      "dispatchEvent"
    );

    setCart([
      {
        id: "item-a",
        price: 100,
        quantity: 1,
      },
    ]);

    renderCart();

    fireEvent.click(
      screen.getByTestId("increase-item-a")
    );

    expect(
      dispatchSpy.mock.calls.some(
        ([event]) => event.type === "cartUpdated"
      )
    ).toBe(true);
  });

  // ---------------------------------------------------
  // DECREASE QUANTITY
  // ---------------------------------------------------

  test("decreases item quantity", () => {
    setCart([
      {
        id: "item-a",
        price: 100,
        quantity: 3,
      },
    ]);

    renderCart();

    fireEvent.click(
      screen.getByTestId("decrease-item-a")
    );

    expect(
      screen.getByTestId("item-quantity-item-a")
    ).toHaveTextContent("2");

    const cart = JSON.parse(
      localStorage.getItem("cart")
    );

    expect(cart[0].quantity).toBe(2);
  });

  test("does not decrease quantity below one", () => {
    setCart([
      {
        id: "item-a",
        price: 100,
        quantity: 1,
      },
    ]);

    renderCart();

    fireEvent.click(
      screen.getByTestId("decrease-item-a")
    );

    expect(
      screen.getByTestId("item-quantity-item-a")
    ).toHaveTextContent("1");

    const cart = JSON.parse(
      localStorage.getItem("cart")
    );

    expect(cart[0].quantity).toBe(1);
  });

  test("decreases quantity from missing quantity to one", () => {
    setCart([
      {
        id: "item-a",
        price: 100,
      },
    ]);

    renderCart();

    fireEvent.click(
      screen.getByTestId("decrease-item-a")
    );

    expect(
      screen.getByTestId("item-quantity-item-a")
    ).toHaveTextContent("1");
  });

  test("dispatches cartUpdated event after decreasing quantity", () => {
    const dispatchSpy = jest.spyOn(
      window,
      "dispatchEvent"
    );

    setCart([
      {
        id: "item-a",
        price: 100,
        quantity: 2,
      },
    ]);

    renderCart();

    fireEvent.click(
      screen.getByTestId("decrease-item-a")
    );

    expect(
      dispatchSpy.mock.calls.some(
        ([event]) => event.type === "cartUpdated"
      )
    ).toBe(true);
  });

  // ---------------------------------------------------
  // REMOVE ITEM
  // ---------------------------------------------------

  test("removes an item from cart", () => {
    setCart([
      {
        id: "item-a",
        price: 100,
        quantity: 1,
      },
      {
        id: "item-b",
        price: 200,
        quantity: 1,
      },
    ]);

    renderCart();

    fireEvent.click(
      screen.getByTestId("remove-item-a")
    );

    expect(
      screen.queryByTestId("cart-item-item-a")
    ).not.toBeInTheDocument();

    expect(
      screen.getByTestId("cart-item-item-b")
    ).toBeInTheDocument();

    const cart = JSON.parse(
      localStorage.getItem("cart")
    );

    expect(cart).toHaveLength(1);
    expect(cart[0].id).toBe("item-b");
  });

  test("removes the only item and displays empty cart", () => {
    setCart([
      {
        id: "item-a",
        price: 100,
        quantity: 1,
      },
    ]);

    renderCart();

    fireEvent.click(
      screen.getByTestId("remove-item-a")
    );

    expect(
      screen.getByText("Your Cart is Empty")
    ).toBeInTheDocument();

    expect(
      screen.queryByTestId("cart-summary")
    ).not.toBeInTheDocument();

    expect(localStorage.getItem("cart")).toBe("[]");
  });

  test("dispatches cartUpdated event after removing item", () => {
    const dispatchSpy = jest.spyOn(
      window,
      "dispatchEvent"
    );

    setCart([
      {
        id: "item-a",
        price: 100,
        quantity: 1,
      },
    ]);

    renderCart();

    fireEvent.click(
      screen.getByTestId("remove-item-a")
    );

    expect(
      dispatchSpy.mock.calls.some(
        ([event]) => event.type === "cartUpdated"
      )
    ).toBe(true);
  });

  // ---------------------------------------------------
  // SUBTOTAL
  // ---------------------------------------------------

  test("calculates subtotal correctly", () => {
    setCart([
      {
        id: "item-a",
        price: 100,
        quantity: 2,
      },
      {
        id: "item-b",
        price: 200,
        quantity: 1,
      },
    ]);

    renderCart();

    expect(
      screen.getByTestId("summary-subtotal")
    ).toHaveTextContent("400");
  });

  test("calculates subtotal using discountedPrice when price is missing", () => {
    setCart([
      {
        id: "item-a",
        discountedPrice: 150,
        quantity: 2,
      },
    ]);

    renderCart();

    expect(
      screen.getByTestId("summary-subtotal")
    ).toHaveTextContent("300");
  });

  test("uses price when both price and discountedPrice exist", () => {
    setCart([
      {
        id: "item-a",
        price: 100,
        discountedPrice: 50,
        quantity: 2,
      },
    ]);

    renderCart();

    expect(
      screen.getByTestId("summary-subtotal")
    ).toHaveTextContent("200");
  });

  test("uses zero when no valid price exists", () => {
    setCart([
      {
        id: "item-a",
        quantity: 2,
      },
    ]);

    renderCart();

    expect(
      screen.getByTestId("summary-subtotal")
    ).toHaveTextContent("0");
  });

  // ---------------------------------------------------
  // DISCOUNT
  // ---------------------------------------------------

  test("calculates ten percent discount", () => {
    setCart([
      {
        id: "item-a",
        price: 200,
        quantity: 1,
      },
    ]);

    renderCart();

    expect(
      screen.getByTestId("summary-discount")
    ).toHaveTextContent("20");
  });

  test("rounds discount to nearest integer", () => {
    setCart([
      {
        id: "item-a",
        price: 105,
        quantity: 1,
      },
    ]);

    renderCart();

    expect(
      screen.getByTestId("summary-discount")
    ).toHaveTextContent("11");
  });

  // ---------------------------------------------------
  // DELIVERY
  // ---------------------------------------------------

  test("adds low-order delivery charge", () => {
    setCart([
      {
        id: "item-a",
        price: 100,
        quantity: 1,
      },
    ]);

    renderCart();

    expect(
      screen.getByTestId("summary-delivery")
    ).toHaveTextContent("10");
  });

  test("makes base delivery free when subtotal reaches threshold", () => {
    setCart([
      {
        id: "item-a",
        price: 500,
        quantity: 1,
      },
    ]);

    renderCart();

    expect(
      screen.getByTestId("summary-delivery")
    ).toHaveTextContent("0");
  });

  test("adds special category surcharge", () => {
    setCart([
      {
        id: "item-a",
        price: 100,
        quantity: 1,
        category: "Medical Devices",
      },
    ]);

    renderCart();

    expect(
      screen.getByTestId("summary-delivery")
    ).toHaveTextContent("60");
  });

  test("adds premium category surcharge", () => {
    setCart([
      {
        id: "item-a",
        price: 100,
        quantity: 1,
        category: "Premium Healthcare",
      },
    ]);

    renderCart();

    expect(
      screen.getByTestId("summary-delivery")
    ).toHaveTextContent("60");
  });

  test("does not add special surcharge for normal category", () => {
    setCart([
      {
        id: "item-a",
        price: 100,
        quantity: 1,
        category: "General",
      },
    ]);

    renderCart();

    expect(
      screen.getByTestId("summary-delivery")
    ).toHaveTextContent("10");
  });

  test("detects category with hyphen", () => {
    setCart([
      {
        id: "item-a",
        price: 100,
        quantity: 1,
        category: "medical-device",
      },
    ]);

    renderCart();

    expect(
      screen.getByTestId("summary-delivery")
    ).toHaveTextContent("60");
  });

  test("detects category with underscore", () => {
    setCart([
      {
        id: "item-a",
        price: 100,
        quantity: 1,
        category: "premium_healthcare",
      },
    ]);

    renderCart();

    expect(
      screen.getByTestId("summary-delivery")
    ).toHaveTextContent("60");
  });

  // ---------------------------------------------------
  // TOTAL
  // ---------------------------------------------------

  test("calculates total amount correctly", () => {
    setCart([
      {
        id: "item-a",
        price: 100,
        quantity: 1,
      },
    ]);

    renderCart();

    // subtotal = 100
    // discount = 10
    // delivery = 10
    // total = 100
    expect(
      screen.getByTestId("summary-total")
    ).toHaveTextContent("100");
  });

  test("calculates total with special category surcharge", () => {
    setCart([
      {
        id: "item-a",
        price: 100,
        quantity: 1,
        category: "Medical Device",
      },
    ]);

    renderCart();

    // subtotal = 100
    // discount = 10
    // delivery = 60
    // total = 150
    expect(
      screen.getByTestId("summary-total")
    ).toHaveTextContent("150");
  });

  // ---------------------------------------------------
  // CART UPDATED EVENT
  // ---------------------------------------------------

  test("reloads cart when cartUpdated event is dispatched", () => {
    setCart([
      {
        id: "item-a",
        price: 100,
        quantity: 1,
      },
    ]);

    renderCart();

    expect(
      screen.getByTestId("cart-item-item-a")
    ).toBeInTheDocument();

    act(() => {
      localStorage.setItem(
        "cart",
        JSON.stringify([
          {
            id: "item-b",
            price: 200,
            quantity: 1,
          },
        ])
      );

      window.dispatchEvent(
        new Event("cartUpdated")
      );
    });

    expect(
      screen.queryByTestId("cart-item-item-a")
    ).not.toBeInTheDocument();

    expect(
      screen.getByTestId("cart-item-item-b")
    ).toBeInTheDocument();
  });

  // ---------------------------------------------------
  // EVENT LISTENER CLEANUP
  // ---------------------------------------------------

  test("removes cartUpdated event listener on unmount", () => {
    const removeEventListenerSpy = jest.spyOn(
      window,
      "removeEventListener"
    );

    const { unmount } = renderCart();

    unmount();

    expect(
      removeEventListenerSpy
    ).toHaveBeenCalledWith(
      "cartUpdated",
      expect.any(Function)
    );
  });

  // ---------------------------------------------------
  // SUMMARY PROPS
  // ---------------------------------------------------

  test("passes correct number of items to CartSummary", () => {
    setCart([
      {
        id: "item-a",
        price: 100,
        quantity: 2,
      },
      {
        id: "item-b",
        price: 200,
        quantity: 3,
      },
    ]);

    renderCart();

    expect(
      screen.getByTestId("summary-item-count")
    ).toHaveTextContent("5");
  });

  test("passes correct cart length to CartSummary", () => {
    setCart([
      firstItem,
      secondItem,
    ]);

    renderCart();

    expect(
      screen.getByTestId("summary-cart-length")
    ).toHaveTextContent("2");
  });
});