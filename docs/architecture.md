# SilvioRats Architecture

SilvioRats is a private PWA for a single friend group around Bar do Silvio.

## Stack

- Bun workspaces for runtime, package management, and scripts.
- Vue 3, Vite, TypeScript for the PWA.
- Elysia for the API.
- BetterAuth for email/password auth in the MVP.
- SQLite with Drizzle ORM for persistence.
- DigitalOcean Spaces through the S3 API for private photo storage.
- Web Push for installed PWA notifications.
- Docker image published to GHCR and deployed by Dokploy.

## Access Model

The app has one server-side instance, defined by `SILVIO_INSTANCE_ID`. Clients never choose an instance. New users become `pending` and cannot access feed, hangouts, photo upload, or admin APIs until an admin approves them.

## PWA Gate

Browser access shows only an install landing page. The app shell loads only when the browser reports standalone PWA mode. API authorization remains the real security boundary.

## Image Cache

Feed photos are intended to be cached as Blobs in IndexedDB. The app stores image data locally by `photoId` and `version`, not by presigned URL, because presigned URLs expire and change.
