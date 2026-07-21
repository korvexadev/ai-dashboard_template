# Dashboard Agent Rules

This file is the complete agent contract for `dashboard/`. Read `README.md`, `ARCHITECTURE.md`, `PLAN.md`, and relevant `docs/` before changing files.

## Operating rules

- Work from explicit acceptance criteria and keep `PLAN.md` current for non-trivial work.
- Preserve unrelated changes and never commit secrets, production credentials, personal data, build output, or dependency caches.
- Keep changes inside `dashboard/` unless a cross-application task explicitly assigns another folder.
- Never silently change a REST endpoint, socket event, feature flag, or deep-link contract.
- Feature flags never replace backend authorization.
- Finish with lint/type checks, tests, a production build, and a concise handoff.

## Architecture

- App Router route files are thin composition and access-control boundaries.
- Domain behavior lives in `src/features/<feature>/`, not `page.tsx` or generic components.
- REST endpoint adapters and mappers are feature-owned unless genuinely shared.
- Generated OpenAPI clients are never hand-edited; do not introduce another product API style.
- Server components are the default for initial reads; client components are introduced for interaction, browser APIs, or live state.
- Server-only credentials and clients never enter client bundles.
- URL query parameters own shareable table filters, search, pagination, sorting, and selected tabs.

## UI freedom with guardrails

UI layout may evolve freely, but use semantic design tokens and shared primitives for color, spacing, typography, form controls, dialogs, tables, navigation, and status feedback. Do not fork business behavior to support a visual experiment.

All UI must remain responsive, keyboard accessible, screen-reader meaningful, and usable at common zoom levels. Destructive and financial actions require explicit confirmation and server-confirmed results.

## Flags and permissions

- The backend is authoritative for permissions and effective feature access.
- Central route/navigation/action guards consume the flag snapshot; do not scatter string checks through JSX.
- The flag-management UI requires dedicated permission and writes an audit reason.
- A hidden navigation item does not secure a route or mutation.
- Preview changes must show actor/cohort, environment, schedule, owner, and expiry.

## Data and state

- Remote server state stays in the API client cache or server request lifecycle.
- Local component state is used for ephemeral interaction only.
- Avoid a global client store unless an ADR proves a cross-route client-only need.
- Validate forms at the boundary and map API errors to actionable field/global messages.

## REST and sockets

- Server components and server actions call the typed REST client with forwarded session context.
- Client components use narrowly scoped REST hooks/actions; they never construct endpoint URLs directly.
- One authenticated socket provider owns connection, reconnect/backoff, room subscriptions, and connection health.
- Features consume typed socket event adapters and reconcile authoritative state through REST after reconnect or sequence gaps.
- Do not use sockets for ordinary reads or as the sole durable record of an operation.

## Verification

Run formatting/lint, strict type checking, targeted tests, and a production build. Critical operator flows require browser tests, including permission denial, flag-disabled direct URL access, and failed mutation recovery.
