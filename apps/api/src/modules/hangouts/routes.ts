import { db, hangouts, rsvps } from "@silviorats/db";
import { desc, eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { nanoid } from "nanoid";
import { requireApprovedMember } from "../../middleware/session";

export const hangoutRoutes = new Elysia({ prefix: "/hangouts" })
  .get("/", async ({ request }) => {
    const { instanceId } = await requireApprovedMember(request);

    return db
      .select()
      .from(hangouts)
      .where(eq(hangouts.instanceId, instanceId))
      .orderBy(desc(hangouts.startsAt));
  })
  .post(
    "/",
    async ({ body, request }) => {
      const { session, instanceId } = await requireApprovedMember(request);
      const id = nanoid();

      await db.insert(hangouts).values({
        id,
        instanceId,
        title: body.title,
        note: body.note,
        startsAt: new Date(body.startsAt),
        createdBy: session.user.id,
      });

      return { id };
    },
    {
      body: t.Object({
        title: t.String({ minLength: 1, maxLength: 120 }),
        note: t.Optional(t.String({ maxLength: 500 })),
        startsAt: t.String(),
      }),
    },
  )
  .post(
    "/:hangoutId/rsvp",
    async ({ body, params, request }) => {
      const { session } = await requireApprovedMember(request);

      await db
        .insert(rsvps)
        .values({ hangoutId: params.hangoutId, userId: session.user.id, status: body.status })
        .onConflictDoUpdate({
          target: [rsvps.hangoutId, rsvps.userId],
          set: { status: body.status, updatedAt: new Date() },
        });

      return { ok: true };
    },
    {
      params: t.Object({ hangoutId: t.String() }),
      body: t.Object({
        status: t.Union([t.Literal("going"), t.Literal("maybe"), t.Literal("not_going")]),
      }),
    },
  );
