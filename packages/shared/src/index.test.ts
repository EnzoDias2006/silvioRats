import { describe, expect, it } from "bun:test";
import { maxUploadBytes, membershipStatuses } from "./index";

describe("shared constants", () => {
  it("keeps pending membership status", () => {
    expect(membershipStatuses).toContain("pending");
  });

  it("sets an upload limit", () => {
    expect(maxUploadBytes).toBeGreaterThan(0);
  });
});
