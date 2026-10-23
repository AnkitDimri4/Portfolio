import { existsSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The commit Vercel built, for the admin view's Site health to say when the site has been deployed since
// its report was measured (VERCEL_GIT_COMMIT_SHA is Vercel's; a local build has none)
process.env.VITE_DEPLOY_SHA ??= process.env.VERCEL_GIT_COMMIT_SHA ?? "";

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

// The resume builder's three pages and the English coach carry their CSS inside the page, as a <style>,
// rather than as <link>s the browser must fetch before it can paint anything: one round trip less on a
// first visit (Lighthouse's render-blocking requests; `npm run measure`, docs/runbooks/activity.md).
// None of them loads more CSS later. The home page does (the call scheduler and the stack grid each
// bring a <link> to the shared CSS they need, which would then come twice, after the page's own), so it
// keeps its links.
const INLINE_CSS = ["resume-builder/index.html", "resume-builder/account/index.html", "resume-builder/admin/index.html", "english/index.html"];
const clientRoot = fileURLToPath(new URL(".", import.meta.url));
const inlineCss = {
  name: "inline-css",
  apply: "build",
  transformIndexHtml: {
    order: "post",
    handler(html, { filename, bundle }) {
      const page = relative(clientRoot, filename).replaceAll("\\", "/");
      if (!bundle || !INLINE_CSS.includes(page)) return html;
      return html.replace(/<link rel="stylesheet" crossorigin href="\/(assets\/[^"]+\.css)">/g, (_, file) => {
        const source = bundle[file]?.source;
        const css = typeof source === "string" ? source : source && new TextDecoder().decode(source);
        if (!css || css.includes("</style")) throw new Error(`${file} can't be written into ${page}`);
        return `<style>${css}</style>`;
      });
    },
  },
};

// The English coach's page fetches the coach itself only once the admin is in (english/English.jsx's
// lazy `import()`), and the home page has lazy imports of its own (the stack grid, the call scheduler).
// Vite sends every lazy import through one helper (`__vitePreload`), which would then come out as a file
// of its own that both pages fetch before they draw: on a phone in `npm run measure` it cost the home
// page's largest paint 0.08 s. So the coach's page gets a helper of its own, built into its script (as
// `Rail.jsx?english` gives it its own rail, #209), and the home page keeps Vite's in its own, as before.
// It only imports: the coach needs no script the page hasn't loaded already but its own file, and the page
// carries its CSS inside it, where Vite's helper, which looks for <link>s, would add the shared CSS a
// second time, after the page's own. The coach brings no CSS of its own: what its parts need is imported
// from the page's main.jsx, so it stays in the page, in order (English.test.jsx checks it; CSS imported
// only from the coach's own files doesn't come out of the build at all).
const PRELOAD_HELPER = "\0vite/preload-helper.js";
const COACH_HELPER = "\0english-preload-helper.js";
const coachPreloadHelper = {
  name: "coach-preload-helper",
  apply: "build",
  enforce: "pre",
  resolveId(source, importer) {
    return source === PRELOAD_HELPER && importer?.replaceAll("\\", "/").includes("/src/english/") ? COACH_HELPER : null;
  },
  load(id) {
    return id === COACH_HELPER ? "export const __vitePreload = (load) => load();" : null;
  },
};

export default defineConfig({
  plugins: [react(), publicPages, vercelHeaders, inlineCss, coachPreloadHelper],
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
