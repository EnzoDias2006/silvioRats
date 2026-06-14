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

export function createS3Client() {
  const storage = requireStorageEnv();

  return new S3Client({
    endpoint: storage.endpoint,
    region: env.DO_SPACES_REGION,
    credentials: {
      accessKeyId: storage.accessKeyId,
      secretAccessKey: storage.secretAccessKey,
    },
  });
}

export async function createUploadUrl(input: {
  key: string;
  contentType: string;
  contentLength: number;
}) {
  const storage = requireStorageEnv();
  const client = createS3Client();

  const command = new PutObjectCommand({
    Bucket: storage.bucket,
    Key: input.key,
    ContentType: input.contentType,
    ContentLength: input.contentLength,
  });

  return getSignedUrl(client, command, { expiresIn: 300 });
}

export async function createDownloadUrl(key: string) {
  const storage = requireStorageEnv();
  const client = createS3Client();

  const command = new GetObjectCommand({
    Bucket: storage.bucket,
    Key: key,
  });

  return getSignedUrl(client, command, { expiresIn: 300 });
}
