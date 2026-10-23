// After a deploy, Vercel serves only the new deployment's files. A page opened before it still names the
// old ones, so a part it loads on demand (the scheduler, the stack's grid) is asked for by a name that's
// gone: 404. Loading the page again brings the new names.
const KEY = "reloaded-for-new-files";
const WITHIN_MS = 60_000;

/** The browser's reload, on an object of its own so the tests can stand in for it (jsdom can't navigate). */
export const page = { reload: () => window.location.reload() };

/** Loads the page again, at `hash` if given (#schedule opens the scheduler as the page starts). */
export const reloadAt = (hash) => {
  if (hash) window.history.replaceState(window.history.state, "", hash);
  page.reload();
};

/**
 * Whether a part that didn't arrive may load the page again: not if it did so in the last minute (that
 * reload didn't bring the file, so another won't), nor offline (the browser would show its own error page
 * instead of this one), nor where the browser keeps no session storage (a loop couldn't be told).
 */
const mayReload = () => {
  try {
    if (navigator.onLine === false || Date.now() - Number(sessionStorage.getItem(KEY)) < WITHIN_MS) return false;
    sessionStorage.setItem(KEY, String(Date.now()));
    return true;
  } catch {
    return false;
  }
};

/**
 * `load` (a part's import), loading the page again at `hash` if it fails, when it may. Otherwise it fails as
 * `load` did. While the page reloads, it never settles: there's nothing to draw meanwhile.
 */
export const orReload = (load, hash) => () =>
  load().catch((error) => {
    if (!mayReload()) throw error;
    reloadAt(hash);
    return new Promise(() => {});
  });
