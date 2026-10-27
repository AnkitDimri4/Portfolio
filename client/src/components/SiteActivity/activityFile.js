// The activity card's file (SiteActivity.jsx): where GitHub has the latest, and the checks a download
// must pass before the card draws it. Plain JavaScript, so the build's first step (scripts/activity.js)
// checks the file it fetches the same way.
export const LIVE_URL = "https://raw.githubusercontent.com/AnkitDimri4/AnkitDimri4/main/assets/cards/portfolio-activity.json";

export const DATE = /^\d{4}-\d{2}-\d{2}$/;
/** True when `a` has the shape this card draws, so a broken download can't break the page. */
export const isActivity = (a) =>
  Boolean(a) &&
  DATE.test(a.from) &&
  DATE.test(a.to) &&
  a.from <= a.to &&
  ["commits", "mergedPullRequests", "deployments", "productionDeploys"].every((k) => Number.isFinite(a.totals?.[k])) &&
  typeof a.days === "object" &&
  a.days !== null;

/** True when `l` has the two Lighthouse scores, 0 to 100, mobile and desktop. */
export const isLighthouse = (l) => Boolean(l) && [l.mobile, l.desktop].every((n) => Number.isInteger(n) && n >= 0 && n <= 100);
