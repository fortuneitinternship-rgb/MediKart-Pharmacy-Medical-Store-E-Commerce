import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import NoInternet from "./NoInternet";

describe("NoInternet Component", () => {
  beforeEach(() => {
    Object.defineProperty(window, "location", {
      writable: true,
      value: { reload: jest.fn() },
    });
  });

  test("renders no internet icon", () => {
    render(<NoInternet />);

    expect(screen.getByText("📶")).toBeInTheDocument();
  });

  test("renders heading", () => {
    render(<NoInternet />);

    expect(
      screen.getByText("No Internet Connection")
    ).toBeInTheDocument();
  });

  test("renders message", () => {
    render(<NoInternet />);

    expect(
      screen.getByText("Please check your network and try again.")
    ).toBeInTheDocument();
  });

  test("renders Retry button", () => {
    render(<NoInternet />);

    expect(
      screen.getByRole("button", { name: /Retry/i })
    ).toBeInTheDocument();
  });

  test("calls window.location.reload when Retry button is clicked", () => {
    render(<NoInternet />);

    fireEvent.click(
      screen.getByRole("button", { name: /Retry/i })
    );

    expect(window.location.reload).toHaveBeenCalled();
  });
});