# Dashboard Architecture

The dashboard is the operator surface for the Mikozi domains defined by the
backend. Its feature folders use the same vocabulary and module order:
`identity`, `access-control`, `taxonomy`, `media`, `newsroom`, `audience`,
`feeds`, `advertising`, `distribution`, and `analytics`. It consumes generated
REST/OpenAPI contracts and does not reproduce backend permissions, workflow
transitions, targeting decisions, or publication rules.

## Directory target

```text
dashboard/
  src/
    app/
      (auth)/
      (dashboard)/
      api/
    features/
      <feature>/
        api/
        components/
        hooks/
        schemas/
        types/
    components/
      ui/
      layout/
    lib/
      auth/
      feature-flags/
      api/
      observability/
      sockets/
    styles/
  tests/
    e2e/
```

## Rendering model

- Layouts establish authentication, navigation, workspace context, and error boundaries.
- Server components fetch initial REST read models close to routes.
- Client feature components handle forms, optimistic interaction, subscriptions, maps, and rich tables.
- Route handlers proxy only when browser security, cookies, uploads, or provider callbacks require it; they do not duplicate backend business logic.

## Feature slices

A feature owns its REST adapters, mapping, UI, validation, socket-event adapters, and tests. Pages import a feature entry point. Shared UI has no domain knowledge; shared domain code must have multiple demonstrated consumers.

## Feature flags

The root layout obtains an effective flag snapshot for the operator. A typed flag catalog drives navigation and route/action guards. The management feature edits canonical backend definitions with audit history, safe defaults, preview cohorts, scheduling, and expiry.

Unknown flags hide dependent UI. Server-side route authorization still runs on direct access.

## UI system

Use semantic tokens and composable primitives so the visual language can change without rewriting feature behavior. Establish accessibility and responsive behavior in primitives. Tables support URL-backed filters, pagination, loading/empty/error states, export status, and stable row identity.

The operator shell uses the native Apple system font stack, the supplied Mikozi
mark, and a compact icon-led navigation model. Desktop operators can collapse
or expand the sidebar; that device-local presentation preference contains no
authorization or identity state. Mobile uses the same navigation semantics in
a reduced top bar. Empty, loading, error, and not-found states remain
dashboard-native rather than switching to a marketing-page layout.

## Real-time and operations

Use the shared authenticated socket client only for genuinely live workflows. Reconnect with bounded backoff, restore rooms, reconcile with a fresh REST request after reconnect, and surface stale/offline state. Administrative REST commands return durable IDs/status when work continues asynchronously, with sockets reporting progress.

## REST client

The backend OpenAPI document generates the dashboard client and transport types. Server-only wrappers attach credentials and correlation headers; browser wrappers use the approved session mechanism. Endpoint adapters translate transport errors into stable feature errors. URL-backed filters map consistently to REST pagination, search, filter, and sort parameters.

## Authentication boundary

The browser calls same-origin route handlers for phone OTP, profile
reconciliation, and logout. Those handlers are a narrow backend-for-frontend
boundary: they forward canonical backend REST commands and never reproduce
identity rules. Access and refresh JWTs are stored only in secure, HttpOnly
cookies. `auth/me` attempts one refresh-token rotation after an expired access
token, stores the rotated pair, and retries the authoritative profile read.
Concurrent refresh attempts in one dashboard instance are coalesced briefly so
development-mode reconciliation, multiple components, or adjacent browser
requests cannot replay a token that another request just rotated. Transient
timeouts, rate limits, and upstream 5xx responses preserve both cookies; only
authoritative invalid, expired, revoked, or forbidden responses clear them.

Protected layouts perform an early server-side cookie-presence redirect, then
reconcile the session through `auth/me` before rendering private content.
Profiles without backend-provided `adminAccess` fail closed. The only remembered
browser value is an optional phone number.

## Testing

- Pure tests for mappings, formatters, schemas, and permission/flag policies.
- Component tests for interactive state and accessibility.
- API mock/contract tests using generated OpenAPI types and fixtures.
- Socket event, reconnect, resubscribe, and REST reconciliation tests.
- Playwright smoke tests for login, navigation, one CRUD journey, permission denial, and critical financial/operational actions.
