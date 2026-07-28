# Mikozi Dashboard Plan

Status values are `pending`, `in_progress`, `blocked`, and `done`. Work follows
the shared contract-first loop in `../backend/docs/DELIVERY_WORKFLOW.md`.

## 0. Platform foundation and contract tooling

- [x] `done` Scaffold Next.js App Router with strict TypeScript, environment
      validation, semantic design tokens, accessible primitives, and test/build
      gates.
- [x] `done` Generate the REST client from the backend OpenAPI artifact and
      enforce drift checks.
- [x] `done` Normalize the operator UI with readable typography,
      conventional workspace hierarchy, restrained status treatments, and
      consistent responsive tables, forms, navigation, and feedback states.
- [ ] `in_progress` Establish server/client authentication boundaries, common error
      mapping, URL-owned table state, audit context, and observability.

### Operator UI cleanup acceptance criteria

- Preserve the existing routes, navigation labels, authentication boundary,
  generated contracts, form fields, and article behavior.
- Use the existing Mikozi mark, system font stack, neutral surfaces, and one
  restrained red brand accent without decorative gradients or unnecessary
  motion.
- Dashboard, article, composer, reader, and activity views use readable
  production UI type sizes and consistent controls, borders, radii, and focus
  states.
- The overview prioritizes real operator destinations and implementation
  availability without invented editorial metrics.
- Desktop, tablet, and mobile layouts remain keyboard accessible and avoid
  clipped actions, unreadable tables, or horizontal page overflow.

## 1. Phone identity and admin access

- [x] `done` Build admin phone OTP sign-in, JWT refresh/logout, protected layouts,
      and safe expired/revoked-session recovery.
- [ ] `pending` Build permission-aware navigation, direct-route guards, roles,
      permission assignments, exceptions, and audit history.
- [ ] `pending` Pass the shared identity/access acceptance journey with backend.

### Authentication slice acceptance criteria

- The sign-in journey uses only the canonical REST endpoints:
  `request-otp`, `verify-otp`, `me`, `refresh-token`, and `logout`.
- The browser never receives or persists access or refresh tokens. The dashboard
  BFF stores both in secure, HttpOnly cookies and rotates the refresh token when
  recovering an expired access token.
- Only profiles with `adminAccess` can enter the operator workspace. Any session
  issued to a non-admin during verification is revoked before access is denied.
- Protected routes check for a server session before rendering and reconcile the
  session against `auth/me`; expired, revoked, and unauthorized sessions return
  to sign-in without a redirect loop.
- OTP input, resend, errors, pending states, and keyboard/focus behavior are
  accessible and responsive. Remembered sign-in state contains only a phone
  number, never credentials or tokens.
- Development and production builds run in Docker, and lint, strict type checks,
  unit tests, OpenAPI drift checks, and the production build pass.

## 2. Taxonomy and media

- [ ] `pending` Build section/topic/tag management with stable slugs and
      compatible edits.
- [ ] `pending` Build media upload, processing state, rights, caption, alt text,
      rendition, usage, and failure recovery.
- [ ] `pending` Pass the shared taxonomy/media acceptance journey.

## 3. Newsroom publishing

- [x] `done` Complete the Articles create/read vertical slice with generated
      REST types, refresh-aware BFF routes, ordered section composer, list,
      reader, super-admin activity log, and production verification.
- [ ] `in_progress` Build editorial queues, drafts, structured content, autosave,
      preview, revision comparison, review, schedule, publish, correction, archive,
      restore, and audit.
- [ ] `pending` Enforce action permissions and resilient concurrent-edit and
      failed-publication states.
- [ ] `pending` Pass the shared publish-and-read journey with backend and mobile.

### Article creation/read slice acceptance criteria

- Articles navigation, list, creation, and detail reading use the generated
  REST contract and the existing HttpOnly session boundary.
- The creation composer supports any number of ordered rich-text, image,
  YouTube, and advert sections with accessible type-specific validation.
- Successful creation opens the authoritative backend read model; failures
  preserve the draft form and show a stable actionable error.
- Empty, loading, unauthorized, not-found, and service-unavailable states use
  the dashboard visual system. No authorization rule is reproduced client-side.

### Article authoring upgrade acceptance criteria

- Article list, create redirect, browser route, breadcrumb, and BFF reads use
  the backend-provided article slug rather than the database ID.
- Sections can be reordered by pointer, touch, or keyboard drag-and-drop while
  retaining the one-step up/down controls as an accessible fallback.
- Rich-text sections use a maintained JavaScript editor with formatting,
  history, lists, links, and Markdown serialization; section headings are not
  offered or rendered.
- The composer keeps editing controls on the left and shows a large, sticky,
  live phone preview on the right across supported responsive layouts.
- The article reader keeps its linked article path visible while scrolling and
  displays the current slug.

### Article management workflow acceptance criteria

- The article table uses URL-owned search, status, sorting, direction, and
  pagination parameters backed by the canonical REST list endpoint.
- Editors can update an article through the existing structured composer;
  successful saves open the authoritative new revision and stale saves remain
  recoverable.
- Article detail actions consume backend-provided available transitions, show
  server-confirmed results, and require explicit confirmation before deletion.
- Successful deletion returns to the article list. Failed status, update, and
  delete commands retain the current view and show the backend-safe error.
- Article detail includes a clearly unavailable engagement scaffold for future
  comments and likes without displaying invented counts or client-owned rules.

## 4. Reader discovery and audience preferences

- [ ] `pending` Build homepage/feed curation, editorial priority controls, safe
      audience-policy preview, and explainable placement inspection.
- [ ] `pending` Build consent-aware segment administration without exposing raw
      protected reader attributes.
- [ ] `pending` Pass the shared discovery/personalization journey.

## 5. Advertising

- [ ] `pending` Build placements, campaigns, flights, creatives, budgets,
      targeting, frequency caps, approval, pause/resume, and audit.
- [ ] `pending` Build decision/reconciliation reporting that keeps commercial
      controls separate from editorial ranking.
- [ ] `pending` Pass the shared advertising delivery journey.

## 6. Reader engagement and search

- [ ] `pending` Build search/index operations, suggestion controls, rebuild
      status, and privacy-safe engagement configuration where operator action is
      required.
- [ ] `pending` Build moderation, retention, and audited reader-data support
      tools without exposing unnecessary personal history.
- [ ] `pending` Pass the shared engagement/search acceptance journey.

## 7. Distribution, deep links, and notifications

- [ ] `pending` Build canonical-link management, link resolution diagnostics,
      breaking-news approval, notification operations, syndication status, and
      delivery reconciliation.
- [ ] `pending` Add sockets only for justified live workflows with REST
      reconciliation.
- [ ] `pending` Pass the shared distribution acceptance journey.

## 8. Analytics, operations, and hardening

- [ ] `pending` Build privacy-safe editorial/commercial analytics, audited
      exports, system health, job/reconciliation views, and operational controls.
- [ ] `pending` Complete accessibility, security, recovery, browser,
      performance, and production-readiness gates.
- [ ] `pending` Pass the final cross-application production-readiness journey.
