import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Real visits' timings (vitals.js): one beacon as the visitor leaves the page, with the page, the device
// and what web-vitals measured, rounded; nothing from Lighthouse, a headless or automated browser, or a
// browser without beacons. The API's side: backend/test/vitals.test.js.
vi.mock("./idle", () => ({ afterLoad: (callback) => (callback(), () => {}) })); // the page has painted
const { reportVitals } = await import("./vitals");

/** web-vitals as the page loads it: each on… keeps its callback, to report with. */
const library = () => {
  const report = {};
  const on = (name) => (callback) => (report[name] = (value) => callback({ name, value }));
  return { report, load: async () => ({ onLCP: on("LCP"), onINP: on("INP"), onCLS: on("CLS"), onFCP: on("FCP"), onTTFB: on("TTFB") }) };
};
const settle = () => new Promise((resolve) => setTimeout(resolve));
const hide = () => {
  Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" });
  document.dispatchEvent(new Event("visibilitychange"));
};
const sentBody = async (call) => JSON.parse(await call[1].text());

let beacon;
let agent;
beforeEach(() => {
  beacon = vi.fn(() => true);
  Object.defineProperty(navigator, "sendBeacon", { configurable: true, value: beacon });
  agent = vi.spyOn(navigator, "userAgent", "get").mockReturnValue("Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Mobile Safari/537.36");
  window.matchMedia = vi.fn((query) => ({ matches: query === "(max-width: 767px)", media: query }));
  Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
});
afterEach(() => {
  delete navigator.sendBeacon;
  agent.mockRestore();
  delete window.matchMedia;
});

describe("real visits' timings", () => {
  it("send one beacon as the page is hidden: the page, a phone, and each timing rounded", async () => {
    const { report, load } = library();
    const stop = reportVitals("home", { load });
    await settle();
    report.LCP(2104.6);
    report.FCP(1203.2);
    report.TTFB(410.4);
    report.CLS(0.01234);
    report.INP(88);
    expect(beacon).not.toHaveBeenCalled(); // nothing until the visitor leaves
    hide();
    expect(beacon).toHaveBeenCalledTimes(1);
    expect(beacon.mock.calls[0][0]).toMatch(/\/api\/v1\/portfolio\/vitals$/);
    expect(beacon.mock.calls[0][1].type).toBe("text/plain"); // the one body a beacon sends without asking the API first
    expect(await sentBody(beacon.mock.calls[0])).toEqual({ page: "home", device: "mobile", lcp: 2105, fcp: 1203, ttfb: 410, cls: 0.012, inp: 88 });
    // once a visit: hidden again, or the page closing, sends nothing more
    hide();
    window.dispatchEvent(new Event("pagehide"));
    expect(beacon).toHaveBeenCalledTimes(1);
    stop();
  });

  it("on a desktop says so, and closing the page sends too; without a tap there's no INP, and without any timing nothing", async () => {
    window.matchMedia = vi.fn(() => ({ matches: false }));
    const { report, load } = library();
    reportVitals("builder", { load });
    await settle();
    report.LCP(900);
    window.dispatchEvent(new Event("pagehide"));
    expect(await sentBody(beacon.mock.calls[0])).toEqual({ page: "builder", device: "desktop", lcp: 900 });

    beacon.mockClear();
    const quiet = library();
    reportVitals("account", { load: quiet.load });
    await settle();
    hide();
    expect(beacon).not.toHaveBeenCalled(); // nothing measured, nothing sent
  });

  it("send nothing from Lighthouse, a headless or automated browser, or one without beacons, and never load the library there", async () => {
    for (const ua of ["Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Mobile Safari/537.36 Chrome-Lighthouse", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/141.0 Safari/537.36", "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"]) {
      agent.mockReturnValue(ua);
      const load = vi.fn();
      reportVitals("home", { load });
      expect(load).not.toHaveBeenCalled();
    }
    agent.mockReturnValue("Mozilla/5.0 Chrome/141.0");
    Object.defineProperty(navigator, "webdriver", { configurable: true, value: true });
    const driven = vi.fn();
    reportVitals("home", { load: driven });
    expect(driven).not.toHaveBeenCalled();
    delete navigator.webdriver;
    delete navigator.sendBeacon;
    const noBeacon = vi.fn();
    reportVitals("home", { load: noBeacon });
    expect(noBeacon).not.toHaveBeenCalled();
  });

  it("an old tab whose library file is gone after a deploy sends nothing and breaks nothing; stopped, it sends nothing", async () => {
    reportVitals("home", { load: () => Promise.reject(new Error("Failed to fetch dynamically imported module")) });
    await settle();
    hide();
    expect(beacon).not.toHaveBeenCalled();

    const { report, load } = library();
    const stop = reportVitals("home", { load });
    await settle();
    report.LCP(1000);
    stop();
    hide();
    expect(beacon).not.toHaveBeenCalled();
  });
});
