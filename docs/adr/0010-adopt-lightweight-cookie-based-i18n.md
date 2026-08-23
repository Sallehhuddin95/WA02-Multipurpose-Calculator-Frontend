# 0010 Adopt Lightweight Cookie-Based i18n

## Status

Accepted

## Context

The app needs English (default) and Malay language switching. The string inventory is moderate, the app targets a single market (Malaysia), and every route page is a Server Component. There is no requirement today for per-locale SEO or separate `/ms/` URLs.

A full framework-level i18n solution (next-intl) would introduce path-based routing and a heavier abstraction, which is more than the current requirement justifies.

## Decision

Use a custom lightweight i18n solution with a cookie-based locale and no URL prefix.

- a typed `t()` context in `lib/i18n/` with flat JSON catalogs `messages/en.json` and `messages/ms.json` using feature-qualified dot keys (for example `nav.overview`, `asb.strategy.compounding`)
- the locale lives in a cookie named `locale` (`en` default, `ms` optional); there is no URL prefix
- switching writes the cookie and calls `router.refresh()`
- `I18nProvider` hydrates from the server-read cookie in `app/layout.tsx`, and the server reads the cookie during SSR so the first paint is in the correct language
- `<html lang>` and the metadata title and description follow the active locale
- the `t` hook falls back to English when no provider is present, so existing tests stay green

Revisit `next-intl` only if per-locale SEO or shared `/ms/` URLs become a requirement.

## Consequences

Benefits:

- no per-locale URL or routing complexity; URLs stay unchanged
- a small, typed, understandable surface that fits a moderate string inventory
- correct first paint because route pages are Server Components and the cookie is read on the server

Costs and tradeoffs:

- no per-locale URLs or SEO for Malay content (accepted for now)
- translation quality and catalog completeness are maintained by hand rather than by a framework
- the future trigger to revisit `next-intl` is documented so the choice is not re-litigated without new requirements

## Alternatives Considered

### next-intl with path-based routing

Rejected for now. It would add per-locale URLs and a heavier abstraction before any SEO or shared-URL requirement exists. Documented as the trigger to revisit.

### react-i18next

Rejected. It adds a client-heavy library with pluralization and interpolation machinery the app does not need; Malay has no pluralization and the app needs simple keyed catalogs.

### localStorage-only locale

Rejected. `localStorage` is not available during SSR, so first paint would fall back to English and then swap after hydration, producing a flash of the wrong language. A cookie is readable on the server and avoids that flash.
