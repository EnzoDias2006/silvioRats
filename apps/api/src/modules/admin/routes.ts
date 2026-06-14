import { db, memberships, user } from "@silviorats/db";
import { and, eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { env } from "../../lib/env";
import { requireAdmin } from "../../middleware/session";

export const adminRoutes = new Elysia({ prefix: "/admin" })
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
