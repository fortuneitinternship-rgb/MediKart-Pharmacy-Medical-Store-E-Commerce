
import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  MemoryRouter,
  useLocation,
} from "react-router-dom";

import UserActions from "./UserActions";

import {
  getAccessToken,
  getCart,
} from "../../api/cartApi";

import { getWishlist } from "../../api/wishlistApi";
import { logoutUser } from "../../api/loginApi";

// ============================================
// MOCK API MODULES
// ============================================

jest.mock("../../api/cartApi", () => ({
  getAccessToken: jest.fn(),
  getCart: jest.fn(),
}));

jest.mock("../../api/wishlistApi", () => ({
  getWishlist: jest.fn(),
}));

jest.mock("../../api/loginApi", () => ({
  logoutUser: jest.fn(),
}));

// ============================================
// MOCK LOGIN COMPONENT
// ============================================

jest.mock("../Login/Login", () => {
  return function MockLogin({
    onClose,
    onLoginSuccess,
    onSwitchToRegister,
    onSwitchToForgotPassword,
  }) {
    return (
      <div data-testid="login-component">
        <button onClick={onLoginSuccess}>
          Complete Login
        </button>

        <button onClick={onSwitchToRegister}>
          Open Register
        </button>

        <button onClick={onSwitchToForgotPassword}>
          Open Forgot Password
        </button>

        <button onClick={onClose}>
          Close Login
        </button>
      </div>
    );
  };
});

// ============================================
// MOCK REGISTER COMPONENT
// ============================================

jest.mock("../Register/Register", () => {
  return function MockRegister({
    onClose,
    onSwitchToLogin,
  }) {
    return (
      <div data-testid="register-component">
        <button onClick={onSwitchToLogin}>
          Back To Login
        </button>

        <button onClick={onClose}>
          Close Register
        </button>
      </div>
    );
  };
});

// ============================================
// MOCK FORGOT PASSWORD COMPONENT
// ============================================

jest.mock("../ForgotPassword/ForgotPassword", () => {
  return function MockForgotPassword({
    onClose,
    onSwitchToLogin,
  }) {
    return (
      <div data-testid="forgot-password-component">
        <button onClick={onSwitchToLogin}>
          Back To Login
        </button>

        <button onClick={onClose}>
          Close Forgot Password
        </button>
      </div>
    );
  };
});

// ============================================
// LOCATION DISPLAY
// ============================================

function LocationDisplay() {
  const location = useLocation();

  return (
    <div data-testid="current-location">
      {location.pathname}
    </div>
  );
}

// ============================================
// RENDER HELPER
// ============================================

const renderComponent = () => {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <UserActions />
      <LocationDisplay />
    </MemoryRouter>
  );
};

// ============================================
// SETUP
// ============================================

beforeEach(() => {
  localStorage.clear();

  jest.clearAllMocks();

  getAccessToken.mockReturnValue(null);

  getCart.mockResolvedValue([]);

  getWishlist.mockResolvedValue([]);

  logoutUser.mockImplementation(() => {
    localStorage.removeItem("username");
    localStorage.removeItem("isLoggedIn");
  });
});

afterEach(() => {
  cleanup();
  localStorage.clear();
});

// ============================================
// 1. BASIC RENDERING
// ============================================

describe("UserActions - Basic Rendering", () => {
  test("renders UserActions component", () => {
    renderComponent();

    expect(
      screen.getByText("Wishlist")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Cart")
    ).toBeInTheDocument();
  });

  test("displays Login when user is not logged in", () => {
    renderComponent();

    expect(
      screen.getByRole("button", {
        name: /login/i,
      })
    ).toBeInTheDocument();
  });

  test("does not show account dropdown initially", () => {
    renderComponent();

    expect(
      screen.queryByText("Upload Prescription")
    ).not.toBeInTheDocument();
  });

  test("renders wishlist navigation link", () => {
    renderComponent();

    expect(
      screen.getByRole("link", {
        name: /^❤️ Wishlist$/,
      })
    ).toHaveAttribute("href", "/wishlist");
  });

  test("renders cart navigation link", () => {
    renderComponent();

    expect(
      screen.getByRole("link", {
        name: /^🛒 Cart$/,
      })
    ).toHaveAttribute("href", "/cart");
  });
});

// ============================================
// 2. LOCAL CART AND WISHLIST
// ============================================

describe("UserActions - Local Shopping Counts", () => {
  test("displays local cart quantity", async () => {
    localStorage.setItem(
      "cart",
      JSON.stringify([
        { quantity: 2 },
        { quantity: 3 },
      ])
    );

    renderComponent();

    expect(
      await screen.findByText("5")
    ).toBeInTheDocument();
  });

  test("displays local wishlist quantity", async () => {
    localStorage.setItem(
      "wishlist",
      JSON.stringify([
        { id: "item-a" },
        { id: "item-b" },
      ])
    );

    renderComponent();

    expect(
      await screen.findByText("2")
    ).toBeInTheDocument();
  });

  test("handles empty cart and wishlist", async () => {
    renderComponent();

    await waitFor(() => {
      expect(getAccessToken).toHaveBeenCalled();
    });

    expect(
      screen.queryByText("0")
    ).not.toBeInTheDocument();
  });

  test("handles invalid local storage data", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    localStorage.setItem("cart", "invalid");
    localStorage.setItem("wishlist", "invalid");

    renderComponent();

    await waitFor(() => {
      expect(getAccessToken).toHaveBeenCalled();
    });

    expect(
      screen.getByRole("button", {
        name: /login/i,
      })
    ).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});

// ============================================
// 3. API CART AND WISHLIST
// ============================================

describe("UserActions - API Shopping Counts", () => {
  test("loads cart and wishlist from APIs", async () => {
    getAccessToken.mockReturnValue("mock-token");

    getCart.mockResolvedValue([
      { quantity: 2 },
      { quantity: 3 },
    ]);

    getWishlist.mockResolvedValue([
      { id: "item-a" },
      { id: "item-b" },
    ]);

    renderComponent();

    await waitFor(() => {
      expect(getCart).toHaveBeenCalled();
      expect(getWishlist).toHaveBeenCalled();
    });

    expect(
      await screen.findByText("5")
    ).toBeInTheDocument();

    expect(
      await screen.findByText("2")
    ).toBeInTheDocument();
  });

  test("uses local cart when cart API fails", async () => {
    getAccessToken.mockReturnValue("mock-token");

    getCart.mockRejectedValue(
      new Error("Cart API error")
    );

    getWishlist.mockResolvedValue([]);

    localStorage.setItem(
      "cart",
      JSON.stringify([{ quantity: 4 }])
    );

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    renderComponent();

    expect(
      await screen.findByText("4")
    ).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  test("uses local wishlist when wishlist API fails", async () => {
    getAccessToken.mockReturnValue("mock-token");

    getCart.mockResolvedValue([]);

    getWishlist.mockRejectedValue(
      new Error("Wishlist API error")
    );

    localStorage.setItem(
      "wishlist",
      JSON.stringify([
        { id: "item-a" },
        { id: "item-b" },
        { id: "item-c" },
      ])
    );

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    renderComponent();

    expect(
      await screen.findByText("3")
    ).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});

// ============================================
// 4. ACCOUNT DROPDOWN
// ============================================

describe("UserActions - Account Dropdown", () => {
  beforeEach(() => {
    localStorage.setItem("username", "Test Account");
  });

  test("displays username", async () => {
    renderComponent();

    expect(
      await screen.findByText("Test Account")
    ).toBeInTheDocument();
  });

  test("opens account dropdown", async () => {
    renderComponent();

    fireEvent.click(
      await screen.findByRole("button", {
        name: /test account/i,
      })
    );


    expect(
      screen.getByText("Settings")
    ).toBeInTheDocument();
  });

  test("closes dropdown when account button is clicked again", async () => {
    renderComponent();

    const accountButton = await screen.findByRole(
      "button",
      { name: /test account/i }
    );

    fireEvent.click(accountButton);

    expect(
      screen.getByText("Settings")
    ).toBeInTheDocument();

    fireEvent.click(accountButton);

    expect(
      screen.queryByText("Settings")
    ).not.toBeInTheDocument();
  });

  test("displays all account menu options", async () => {
    renderComponent();

    fireEvent.click(
      await screen.findByRole("button", {
        name: /test account/i,
      })
    );

    const menuItems = [
      "My Account",
      "My Orders",
      "Order History",
      "Track Order",
      "My Wishlist",
      "My Cart",
      "Upload Prescription",
      "Settings",
    ];
  });

  test("displays Upload Prescription link", async () => {
  });

  test("navigates to Upload Prescription and closes dropdown", async () => {
    renderComponent();

    fireEvent.click(
      await screen.findByRole("button", {
        name: /test account/i,
      })
    );

    fireEvent.click(
      screen.getByRole("link", {
        name: /upload prescription/i,
      })
    );

    expect(
      screen.getByTestId("current-location")
    ).toHaveTextContent("/upload-prescription");

    expect(
      screen.queryByText("Settings")
    ).not.toBeInTheDocument();
  });

  test("navigates to My Orders", async () => {
    renderComponent();

    fireEvent.click(
      await screen.findByRole("button", {
        name: /test account/i,
      })
    );

    fireEvent.click(
      screen.getByRole("link", {
        name: /my orders/i,
      })
    );

    expect(
      screen.getByTestId("current-location")
    ).toHaveTextContent("/orders");
  });

  test("navigates to Settings", async () => {
    renderComponent();

    fireEvent.click(
      await screen.findByRole("button", {
        name: /test account/i,
      })
    );

    fireEvent.click(
      screen.getByRole("link", {
        name: /^Settings$/,
      })
    );

    expect(
      screen.getByTestId("current-location")
    ).toHaveTextContent("/settings");
  });
});

// ============================================
// 5. LOGIN MODAL
// ============================================

describe("UserActions - Login Modal", () => {
  test("opens login modal", () => {
    renderComponent();

    fireEvent.click(
      screen.getByRole("button", {
        name: /login/i,
      })
    );

    expect(
      screen.getByTestId("login-component")
    ).toBeInTheDocument();
  });

  test("closes login modal", () => {
    renderComponent();

    fireEvent.click(
      screen.getByRole("button", {
        name: /login/i,
      })
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /close login/i,
      })
    );

    expect(
      screen.queryByTestId("login-component")
    ).not.toBeInTheDocument();
  });

  test("closes modal using popup close button", () => {
    renderComponent();

    fireEvent.click(
      screen.getByRole("button", {
        name: /login/i,
      })
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "✕",
      })
    );

    expect(
      screen.queryByTestId("login-component")
    ).not.toBeInTheDocument();
  });

  test("closes modal when overlay is clicked", () => {
    const { container } = renderComponent();

    fireEvent.click(
      screen.getByRole("button", {
        name: /login/i,
      })
    );

    const overlay = container.querySelector(
      '[class*="overlay"]'
    );

    expect(overlay).toBeInTheDocument();

    fireEvent.click(overlay);

    expect(
      screen.queryByTestId("login-component")
    ).not.toBeInTheDocument();
  });

  test("does not close modal when popup is clicked", () => {
    const { container } = renderComponent();

    fireEvent.click(
      screen.getByRole("button", {
        name: /login/i,
      })
    );

    const popup = container.querySelector(
      '[class*="popup"]'
    );

    fireEvent.click(popup);

    expect(
      screen.getByTestId("login-component")
    ).toBeInTheDocument();
  });
});

// ============================================
// 6. REGISTER MODAL
// ============================================

describe("UserActions - Register Modal", () => {
  test("opens register modal", () => {
    renderComponent();

    fireEvent.click(
      screen.getByRole("button", {
        name: /login/i,
      })
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /open register/i,
      })
    );

    expect(
      screen.getByTestId("register-component")
    ).toBeInTheDocument();
  });

  test("switches from register to login", () => {
    renderComponent();

    fireEvent.click(
      screen.getByRole("button", {
        name: /login/i,
      })
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /open register/i,
      })
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /back to login/i,
      })
    );

    expect(
      screen.getByTestId("login-component")
    ).toBeInTheDocument();
  });

  test("closes register modal", () => {
    renderComponent();

    fireEvent.click(
      screen.getByRole("button", {
        name: /login/i,
      })
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /open register/i,
      })
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /close register/i,
      })
    );

    expect(
      screen.queryByTestId("register-component")
    ).not.toBeInTheDocument();
  });
});

// ============================================
// 7. FORGOT PASSWORD
// ============================================

describe("UserActions - Forgot Password", () => {
  test("opens forgot password modal", () => {
    renderComponent();

    fireEvent.click(
      screen.getByRole("button", {
        name: /login/i,
      })
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /open forgot password/i,
      })
    );

    expect(
      screen.getByTestId("forgot-password-component")
    ).toBeInTheDocument();
  });

  test("switches from forgot password to login", () => {
    renderComponent();

    fireEvent.click(
      screen.getByRole("button", {
        name: /login/i,
      })
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /open forgot password/i,
      })
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /back to login/i,
      })
    );

    expect(
      screen.getByTestId("login-component")
    ).toBeInTheDocument();
  });

  test("closes forgot password modal", () => {
    renderComponent();

    fireEvent.click(
      screen.getByRole("button", {
        name: /login/i,
      })
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /open forgot password/i,
      })
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /close forgot password/i,
      })
    );

    expect(
      screen.queryByTestId("forgot-password-component")
    ).not.toBeInTheDocument();
  });
});

// ============================================
// 8. LOGIN SUCCESS
// ============================================

describe("UserActions - Login Success", () => {
  test("closes login modal after successful login", () => {
    renderComponent();

    fireEvent.click(
      screen.getByRole("button", {
        name: /login/i,
      })
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /complete login/i,
      })
    );

    expect(
      screen.queryByTestId("login-component")
    ).not.toBeInTheDocument();
  });

  test("dispatches userUpdated event after login", () => {
    const dispatchSpy = jest.spyOn(
      window,
      "dispatchEvent"
    );

    renderComponent();

    fireEvent.click(
      screen.getByRole("button", {
        name: /login/i,
      })
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /complete login/i,
      })
    );

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "userUpdated",
      })
    );

    dispatchSpy.mockRestore();
  });
});

// ============================================
// 9. LOGOUT
// ============================================

describe("UserActions - Logout", () => {
  beforeEach(() => {
    localStorage.setItem("username", "Test Account");
  });

  test("calls logoutUser", async () => {
    renderComponent();

    fireEvent.click(
      await screen.findByRole("button", {
        name: /test account/i,
      })
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /logout/i,
      })
    );

    expect(logoutUser).toHaveBeenCalledTimes(1);
  });

  test("navigates to home after logout", async () => {
    renderComponent();

    fireEvent.click(
      await screen.findByRole("button", {
        name: /test account/i,
      })
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /logout/i,
      })
    );

    expect(
      screen.getByTestId("current-location")
    ).toHaveTextContent("/");
  });

  test("hides account dropdown after logout", async () => {
    renderComponent();

    fireEvent.click(
      await screen.findByRole("button", {
        name: /test account/i,
      })
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /logout/i,
      })
    );

    expect(
      screen.queryByText("Settings")
    ).not.toBeInTheDocument();
  });
});

// ============================================
// 10. WINDOW EVENTS
// ============================================

describe("UserActions - Window Events", () => {
  test("updates cart count after cartUpdated event", async () => {
    localStorage.setItem(
      "cart",
      JSON.stringify([{ quantity: 2 }])
    );

    renderComponent();

    expect(
      await screen.findByText("2")
    ).toBeInTheDocument();

    localStorage.setItem(
      "cart",
      JSON.stringify([{ quantity: 5 }])
    );

    fireEvent(
      window,
      new Event("cartUpdated")
    );

    await waitFor(() => {
      expect(
        screen.getByText("5")
      ).toBeInTheDocument();
    });
  });

  test("updates wishlist count after wishlistUpdated event", async () => {
    localStorage.setItem(
      "wishlist",
      JSON.stringify([{ id: "item-a" }])
    );

    renderComponent();

    expect(
      await screen.findByText("1")
    ).toBeInTheDocument();

    localStorage.setItem(
      "wishlist",
      JSON.stringify([
        { id: "item-a" },
        { id: "item-b" },
      ])
    );

    fireEvent(
      window,
      new Event("wishlistUpdated")
    );

    await waitFor(() => {
      expect(
        screen.getByText("2")
      ).toBeInTheDocument();
    });
  });

  test("updates username after userUpdated event", async () => {
    renderComponent();

    localStorage.setItem(
      "username",
      "Updated Account"
    );

    fireEvent(
      window,
      new Event("userUpdated")
    );

    expect(
      await screen.findByText("Updated Account")
    ).toBeInTheDocument();
  });
});

// ============================================
// 11. EVENT LISTENER CLEANUP
// ============================================

describe("UserActions - Cleanup", () => {
  test("removes event listeners when component unmounts", () => {
    const removeSpy = jest.spyOn(
      window,
      "removeEventListener"
    );

    const { unmount } = renderComponent();

    unmount();

    expect(removeSpy).toHaveBeenCalledWith(
      "cartUpdated",
      expect.any(Function)
    );

    expect(removeSpy).toHaveBeenCalledWith(
      "wishlistUpdated",
      expect.any(Function)
    );

    expect(removeSpy).toHaveBeenCalledWith(
      "userUpdated",
      expect.any(Function)
    );

    removeSpy.mockRestore();
  });
});
