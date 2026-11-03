# PokéWishlist

Vercel : https://ci-nuxt.vercel.app
Cloudfront : https://d1lv2rpdnes9j1.cloudfront.net
API : https://19993l7s6i.execute-api.eu-north-1.amazonaws.com

![coverage](https://github.com/ImLyenx/ci-nuxt/raw/badges/coverage.svg)

Nuxt front, Hono API on AWS Lambda, Supabase Postgres.

- `web`: Nuxt app. SSR on Vercel, SSG on S3 + CloudFront
- `api`: Hono API, deployed to Lambda + API Gateway
- `infra`: CDK stacks
- `db`: SQL migrations and their runner

## Setup

```bash
pnpm install
cp .env.example .env
pnpm db:migrate
pnpm dev
```

## Checks

```bash
pnpm lint
pnpm format:check
pnpm typecheck
pnpm check:i18n
pnpm test:coverage
pnpm test:e2e
pnpm build
```

Tests need a disposable Postgres in `TEST_DATABASE_URL`, they truncate its tables:

```bash
docker run -d -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:17
DATABASE_URL=$TEST_DATABASE_URL pnpm db:migrate
```

## CI/CD

Every push runs lint, format, typecheck, i18n, unit and integration tests with coverage, build and E2E.
On `master`, once everything is green:

1. `deploy.yml` migrates the database and deploys the API with CDK
2. it generates the static site, syncs it to S3 and invalidates CloudFront
3. `scripts/smoke.sh` checks the API and the static site
4. Vercel deploys the SSR site, then `smoke-vercel.yml` checks it

GitHub secrets: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `DATABASE_URL`.
GitHub variables: `API_BASE_URL`, `CORS_ORIGIN`, `WEB_BUCKET`, `WEB_DISTRIBUTION_ID`, `WEB_URL`, `SSR_URL`.

## Rollback

- AWS: run the Deploy workflow from the Actions tab with the last good commit as `ref`.
  Migrations only move forward, so the old code must still work with the current schema.
- Vercel: promote the previous deployment from the dashboard (Instant Rollback), or `vercel rollback`.
