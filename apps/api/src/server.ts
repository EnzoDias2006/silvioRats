import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { logger as elysiaLogger } from "@bogeychan/elysia-logger";
import { openapi } from "@elysia/openapi";
import cors from "@elysiajs/cors";
import { db, memberships } from "@silviorats/db";
import { migrationsFolder } from "@silviorats/db/migrate";
import { and, eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { Elysia } from "elysia";
import { auth } from "./auth/auth";
import { env, isProduction } from "./lib/env";
import { adminRoutes } from "./modules/admin/routes";
import { feedRoutes } from "./modules/feed/routes";
import { hangoutRoutes } from "./modules/hangouts/routes";
import { pushRoutes } from "./modules/push/routes";

const webDistPath = join(process.cwd(), "apps/web/dist");

async function applyMigrations() {
  if (!existsSync(migrationsFolder)) {
    console.warn("Database migrations folder not found. Skipping migrations.");
    return;
  }

  migrate(db, { migrationsFolder });
}

function getContentType(path: string) {
  if (path.endsWith(".html")) return "text/html; charset=utf-8";
  if (path.endsWith(".js")) return "application/javascript; charset=utf-8";
  if (path.endsWith(".css")) return "text/css; charset=utf-8";
  if (path.endsWith(".webmanifest")) return "application/manifest+json; charset=utf-8";
  if (path.endsWith(".svg")) return "image/svg+xml";
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".ico")) return "image/x-icon";
  if (path.endsWith(".woff2")) return "font/woff2";
  return "application/octet-stream";
}

function serveWebFile(relativePath: string) {
  const safePath = relativePath.replace(/^\/+/, "");
  const filePath = join(webDistPath, safePath);

  if (!filePath.startsWith(webDistPath) || !existsSync(filePath) || !statSync(filePath).isFile()) {
    return undefined;
  }

  return new Response(Bun.file(filePath), {
    headers: { "Content-Type": getContentType(filePath) },
  });
}

function isStaticAssetPath(path: string) {
  return /\.[a-z0-9]+$/i.test(path);
}

function isManifestAssetPath(path: string) {
  return path === "/manifest.webmanifest" || path === "/sw.js" || path.startsWith("/pwa-");
}

function serveIndex() {
  const indexPath = join(webDistPath, "index.html");
  if (!existsSync(indexPath)) return new Response("Web app not built", { status: 503 });

  return new Response(Bun.file(indexPath), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

const app = new Elysia()
  .use(
    elysiaLogger({
      level: isProduction ? "info" : "debug",
      autoLogging: {
        ignore(ctx) {
          return !ctx.path.startsWith("/api/auth");
        },
      },
    }),
  )
  .use(
    cors({
      origin: [env.APP_URL, ...env.APP_URLS],
      credentials: true,
    }),
  )
  .use(
    openapi({
      path: "/openapi",
      documentation: {
        info: {
          title: "SilvioRats API",
          version: "1.0.0",
          description: "API for SilvioRats web and PWA clients.",
        },
      },
    }),
  )
  .get("/health", () => ({ ok: true, service: "silviorats-api" }))
  .mount(auth.handler)
  .get("/api/me", async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return new Response("Unauthorized", { status: 401 });

    const membership = await db.query.memberships.findFirst({
      where: and(
        eq(memberships.userId, session.user.id),
        eq(memberships.instanceId, env.SILVIO_INSTANCE_ID),
      ),
    });

    if (!membership) {
      await db.insert(memberships).values({
        userId: session.user.id,
        instanceId: env.SILVIO_INSTANCE_ID,
      });

      return { user: session.user, membership: { status: "pending", role: "member" } };
    }

    return { user: session.user, membership };
  })
  .group("/api", (api) => api.use(feedRoutes).use(hangoutRoutes).use(adminRoutes).use(pushRoutes))
  .get("/*", ({ path }) => {
    const staticAsset = serveWebFile(path);
    if (staticAsset) return staticAsset;

    if (isManifestAssetPath(path) || isStaticAssetPath(path)) {
      return new Response("Not Found", { status: 404 });
    }

    return serveIndex();
  })
  .onError(({ error, code }) => {
    if (error instanceof Response) return error;
    if (!isProduction) console.error(code, error);
    return new Response("Internal Server Error", { status: 500 });
  });

await applyMigrations();

app.listen(env.PORT);

console.log(`SilvioRats API running on http://localhost:${env.PORT}`);
