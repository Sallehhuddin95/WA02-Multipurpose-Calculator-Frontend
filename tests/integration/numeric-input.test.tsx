import React, { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NumericInput } from "@/components/NumericInput";

function ControlledHarness({ initial = 90000 }: { initial?: number }) {
  const [value, setValue] = useState(initial);

  return (
    <div>
      <label htmlFor="amount">Amount</label>
      <NumericInput id="amount" value={value} onValueChange={setValue} />
      <output data-testid="model">{value}</output>
    </div>
  );
}

function getInput() {
  return screen.getByLabelText(/amount/i) as HTMLInputElement;
}

describe("NumericInput", () => {
  it("shows an empty field instead of zero after clearing", () => {
    // Arrange
    render(<ControlledHarness />);

    // Act
    fireEvent.change(getInput(), { target: { value: "" } });

    // Assert
    expect(getInput().value).toBe("");
    expect(screen.getByTestId("model")).toHaveTextContent("0");
  });

  it("starts fresh when typing after clearing", () => {
    // Arrange
    render(<ControlledHarness />);
    fireEvent.change(getInput(), { target: { value: "" } });

    // Act
    fireEvent.change(getInput(), { target: { value: "6" } });

    // Assert
    expect(getInput().value).toBe("6");
    expect(screen.getByTestId("model")).toHaveTextContent("6");
  });

  it("keeps the typed text while syncing the numeric model", () => {
    // Arrange
    render(<ControlledHarness initial={0} />);

    // Act
    fireEvent.change(getInput(), { target: { value: "06" } });

    // Assert
    expect(getInput().value).toBe("06");
    expect(screen.getByTestId("model")).toHaveTextContent("6");
  });
});
