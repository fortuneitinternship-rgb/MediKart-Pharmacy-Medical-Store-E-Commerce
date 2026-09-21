import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

/* =========================================================
   MOCK COMPONENTS
========================================================= */

jest.mock("./components/Navbar/Navbar", () => () => (
  <div>Navbar</div>
));

jest.mock("./components/Footer/Footer", () => () => (
  <div data-testid="footer">Footer</div>
));

jest.mock("./ScrollToTop/ScrollToTop", () => () => (
  <div data-testid="scroll-to-top" />
));

/* =========================================================
   MOCK PAGES
========================================================= */

jest.mock("./pages/Home/Home", () => () => (
  <div>Home Page</div>
));

jest.mock("./pages/Shop/Shop", () => () => (
  <div>Shop Page</div>
));

jest.mock("./pages/About/About", () => () => (
  <div>About Page</div>
));

jest.mock("./pages/Categories/Categories", () => () => (
  <div>Categories Page</div>
));

jest.mock("./pages/Contact/Contact", () => () => (
  <div>Contact Page</div>
));

jest.mock("./components/Login/Login", () => () => (
  <div>Login Page</div>
));

jest.mock("./components/Register/Register", () => () => (
  <div>Register Page</div>
));

jest.mock(
  "./components/ForgotPassword/ForgotPassword",
  () => () => <div>Forgot Password Page</div>
);

jest.mock("./pages/ProductListingPage", () => () => (
  <div>Product Listing Page</div>
));

jest.mock(
  "./pages/ProductListing/ProductListing",
  () => () => <div>Product Listing</div>
);

jest.mock(
  "./pages/ProductDetails/ProductDetails",
  () => () => <div>Product Details</div>
);

jest.mock("./pages/Wishlist/Wishlist", () => () => (
  <div>Wishlist Page</div>
));

jest.mock("./pages/Cart/Cart", () => () => (
  <div>Cart Page</div>
));

jest.mock(
  "./pages/OrderConfirmation/OrderConfirmation",
  () => () => <div>Order Confirmation Page</div>
);

jest.mock(
  "./pages/OrderHistory/OrderHistory",
  () => () => <div>Order History Page</div>
);

jest.mock("./pages/Checkout/Checkout", () => () => (
  <div>Checkout Page</div>
));

jest.mock(
  "./pages/PrivacyPolicy/PrivacyPolicy",
  () => () => <div>Privacy Policy Page</div>
);

jest.mock(
  "./pages/TermsConditions/TermsConditions",
  () => () => <div>Terms Conditions Page</div>
);

jest.mock(
  "./pages/ShippingPolicy/ShippingPolicy",
  () => () => <div>Shipping Policy Page</div>
);

jest.mock("./pages/Careers/Careers", () => () => (
  <div>Careers Page</div>
));

jest.mock("./pages/Blog/Blog", () => () => (
  <div>Blog Page</div>
));

jest.mock("./pages/TrackOrder/TrackOrder", () => () => (
  <div>Track Order Page</div>
));

jest.mock("./pages/Reviews/Reviews", () => () => (
  <div>Reviews Page</div>
));

jest.mock(
  "./pages/CompareProducts/CompareProducts",
  () => () => <div>Compare Products Page</div>
);

jest.mock("./pages/Gallery/Gallery", () => () => (
  <div>Gallery Page</div>
));

jest.mock("./pages/FAQ/FAQ", () => () => (
  <div>FAQ Page</div>
));

jest.mock("./components/Feedback/Feedback", () => () => (
  <div>Feedback Page</div>
));

jest.mock("./pages/Error404/Error404", () => () => (
  <div>404 Error Page</div>
));

jest.mock("./pages/Error500/Error500", () => () => (
  <div>500 Error Page</div>
));

jest.mock("./pages/NoInternet/NoInternet", () => () => (
  <div>No Internet Page</div>
));

jest.mock(
  "./pages/AccessDenied/AccessDenied",
  () => () => <div>Access Denied Page</div>
);

jest.mock(
  "./pages/Maintenance/Maintenance",
  () => () => <div>Maintenance Page</div>
);

jest.mock("./pages/EmptyState/EmptyState", () => () => (
  <div>Empty State Page</div>
));

jest.mock("./pages/Account/Account", () => () => (
  <div>Account Page</div>
));

jest.mock("./pages/Profile/Profile", () => () => (
  <div>Profile Page</div>
));

jest.mock("./pages/Orders/Orders", () => () => (
  <div>Orders Page</div>
));

jest.mock("./pages/Payments/Payments", () => () => (
  <div>Payments Page</div>
));

jest.mock("./pages/Addresses/Addresses", () => () => (
  <div>Addresses Page</div>
));

jest.mock(
  "./pages/UploadPrescription/UploadPrescription",
  () => () => <div>Upload Prescription Page</div>
);

jest.mock(
  "./pages/HealthRecords/HealthRecords",
  () => () => <div>Health Records Page</div>
);

jest.mock("./pages/Offers/Offers", () => () => (
  <div>Offers Page</div>
));

jest.mock(
  "./pages/Notifications/Notifications",
  () => () => <div>Notifications Page</div>
);

jest.mock("./pages/Settings/Settings", () => () => (
  <div>Settings Page</div>
));

jest.mock(
  "./pages/TrackOrderPage",
  () => () => <div>Track Order Detail Page</div>
);

/* =========================================================
   MOCK COMPONENTS
========================================================= */

jest.mock(
  "./components/QuantitySelector/QuantitySelector",
  () => () => <div>Quantity Selector</div>
);

jest.mock(
  "./components/RelatedProducts/RelatedProducts",
  () => () => <div>Related Products</div>
);

jest.mock(
  "./components/ProductSpecifications/ProductSpecifications",
  () => () => <div>Product Specifications</div>
);

/* =========================================================
   MOCK REACT TOASTIFY
========================================================= */

jest.mock("react-toastify", () => ({
  ToastContainer: () => (
    <div data-testid="toast-container" />
  ),
}));

/* =========================================================
   TEST HELPER
========================================================= */

const renderApp = (route = "/") => {
  window.history.pushState({}, "Test", route);

  return render(<App />);
};

/* =========================================================
   TESTS
========================================================= */

describe("MediKart App Routing", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /* =======================================================
     HOME
  ======================================================= */

  test("renders Home page", () => {
    renderApp("/");

    expect(
      screen.getByText("Home Page")
    ).toBeInTheDocument();
  });

  /* =======================================================
     NAVBAR
  ======================================================= */

  test("renders Navbar on normal pages", () => {
    renderApp("/");

    expect(
      screen.getByText("Navbar")
    ).toBeInTheDocument();
  });

  test("renders only one footer across the app", () => {
    renderApp("/");

    expect(
      screen.getAllByTestId("footer")
    ).toHaveLength(1);
  });

  /* =======================================================
     LOGIN
  ======================================================= */

  test("renders Login page", () => {
    renderApp("/login");

    expect(
      screen.getByText("Login Page")
    ).toBeInTheDocument();
  });

  /* =======================================================
     REGISTER
  ======================================================= */

  test("renders Register page", () => {
    renderApp("/register");

    expect(
      screen.getByText("Register Page")
    ).toBeInTheDocument();
  });

  /* =======================================================
     FORGOT PASSWORD
  ======================================================= */

  test("renders Forgot Password page", () => {
    renderApp("/forgot-password");

    expect(
      screen.getByText("Forgot Password Page")
    ).toBeInTheDocument();
  });

  /* =======================================================
     NAVBAR HIDDEN ON LOGIN
  ======================================================= */

  test("does not render Navbar on Login page", () => {
    renderApp("/login");

    expect(
      screen.queryByText("Navbar")
    ).not.toBeInTheDocument();
  });

  /* =======================================================
     NAVBAR HIDDEN ON REGISTER
  ======================================================= */

  test("does not render Navbar on Register page", () => {
    renderApp("/register");

    expect(
      screen.queryByText("Navbar")
    ).not.toBeInTheDocument();
  });

  /* =======================================================
     NAVBAR HIDDEN ON FORGOT PASSWORD
  ======================================================= */

  test("does not render Navbar on Forgot Password page", () => {
    renderApp("/forgot-password");

    expect(
      screen.queryByText("Navbar")
    ).not.toBeInTheDocument();
  });

  /* =======================================================
     SHOP
  ======================================================= */

  test("renders Shop page", () => {
    renderApp("/shop");

    expect(
      screen.getByText("Shop Page")
    ).toBeInTheDocument();
  });

  /* =======================================================
     SHOP CATEGORY
  ======================================================= */

  test("renders Shop page for category route", () => {
    renderApp("/shop/medicines");

    expect(
      screen.getByText("Shop Page")
    ).toBeInTheDocument();
  });

  /* =======================================================
     PRODUCT LISTING
  ======================================================= */

  test("renders Product Listing page", () => {
    renderApp("/products");

    expect(
      screen.getByText("Product Listing Page")
    ).toBeInTheDocument();
  });

  /* =======================================================
     PRODUCT DETAILS
  ======================================================= */

  test("renders Product Details page", () => {
    renderApp("/product/1");

    expect(
      screen.getByText("Product Details")
    ).toBeInTheDocument();
  });

  /* =======================================================
     WISHLIST
  ======================================================= */

  test("renders Wishlist page", () => {
    renderApp("/wishlist");

    expect(
      screen.getByText("Wishlist Page")
    ).toBeInTheDocument();
  });

  /* =======================================================
     CART
  ======================================================= */

  test("renders Cart page", () => {
    renderApp("/cart");

    expect(
      screen.getByText("Cart Page")
    ).toBeInTheDocument();
  });

  /* =======================================================
     CHECKOUT
  ======================================================= */

  test("renders Checkout page", () => {
    renderApp("/checkout");

    expect(
      screen.getByText("Checkout Page")
    ).toBeInTheDocument();
  });

  /* =======================================================
     ORDER CONFIRMATION
  ======================================================= */

  test("renders Order Confirmation page", () => {
    renderApp("/order-confirmation");

    expect(
      screen.getByText("Order Confirmation Page")
    ).toBeInTheDocument();
  });

  /* =======================================================
     ORDER HISTORY
  ======================================================= */

  test("renders Order History page", () => {
    renderApp("/order-history");

    expect(
      screen.getByText("Order History Page")
    ).toBeInTheDocument();
  });

  /* =======================================================
     TRACK ORDER
  ======================================================= */

  test("renders Track Order page", () => {
    renderApp("/track-order");

    expect(
      screen.getByText("Track Order Page")
    ).toBeInTheDocument();
  });

  /* =======================================================
     REVIEWS
  ======================================================= */

  test("renders Reviews page", () => {
    renderApp("/reviews");

    expect(
      screen.getByText("Reviews Page")
    ).toBeInTheDocument();
  });

  /* =======================================================
     COMPARE PRODUCTS
  ======================================================= */

  test("renders Compare Products page", () => {
    renderApp("/compare-products");

    expect(
      screen.getByText("Compare Products Page")
    ).toBeInTheDocument();
  });

  /* =======================================================
     GALLERY
  ======================================================= */

  test("renders Gallery page", () => {
    renderApp("/gallery");

    expect(
      screen.getByText("Gallery Page")
    ).toBeInTheDocument();
  });

  /* =======================================================
     FAQ
  ======================================================= */

  test("renders FAQ page", () => {
    renderApp("/faq");

    expect(
      screen.getByText("FAQ Page")
    ).toBeInTheDocument();
  });

  /* =======================================================
     ACCOUNT
  ======================================================= */

  test("renders Account page", () => {
    renderApp("/account");

    expect(
      screen.getByText("Account Page")
    ).toBeInTheDocument();
  });

  /* =======================================================
     PROFILE
  ======================================================= */

  test("renders Profile page", () => {
    renderApp("/profile");

    expect(
      screen.getByText("Profile Page")
    ).toBeInTheDocument();
  });

  /* =======================================================
     ORDERS
  ======================================================= */

  test("renders Orders page", () => {
    renderApp("/orders");

    expect(
      screen.getByText("Orders Page")
    ).toBeInTheDocument();
  });

  /* =======================================================
     PAYMENTS
  ======================================================= */

  test("renders Payments page", () => {
    renderApp("/payments");

    expect(
      screen.getByText("Payments Page")
    ).toBeInTheDocument();
  });

  /* =======================================================
     ADDRESSES
  ======================================================= */

  test("renders Addresses page", () => {
    renderApp("/addresses");

    expect(
      screen.getByText("Addresses Page")
    ).toBeInTheDocument();
  });

  /* =======================================================
     UPLOAD PRESCRIPTION
  ======================================================= */

  test("renders Upload Prescription page", () => {
    renderApp("/upload-prescription");

    expect(
      screen.getByText("Upload Prescription Page")
    ).toBeInTheDocument();
  });

  /* =======================================================
     HEALTH RECORDS
  ======================================================= */

  test("renders Health Records page", () => {
    renderApp("/health-records");

    expect(
      screen.getByText("Health Records Page")
    ).toBeInTheDocument();
  });

  /* =======================================================
     OFFERS
  ======================================================= */

  test("renders Offers page", () => {
    renderApp("/offers");

    expect(
      screen.getByText("Offers Page")
    ).toBeInTheDocument();
  });

  /* =======================================================
     NOTIFICATIONS
  ======================================================= */

  test("renders Notifications page", () => {
    renderApp("/notifications");

    expect(
      screen.getByText("Notifications Page")
    ).toBeInTheDocument();
  });

  /* =======================================================
     SETTINGS
  ======================================================= */

  test("renders Settings page", () => {
    renderApp("/settings");

    expect(
      screen.getByText("Settings Page")
    ).toBeInTheDocument();
  });

  /* =======================================================
     PRIVACY POLICY
  ======================================================= */

  test("renders Privacy Policy page", () => {
    renderApp("/privacy-policy");

    expect(
      screen.getByText("Privacy Policy Page")
    ).toBeInTheDocument();
  });

  /* =======================================================
     TERMS
  ======================================================= */

  test("renders Terms Conditions page", () => {
    renderApp("/terms-conditions");

    expect(
      screen.getByText("Terms Conditions Page")
    ).toBeInTheDocument();
  });

  /* =======================================================
     SHIPPING
  ======================================================= */

  test("renders Shipping Policy page", () => {
    renderApp("/shipping-policy");

    expect(
      screen.getByText("Shipping Policy Page")
    ).toBeInTheDocument();
  });

  /* =======================================================
     CAREERS
  ======================================================= */

  test("renders Careers page", () => {
    renderApp("/careers");

    expect(
      screen.getByText("Careers Page")
    ).toBeInTheDocument();
  });

  /* =======================================================
     BLOG
  ======================================================= */

  test("renders Blog page", () => {
    renderApp("/blog");

    expect(
      screen.getByText("Blog Page")
    ).toBeInTheDocument();
  });

  /* =======================================================
     FEEDBACK
  ======================================================= */

  test("renders Feedback page", () => {
    renderApp("/feedback");

    expect(screen.getByText("Feedback Page")).toBeInTheDocument();
  });

  /* =======================================================
     ERROR 500
  ======================================================= */

  test("renders Error 500 page", () => {
    renderApp("/500");

    expect(screen.getByText("500 Error Page")).toBeInTheDocument();
  });

  /* =======================================================
     NO INTERNET
  ======================================================= */

  test("renders No Internet page", () => {
    renderApp("/no-internet");

    expect(screen.getByText("No Internet Page")).toBeInTheDocument();
  });

  /* =======================================================
     ACCESS DENIED
  ======================================================= */

  test("renders Access Denied page", () => {
    renderApp("/access-denied");

    expect(screen.getByText("Access Denied Page")).toBeInTheDocument();
  });

  /* =======================================================
     MAINTENANCE
  ======================================================= */

  test("renders Maintenance page", () => {
    renderApp("/maintenance");

    expect(screen.getByText("Maintenance Page")).toBeInTheDocument();
  });

  /* =======================================================
     EMPTY STATE
  ======================================================= */

  test("renders Empty State page", () => {
    renderApp("/empty");

    expect(screen.getByText("Empty State Page")).toBeInTheDocument();
  });

  /* =======================================================
     UNKNOWN ROUTE
  ======================================================= */

  test("renders 404 page for unknown route", () => {
    renderApp("/this-route-does-not-exist");

    expect(screen.getByText("404 Error Page")).toBeInTheDocument();
  });

  /* =======================================================
     SCROLL TO TOP
  ======================================================= */

  test("renders ScrollToTop component", () => {
    renderApp("/");

    expect(screen.getByTestId("scroll-to-top")).toBeInTheDocument();
  });

  /* =======================================================
     TOAST CONTAINER
  ======================================================= */

  test("renders ToastContainer", () => {
    renderApp("/");

    expect(screen.getByTestId("toast-container")).toBeInTheDocument();
  });
});