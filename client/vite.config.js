import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Keep the REACT_APP_* names already used in .env files and on Vercel.
  envPrefix: ["VITE_", "REACT_APP_"],
  server: {
    port: 3000,
    // Relative /api requests, and /health (the server bar's check), go to the local backend when
    // REACT_APP_BACKEND_URL is unset.
    proxy: { "/api": "http://localhost:8080", "/health": "http://localhost:8080" },
  },
  build: {
    outDir: "build",
    // The portfolio, and the resume builder's pages, each with its own bundle: the builder
    // (/resume-builder/), signing in and "My resumes" (/resume-builder/account/), and the admin view
    // (/resume-builder/admin/). The pre-render step (`vite build --ssr`) has its own entry and ignores these.
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        builder: fileURLToPath(new URL("./resume-builder/index.html", import.meta.url)),
        account: fileURLToPath(new URL("./resume-builder/account/index.html", import.meta.url)),
        admin: fileURLToPath(new URL("./resume-builder/admin/index.html", import.meta.url)),
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.js",
  },
});
