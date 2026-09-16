import React, { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { SegmentedControl } from "@/components/SegmentedControl";

const options = [
  { label: "First option", value: "first" },
  { label: "Second option with a very long label", value: "second" },
];

function ControlledHarness() {
  const [value, setValue] = useState("first");

  return (
    <SegmentedControl
      label="Choice"
      onValueChange={setValue}
      options={options}
      value={value}
    />
  );
}

describe("SegmentedControl", () => {
  it("exposes the options as a labelled radio group with the current value checked", () => {
    // Arrange + Act
    render(<ControlledHarness />);

    // Assert
    expect(
      screen.getByRole("radiogroup", { name: "Choice" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "First option" })).toBeChecked();
    expect(
      screen.getByRole("radio", {
        name: "Second option with a very long label",
      }),
    ).not.toBeChecked();
  });

  it("selects the clicked option", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ControlledHarness />);

    // Act
    await user.click(screen.getByRole("radio", { name: /second option/i }));

    // Assert
    expect(
      screen.getByRole("radio", { name: /second option/i }),
    ).toBeChecked();
    expect(
      screen.getByRole("radio", { name: "First option" }),
    ).not.toBeChecked();
  });

  it("moves selection with arrow keys", async () => {
    // Arrange
    render(<ControlledHarness />);
    const firstOption = screen.getByRole("radio", { name: "First option" });

    // Act - Radix moves focus on the next tick, so wait for the update.
    firstOption.focus();
    fireEvent.keyDown(firstOption, { key: "ArrowRight" });

    // Assert
    await waitFor(() => {
      expect(
        screen.getByRole("radio", { name: /second option/i }),
      ).toBeChecked();
    });
  });
});
