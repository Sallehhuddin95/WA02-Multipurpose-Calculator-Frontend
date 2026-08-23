# Language Switching (English and Malay)

## Status

Draft

## Goal

Let the user switch the app's user-facing copy between English (default) and Malay across the app shell, the home page, and every calculator surface, while leaving numeric and currency formatting, URL structure, and calculation logic unchanged.

## Scope

### In scope

The following surfaces are translated through the i18n catalogs:

- the 7 shared navigation items (Overview plus the six calculators) in the Header, `PrimaryNav`, and `MobileMenu`
- the Header site name, theme toggle `aria-label`, and language switch `aria-label`
- home page copy: hero tagline, "All Shipped" completion heading, calculator grid summaries, "About this app" card, and feedback CTA
- every calculator page's route heading, assumptions notice, form labels, helper text, buttons, validation errors, metric labels, table headers, and glossary definitions
- period and depletion labels (for example "years" and "months", and their Malay equivalents "tahun" and "bulan")
- the `<html lang>` attribute
- the per-page metadata title and description

### Out of scope

- numeric and currency formatting semantics: `formatCurrency` output is unchanged across locales (en-MY and ms-MY produce identical output)
- URL structure: no per-locale prefix or `/ms/` routes
- calculation logic and result values

## Locale Strategy

- The locale is stored in a cookie named `locale` with a value of `en` (default) or `ms`.
- There is no URL prefix; locale is not part of the route path.
- Switching writes the `locale` cookie and calls `router.refresh()` so server-rendered surfaces re-render in the new locale.
- The server reads the `locale` cookie during SSR so the first paint is already in the correct language; `I18nProvider` hydrates from that server-read cookie in `app/layout.tsx`.
- The `locale` cookie is a non-`httpOnly` UI preference cookie and is explicitly distinct from authentication tokens, which remain `httpOnly` server-managed session cookies per frontend guideline §9. It holds no sensitive data.

## Entry Points

- the Header controls cluster, where the `LanguageSwitch` two-state segmented pill ("EN / MS") sits next to the theme toggle (desktop)
- the `MobileMenu` panel, which repeats the same controls below `md`
- the server-side layout read of the `locale` cookie in `app/layout.tsx`

## Preconditions

- the app renders with a locale in effect on every route, defaulting to `en` when no `locale` cookie is present
- the typed `t()` context in `lib/i18n/` and the flat JSON catalogs `messages/en.json` and `messages/ms.json` are present with feature-qualified dot keys (for example `nav.overview`, `asb.strategy.compounding`)
- validation schemas are built through `createXSchema(t)` so their messages localize, and the salary service emits `labelKey` values instead of hardcoded English strings

## Main Flow

1. The user opens the app with no `locale` cookie; the server reads no cookie, defaults to `en`, and renders English copy with `<html lang="en">`.
2. The user activates the `LanguageSwitch` and selects Malay.
3. The client writes the `locale` cookie to `ms` and calls `router.refresh()`.
4. The server re-renders with the `ms` locale, updating `<html lang="ms">`, the metadata title and description, and all translated surfaces.
5. The user navigates to any calculator page and sees Malay copy throughout.

## Alternate Flows

- If no `I18nProvider` is present in a render tree, the `t` hook falls back to English so existing tests and standalone renders remain green.
- Malay does not pluralize: "1 tahun" is correct and "1 tahuns" is never produced. English "years"/"months" map to Malay "tahun"/"bulan" unchanged, handled with conditional catalog strings rather than `Intl.PluralRules`.
- If a translation key is missing from the Malay catalog, the `t` hook falls back to the English string for that key rather than rendering a raw key.
- Switching back to English writes `en` and refreshes, restoring English copy and `<html lang="en">`.

## Error and Empty States

- This feature introduces no new error or empty states of its own. Missing catalogs or keys degrade to English fallback rather than blocking rendering.

## Acceptance Criteria

- The app defaults to English on first visit when no `locale` cookie is set.
- Switching to Malay translates all 7 navigation items and a representative calculator's labels immediately.
- The chosen language persists across reloads and navigation.
- `<html lang>` and the page title and description follow the active locale.
- Malay does not pluralize period labels ("1 tahun", not "1 tahuns").
- Existing English behavior is unchanged when no cookie is set.

## Related Specs

- UI: [specs/ui/initial-calculator-app.md](../ui/initial-calculator-app.md)
- UI: [specs/ui/design-tokens-and-theme.md](../ui/design-tokens-and-theme.md)
- Acceptance: [specs/acceptance/initial-calculator-release.md](../acceptance/initial-calculator-release.md)
- ADR: [docs/adr/0010-adopt-lightweight-cookie-based-i18n.md](../../docs/adr/0010-adopt-lightweight-cookie-based-i18n.md)
