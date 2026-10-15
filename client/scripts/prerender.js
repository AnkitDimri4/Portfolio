// Runs after `vite build`: renders the app to HTML and writes it into build/index.html,
// so the first paint, search engines and link previews get the real page instead of an
// empty <div id="root">. In the browser, React then hydrates this markup. The resume
// builder's page gets its top bar and heading the same way (src/builder/Intro.jsx).
import { readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const htmlFile = path.join(root, "build", "index.html");
const builderFile = path.join(root, "build", "resume-builder", "index.html");
const serverDir = path.join(root, "build-ssr");
const MARKER = "<!--app-html-->";

const { render, renderBuilder } = await import(pathToFileURL(path.join(serverDir, "entry-server.js")).href);

/** Writes `html` into the page at the marker; the page must have one. */
const fill = async (file, html) => {
  const template = await readFile(file, "utf8");
  if (!template.includes(MARKER)) throw new Error(`${MARKER} not found in ${path.relative(root, file)}`);
  await writeFile(file, template.replace(MARKER, () => html));
  console.log(`Pre-rendered ${path.relative(root, file)} (${(html.length / 1024).toFixed(1)} kB of markup)`);
};

await fill(htmlFile, render());
await fill(builderFile, renderBuilder());
await rm(serverDir, { recursive: true, force: true });
