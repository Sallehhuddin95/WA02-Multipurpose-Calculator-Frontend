"use client";

import React from "react";

/**
 * Result of resolving a raw persisted string against a validator.
 *
 * `value` is the validated value when the raw string was usable, otherwise
 * `null`. `shouldClear` is true when the stored key must be removed because the
 * raw string was malformed, failed validation, or carried an unknown shape.
 */
export interface ResolvedPersistedValue<T> {
  value: T | null;
  shouldClear: boolean;
}

/**
 * Parse and validate a raw persisted string.
 *
 * Rules:
 * - `null` raw (no stored key): `{ value: null, shouldClear: false }`.
 * - Malformed JSON: `{ value: null, shouldClear: true }`.
 * - JSON that fails `validate` (returns null): `{ value: null, shouldClear: true }`.
 * - Valid JSON passing `validate`: `{ value: <validated>, shouldClear: false }`.
 *
 * This is a pure helper so it can be unit tested without a DOM or storage.
 */
export function resolvePersistedValue<T>(
  raw: string | null,
  validate: (value: unknown) => T | null,
): ResolvedPersistedValue<T> {
  if (raw === null) {
    return { value: null, shouldClear: false };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { value: null, shouldClear: true };
  }

  const validated = validate(parsed);

  if (validated === null) {
    return { value: null, shouldClear: true };
  }

  return { value: validated, shouldClear: false };
}

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    // Storage unavailable (private mode, disabled, or quota exceeded).
    return null;
  }
}

function writeStorage(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable. Persistence is silently skipped; the form remains
    // fully usable in memory.
  }
}

function removeStorage(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Storage unavailable. Nothing to clear.
  }
}

export interface PersistedStateControls {
  /** Clear the stored key and restore the default value. */
  reset: () => void;
  /**
   * True once the mounted-gate rehydration has run. The initial render uses
   * the default value so server and client HTML match; after mount the hook
   * reads storage, applies a valid persisted value (or clears an invalid one),
   * and flips this flag so callers can recompute derived results exactly once.
   */
  isHydrated: boolean;
}

/**
 * Persist a value to localStorage with a mounted-gate rehydration.
 *
 * - First render (and SSR): returns `defaultValue` and never touches storage,
 *   so server and client render identically.
 * - After mount: reads the stored key, validates it with `validate`, and either
 *   applies the restored value or removes the key when it should be cleared.
 * - `setter` writes through to localStorage on every change (try/catch, never
 *   throws). It accepts either a value or an updater function.
 * - `reset()` removes the stored key and restores `defaultValue`.
 *
 * `validate` must be a stable reference (a module-level function); it is listed
 * as an effect dependency so rehydration runs once per `key`.
 */
export function usePersistedState<T>(
  key: string,
  defaultValue: T,
  validate: (value: unknown) => T | null,
): [T, React.Dispatch<React.SetStateAction<T>>, PersistedStateControls] {
  const [value, setValue] = React.useState<T>(defaultValue);
  const [isHydrated, setIsHydrated] = React.useState(false);
  const valueRef = React.useRef<T>(defaultValue);

  React.useEffect(() => {
    const raw = readStorage(key);
    const { value: persisted, shouldClear } = resolvePersistedValue(
      raw,
      validate,
    );

    if (shouldClear) {
      removeStorage(key);
    } else if (persisted !== null) {
      valueRef.current = persisted;
      setValue(persisted);
    }

    setIsHydrated(true);
  }, [key, validate]);

  function setter(next: React.SetStateAction<T>) {
    const resolved =
      typeof next === "function"
        ? (next as (previous: T) => T)(valueRef.current)
        : next;

    valueRef.current = resolved;
    setValue(resolved);
    writeStorage(key, resolved);
  }

  function reset() {
    removeStorage(key);
    valueRef.current = defaultValue;
    setValue(defaultValue);
  }

  return [value, setter, { reset, isHydrated }];
}
