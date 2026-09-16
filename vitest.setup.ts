import "@testing-library/jest-dom/vitest";
import { beforeEach } from "vitest";

// Radix primitives observe element size internally, but JSDOM does not
// implement ResizeObserver. Provide a minimal no-op stub for tests.
if (typeof window.ResizeObserver === "undefined") {
  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}

// Form persistence writes to localStorage. Clear it before every test so a
// previous test's persisted form values never leak into the next one.
beforeEach(() => {
  window.localStorage.clear();
});
