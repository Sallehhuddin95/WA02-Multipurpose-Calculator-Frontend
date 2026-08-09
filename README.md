# Multipurpose Calculators v2

A collection of financial calculators built with Next.js App Router, TypeScript, and Tailwind CSS.

## Calculators

- **ASB Financing** — Loan financing and repayment calculator
- **Car Loan** — Hire purchase and auto loan calculator
- **Compound Interest** — Compound interest growth and projection calculator
- **Property Investment** — Real estate investment and return calculator
- **Retirement Fund** — Retirement savings and withdrawal planner

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS 4 |
| Validation | Zod |
| Testing | Vitest + React Testing Library |
| E2E Testing | Playwright |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Type check |
| `npx vitest run` | Run unit and integration tests |
| `npx vitest` | Run tests in watch mode |
| `npx playwright test` | Run end-to-end tests |

## Project Structure

```
├── app/                    # Next.js App Router (routing and layouts)
├── components/             # Global, domain-agnostic UI
│   └── ui/                 # shadcn/ui primitives
├── features/               # Feature modules (one per calculator)
│   ├── asb-financing/
│   ├── car-loan/
│   ├── compound-interest/
│   ├── property-investment/
│   └── retirement-fund/
├── hooks/                  # Global reusable hooks
├── lib/                    # Shared library initialization
├── utils/                  # Pure helper functions
├── types/                  # Global, domain-agnostic types
├── tests/                  # Unit and integration tests
│   ├── unit/
│   ├── integration/
│   └── shared/
├── e2e/                    # Playwright end-to-end specs
├── specs/                  # Feature and behavior specifications
├── docs/                   # Architecture, ADRs, and workflow docs
├── .opencode/agents/       # OpenCode subagent definitions
└── .github/                # Copilot agents and instructions
```

## Architecture

Feature-driven design: each calculator is a self-contained module under `features/` with its own components, hooks, services, types, and schemas. Shared code lives in global folders and is promoted there only when reused across multiple features.

For detailed architecture rules, see `docs/architecture/`.

## Development Approach

This project follows a **spec-driven AI development** model:

1. **Constitution** (`CONSTITUTION.md`) — non-negotiable governance principles
2. **ADRs** (`docs/adr/`) — accepted architectural decisions
3. **Architecture docs** (`docs/architecture/`) — structural and cross-cutting rules
4. **Frontend guideline** (`.github/instructions/`) — coding conventions
5. **Specs** (`specs/`) — feature behavior before implementation
6. **Workflow docs** (`docs/workflow/`) — development and review processes
7. **Agents** (`.opencode/agents/`) — specialized AI subagents

### AI Agent Workflow

When implementing changes, use agents in this order:

`@architect` → `@nextjs-dev` → `@tester` → `@reviewer` → `@documentation`

See `AGENTS.md` for agent descriptions and usage rules.

## License

Private
