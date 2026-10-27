// node scripts/activity.js
//
// The build's first step: the Work section's activity card (src/components/SiteActivity) is drawn from
// GitHub's latest activity file, as it is now, rather than from the repository's copy
// (src/data/portfolioActivity.json, refreshed only by hand). The browser asks for the latest file again
// as the card comes near, and swaps it in. Drawn from an older copy, the card then changed height: its
// calendar fills the card's width with a column a week, so every week the copy was behind made the
// squares smaller and the card shorter, and the nav's links to the sections below it, which scroll
// smoothly to where a section was when they started, went that much past it. Drawn from the same file,
// the card keeps its height.
//
// It writes the file to node_modules/.cache, where vite.config.js's latest-activity plugin gives it to
// both of the build's passes in place of the copy, so the pre-rendered page and the browser's first render
// agree. When GitHub can't be reached in time, answers an error, or sends a file that's broken or older
// than the copy, it writes nothing and the copy stays, as before; the build goes on either way.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LIVE_URL, isActivity, isLighthouse } from "../src/components/SiteActivity/activityFile.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const COPY = path.join(root, "src", "data", "portfolioActivity.json");
/** Where the build finds the latest file (vite.config.js reads it). */
export const LATEST = path.join(root, "node_modules", ".cache", "portfolio-activity.json");

/**
 * The file the build should draw: GitHub's latest when it's good and no older than `copy` (with the
 * copy's Lighthouse scores, should it have none), else null. `fetch`, `log` and `warn` are swapped out
 * in the tests.
 */
export const latestActivity = async (copy, { fetch = globalThis.fetch, timeout = 15_000, log = console.log, warn = console.warn } = {}) => {
  const keep = (why) => {
    warn(`The activity card keeps the repository's copy, to ${copy.to}: GitHub's file ${why}`);
    return null;
  };
  let latest;
  try {
    const res = await fetch(LIVE_URL, { signal: AbortSignal.timeout(timeout) });
    if (!res.ok) return keep(`answered HTTP ${res.status}`);
    latest = await res.json();
  } catch (err) {
    return keep(`couldn't be had (${err.message})`);
  }
  if (!isActivity(latest)) return keep("isn't one the card can draw");
  if (latest.to < copy.to) return keep(`is older, to ${latest.to}`);
  log(`The activity card draws GitHub's file, ${latest.from} to ${latest.to} (the repository's copy is to ${copy.to})`);
  return isLighthouse(latest.lighthouse) ? latest : { ...latest, lighthouse: copy.lighthouse };
};

/** Writes `latest` where the build reads it; with none, removes an earlier build's, so the copy stays. */
export const writeLatest = (latest, file = LATEST) => {
  rmSync(file, { force: true });
  if (!latest) return;
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(latest));
};

if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  writeLatest(await latestActivity(JSON.parse(readFileSync(COPY, "utf8"))));
}
