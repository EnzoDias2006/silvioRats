import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3000),
  APP_URL: z.string().url().default("http://localhost:5173"),
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
  API_URL: z.string().url().default("http://localhost:3000"),
  BETTER_AUTH_SECRET: z.string().min(32).default("dev-secret-change-me-dev-secret-change-me"),
  SILVIO_INSTANCE_ID: z.string().min(8).default("silvio-local"),
  BOOTSTRAP_ADMIN_EMAIL: z.string().email().optional(),
  BOOTSTRAP_ADMIN_NAME: z.string().default("Admin"),
  BOOTSTRAP_ADMIN_PASSWORD: z.string().min(8).optional(),
  DO_SPACES_ENDPOINT: z.string().url().optional(),
  DO_SPACES_REGION: z.string().default("nyc3"),
  DO_SPACES_BUCKET: z.string().optional(),
  DO_SPACES_PUBLIC_URL: z.string().url().optional(),
  DO_SPACES_ACCESS_KEY_ID: z.string().optional(),
  DO_SPACES_SECRET_ACCESS_KEY: z.string().optional(),
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().default("mailto:admin@example.com"),
});

export const env = envSchema.parse(process.env);
export const isProduction = env.NODE_ENV === "production";
