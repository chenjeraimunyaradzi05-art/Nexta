# Railway Deployment

This repo is set up to deploy the API to Railway from the repository root.

## Deploy Target

- Service root: repository root
- Config file: `railway.toml`
- Image build: `Dockerfile.railway`
- Source entrypoint script: `apps/api/start.sh`
- Source pre-deploy script: `apps/api/railway-predeploy.sh`
- Runtime entrypoint inside the container: `/app/start.sh`
- Runtime pre-deploy command inside the container: `/app/railway-predeploy.sh`
- Healthcheck: `/health/live`
- Rebuild trigger files also include `apps/api/build.mjs`, `apps/api/tsconfig.json`, `apps/api/tsconfig.build.json`, `.dockerignore`, and `apps/api/.dockerignore`

## Required API Variables

Set these in the Railway service before the first production deploy:

- `NODE_ENV=production`
- `DATABASE_URL`
- `JWT_SECRET`

At least one of `JWT_SECRET` or `DEV_JWT_SECRET` is required by the API, but production should use `JWT_SECRET`.

Recommended variables:

- `ALLOWED_ORIGINS`
- `WEB_URL`
- `APP_URL`
- `FRONTEND_URL`
- `REDIS_URL`
- `OPENAI_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SENDGRID_API_KEY`
- `SENDGRID_FROM_EMAIL`
- `AWS_REGION`
- `AWS_S3_BUCKET`

## Deploy Flow

1. Point the Railway service at the repository root.
2. Railway reads `railway.toml` automatically.
3. The Docker image is built with Node 20 from `Dockerfile.railway`.
4. Dependencies are installed without lifecycle scripts until the Prisma schema is copied, then Prisma Client is generated explicitly.
5. `preDeployCommand` runs `sh ./railway-predeploy.sh` inside the built container.
6. Prisma migrations run if `DATABASE_URL` is present and `SKIP_DB_MIGRATIONS` is not `true`.
7. The container starts with `sh ./start.sh`, which launches `node dist/src/index.js`.

## Verification

After deploy, verify:

- `GET /health/live`
- `GET /health/ready`
- `GET /health`
- `GET /docs/openapi.json`

## URL Variable Notes

- `API_URL` should be the public API base URL on Railway.
- `WEB_URL` is used for redirects and links back to the main web app in several routes.
- `APP_URL` is used by payment and email flows for checkout and dashboard links.
- `FRONTEND_URL` is still used by several billing, referral, email, and course-payment flows.
- For now, set `WEB_URL`, `APP_URL`, and `FRONTEND_URL` to the same public web origin unless you intentionally split them.

## Local Notes

- The repo pins Node `20` in `.node-version` and `.nvmrc`.
- The current local machine was running Node `24.7.0`, which did not reliably complete the Next.js production build on Windows because child process spawning returned `EPERM`.
- The API build path was changed to `tsc` so it now builds locally without the esbuild worker dependency.
- The Railway-specific web Dockerfile expects `NEXT_PUBLIC_API_URL` at build time and now installs `wget` in the runtime image so its healthcheck can succeed.
