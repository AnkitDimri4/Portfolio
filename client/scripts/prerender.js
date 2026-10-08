// Runs after `vite build`: renders the app to HTML and writes it into build/index.html,
// so the first paint, search engines and link previews get the real page instead of an
// empty <div id="root">. In the browser, React then hydrates this markup.
import { readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const htmlFile = path.join(root, "build", "index.html");
const serverDir = path.join(root, "build-ssr");
const MARKER = "<!--app-html-->";

const { render } = await import(pathToFileURL(path.join(serverDir, "entry-server.js")).href);
const template = await readFile(htmlFile, "utf8");
if (!template.includes(MARKER)) throw new Error(`${MARKER} not found in build/index.html`);

const appHtml = render();
await writeFile(htmlFile, template.replace(MARKER, () => appHtml));
await rm(serverDir, { recursive: true, force: true });

console.log(`Pre-rendered build/index.html (${(appHtml.length / 1024).toFixed(1)} kB of markup)`);
