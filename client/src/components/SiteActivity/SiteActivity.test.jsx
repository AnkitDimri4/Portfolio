import { render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import SNAPSHOT from "../../data/portfolioActivity.json";
import SiteActivity, { LIVE_URL, isActivity, isLighthouse } from "./SiteActivity";

const num = (n) => n.toLocaleString("en-US");
const stat = (label) => within(document.querySelector(".sa-stats")).getByText(label).closest(".sa-stat").querySelector("dd").textContent;
// The card asks for the latest file only once it comes near; with no IntersectionObserver it's "near" at once.
const nearAtOnce = () => vi.stubGlobal("IntersectionObserver", undefined);
const answer = (body, ok = true) => vi.stubGlobal("fetch", vi.fn(async () => ({ ok, json: async () => body })));
const DAY = 864e5;
const iso = (t) => new Date(t).toISOString().slice(0, 10);
const NEXT_DAY = iso(Date.parse(`${SNAPSHOT.to}T00:00:00Z`) + DAY);
const NEWER = {
  ...SNAPSHOT,
  to: NEXT_DAY,
  totals: { ...SNAPSHOT.totals, commits: 4321, mergedPullRequests: 765, deployments: 1234, productionDeploys: 567 },
  lighthouse: { mobile: 87, desktop: 99, measured: NEXT_DAY },
  days: { ...SNAPSHOT.days, [NEXT_DAY]: { commits: 12, pullRequests: 3, deployments: 4 } },
};
const BUILD_SCORES = `${SNAPSHOT.lighthouse.mobile} · ${SNAPSHOT.lighthouse.desktop}`;
const dayLabel = (date) => `${Number(date.slice(8))} ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][Number(date.slice(5, 7)) - 1]}`;

afterEach(() => vi.unstubAllGlobals());

describe("this site's activity card", () => {
  it("shows the build's numbers first: Lighthouse, then commits, merged pull requests and deployments", () => {
    render(<SiteActivity title="GitHub activity on this site" />);
    expect(screen.getByText("GitHub activity on this site")).toBeInTheDocument();
    const labels = [...document.querySelectorAll(".sa-stat dt")].map((dt) => dt.textContent);
    expect(labels).toEqual(["Lighthouse, mobile · desktop", "commits", "pull requests merged", `deployments, ${num(SNAPSHOT.totals.productionDeploys)} to production`]);
    expect(stat("Lighthouse, mobile · desktop")).toBe(BUILD_SCORES);
    expect(stat("commits")).toBe(num(SNAPSHOT.totals.commits));
    expect(stat("pull requests merged")).toBe(num(SNAPSHOT.totals.mergedPullRequests));
    expect(screen.getByText(/· updated after every deploy$/)).toBeInTheDocument();
  });

  it("keeps the build's Lighthouse scores when the latest file has none, or broken ones", async () => {
    for (const lighthouse of [undefined, { mobile: "fast", desktop: 100 }, { mobile: 101, desktop: 99 }]) {
      nearAtOnce();
      answer({ ...NEWER, lighthouse });
      const { unmount } = render(<SiteActivity />);
      await waitFor(() => expect(stat("commits")).toBe("4,321"));
      expect(stat("Lighthouse, mobile · desktop")).toBe(BUILD_SCORES);
      unmount();
      vi.unstubAllGlobals();
    }
  });

  it("draws a square for every day from the Sunday before the first, and a triangle on each day the site was deployed", () => {
    render(<SiteActivity />);
    const calendar = screen.getByRole("img", { name: /^Commits day by day/ });
    const last = Date.parse(`${SNAPSHOT.to}T00:00:00Z`);
    const first = Math.max(Date.parse(`${SNAPSHOT.from}T00:00:00Z`), last - 364 * DAY);
    const days = Math.round((last - first) / DAY) + 1 + new Date(first).getUTCDay();
    expect(calendar.querySelectorAll("rect")).toHaveLength(days);
    const deployDays = Object.entries(SNAPSHOT.days).filter(([date, d]) => d.deployments > 0 && date >= SNAPSHOT.from && date <= SNAPSHOT.to);
    expect(calendar.querySelectorAll(".sa-deploy")).toHaveLength(deployDays.length);
    // Each square says what happened that day
    const [date, d] = deployDays[0];
    const square = [...calendar.querySelectorAll("rect")].find((r) => r.querySelector("title").textContent.startsWith(`${Number(date.slice(8))} `));
    expect(square.querySelector("title").textContent).toContain(`${num(d.deployments)} deployment`);
  });

  it("draws a month's bars only when something happened in it, and names each month", () => {
    render(<SiteActivity />);
    const bars = screen.getByRole("img", { name: /: \d/ });
    const busy = new Set(Object.keys(SNAPSHOT.days).map((date) => date.slice(0, 7)));
    expect(within(bars).getAllByText(/^[A-Z][a-z]{2}$/).length).toBeGreaterThanOrEqual(busy.size);
    expect(bars.querySelectorAll(".sa-bar").length).toBeGreaterThanOrEqual(busy.size);
    expect(bars.getAttribute("aria-label")).toMatch(/^Feb: \d+ commits?, /);
  });

  it("swaps in the latest file when the card comes near, Lighthouse included", async () => {
    nearAtOnce();
    answer(NEWER);
    render(<SiteActivity />);
    await waitFor(() => expect(stat("commits")).toBe("4,321"));
    expect(fetch).toHaveBeenCalledWith(LIVE_URL, expect.objectContaining({ signal: expect.any(AbortSignal) }));
    expect(stat("Lighthouse, mobile · desktop")).toBe("87 · 99");
    expect(stat("pull requests merged")).toBe("765");
    expect(screen.getByText("deployments, 567 to production")).toBeInTheDocument();
    expect(screen.getByText(`${dayLabel(NEXT_DAY)}: 12 commits · 3 pull requests · 4 deployments`)).toBeInTheDocument();
  });

  it("draws at most the last year of days and the last 12 months, while the totals stay all-time", async () => {
    nearAtOnce();
    answer({ ...NEWER, from: "2024-01-01", days: { ...NEWER.days, "2024-01-01": { commits: 5, pullRequests: 1, deployments: 1 } } });
    render(<SiteActivity />);
    await waitFor(() => expect(stat("commits")).toBe("4,321"));
    const squares = screen.getByRole("img", { name: /^Commits day by day/ }).querySelectorAll("rect");
    expect(squares.length).toBeLessThanOrEqual(53 * 7);
    expect(squares[squares.length - 1].querySelector("title").textContent).toMatch(new RegExp(`^${dayLabel(NEXT_DAY)}:`));
    const months = within(screen.getByRole("img", { name: /: \d/ })).getAllByText(/^[A-Z][a-z]{2}$/);
    expect(months).toHaveLength(12);
    expect(screen.getByText(/^Since Jan 2024 ·/)).toBeInTheDocument();
  });

  it("keeps the build's copy when the latest file can't be had, is broken, or is older", async () => {
    for (const setUp of [
      () => vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new TypeError("Failed to fetch")))),
      () => answer(null, false),
      () => answer({ ...NEWER, totals: { commits: "lots" } }),
      () => answer({ ...NEWER, to: "2020-01-01" }),
    ]) {
      nearAtOnce();
      setUp();
      const { unmount } = render(<SiteActivity />);
      await waitFor(() => expect(fetch).toHaveBeenCalled());
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(stat("commits")).toBe(num(SNAPSHOT.totals.commits));
      unmount();
      vi.unstubAllGlobals();
    }
  });

  it("only asks for the file once the card is near", () => {
    answer(NEWER);
    render(<SiteActivity />);
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("isActivity", () => {
  it("accepts the build's copy and rejects anything else", () => {
    expect(isActivity(SNAPSHOT)).toBe(true);
    for (const bad of [null, {}, { ...SNAPSHOT, from: "Feb" }, { ...SNAPSHOT, from: "2026-12-01", to: "2026-01-01" }, { ...SNAPSHOT, days: null }, { ...SNAPSHOT, totals: { ...SNAPSHOT.totals, deployments: "x" } }])
      expect(isActivity(bad)).toBe(false);
  });
});

describe("isLighthouse", () => {
  it("accepts two whole scores from 0 to 100, and nothing else", () => {
    expect(isLighthouse(SNAPSHOT.lighthouse)).toBe(true);
    expect(isLighthouse({ mobile: 0, desktop: 100 })).toBe(true);
    for (const bad of [undefined, null, {}, { mobile: 96 }, { mobile: 96.5, desktop: 100 }, { mobile: -1, desktop: 100 }, { mobile: "96", desktop: "100" }, [96, 100]])
      expect(isLighthouse(bad)).toBe(false);
  });
});
