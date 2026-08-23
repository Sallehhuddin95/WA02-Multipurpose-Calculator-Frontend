import { describe, expect, it } from "vitest";

import { resolvePersistedValue } from "@/hooks/use-persisted-state";

describe("resolvePersistedValue", () => {
  it("returns no value and no clear when the raw string is null", () => {
    const result = resolvePersistedValue(null, () => 42);

    expect(result).toEqual({ value: null, shouldClear: false });
  });

  it("returns the validated value when JSON parses and validate accepts it", () => {
    const validate = (value: unknown) =>
      typeof value === "number" ? value * 2 : null;

    const result = resolvePersistedValue("21", validate);

    expect(result).toEqual({ value: 42, shouldClear: false });
  });

  it("flags a clear when the raw string is malformed JSON", () => {
    const result = resolvePersistedValue("{not json", () => 42);

    expect(result).toEqual({ value: null, shouldClear: true });
  });

  it("flags a clear when validate returns null", () => {
    const result = resolvePersistedValue('{"ok":true}', () => null);

    expect(result).toEqual({ value: null, shouldClear: true });
  });
});
