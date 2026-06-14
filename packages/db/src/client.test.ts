import { describe, expect, it } from "bun:test";
import { resolveSqlitePath } from "./client";

describe("resolveSqlitePath", () => {
  it("removes file prefix", () => {
    expect(resolveSqlitePath("file:/app/data/app.sqlite")).toBe("/app/data/app.sqlite");
  });

  it("keeps plain paths", () => {
    expect(resolveSqlitePath("./data/app.sqlite")).toBe("./data/app.sqlite");
  });
});
