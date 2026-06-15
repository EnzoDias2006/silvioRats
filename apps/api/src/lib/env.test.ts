import { describe, expect, it } from "bun:test";
import { env } from "./env";

describe("env", () => {
  it("loads default local instance", () => {
    expect(env.SILVIO_INSTANCE_ID.length).toBeGreaterThanOrEqual(8);
  });

  it("parses trusted app urls list", () => {
    expect(env.APP_URLS).toEqual([]);
  });
});
