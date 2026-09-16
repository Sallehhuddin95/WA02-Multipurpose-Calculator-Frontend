# 0014 Standardize Malay Financial Copy and Punctuation

## Status

Accepted

## Context

The Malay catalog (`messages/ms.json`) was written with literal translations of
financial product terms that Malaysians never say in Malay ("pembiayaan baki
berkurangan bulanan", "kadar rata", "Peraturan 78", "leveraj", "pengimbang
dividen"). The copy sounded translated rather than local, and sentence
punctuation used em dashes and middots that read as machine-generated.

Malaysians talk about finance by code-switching: Malay grammar with English
product terms ("bayaran bulanan Reducing Balance Financing"). The catalog
should match that norm.

## Decision

Adopt a two-part content standard for all UI copy:

1. **Manglish code-switching for Malay.** Financial, technical, and regulatory
   product terms stay in English (Title Case) inside otherwise-Malay phrases:
   Reducing Balance, Flat Rate, Rule of 78, leverage, Dividend Offset, vs,
   EIR, REIT, MRTT, MLTT, Lindung24. Everyday concepts keep their natural
   Malay words: pinjaman, bayaran, ansuran, kadar, faedah, tempoh, dividen,
   caruman, potongan, unjuran, simpanan, tunai, pulangan. Statutory acronyms
   keep the dual form Malaysians know: KWSP (EPF), PERKESO (SOCSO), SIP (EIS),
   PCB (MTD).
2. **Plain hyphens only.** The only allowed separator is the ASCII hyphen `-`
   (U+002D), e.g. "Year 1 - Q2". En dashes, em dashes, and middots are
   forbidden in both catalogs. Em dashes in sentence copy are restructured
   into periods or parentheses, not swapped for hyphens. A guard test in
   `tests/unit/i18n-catalog.test.ts` scans both catalogs and fails on any
   en dash, em dash, or middot so the rule cannot regress.

Tone is conversational but professional: formal `anda`, short imperatives,
plain actionable errors. No pluralization (unchanged, per ADR 0010).

## Consequences

Benefits:
- Malay copy reads the way local users speak about money
- one enforced punctuation rule instead of mixed typographic separators
- future Malay strings have a default policy instead of ad-hoc translation

Costs and tradeoffs:
- about 50 existing Malay strings changed at once, plus 4 middot fixes in
  `en.json`; test expectations updated to match
- one deliberate leftover: `route.carLoan.assumptions` still says "kadar
  tetap (kadar rata dengan rebat Rule of 78)"; only the rebat fragment was
  converted pending a wording review

## Alternatives Considered

### Fully Malay copy with Dewan Bahasa-style terms

Rejected. Terms like "baki berkurangan" and "Peraturan 78" are technically
Malay but incomprehensible to users shopping for loans, who know these
products by their English names.

### Fully English UI, dropping the Malay catalog

Rejected. The bilingual UI is a committed feature (ADR 0010) and the Malay
catalog only needed better wording, not removal.
