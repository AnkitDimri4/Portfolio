import { render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import SNAPSHOT from "../../data/portfolioActivity.json";
import WORK from "../../data/workActivity.json";
import SiteActivity, { perActiveDay } from "./SiteActivity";
import { LIVE_URL, isActivity, isLighthouse } from "./activityFile";

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

  it("puts each number's logo before it, as on the profile card, and keeps the logos from screen readers", () => {
    render(<SiteActivity />);
    const logos = [...document.querySelectorAll(".sa-stat dd:not(.sa-rate)")].map((dd) => dd.firstElementChild);
    expect(logos.map((logo) => [...logo.classList].find((c) => c.startsWith("sa-icon-")))).toEqual(["sa-icon-lighthouse", "sa-icon-git", "sa-icon-github", "sa-icon-vercel"]);
    for (const logo of logos) {
      expect(logo.tagName).toBe("svg");
      expect(logo).toHaveAttribute("aria-hidden", "true");
    }
    // The logos add no words: each number reads as before
    expect(stat("commits")).toBe(num(SNAPSHOT.totals.commits));
  });

  it("says each total per active day under its number, the Lighthouse scores' source, and the active days", () => {
    render(<SiteActivity />);
    const rateOf = (label) => within(document.querySelector(".sa-stats")).getByText(label).closest(".sa-stat").querySelector(".sa-rate").textContent;
    const { activeDays } = SNAPSHOT.totals;
    expect(rateOf("Lighthouse, mobile · desktop")).toBe("on the live site");
    expect(rateOf("commits")).toBe(`${perActiveDay(SNAPSHOT.totals.commits, activeDays)} per active day`);
    expect(rateOf("pull requests merged")).toBe(`${perActiveDay(SNAPSHOT.totals.mergedPullRequests, activeDays)} per active day`);
    expect(rateOf(`deployments, ${num(SNAPSHOT.totals.productionDeploys)} to production`)).toBe(`${perActiveDay(SNAPSHOT.totals.deployments, activeDays)} per active day`);
    expect(document.querySelector(".sa-dates")).toHaveTextContent(new RegExp(`^Since \\w{3} \\d{4} · ${activeDays} active days · private repository`));
  });

  it("leaves the rates and active days out when the latest file doesn't say how many days had a commit", async () => {
    nearAtOnce();
    answer({ ...NEWER, totals: { ...NEWER.totals, activeDays: undefined } });
    render(<SiteActivity />);
    await waitFor(() => expect(stat("commits")).toBe("4,321"));
    expect([...document.querySelectorAll(".sa-rate")].map((r) => r.textContent)).toEqual(["on the live site"]);
    expect(document.querySelector(".sa-dates")).not.toHaveTextContent("active day");
  });

  it("says the busiest day and month, the earlier on a tie, as on the profile card", async () => {
    nearAtOnce();
    answer({
      ...NEWER,
      days: {
        "2026-10-16": { commits: 83, pullRequests: 1, deployments: 1 },
        "2026-10-15": { commits: 83, pullRequests: 34, deployments: 59 },
        [SNAPSHOT.from]: { commits: 5, deployments: 1 },
      },
    });
    render(<SiteActivity />);
    await waitFor(() => expect(stat("commits")).toBe("4,321"));
    const notes = [...document.querySelectorAll(".sa-note")].map((p) => p.textContent);
    expect(notes).toEqual(["Busiest day, 15 Oct: 83 commits · 34 pull requests · 59 deployments", "Busiest month, Oct: 166 commits · 35 PRs · 60 deploys"]);
  });

  it("fills the days this site has no commits with my FileSure work, in faint squares that say so", () => {
    nearAtOnce();
    render(<SiteActivity />);
    const calendar = screen.getByRole("img", { name: /^Commits day by day/ });
    expect(calendar).toHaveAttribute("aria-label", expect.stringMatching(/my work at FileSure, in private repositories, in faint squares$/));
    const faint = [...calendar.querySelectorAll("rect")].filter((r) => /^sa-fs-l[1-4]$/.test(r.getAttribute("class")));
    const workDays = Object.entries(WORK).filter(([date, n]) => n > 0 && date >= SNAPSHOT.from && date <= SNAPSHOT.to && !SNAPSHOT.days[date]?.commits);
    expect(workDays.length).toBeGreaterThan(0);
    expect(faint).toHaveLength(workDays.length);
    for (const square of faint) expect(square.querySelector("title").textContent).toMatch(/^\d+ [A-Z][a-z]{2}: [\d,]+ contributions? at FileSure, in private repositories$/);
    // A day with this site's commits stays green, and says both
    const both = Object.keys(WORK).find((date) => WORK[date] > 0 && SNAPSHOT.days[date]?.commits > 0);
    if (both) {
      const square = [...calendar.querySelectorAll("rect")].find((r) => r.querySelector("title").textContent.startsWith(`${dayLabel(both)}:`));
      expect(square.getAttribute("class")).toMatch(/^cg-l[1-4]$/);
      expect(square.querySelector("title").textContent).toMatch(/commits? · .*; [\d,]+ contributions? at FileSure/);
    }
  });

  it("names FileSure's weeks under the calendar, and shows its months as faint bars behind this site's", () => {
    render(<SiteActivity />); // the line and the bars are there before the card comes near
    const calendar = screen.getByRole("img", { name: /^Commits day by day/ });
    expect(within(calendar).getByText("at FileSure, in private repositories")).toBeInTheDocument();
    const bars = screen.getByRole("img", { name: /: \d/ });
    const workMonths = new Set(Object.keys(WORK).filter((date) => WORK[date] > 0 && date <= SNAPSHOT.to).map((date) => date.slice(0, 7)));
    expect(bars.querySelectorAll(".sa-bar-fs")).toHaveLength(workMonths.size);
    expect(bars.getAttribute("aria-label")).toMatch(/Jul: 0 commits, 0 pull requests, 0 deployments, and [\d,]+ contributions at FileSure, in private repositories/);
    expect(screen.getAllByText("FileSure, private")).toHaveLength(2); // in both keys
  });

  it("names Mon, Wed and Fri beside the calendar, as GitHub does", () => {
    render(<SiteActivity />);
    const calendar = screen.getByRole("img", { name: /^Commits day by day/ });
    expect(within(calendar).getByText("Mon")).toBeInTheDocument();
    expect(within(calendar).getByText("Wed")).toBeInTheDocument();
    expect(within(calendar).getByText("Fri")).toBeInTheDocument();
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

  it("draws its squares only once the card comes near; until then, the calendar's size, months and summary", () => {
    render(<SiteActivity />); // the IntersectionObserver of the tests never says "near"
    const calendar = screen.getByRole("img", { name: /^Commits day by day/ });
    expect(calendar.querySelectorAll("rect, .sa-deploy")).toHaveLength(0);
    expect(calendar.getAttribute("viewBox")).toMatch(/^0 0 \d+(\.\d+)? \d+(\.\d+)?$/);
    expect(within(calendar).getAllByText(/^[A-Z][a-z]{2}$/).length).toBeGreaterThan(0);
    // The month-by-month bars are few, so they're there at once
    expect(screen.getByRole("img", { name: /: \d/ }).querySelectorAll(".sa-bar").length).toBeGreaterThan(0);
  });

  it("draws a square for every day from the Sunday before the first, and a triangle on each day the site was deployed", () => {
    nearAtOnce();
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

  // What sets the card's height at its width: each graph's svg fills the width, so its height is the
  // width times its viewBox's height over its width; and the lines of words around them
  const shapes = () =>
    [...document.querySelectorAll(".sa-svg")].map((svg) => {
      const [, , w, h] = svg.getAttribute("viewBox").split(" ").map(Number);
      return h / w;
    });
  const lines = () => document.querySelectorAll(".sa figcaption, .sa dt, .sa dd, .sa p").length;

  it("keeps its height when it swaps in the latest file of the same weeks, as the build now draws it", async () => {
    const weekday = new Date(`${SNAPSHOT.to}T00:00:00Z`).getUTCDay();
    const SATURDAY = iso(Date.parse(`${SNAPSHOT.to}T00:00:00Z`) + (6 - weekday) * DAY);
    for (const latest of [
      // Counted again after the deploy, the same day: new numbers, new scores, a busier day
      { ...NEWER, to: SNAPSHOT.to, days: { ...SNAPSHOT.days, [SNAPSHOT.to]: { commits: 90, pullRequests: 30, deployments: 60 } } },
      // Counted again every 6 hours to the end of that week
      { ...NEWER, to: SATURDAY },
    ]) {
      nearAtOnce();
      answer(latest);
      const { unmount } = render(<SiteActivity />);
      const [before, parts] = [shapes(), lines()];
      expect(before).toHaveLength(2);
      await waitFor(() => expect(stat("commits")).toBe("4,321"));
      expect(shapes()).toEqual(before);
      expect(lines()).toBe(parts);
      unmount();
      vi.unstubAllGlobals();
    }
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

describe("perActiveDay", () => {
  it("says a rate as the profile card does: whole from 10, one decimal below, without a trailing .0", () => {
    // The profile card's numbers on 19 October: 438 commits, 149 pull requests, 326 deployments, 17 active days
    expect(perActiveDay(438, 17)).toBe("26");
    expect(perActiveDay(149, 17)).toBe("8.8");
    expect(perActiveDay(326, 17)).toBe("19");
    expect(perActiveDay(20, 10)).toBe("2");
    expect(perActiveDay(100, 10)).toBe("10");
  });
});
