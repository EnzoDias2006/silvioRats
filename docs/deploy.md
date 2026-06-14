# Deployment

## Flow

1. GitHub Actions installs dependencies with Bun.
2. CI runs lint, typecheck, tests, and build.
3. Docker image is built and pushed to GHCR.
4. CI calls the Dokploy webhook.
5. Dokploy pulls `ghcr.io/<owner>/<repo>:latest`.

## Dokploy Environment

Required variables:

- `NODE_ENV=production`
- `PORT=3000`
- `APP_URL`
- `API_URL`
- `BETTER_AUTH_SECRET`
- `DATABASE_URL=file:/app/data/silviorats.sqlite`
- `SILVIO_INSTANCE_ID`
- `BOOTSTRAP_ADMIN_EMAIL`
- `DO_SPACES_ENDPOINT`
- `DO_SPACES_REGION`
- `DO_SPACES_BUCKET`
- `DO_SPACES_ACCESS_KEY_ID`
- `DO_SPACES_SECRET_ACCESS_KEY`
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`

Mount a persistent volume at `/app/data` for SQLite.
