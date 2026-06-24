# AGENTS.md

## Project Shape

- Bun monorepo (`bun@1.3.14`) with workspaces under `apps/*` and `packages/*`; use Bun commands, not npm/pnpm/yarn.
- Main packages: `apps/api` (Elysia API), `apps/web` (Vue 3/Vite PWA), `packages/db` (Drizzle/SQLite), `packages/shared` (shared Zod/contracts).
- API entrypoint is `apps/api/src/server.ts`; web entrypoint is `apps/web/src/main.ts`; router is `apps/web/src/router/index.ts`.
- API serves built web assets from `apps/web/dist` in production, so production verification needs `bun run build` before `bun --filter @silviorats/api start`.

## Setup And Dev

- First local setup: `bun install`, `cp .env.example .env`, `bun run db:generate`, `bun run db:migrate`, `bun run dev`.
- `bun run dev` starts API with `bun --watch src/server.ts` in background and Vite web in foreground; stop both if restarting.
- Local URLs: web `http://localhost:5173`, API `http://localhost:3000`; Vite proxies `/api` to port `3000`.
- Vite loads env from repo root via `envDir: "../.."`; keep frontend env in root `.env`, not under `apps/web`.

## Commands

- Full quality gate: `bun run lint && bun run typecheck && bun run test`.
- Root scripts: `bun run build`, `bun run lint`, `bun run format`, `bun run typecheck`, `bun run test`.
- Focus a workspace with Bun filters, e.g. `bun --filter @silviorats/web test`, `bun --filter @silviorats/api typecheck`, `bun --filter @silviorats/db test`.
- DB commands from root: `bun run db:generate` after schema changes, then `bun run db:migrate`.
- Web tests use Vitest; API/db/shared tests use `bun test`.

## Data And Runtime Gotchas

- Default local DB is SQLite at `file:./data/silviorats.sqlite`; production Dokploy expects `DATABASE_URL=file:/app/data/silviorats.sqlite` with `/app/data` mounted persistently.
- `packages/db/drizzle.config.ts` strips a `file:` prefix for Drizzle Kit; keep `DATABASE_URL` formats compatible with that behavior.
- API startup applies Drizzle migrations from `packages/db/src/migrations` and bootstraps an admin when `BOOTSTRAP_ADMIN_EMAIL` is set.
- Access is scoped by server-side `SILVIO_INSTANCE_ID`; clients must not choose or override an instance.
- New users become `pending`; feed, hangouts, upload, and admin APIs should remain server-authorized until approval.

## PWA Notes

- Normal browser mode intentionally shows only the install landing page; real app shell loads only in standalone PWA mode.
- Local browser testing can use `VITE_BYPASS_PWA_CHECK=true` from `.env.example`; do not treat that bypass as a security control.
- Feed photos should be cached by `photoId` and `version`, not by presigned URL, because presigned URLs expire/change.

## Style And Generated Files

- Biome is the formatter/linter: 2 spaces, 100 char line width, double quotes, semicolons.
- Biome disables unused import/variable checks only for `*.vue`; TypeScript still has `strict`, `noUnusedLocals`, and `noUnusedParameters`.
- Do not edit `apps/web/dist`, `node_modules`, `data`, build output, or generated migration snapshots by hand unless explicitly regenerating migrations.
- Preserve workspace imports (`@silviorats/db`, `@silviorats/shared`) instead of deep relative imports across packages.

## Hooks And Deploy

- Lefthook pre-commit runs `bun run lint` and `bun run typecheck`; pre-push runs `bun run test`.
- Docker build runs `bun install --frozen-lockfile` then `bun run build`; runtime command is `bun apps/api/src/server.ts`.
- Deployment docs expect GHCR image `ghcr.io/enzodias2006/silviorats:latest` and Dokploy webhook/registry setup.
