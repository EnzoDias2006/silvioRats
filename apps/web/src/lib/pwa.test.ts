import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getInstallPlatform, isStandalonePwa } from "./pwa";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

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
  beforeEach(() => {
    vi.stubEnv("VITE_BYPASS_PWA_CHECK", "");
  });

  it("returns false outside browser", () => {
    expect(isStandalonePwa()).toBe(false);
  });

  it("detects standalone display mode", () => {
    vi.stubGlobal("window", {
      navigator: {},
      matchMedia: (query: string) => ({ matches: query === "(display-mode: standalone)" }),
    } as unknown as Window);
    vi.stubGlobal("document", { referrer: "" } as unknown as Document);

    expect(isStandalonePwa()).toBe(true);
  });

  it("detects android app referrer", () => {
    vi.stubGlobal("window", {
      navigator: {},
      matchMedia: () => ({ matches: false }),
    } as unknown as Window);
    vi.stubGlobal("document", { referrer: "android-app://com.example" } as unknown as Document);

    expect(isStandalonePwa()).toBe(true);
  });

  it("returns false for normal browser", () => {
    vi.stubGlobal("window", {
      navigator: {},
      matchMedia: () => ({ matches: false }),
    } as unknown as Window);
    vi.stubGlobal("document", { referrer: "" } as unknown as Document);

    expect(isStandalonePwa()).toBe(false);
  });
});
