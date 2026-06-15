import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import { db, memberships, user } from "@silviorats/db";
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

async function bootstrapAdmin() {
  if (!env.BOOTSTRAP_ADMIN_EMAIL) return;

  const admin = await db.query.user.findFirst({ where: eq(user.email, env.BOOTSTRAP_ADMIN_EMAIL) });
  if (!admin) {
    if (!env.BOOTSTRAP_ADMIN_PASSWORD) {
      console.warn("Bootstrap admin skipped: password missing.");
      return;
    }

    await auth.api.signUpEmail({
      body: {
        name: env.BOOTSTRAP_ADMIN_NAME,
        email: env.BOOTSTRAP_ADMIN_EMAIL,
        password: env.BOOTSTRAP_ADMIN_PASSWORD,
      },
    });
  }

  const resolvedAdmin =
    admin ?? (await db.query.user.findFirst({ where: eq(user.email, env.BOOTSTRAP_ADMIN_EMAIL) }));

  if (!resolvedAdmin) return;

  const existing = await db.query.memberships.findFirst({
    where: and(
      eq(memberships.userId, resolvedAdmin.id),
      eq(memberships.instanceId, env.SILVIO_INSTANCE_ID),
    ),
  });

  if (existing?.role === "admin" && existing.status === "approved") return;

  await db
    .insert(memberships)
    .values({
      userId: resolvedAdmin.id,
      instanceId: env.SILVIO_INSTANCE_ID,
      status: "approved",
      role: "admin",
      approvedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [memberships.userId, memberships.instanceId],
      set: { status: "approved", role: "admin", approvedAt: new Date(), updatedAt: new Date() },
    });
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
    cors({
      origin: [env.APP_URL, ...env.APP_URLS],
      credentials: true,
    }),
  )
  .use(swagger())
  .get("/health", () => ({ ok: true, service: "silviorats-api" }))
  .all("/api/auth/*", async ({ request }) => auth.handler(request))
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
      const status = session.user.email === env.BOOTSTRAP_ADMIN_EMAIL ? "approved" : "pending";
      const role = session.user.email === env.BOOTSTRAP_ADMIN_EMAIL ? "admin" : "member";

      await db.insert(memberships).values({
        userId: session.user.id,
        instanceId: env.SILVIO_INSTANCE_ID,
        status,
        role,
        approvedAt: status === "approved" ? new Date() : undefined,
      });

      return { user: session.user, membership: { status, role } };
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
await bootstrapAdmin();

app.listen(env.PORT);

console.log(`SilvioRats API running on http://localhost:${env.PORT}`);
