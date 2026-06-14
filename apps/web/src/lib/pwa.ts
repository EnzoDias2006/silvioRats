export type BeforeInstallPromptEvent = Event & {
  prompt: () => void;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function isStandalonePwa() {
  if (typeof window === "undefined") return false;

  const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean };
  return (
    navigatorWithStandalone.standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}

export function getInstallPlatform(userAgent = globalThis.window?.navigator.userAgent ?? "") {
  const ua = userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  return "desktop";
}
