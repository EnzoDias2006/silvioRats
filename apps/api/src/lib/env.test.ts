import { beforeAll, describe, expect, it } from "bun:test";

type EnvType = {
  SILVIO_INSTANCE_ID: string;
  APP_URLS: string[];
  MASTER_KEY: string;
};

let env: EnvType;

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.PORT = "3000";
  process.env.APP_URL = "http://localhost:5173";
  process.env.APP_URLS = "http://localhost:5173,http://127.0.0.1:5173";
  process.env.API_URL = "http://localhost:3000";
  process.env.BETTER_AUTH_SECRET = "test-secret-at-least-32-characters-long";
  process.env.SILVIO_INSTANCE_ID = "silvio-test-instance";
  process.env.MASTER_KEY = "test-master-key-at-least-16";
  process.env.DO_SPACES_REGION = "nyc3";
  process.env.VAPID_SUBJECT = "mailto:test@example.com";

  const mod = await import("./env");
  env = mod.env;
});

describe("env", () => {
  it("loads default local instance", () => {
    expect(env.SILVIO_INSTANCE_ID.length).toBeGreaterThanOrEqual(8);
  });

  it("loads master key", () => {
    expect(env.MASTER_KEY.length).toBeGreaterThanOrEqual(16);
  });

  it("loads app urls", () => {
    expect(env.APP_URLS).toEqual(["http://localhost:5173", "http://127.0.0.1:5173"]);
  });
});
