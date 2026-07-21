# Dashboard Template

Next.js operations and administration client. It follows the same domain vocabulary and API contracts as the backend while allowing UI experimentation behind a stable design-system and accessibility boundary.

Recommended foundation: Next.js App Router, TypeScript strict mode, React, an OpenAPI-generated REST client, a shared authenticated socket client, Tailwind, a tokenized component system, schema validation, and a modern test runner plus Playwright.

All product reads and commands use versioned REST endpoints. Sockets provide live operational updates, chat, presence, locations, and background-operation progress. REST/OpenAPI is the only client API contract in this template.
