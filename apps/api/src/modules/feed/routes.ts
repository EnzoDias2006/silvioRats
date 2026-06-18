import { db, photos, posts, user } from "@silviorats/db";
import { maxUploadBytes } from "@silviorats/shared";
import { desc, eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { nanoid } from "nanoid";
import { buildStorageKey, createUploadUrl, getImageStream, putImage } from "../../lib/storage";
import { requireApprovedMember } from "../../middleware/session";

const allowedMimeTypes = ["image/webp", "image/jpeg", "image/png"] as const;

function getPhotoExtension(contentType: string) {
  if (contentType === "image/jpeg") return "jpg";
  if (contentType === "image/png") return "png";
  return "webp";
}

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

      if (!(allowedMimeTypes as readonly string[]).includes(body.mimeType)) {
        throw new Response("Unsupported media type", { status: 415 });
      }

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
      const key = buildStorageKey({
        instanceId,
        postId: params.postId,
        photoId,
        extension: getPhotoExtension(body.mimeType),
      });

      await db.insert(photos).values({
        id: photoId,
        postId: params.postId,
        s3Key: key,
        mimeType: body.mimeType,
        sizeBytes: body.sizeBytes,
        version,
      });

      const upload = await createUploadUrl({
        key,
        contentType: body.mimeType,
      });

      return {
        photoId,
        version,
        key,
        ...upload,
      };
    },
    {
      params: t.Object({ postId: t.String() }),
      body: t.Object({
        mimeType: t.Union([
          t.Literal("image/webp"),
          t.Literal("image/jpeg"),
          t.Literal("image/png"),
        ]),
        sizeBytes: t.Number({ minimum: 1, maximum: maxUploadBytes }),
      }),
    },
  )
  .post(
    "/posts/:postId/photos",
    async ({ params, request }) => {
      const { instanceId } = await requireApprovedMember(request);

      const contentType = request.headers.get("content-type") || "";
      if (!(allowedMimeTypes as readonly string[]).includes(contentType)) {
        throw new Response("Unsupported media type", { status: 415 });
      }

      const buffer = new Uint8Array(await request.arrayBuffer());
      if (buffer.byteLength > maxUploadBytes) {
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
      const key = buildStorageKey({
        instanceId,
        postId: params.postId,
        photoId,
        extension: getPhotoExtension(contentType),
      });

      await putImage(key, buffer, contentType);

      await db.insert(photos).values({
        id: photoId,
        postId: params.postId,
        s3Key: key,
        mimeType: contentType,
        sizeBytes: buffer.byteLength,
        version,
      });

      return { photoId, version };
    },
    {
      params: t.Object({ postId: t.String() }),
    },
  )
  .get(
    "/photos/:photoId/image",
    async ({ params, request }) => {
      await requireApprovedMember(request);

      const photo = await db.query.photos.findFirst({
        where: eq(photos.id, params.photoId),
      });
      if (!photo) {
        throw new Response("Photo not found", { status: 404 });
      }

      const s3Response = await getImageStream(photo.s3Key);

      if (!s3Response.Body) {
        throw new Response("Image not available", { status: 404 });
      }

      // Bun's Response accepts Node.js Readable streams directly
      return new Response(s3Response.Body as ReadableStream, {
        headers: {
          "Content-Type": photo.mimeType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    },
    {
      params: t.Object({ photoId: t.String() }),
    },
  );
