// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  srcDir: "src/",
  ssr: false,
  modules: ["@pinia/nuxt", "@primevue/nuxt-module", "@nuxtjs/tailwindcss"],
  css: ["maplibre-gl/dist/maplibre-gl.css", "@/styles.css"],
  primevue: {
    options: {
      ripple: true,
    },
    importPT: { from: "@/presets/aura/index.js" },
  },
  vite: {
    clearScreen: false,
    envPrefix: ["VITE_", "TAURI_"],
    server: {
      strictPort: true,
      hmr: {
        protocol: "ws",
        host: "0.0.0.0",
        port: 5183,
      },
      watch: {
        ignored: ["**/src-tauri/**"],
      },
    },
  },
});
