import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import QuantitySelector from "./QuantitySelector";

describe("QuantitySelector Component", () => {
  test("renders the current quantity", () => {
    render(
      <QuantitySelector
        quantity={1}
        setQuantity={jest.fn()}
      />
    );

    expect(screen.getByText("1")).toBeInTheDocument();
  });

  test("calls setQuantity when plus button is clicked", () => {
    const setQuantity = jest.fn();

    render(
      <QuantitySelector
        quantity={1}
        setQuantity={setQuantity}
      />
    );

    fireEvent.click(screen.getByLabelText("Increase quantity"));

    expect(setQuantity).toHaveBeenCalledWith(2);
  });

  test("calls setQuantity when minus button is clicked", () => {
    const setQuantity = jest.fn();

    render(
      <QuantitySelector
        quantity={2}
        setQuantity={setQuantity}
      />
    );

    fireEvent.click(screen.getByLabelText("Decrease quantity"));

    expect(setQuantity).toHaveBeenCalledWith(1);
  });

  test("does not decrease quantity below 1", () => {
    const setQuantity = jest.fn();

    render(
      <QuantitySelector
        quantity={1}
        setQuantity={setQuantity}
      />
    );

    fireEvent.click(screen.getByLabelText("Decrease quantity"));

    expect(setQuantity).not.toHaveBeenCalled();
  });

  test("renders both increase and decrease buttons", () => {
    render(
      <QuantitySelector
        quantity={1}
        setQuantity={jest.fn()}
      />
    );

    expect(
      screen.getByLabelText("Increase quantity")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Decrease quantity")
    ).toBeInTheDocument();
  });
});