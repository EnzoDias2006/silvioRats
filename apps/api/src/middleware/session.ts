import { db, memberships } from "@silviorats/db";
import { eq } from "drizzle-orm";
import { auth } from "../auth/auth";
import { env } from "../lib/env";

export async function getSessionFromRequest(request: Request) {
  return auth.api.getSession({ headers: request.headers });
}

export async function requireApprovedMember(request: Request) {
  const session = await getSessionFromRequest(request);

  if (!session?.user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const membership = await db.query.memberships.findFirst({
    where: eq(memberships.userId, session.user.id),
  });

  if (!membership || membership.instanceId !== env.SILVIO_INSTANCE_ID) {
    throw new Response("Forbidden", { status: 403 });
  }

  if (membership.status !== "approved") {
    throw new Response("Approval required", { status: 403 });
  }

  return { session, membership, instanceId: env.SILVIO_INSTANCE_ID };
}

export async function requireAdmin(request: Request) {
  const context = await requireApprovedMember(request);

  if (context.membership.role !== "admin") {
    throw new Response("Admin required", { status: 403 });
  }

  return context;
}
