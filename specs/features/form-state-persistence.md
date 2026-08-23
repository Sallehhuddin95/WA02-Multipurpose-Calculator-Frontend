# Form State Persistence

## Status

Draft

## Goal

Preserve a user's entered values and calculation results across page refreshes for every calculator form, so a refresh or accidental navigation does not erase work in progress. Only an explicit Reset clears a form.

The mechanism persists entered values only. Results are never stored; on load they are recomputed from the restored values, so they always reflect the current calculation model rather than a stale saved answer.

## Scope

This feature includes:

- localStorage persistence of entered form values for every calculator form
- recomputation of results from restored values on load (results are not persisted)
- an explicit Reset that clears the stored key and resets values and results
- validation of persisted values on load with fallback to defaults
- graceful degradation when storage is unavailable

### Out of scope

- theme and locale persistence, which are already handled by `next-themes` (the `theme` key) and the i18n cookie respectively
- cross-device or cross-browser sync of form values
- sharing or restoring a form via URL parameters
- server-side storage or account-based scenario management
- persisting calculation results

### Persistence mechanism

- Persist via localStorage, values-only. A shared hook (`hooks/use-persisted-state.ts`) owns the read, write, validation, and clear logic for all forms.
- The hook exposes a pure helper `resolvePersistedValue<T>(raw, validate)` that returns `{ value, shouldClear }`. It runs the feature's zod schema over the raw parsed value and reports whether the stored key must be cleared.
- Write timing: persist on every change as the user types, not only on submit or blur. A refresh mid-typing must retain the values entered so far. Debouncing the write is acceptable but must never drop the final value.
- SSR-safety: calculator components are client components that Next.js also server-renders. The hook must use a mounted gate so the persisted value is applied only after hydration, preventing a hydration mismatch between the server-rendered default state and the client-rendered restored state.
- Rehydration validation: on load, parse the stored value and run it through the feature's zod schema. Malformed JSON, schema-invalid values, or a version mismatch fall back to defaults and clear the stored key.

### Storage keys

Use one per-feature key with a version suffix. The naming convention is `<feature>:form:v<N>` for single-form features and `<feature>:<section>:form:v<N>` for features with more than one form, where `<section>` is a short stable slug for the form within the feature.

| Feature | Forms | Storage key |
| --- | --- | --- |
| ASB financing | 1 | `asb-financing:form:v1` |
| Car loan | 1 (plus settlement toggle) | `car-loan:form:v1` |
| Compound interest | 1 | `compound-interest:form:v1` |
| Property investment | 1 | `property-investment:form:v1` |
| Retirement fund | 2 (Section A accumulation, Section B drawdown) | `retirement-fund:accumulation:form:v1`, `retirement-fund:drawdown:form:v1` |
| Salary calculator | 2 (breakdown form, salary projection form) | `salary-calculator:breakdown:form:v1`, `salary-calculator:projection:form:v1` |

The version suffix (`v<N>`) is the schema-migration gate. When a form's input shape changes, the feature bumps `N` and relies on the existing stale-key self-heal (fall back to defaults and clear) rather than writing a migration routine.

## Entry Points

This behavior applies to the form surface of each calculator route:

- ASB financing form
- car loan form, including the early-settlement toggle state
- compound interest form
- property investment form
- retirement fund Section A (accumulation) form and Section B (drawdown) form
- salary calculator breakdown form and salary projection form

## Preconditions

- the user has opened a calculator route in a browser that supports localStorage
- each form defines a zod schema for its input values, which the hook uses to validate restored data
- the shared `usePersistedState` hook exists in `hooks/use-persisted-state.ts` and is reusable by all six features (Rule of Co-Location: all features reuse it)

## Main Flow

1. The user opens a calculator and enters values into the form.
2. As the user types, the shared hook writes the current values to the feature's storage key (for example `asb-financing:form:v1`). Values persist on every change, not only on submit.
3. The user runs the calculation and sees results.
4. The user refreshes the page.
5. On load, the server renders the form in its default state; after hydration, the hook reads the stored key, validates the parsed values against the feature's zod schema, and applies the restored values.
6. The system recomputes results from the restored values and displays them, so the refresh shows the same entered values and results as before.
7. The user presses Reset.
8. The hook removes the stored key and resets both the entered values and the results to defaults.

## Alternate Flows

- If the stored JSON is malformed, the hook falls back to defaults and clears the key; the form renders empty and no error is shown.
- If the stored values fail the feature's zod schema, the hook falls back to defaults and clears the key.
- If the stored key carries an unknown or older version suffix (version drift), the hook treats it as stale, falls back to defaults, and clears the key.
- If localStorage is unavailable (private mode, disabled, or quota exceeded), the hook falls back to in-memory state for the session; the form works normally but does not persist across refreshes and never crashes.
- On the first visit to a form, there is no stored key, so the form renders its defaults.

## Error and Empty States

- Malformed persisted JSON: fall back to form defaults and clear the stored key; no error surfaces to the user.
- Schema-invalid or stale persisted values: fall back to form defaults and clear the stored key; no error surfaces to the user.
- Storage unavailable: fall back to in-memory state; persistence is silently skipped and the form remains fully usable.
- First visit (no stored key): the form renders its default or empty state.
- A failed read, write, or clear never throws to the user and never blocks rendering or calculation.

## Acceptance Criteria

- Entered values persist after a refresh for every form across all six calculators: ASB financing, car loan (including the early-settlement toggle), compound interest, property investment, retirement fund Section A and Section B, and salary calculator breakdown and projection.
- After a refresh, results are restored by recomputing from the persisted values, and the persisted storage contains values only, never computed results.
- Pressing Reset clears the form's stored key and resets both the entered values and the results.
- Malformed persisted JSON, schema-invalid values, and values from an unknown or older storage version fall back to form defaults and clear the stale key without surfacing an error.
- Loading a calculator with persisted values produces no hydration-mismatch warnings in the browser console.
- When localStorage is unavailable, the form still calculates correctly using in-memory state and does not throw.
- The first visit to a form (no stored key) renders the form's default or empty state.
- The storage key for each form follows the `<feature>:form:v<N>` convention, with a `<section>` segment for features that have more than one form.

## Related Specs

- Features:
  - [specs/features/asb-financing.md](./asb-financing.md)
  - [specs/features/car-loan.md](./car-loan.md)
  - [specs/features/compound-interest.md](./compound-interest.md)
  - [specs/features/property-investment.md](./property-investment.md)
  - [specs/features/retirement-fund.md](./retirement-fund.md)
  - [specs/features/salary-calculator.md](./salary-calculator.md)
- UI: [specs/ui/design-tokens-and-theme.md](../ui/design-tokens-and-theme.md) (theme key coexistence)
- Acceptance: [specs/acceptance/initial-calculator-release.md](../acceptance/initial-calculator-release.md)
- ADR: [docs/adr/0011-adopt-localstorage-form-persistence.md](../../docs/adr/0011-adopt-localstorage-form-persistence.md)
