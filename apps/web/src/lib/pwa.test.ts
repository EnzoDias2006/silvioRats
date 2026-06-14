import { describe, expect, it } from "vitest";
import { getInstallPlatform, isStandalonePwa } from "./pwa";

describe("getInstallPlatform", () => {
  it("detects ios", () => {
    expect(getInstallPlatform("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)")).toBe(
      "ios",
    );
  });

  it("detects android", () => {
    expect(getInstallPlatform("Mozilla/5.0 (Linux; Android 14)")).toBe("android");
  });

  it("falls back to desktop", () => {
    expect(getInstallPlatform("Mozilla/5.0 (X11; Linux x86_64)")).toBe("desktop");
  });
});

describe("isStandalonePwa", () => {
  it("returns false outside browser", () => {
    expect(isStandalonePwa()).toBe(false);
  });
});
