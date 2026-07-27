# Mikozi Dashboard

The operator workspace for Mikozi. It is a Next.js App Router application that
uses the backend's versioned REST/OpenAPI contract. The browser talks to local
route handlers for authentication so access and refresh tokens remain in
HttpOnly cookies.

## Run in Docker

The backend development app must be available on port `9289`.

```sh
docker compose build --no-cache app-development
docker compose up -d app-development
```

Open `http://localhost:3000/auth`. Production and staging use the same runtime
image:

```sh
docker compose build --no-cache app
docker compose up -d app

docker compose build --no-cache app-staging
docker compose up -d app-staging
```

Override `MIKOZI_API_URL` when the backend is not reachable at
`http://host.docker.internal:9289/api/v1`.

## Run the UI on the host

Keep the backend and infrastructure containerized, then run only the Next.js
development UI on macOS:

```sh
cd ../backend
docker compose up -d postgres redis meilisearch app-development

cd ../dashboard
pnpm install
pnpm dev
```

Host development uses `MIKOZI_API_URL=http://localhost:9289/api/v1`. Do not run
the dashboard `app-development` container at the same time because both modes
claim port `3000`.

## Quality gates

```sh
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm api:check
pnpm build
```

Run `pnpm api:generate` after an intentional backend OpenAPI change. Generated
transport types in `src/lib/api/generated.ts` are never edited manually.
