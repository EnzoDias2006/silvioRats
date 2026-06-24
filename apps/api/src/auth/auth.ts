import { db } from "@silviorats/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "../lib/env";

const localTrustedOrigins =
  env.NODE_ENV === "production" ? [] : ["http://localhost:*", "http://127.0.0.1:*"];

export const auth = betterAuth({
  baseURL: env.API_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
  },
  logger: {
    level: env.NODE_ENV === "production" ? "info" : "debug",
  },
  trustedOrigins: [env.APP_URL, ...env.APP_URLS, ...localTrustedOrigins],
});

export type AuthSession = typeof auth.$Infer.Session;
