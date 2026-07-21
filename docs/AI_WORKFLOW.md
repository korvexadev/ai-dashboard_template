# Dashboard Agent Workflow

1. Read `AGENTS.md`, `PRODUCT.md`, `ARCHITECTURE.md`, and `PLAN.md`.
2. Define acceptance criteria, permissions, flag behavior, and owned paths.
3. Confirm OpenAPI and socket contracts before client work.
4. Update `PLAN.md`; keep one task in progress per active agent.
5. Generate the REST client, then build feature adapters and UI.
6. Verify direct URL access, permission denial, disabled flags, failed commands, and socket reconnect behavior.
7. Run lint, type checking, tests, accessibility checks, and a production build.
8. Handoff changed files, decisions, verification, contract impact, and risks.

Parallel agents require exclusive write ownership. Route shells, generated clients, navigation catalogs, and socket-core files have one writer at a time.
