// Real visits' page timings, for Site health (docs/runbooks/site-health.md#real-visits): Lighthouse
// measures the site in a lab each night; this is how fast it is for the people who visit. Once the page
// has painted, Google's web-vitals library (fetched then, so the first paint never waits for it) watches
// how fast the page showed and answered: LCP (its largest paint), INP (its slowest answer to a tap or a
// key), CLS (how much it shifted), FCP (its first paint) and TTFB (the first byte). When the visitor
// leaves the page, or hides its tab, one beacon sends those, which page it was, and a phone or a desktop,
// to the API (POST /vitals). Nothing about the visitor: no cookie, no id, nothing kept in the browser, and
// the API doesn't keep the address (the privacy page says so). Lighthouse, headless browsers and bots
// don't send: they aren't visitors.
import { afterLoad } from "./idle";
import { API_BASE } from "./serverStatus";

// The ones that run a page's scripts: Lighthouse (Site health's, PageSpeed's), headless Chrome, and search
// engines' renderers (Googlebot, Bingbot); a link preview never runs them
const NOT_A_VISITOR = /HeadlessChrome|Chrome-Lighthouse|Lighthouse|PageSpeed|bot\b|crawler|spider/i;
/** A phone when the page is as narrow as the site's phone layout, as Site health's mobile is. */
const deviceOf = () => (window.matchMedia?.("(max-width: 767px)").matches ? "mobile" : "desktop");

/**
 * Sends `page`'s timings once, as the visitor leaves it: "home", "builder" or "account" (the API's
 * PAGES). `load` is web-vitals' import (the tests give their own). Returns a function that stops it.
 */
export const reportVitals = (page, { load = () => import("web-vitals") } = {}) => {
  if (typeof navigator === "undefined" || typeof navigator.sendBeacon !== "function" || navigator.webdriver || NOT_A_VISITOR.test(navigator.userAgent ?? "")) return () => {};
  const timings = {};
  let sent = false;
  let stopped = false;
  const send = () => {
    if (sent || !Object.keys(timings).length) return;
    sent = true;
    const body = JSON.stringify({ page, device: deviceOf(), ...timings });
    try {
      navigator.sendBeacon(`${API_BASE}/api/v1/portfolio/vitals`, new Blob([body], { type: "text/plain" }));
    } catch {
      // a browser that refuses it: one visit's timings lost, nothing else
    }
  };
  const onHide = () => document.visibilityState === "hidden" && send();
  const cancel = afterLoad(() => {
    load()
      .then(({ onLCP, onINP, onCLS, onFCP, onTTFB }) => {
        if (stopped) return;
        const keep = ({ name, value }) => {
          timings[name.toLowerCase()] = name === "CLS" ? Math.round(value * 1000) / 1000 : Math.round(value);
        };
        // each reports as the page is hidden, before the listener below, so the beacon has their last values
        for (const watch of [onLCP, onINP, onCLS, onFCP, onTTFB]) watch(keep);
        document.addEventListener("visibilitychange", onHide);
        window.addEventListener("pagehide", send);
      })
      .catch(() => {}); // the library's file gone after a deploy (an old tab): no timings, and nothing breaks
  });
  return () => {
    stopped = true;
    cancel();
    document.removeEventListener("visibilitychange", onHide);
    window.removeEventListener("pagehide", send);
  };
};
