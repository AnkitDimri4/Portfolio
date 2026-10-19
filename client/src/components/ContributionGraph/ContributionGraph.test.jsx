import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import ACTIVITY from "../../data/workActivity.json";
import ContributionGraph, { TOTAL } from "./ContributionGraph";

afterEach(() => vi.unstubAllGlobals());

describe("the GitHub contribution graph", () => {
  it("leaves its squares out of the page the build writes, keeping its size, months and summary", () => {
    const html = renderToString(<ContributionGraph title="GitHub activity at FileSure" />);
    expect(html).not.toContain("<rect");
    expect(html).toMatch(/viewBox="0 0 [\d.]+ [\d.]+"/);
    expect(html).toMatch(/<text [^>]*>[A-Z][a-z]{2}<\/text>/);
    expect(html).toContain(`${TOTAL.toLocaleString("en-US")} contributions on`);
  });

  it("draws a square for every day once it comes near, each saying that day's contributions", () => {
    vi.stubGlobal("IntersectionObserver", undefined); // no observer: near at once
    render(<ContributionGraph />);
    const squares = screen.getByRole("img", { name: /contributions on \d+ days/ }).querySelectorAll("rect");
    expect(squares).toHaveLength(Object.keys(ACTIVITY).length);
    expect(squares[0].querySelector("title").textContent).toMatch(/^\d+ [A-Z][a-z]{2}: \d+ contributions?$/);
  });
});
