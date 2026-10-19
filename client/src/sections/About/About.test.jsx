// The About section's live stats, with the numbers the page was built with (src/lib/api.js)
import { act, render, waitFor } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const GITHUB = { status: "success", totalCommits: 1341, partial: false, repos: [], fetchedAt: "2026-10-19T02:59:23.125Z" };
const LEETCODE = {
  status: "success",
  totalSolved: 692,
  acceptanceRate: "92.70",
  ranking: 102432,
  solvedByDifficulty: { easy: 183, medium: 383, hard: 126 },
  fetchedAt: "2026-10-19T02:59:21.049Z",
};
const SNAPSHOT = { "/api/v1/portfolio/github": GITHUB, "/api/v1/portfolio/leetcode": LEETCODE };

/** About and the API helper afresh, with no answers kept from another test, and this snapshot. */
const fresh = async (snapshot) => {
  vi.resetModules();
  const api = await import("../../lib/api");
  api.setSnapshot(snapshot);
  return (await import("./About")).default;
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("the About section's live stats", () => {
  it("show the numbers the page was built with at once, before the API answers", async () => {
    const About = await fresh(SNAPSHOT);
    render(<About />);
    const stats = document.querySelector(".stats");
    expect(stats.querySelector(".skeleton")).toBeNull();
    expect(stats).toHaveTextContent("2,640"); // 1,341 personal + 1,299 at FileSure
    expect(stats).toHaveTextContent("692");
    expect(stats).toHaveTextContent("92.7%");
    expect(stats).toHaveTextContent("#102,432");
  });

  it("are pre-rendered, and hydrate without a mismatch; the clock's part comes once the page runs", async () => {
    const About = await fresh(SNAPSHOT);
    const html = renderToString(<About />);
    expect(html).toContain("692");
    expect(html).not.toContain("synced");

    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.append(container);
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    await act(async () => {
      hydrateRoot(container, <About />);
    });
    expect(errors).not.toHaveBeenCalled();
    expect(container.querySelector(".stats-head")).toHaveTextContent(/· synced (just now|\d+ (min|h|days) ago)/);
    container.remove();
  });

  it("then show the live numbers when the API answers", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url) => ({ ok: true, status: 200, json: async () => (String(url).includes("leetcode") ? { ...LEETCODE, totalSolved: 693 } : GITHUB) }))
    );
    const About = await fresh(SNAPSHOT);
    render(<About />);
    await waitFor(() => expect(document.querySelector(".stats")).toHaveTextContent("693"));
  });

  it("without a snapshot, wait for the API as before", async () => {
    const About = await fresh({});
    render(<About />);
    expect(document.querySelectorAll(".stats .skeleton")).toHaveLength(4);
  });
});
