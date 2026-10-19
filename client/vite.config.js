import { existsSync, readFileSync } from "node:fs";
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

// `npm run preview` serves the build with the headers Vercel sends (vercel.json), each rule on the
// paths it matches (the Content-Security-Policy on all of them; the microphone allowed on the English
// coach's page alone), so every page can be tried before a deploy. vercel.json's sources are regular
// expressions as they are. upgrade-insecure-requests is left out: the preview runs on plain http. (The
// public copy has no vercel.json, so no headers there.)
const vercelFile = new URL("./vercel.json", import.meta.url);
const headerRules = existsSync(vercelFile)
  ? JSON.parse(readFileSync(vercelFile, "utf8")).headers.map((rule) => ({
      path: new RegExp(`^${rule.source}$`),
      headers: rule.headers.map(({ key, value }) => [key, value.replace(/;\s*upgrade-insecure-requests/, "")]),
    }))
  : [];
const vercelHeaders = {
  name: "vercel-headers",
  configurePreviewServer(server) {
    server.middlewares.use((req, res, next) => {
      const path = req.url.split("?")[0];
      for (const rule of headerRules) if (rule.path.test(path)) for (const [key, value] of rule.headers) res.setHeader(key, value);
      next();
    });
  },
};

export default defineConfig({
  plugins: [react(), publicPages, vercelHeaders],
  // Keep the REACT_APP_* names already used in .env files and on Vercel.
  envPrefix: ["VITE_", "REACT_APP_"],
  server: {
    port: 3000,
    // Relative /api requests, and /health (the server bar's check), go to the local backend when
    // REACT_APP_BACKEND_URL is unset. By IP: the mock API listens only on 127.0.0.1, and "localhost"
    // can mean ::1 first.
    proxy: { "/api": "http://127.0.0.1:8080", "/health": "http://127.0.0.1:8080" },
  },
  build: {
    outDir: "build",
    // The portfolio, and the resume builder's pages, each with its own bundle: the builder
    // (/resume-builder/), signing in and "My resumes" (/resume-builder/account/), and the admin view
    // (/resume-builder/admin/); and the English coach (/english/). The pre-render step
    // (`vite build --ssr`) has its own entry and ignores these.
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        builder: fileURLToPath(new URL("./resume-builder/index.html", import.meta.url)),
        account: fileURLToPath(new URL("./resume-builder/account/index.html", import.meta.url)),
        admin: fileURLToPath(new URL("./resume-builder/admin/index.html", import.meta.url)),
        english: fileURLToPath(new URL("./english/index.html", import.meta.url)),
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.js",
  },
});
