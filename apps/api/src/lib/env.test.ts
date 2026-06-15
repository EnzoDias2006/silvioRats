import { describe, expect, it } from "bun:test";
import { env } from "./env";

describe("env", () => {
  it("loads default local instance", () => {
    expect(env.SILVIO_INSTANCE_ID.length).toBeGreaterThanOrEqual(8);
  });

  it("parses trusted app urls list", () => {
    expect(env.APP_URLS).toEqual([]);
  });

  it("loads bootstrap admin defaults", () => {
    expect(env.BOOTSTRAP_ADMIN_NAME).toBe("Admin");
    expect(env.BOOTSTRAP_ADMIN_PASSWORD).toBeUndefined();
  });
});
