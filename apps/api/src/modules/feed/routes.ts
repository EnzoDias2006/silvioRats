import { db, photos, posts, user } from "@silviorats/db";
import { maxUploadBytes } from "@silviorats/shared";
import { desc, eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { nanoid } from "nanoid";
import { createDownloadUrl, createUploadUrl } from "../../lib/storage";
import { requireApprovedMember } from "../../middleware/session";

export const feedRoutes = new Elysia({ prefix: "/feed" })
  .get("/", async ({ request }) => {
    const { instanceId } = await requireApprovedMember(request);

    const rows = await db
      .select({
        id: posts.id,
        caption: posts.caption,
        occurredAt: posts.occurredAt,
        createdAt: posts.createdAt,
        authorName: user.name,
        authorImage: user.image,
      })
      .from(posts)
      .innerJoin(user, eq(user.id, posts.authorId))
      .where(eq(posts.instanceId, instanceId))
      .orderBy(desc(posts.occurredAt));

    const feed = await Promise.all(
      rows.map(async (post) => {
        const postPhotos = await db.query.photos.findMany({
          where: eq(photos.postId, post.id),
        });

        return {
          ...post,
          photos: postPhotos.map((photo) => ({
            id: photo.id,
            version: photo.version,
            mimeType: photo.mimeType,
            width: photo.width,
            height: photo.height,
          })),
        };
      }),
    );

    return feed;
  })
  .post(
    "/posts",
    async ({ body, request }) => {
      const { session, instanceId } = await requireApprovedMember(request);
      const postId = nanoid();

      await db.insert(posts).values({
        id: postId,
        instanceId,
        authorId: session.user.id,
        caption: body.caption,
        occurredAt: body.occurredAt ? new Date(body.occurredAt) : new Date(),
      });

      return { id: postId };
    },
    {
      body: t.Object({
        caption: t.Optional(t.String({ maxLength: 280 })),
        occurredAt: t.Optional(t.String()),
      }),
    },
  )
  .post(
    "/posts/:postId/photos/presign",
    async ({ body, params, request }) => {
      const { instanceId } = await requireApprovedMember(request);

      if (body.sizeBytes > maxUploadBytes) {
        throw new Response("File too large", { status: 413 });
      }

      const post = await db.query.posts.findFirst({
        where: eq(posts.id, params.postId),
      });

      if (!post || post.instanceId !== instanceId) {
        throw new Response("Post not found", { status: 404 });
      }

      const photoId = nanoid();
      const version = nanoid(10);
      const extension = body.mimeType === "image/png" ? "png" : "webp";
      const now = new Date();
      const key = `instances/${instanceId}/photos/${now.getUTCFullYear()}/${String(
        now.getUTCMonth() + 1,
      ).padStart(2, "0")}/${params.postId}/${photoId}.${extension}`;

      await db.insert(photos).values({
        id: photoId,
        postId: params.postId,
        s3Key: key,
        mimeType: body.mimeType,
        sizeBytes: body.sizeBytes,
        width: body.width,
        height: body.height,
        version,
      });

      const uploadUrl = await createUploadUrl({
        key,
        contentType: body.mimeType,
        contentLength: body.sizeBytes,
      });

      return { photoId, uploadUrl, version };
    },
    {
      params: t.Object({ postId: t.String() }),
      body: t.Object({
        mimeType: t.Union([
          t.Literal("image/webp"),
          t.Literal("image/jpeg"),
          t.Literal("image/png"),
        ]),
        sizeBytes: t.Number(),
        width: t.Optional(t.Number()),
        height: t.Optional(t.Number()),
      }),
    },
  )
  .get(
    "/photos/:photoId/download-url",
    async ({ params, request }) => {
      const { instanceId } = await requireApprovedMember(request);
      const photo = await db.query.photos.findFirst({
        where: eq(photos.id, params.photoId),
        with: { post: true },
      });

      if (!photo || photo.post.instanceId !== instanceId) {
        throw new Response("Photo not found", { status: 404 });
      }

      return { downloadUrl: await createDownloadUrl(photo.s3Key), version: photo.version };
    },
    {
      params: t.Object({ photoId: t.String() }),
    },
  );
