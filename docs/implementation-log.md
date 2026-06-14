# Implementation Log

## Initial Scaffold

- Created Bun workspace monorepo.
- Added API app with Elysia, BetterAuth scaffold, Drizzle SQLite schema, DigitalOcean Spaces presign helper, membership guards, feed, hangout, admin, and push route skeletons.
- Added Vue PWA app with install-only landing, standalone app shell, auth gate placeholder, feed view, hangouts view, admin view, and IndexedDB image cache utility.
- Added Dockerfile, GitHub Actions GHCR deploy workflow, lefthook, Biome, and docs.

## PWA Installability Fix

- Added missing public PWA icons referenced by the web manifest and iOS metadata.
- Added explicit manifest language, scope, portrait-primary orientation, and maskable icon purpose.
- Added Android/desktop install prompt handling via `beforeinstallprompt`, keeping manual iOS instructions.

## Remaining Product Work

- Complete BetterAuth UI flows for email/password sign-up and sign-in.
- Generate and apply Drizzle migrations after dependencies install.
- Add photo download presign endpoint and wire image cache to rendered feed photos.
- Add post creation/upload UI.
- Add admin approve/reject actions in UI.
- Add Web Push send logic for approval and hangout events.
