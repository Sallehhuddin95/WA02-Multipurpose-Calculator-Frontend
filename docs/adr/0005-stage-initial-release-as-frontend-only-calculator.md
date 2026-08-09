# 0005 Stage Initial Release as Frontend-Only Calculator

## Status

Accepted

## Context

The planned initial scope is a set of deterministic financial calculators:

- ASB financing comparison
- compound interest calculator
- car loan and early settlement calculator
- property investment versus REIT comparison

These capabilities do not require authentication, shared user state, server persistence, or third-party system integration in the initial release.

Introducing a dedicated backend and session layer at the start would add deployment, contract, and maintenance complexity before the product has any server-owned behavior that justifies it.

The existing architecture guidance already standardizes the frontend on Next.js App Router. The backend ADRs remain relevant if a backend is introduced later, but they should not force premature infrastructure into a calculator-only first release.

## Decision

The initial release will be implemented as a frontend-only Next.js application.

Calculator execution, scenario comparison, and result rendering will run inside the frontend application without a dedicated FastAPI backend in v1.

The initial release will not introduce:

- application authentication
- server-managed sessions
- server-side persistence for user scenarios
- backend APIs created only to proxy deterministic calculator logic

If later requirements introduce saved scenarios, cross-device access, collaboration, protected data, or integrations that require server-owned logic, a backend may be added at that time. Any future backend must follow the layered structure in ADR 0002, and any authentication layer must follow ADR 0003 and ADR 0004.

## Consequences

Benefits:

- lower implementation and deployment complexity for v1
- faster iteration on feature formulas and UX
- fewer premature transport and authentication decisions
- clearer focus on feature boundaries and pure calculation correctness first

Costs and tradeoffs:

- future saved-scenario or account features will require an architectural expansion step
- frontend code must stay disciplined so client-side calculator logic does not become entangled with route concerns
- some future features may require moving shared contracts from in-process TypeScript types to explicit API contracts

## Alternatives Considered

### Full-Stack Backend From Day One

Rejected because the initial scope does not yet need server-owned state or protected workflows, and introducing a backend now would add structure without immediate product value.

### Minimal SPA Outside the Existing Next.js Direction

Rejected because the repository already standardizes on Next.js App Router for frontend structure, routing, and long-term scalability.
