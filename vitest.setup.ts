import "@testing-library/jest-dom/vitest";
import { beforeEach } from "vitest";

// Form persistence writes to localStorage. Clear it before every test so a
// previous test's persisted form values never leak into the next one.
beforeEach(() => {
  window.localStorage.clear();
});
