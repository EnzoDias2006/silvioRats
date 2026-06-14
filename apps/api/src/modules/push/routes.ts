import { db, pushSubscriptions } from "@silviorats/db";
import { Elysia, t } from "elysia";
import { nanoid } from "nanoid";
import { requireApprovedMember } from "../../middleware/session";

export const pushRoutes = new Elysia({ prefix: "/push" }).post(
  "/subscribe",
  async ({ body, request }) => {
    const { session } = await requireApprovedMember(request);

    await db
      .insert(pushSubscriptions)
      .values({
        id: nanoid(),
        userId: session.user.id,
        endpoint: body.endpoint,
        p256dh: body.keys.p256dh,
        auth: body.keys.auth,
        platform: body.platform,
      })
      .onConflictDoUpdate({
        target: pushSubscriptions.endpoint,
        set: {
          userId: session.user.id,
          p256dh: body.keys.p256dh,
          auth: body.keys.auth,
          platform: body.platform,
        },
      });

    return { ok: true };
  },
  {
    body: t.Object({
      endpoint: t.String(),
      platform: t.Optional(t.String()),
      keys: t.Object({
        p256dh: t.String(),
        auth: t.String(),
      }),
    }),
  },
);
