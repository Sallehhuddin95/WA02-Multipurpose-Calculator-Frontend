# 0012 Deploy via GitHub Actions to Vercel

## Status

Accepted

## Context

The app is a Next.js frontend-only calculator suite with no backend service. It needs a hosted production URL and preview deployments for pull requests so reviewers can see changes before merge. The repository already runs on GitHub with a CI workflow, so a deployment pipeline that lives next to the code and runs on the same platform is the natural fit.

Vercel is the chosen hosting platform because it is a first-class Next.js host with zero-config builds, edge rendering, and environment-based preview URLs. The question is how the deployment is triggered.

## Decision

Deploy the app to Vercel from GitHub Actions using the official Vercel CLI:

- a `deploy-vercel.yml` workflow runs on every push to `main` (production) and every pull request (preview)
- the workflow uses `vercel pull`, `vercel build`, and `vercel deploy --prebuilt` with the official CLI, not a third-party action
- secrets are stored in GitHub: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- the preview URL is posted as a comment on the pull request
- a `ci.yml` workflow keeps validation (lint, typecheck, tests, build) as a separate gate that runs on every pull request

## Consequences

Benefits:

- deployments run in the same place as the rest of the repository workflow, so triggers, permissions, and history are visible in one dashboard
- using the official Vercel CLI avoids depending on a third-party action that could lag behind Vercel's deployment contract
- preview deployments for every pull request make review feedback concrete without touching production
- CI remains a separate concern, so a failing deploy never masks failing tests and vice versa

Costs and tradeoffs:

- three repository secrets must be created and rotated manually in GitHub
- the build runs twice for pull requests (once in CI, once in the deploy step), which costs a little extra runner time
- Vercel's native Git integration would be simpler, but it would move deployment out of the repository and make the pipeline less visible and less configurable

## Alternatives Considered

### Vercel native Git integration

Rejected. It is the fastest way to go live, but deployment settings live inside the Vercel dashboard rather than the repository, which conflicts with the repo's principle that workflow expectations live in code and are visible to every contributor.

### Third-party action (for example amondnet/vercel-action)

Rejected. It wraps the same CLI with an extra dependency layer. The official CLI is stable, documented, and removes the risk of a wrapper action drifting from Vercel's API.

### Another host (Netlify, Cloudflare Pages, GitHub Pages)

Rejected. Vercel is the strongest zero-config fit for this Next.js app, and no reason exists to introduce a second platform for a single frontend deployment.