import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "./env";

function requireStorageEnv() {
  if (
    !env.DO_SPACES_ENDPOINT ||
    !env.DO_SPACES_BUCKET ||
    !env.DO_SPACES_ACCESS_KEY_ID ||
    !env.DO_SPACES_SECRET_ACCESS_KEY
  ) {
    throw new Error("DigitalOcean Spaces is not configured.");
  }

  return {
    endpoint: env.DO_SPACES_ENDPOINT,
    bucket: env.DO_SPACES_BUCKET,
    accessKeyId: env.DO_SPACES_ACCESS_KEY_ID,
    secretAccessKey: env.DO_SPACES_SECRET_ACCESS_KEY,
  };
}

function createS3Client() {
  const storage = requireStorageEnv();

  return new S3Client({
    endpoint: storage.endpoint,
    region: env.DO_SPACES_REGION,
    credentials: {
      accessKeyId: storage.accessKeyId,
      secretAccessKey: storage.secretAccessKey,
    },
    requestChecksumCalculation: "WHEN_REQUIRED",
  });
}

export function getStorageBucket() {
  return requireStorageEnv().bucket;
}

export function buildStorageKey(input: {
  instanceId: string;
  postId: string;
  photoId: string;
  extension: string;
}) {
  const now = new Date();
  return `instances/${input.instanceId}/photos/${now.getUTCFullYear()}/${String(
    now.getUTCMonth() + 1,
  ).padStart(2, "0")}/${input.postId}/${input.photoId}.${input.extension}`;
}

export async function createUploadUrl(input: { key: string; contentType: string }) {
  const client = createS3Client();
  const storage = requireStorageEnv();
  const command = new PutObjectCommand({
    Bucket: storage.bucket,
    Key: input.key,
    ContentType: input.contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 });

  return {
    uploadUrl,
    headers: {
      "Content-Type": input.contentType,
    },
  };
}

export async function putImage(key: string, buffer: Uint8Array, contentType: string) {
  const client = createS3Client();
  const storage = requireStorageEnv();

  await client.send(
    new PutObjectCommand({
      Bucket: storage.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );
}

export async function getImageStream(key: string) {
  const client = createS3Client();
  const storage = requireStorageEnv();

  return client.send(
    new GetObjectCommand({
      Bucket: storage.bucket,
      Key: key,
    }),
  );
}
