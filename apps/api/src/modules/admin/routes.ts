import { timingSafeEqual } from "node:crypto";
import { db, memberships, user } from "@silviorats/db";
import { and, eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { env } from "../../lib/env";
import { requireAdmin } from "../../middleware/session";

function timingSafeEquals(input: string, expected: string) {
  const inputBuffer = Buffer.from(input);
  const expectedBuffer = Buffer.from(expected);

  if (inputBuffer.length !== expectedBuffer.length) return false;

  return timingSafeEqual(inputBuffer, expectedBuffer);
}

export const adminRoutes = new Elysia({ prefix: "/admin" })
  .post(
    "/master-approve",
    async ({ body, set, headers }) => {
      const masterKey = headers["x-master-key"];

      if (!masterKey) {
        set.status = 401;
        return { error: "Master key is required." };
      }

      if (!timingSafeEquals(masterKey, env.MASTER_KEY)) {
        set.status = 403;
        return { error: "Invalid master key." };
      }

      const normalizedEmail = body.email.toLowerCase();

      const foundUser = await db.query.user.findFirst({
        where: eq(user.email, normalizedEmail),
      });

      if (!foundUser) {
        set.status = 404;
        return { error: "User not found." };
      }

      const role = body.role ?? "admin";

      await db
        .insert(memberships)
        .values({
          userId: foundUser.id,
          instanceId: env.SILVIO_INSTANCE_ID,
          status: "approved",
          role,
          approvedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [memberships.userId, memberships.instanceId],
          set: {
            status: "approved",
            role,
            approvedAt: new Date(),
            updatedAt: new Date(),
          },
        });

      return { ok: true, email: normalizedEmail, role, userId: foundUser.id };
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        role: t.Optional(t.Union([t.Literal("admin"), t.Literal("member")])),
      }),
    },
  )
  .get("/approval-requests", async ({ request }) => {
    await requireAdmin(request);

    return db
      .select({
        userId: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        createdAt: memberships.createdAt,
      })
      .from(memberships)
      .innerJoin(user, eq(user.id, memberships.userId))
      .where(
        and(eq(memberships.instanceId, env.SILVIO_INSTANCE_ID), eq(memberships.status, "pending")),
      );
  })
  .post(
    "/approval-requests/:userId/approve",
    async ({ params, request }) => {
      const { session } = await requireAdmin(request);

      await db
        .update(memberships)
        .set({
          status: "approved",
          approvedBy: session.user.id,
          approvedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(memberships.userId, params.userId),
            eq(memberships.instanceId, env.SILVIO_INSTANCE_ID),
          ),
        );

      return { ok: true };
    },
    { params: t.Object({ userId: t.String() }) },
  )
  .post(
    "/approval-requests/:userId/reject",
    async ({ params, request }) => {
      await requireAdmin(request);

      await db
        .update(memberships)
        .set({ status: "rejected", updatedAt: new Date() })
        .where(
          and(
            eq(memberships.userId, params.userId),
            eq(memberships.instanceId, env.SILVIO_INSTANCE_ID),
          ),
        );

      return { ok: true };
    },
    { params: t.Object({ userId: t.String() }) },
  );
