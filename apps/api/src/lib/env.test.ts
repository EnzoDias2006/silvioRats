import { beforeAll, describe, expect, it } from "bun:test";

type EnvType = {
  SILVIO_INSTANCE_ID: string;
  APP_URLS: string[];
  MASTER_KEY: string;
};

let env: EnvType;

beforeAll(async () => {
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
});
