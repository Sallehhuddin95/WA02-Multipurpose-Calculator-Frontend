# 0011 Adopt localStorage Form Persistence

## Status

Accepted

## Context

Every calculator form loses its entered values on refresh today. A user who has filled in a financing principal, run a projection, and then refreshed the page must re-enter everything from scratch. This affects seven forms across six calculators: ASB financing (one form), car loan (one form plus a settlement toggle), compound interest (one form), property investment (one form), retirement fund (Section A accumulation and Section B drawdown), and salary calculator (breakdown form and salary projection form).

Results are a pure function of the entered values, so they can always be recomputed and do not need to be stored. The app is client-only with no accounts or credentials, and the frontend guideline only forbids storing auth tokens in localStorage (section 9); ordinary form draft values are not credentials. Theme (the `theme` key) and locale (a cookie) are already persisted independently and do not conflict with form persistence.

## Decision

Persist calculator form values in localStorage via a single shared `usePersistedState` hook with per-feature versioned keys (`<feature>:form:v<N>`), recomputing results on load.

- Values-only persistence: only entered values are written; results are recomputed from the restored values and never stored, so they can never go stale against the calculation model.
- Shared hook: `hooks/use-persisted-state.ts` is shared by all six features because every feature reuses it (Rule of Co-Location), with a pure helper `resolvePersistedValue<T>(raw, validate)` returning `{ value, shouldClear }`.
- Per-feature versioned keys: `<feature>:form:v<N>` for single-form features and `<feature>:<section>:form:v<N>` for multi-form features, for example `asb-financing:form:v1` and `retirement-fund:accumulation:form:v1`.
- Rehydration: values are applied through a mounted gate after hydration to avoid a server/client mismatch, then validated against the feature's zod schema. Malformed JSON, schema-invalid values, or version drift fall back to defaults and clear the stored key.
- Write timing: values persist on every change as the user types, not only on submit, so a refresh mid-typing retains the values entered so far.
- Failure handling: storage unavailability (private mode, disabled, or quota exceeded) falls back to in-memory state and never crashes.
- Reset: clears the stored key and resets both values and results.

## Consequences

Benefits:

- refresh and accidental navigation no longer erase in-progress work across all seven forms
- versioned keys give each form an explicit schema-migration gate; a shape change bumps the version and stale data self-heals to defaults instead of requiring a migration routine
- values-only storage means results always reflect the current calculation model and can never drift stale
- one shared hook keeps the read, write, validate, and clear behavior in a single place instead of six copies

Costs and tradeoffs:

- storage failures must be handled at every read and write, which adds a small amount of defensive logic to the hook
- each form must define and maintain a zod schema for rehydration validation
- the mounted gate adds a hydration step; until hydration completes, the form renders its defaults, so the restored values appear slightly after first paint rather than in the server HTML

## Alternatives Considered

### sessionStorage

Rejected. It loses data when the tab closes, which defeats the goal of preserving work across a refresh or accidental navigation.

### URL parameters

Rejected. It clutters the URL and mismatches the sharing model; a copied URL would carry a full set of form inputs rather than a clean calculator link.

### Persist results too

Rejected. Results are derived values; storing them risks showing a stale answer that no longer matches the calculation model or the restored inputs.

### Per-feature inline persistence logic

Rejected. It duplicates read, write, validation, and clear logic across six features and drifts; a shared hook with a versioned-key convention is the single source of truth.
