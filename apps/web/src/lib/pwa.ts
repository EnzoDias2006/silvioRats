export type BeforeInstallPromptEvent = Event & {
  prompt: () => void;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const standaloneDisplayModes = [
  "standalone",
  "fullscreen",
  "minimal-ui",
  "window-controls-overlay",
] as const;

function matchesStandaloneMode(mode: string) {
  return window.matchMedia(`(display-mode: ${mode})`).matches;
}

export function isStandalonePwa() {
  if (typeof window === "undefined") return false;

  // Allow bypass for local testing via VITE env var
  try {
    if (import.meta.env.VITE_BYPASS_PWA_CHECK === "true") return true;
  } catch {
    /* import.meta.env not available */
  }

  const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean };
  return (
    navigatorWithStandalone.standalone === true ||
    standaloneDisplayModes.some((mode) => matchesStandaloneMode(mode)) ||
    document.referrer.startsWith("android-app://")
  );
}

export function getInstallPlatform(userAgent = globalThis.window?.navigator.userAgent ?? "") {
  const ua = userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  return "desktop";
}
