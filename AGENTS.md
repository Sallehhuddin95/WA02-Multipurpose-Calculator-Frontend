# Multipurpose Calculators v2

Next.js App Router project — a collection of financial calculators (ASB financing, car loan, compound interest, property investment, retirement fund).

## Project Commands

- **dev**: `npm run dev`
- **build**: `npm run build`
- **lint**: `npm run lint`
- **typecheck**: `npx tsc --noEmit`
- **test (unit/integration)**: `npx vitest run`
- **test (watch)**: `npx vitest`
- **test (e2e)**: `npx playwright test`

## Architecture

Feature-driven structure under `features/` — each calculator is a self-contained feature module.
Global shared code lives in `components/`, `hooks/`, `lib/`, `utils/`, `types/`.

See `docs/architecture/` for detailed architecture, module boundaries, and dependency rules.

## Governance (Spec-Driven Development)

This repo follows a strict spec-driven AI development model. The source-of-truth order is:

1. `CONSTITUTION.md` — repo-wide non-negotiable principles
2. `docs/adr/` — accepted architectural decisions
3. `docs/architecture/` — structural and cross-cutting rules
4. `docs/frontend/` — frontend conventions
5. `specs/` — feature, API, UI, database, and acceptance specs
6. `docs/workflow/` — process expectations (feature dev, review, refactoring, etc.)
7. `.opencode/agents/` — specialized subagents that enforce the above

## Agent Workflow

When implementing changes, use agents in this order:

- `@architect` for structure, boundaries, and ADR decisions
- `@nextjs-dev` for frontend implementation (reads the frontend guideline automatically)
- `@tester` for test design and implementation
- `@reviewer` for merge-readiness review
- `@refactor` for behavior-preserving cleanup
- `@documentation` for docs, specs, and ADR updates

## Key Rules

- Read relevant governing docs before making changes (CONSTITUTION.md §8)
- Specs before implementation for behavior changes (specs/README.md)
- ADRs for durable architectural decisions (CONSTITUTION.md §6)
- Frontend guideline is loaded via `opencode.json` — always follow it
- Tests at the right layer: unit for pure logic, integration for component behavior, e2e for critical flows
