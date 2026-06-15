# PWA Install Troubleshooting

## Symptoms

- Android Chrome shows only `Add to Home screen` instead of `Install app`.
- Chrome opens the site as a normal shortcut instead of a standalone PWA.
- The install prompt never fires.

## Root Causes to Check

1. The manifest icons are not served as real PNG files.
2. The service worker is not controlling the page yet.
3. The site is behind a stale Docker image or CDN cache.
4. The browser is dismissing the install prompt.
5. The site is opened inside an in-app browser instead of Chrome.

## Required PWA Checks

- `https://example.com/manifest.webmanifest` returns `application/manifest+json`.
- `https://example.com/sw.js` returns `application/javascript`.
- Manifest icon URLs return `image/png`, not HTML.
- The manifest includes `id`, `start_url`, `scope`, and `display: standalone`.
- The app has a valid 192x192 icon and a valid 512x512 icon.

## Android Behavior

- `beforeinstallprompt` is the normal way to show a custom install button.
- If Chrome only shows `Add to Home screen`, the app is not yet recognized as fully installable.
- Reopen the page after deploy and clear site data if Chrome cached an older install state.

## Deployment Notes

- When deploying through Docker, make sure the build output includes `apps/web/dist`.
- Avoid serving missing static assets through the SPA HTML fallback.
- If a PNG asset returns HTML, Chrome will not treat the app as installable.

## Fix Applied Here

- Added PWA icons to the manifest asset list.
- Added `id: "/"` to the manifest.
- Added a separate maskable icon entry.
- Increased the Workbox cache size limit so the build can complete even with a large favicon asset.
- Changed the API server so missing static assets return `404` instead of `index.html`.
- Improved the install landing screen so Android users see a fallback explanation when `beforeinstallprompt` never appears.

## Verification Checklist

- Run `bun --filter @silviorats/web build`.
- Run `bun --filter @silviorats/web test`.
- Confirm the Docker image contains:
  - `apps/web/dist/pwa-192x192.png`
  - `apps/web/dist/pwa-512x512.png`
- Confirm production returns `image/png` for both icon URLs.
- Purge CDN cache for the manifest, service worker, and icon URLs.
- Re-test on Android Chrome after clearing site data.
