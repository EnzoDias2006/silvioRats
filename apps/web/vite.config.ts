import path from "node:path";
import { fileURLToPath } from "node:url";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const rootDir = fileURLToPath(new URL("..", import.meta.url));

export default defineConfig({
  envDir: "../..",
  resolve: {
    alias: {
      "@silviorats/shared": path.resolve(rootDir, "../packages/shared/src/index.ts"),
    },
  },
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "apple-touch-icon.png", "pwa-192x192.png", "pwa-512x512.png"],
      manifest: {
        id: "/",
        name: "SilvioRats",
        short_name: "SilvioRats",
        description: "Encontros e memorias do Bar do Silvio.",
        lang: "pt-BR",
        theme_color: "#15100c",
        background_color: "#15100c",
        display: "standalone",
        orientation: "portrait-primary",
        start_url: "/",
        scope: "/",
        icons: [
          { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,webmanifest}"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/api/feed"),
            handler: "NetworkFirst",
            options: {
              cacheName: "api-feed",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 },
            },
          },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
