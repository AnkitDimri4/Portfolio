import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// `npm start` serves public/'s own pages (the download page, privacy, terms, the brain map) at their
// folder's URL, as Vercel does, instead of falling back to the portfolio.
const publicPages = {
  name: "public-pages",
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      const [path, query] = req.url.split("?");
      if (path.endsWith("/") && existsSync(join(server.config.publicDir, path, "index.html"))) {
        req.url = `${path}index.html${query ? `?${query}` : ""}`;
      }
      next();
    });
  },
};

export default defineConfig({
  plugins: [react(), publicPages],
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
