// Runs after `vite build`: renders the app to HTML and writes it into build/index.html,
// so the first paint, search engines and link previews get the real page instead of an
// empty <div id="root">. In the browser, React then hydrates this markup. The resume
// builder's page gets its top bar and heading the same way (src/builder/Intro.jsx), and its
// structured data for search engines in its <head> (src/builder/faq.js).
//
// The live stats (GitHub, LeetCode) go into the page as the API gives them now, so they show at once
// on any device: on Render's free plan the API sleeps after 15 quiet minutes and takes about 20
// seconds to wake. The browser still asks the API, and its answer replaces them (src/lib/api.js).
// Only when the build knows the API's address (REACT_APP_BACKEND_URL, set on Vercel); without it, or
// with no answer within a minute, the page waits for the API as before.
import { readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const htmlFile = path.join(root, "build", "index.html");
const builderFile = path.join(root, "build", "resume-builder", "index.html");
const serverDir = path.join(root, "build-ssr");
const MARKER = "<!--app-html-->";

const { render, renderBuilder, builderStructuredData, snapshotScript } = await import(pathToFileURL(path.join(serverDir, "entry-server.js")).href);
const DATA_MARKER = /<!--structured-data:[^>]*-->/;
const API = (process.env.REACT_APP_BACKEND_URL || "").replace(/\/$/, "");
const SNAPSHOT_PATHS = ["/api/v1/portfolio/github", "/api/v1/portfolio/leetcode"];

/** The API's answers now, by path: only good ones, and none without the API's address. */
const takeSnapshot = async () => {
  const snapshot = {};
  if (!API) return snapshot;
  await Promise.all(
    SNAPSHOT_PATHS.map(async (p) => {
      try {
        const res = await fetch(`${API}${p}`, { signal: AbortSignal.timeout(60_000) });
        const body = await res.json();
        if (res.ok && body?.status === "success") snapshot[p] = body;
        else console.warn(`No snapshot of ${p}: HTTP ${res.status}`);
      } catch (err) {
        console.warn(`No snapshot of ${p}: ${err.message}`);
      }
    })
  );
  return snapshot;
};

/** Writes `html` into the page at the marker; the page must have one. */
const fill = async (file, html) => {
  const template = await readFile(file, "utf8");
  if (!template.includes(MARKER)) throw new Error(`${MARKER} not found in ${path.relative(root, file)}`);
  await writeFile(file, template.replace(MARKER, () => html));
  console.log(`Pre-rendered ${path.relative(root, file)} (${(html.length / 1024).toFixed(1)} kB of markup)`);
};

const snapshot = await takeSnapshot();
await fill(htmlFile, render(snapshot));
if (Object.keys(snapshot).length) {
  // The answers for the browser, after #root: React hydrates only what's inside it
  const page = await readFile(htmlFile, "utf8");
  await writeFile(htmlFile, page.replace("</body>", () => `${snapshotScript(snapshot)}\n</body>`));
  console.log(`Wrote the API's answers into ${path.relative(root, htmlFile)}: ${Object.keys(snapshot).join(", ")}`);
}
await fill(builderFile, renderBuilder());
const builder = await readFile(builderFile, "utf8");
if (!DATA_MARKER.test(builder)) throw new Error("The structured data's marker isn't in resume-builder/index.html");
await writeFile(builderFile, builder.replace(DATA_MARKER, () => builderStructuredData()));
console.log("Wrote the resume builder's structured data (its FAQ)");
await rm(serverDir, { recursive: true, force: true });
