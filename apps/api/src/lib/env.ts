import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  PORT: z.coerce.number(),
  APP_URL: z.string().url(),
  APP_URLS: z
    .string()
    .default("")
    .transform((value) =>
      value
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean),
    )
    .pipe(z.array(z.string().url())),
  API_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  SILVIO_INSTANCE_ID: z.string().min(8),
  MASTER_KEY: z.string().min(16),
  DO_SPACES_ENDPOINT: z.string().url().optional(),
  DO_SPACES_REGION: z.string(),
  DO_SPACES_BUCKET: z.string().optional(),
  DO_SPACES_PUBLIC_URL: z.string().url().optional(),
  DO_SPACES_ACCESS_KEY_ID: z.string().optional(),
  DO_SPACES_SECRET_ACCESS_KEY: z.string().optional(),
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string(),
});

export const env = envSchema.parse(process.env);
export const isProduction = env.NODE_ENV === "production";
