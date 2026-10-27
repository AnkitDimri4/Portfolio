// A tab opened before a deploy: the logos' file, asked for by its old name, is gone (404). The grid is
// already in the page at its full size, so it stays as it is, without logos: no note, no reload, and no
// change in height. A file of its own, with logos that never arrive.
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { page } from "../../lib/reload";
import Stack from "./Stack";
import { STACK } from "./stackData";

const asked = vi.hoisted(() => ({ times: 0 }));
vi.mock("./stackIcons", () => {
  asked.times++;
  throw new TypeError("Failed to fetch dynamically imported module: https://example.test/assets/stackIcons-old.js");
});

beforeEach(() => vi.stubGlobal("IntersectionObserver", undefined)); // no observer: near at once
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

test("the grid stays as it was, every tool listed, without logos, with no note and no reload", async () => {
  const reload = vi.spyOn(page, "reload").mockImplementation(() => {});
  const { container } = render(<Stack />);
  const grid = () => container.querySelector(".stack-grid").outerHTML; // the heading's letters shuffle on their own
  const before = grid();
  await act(() => new Promise((done) => setTimeout(done, 50))); // the import fails meanwhile

  expect(asked.times).toBeGreaterThan(0);
  expect(grid()).toBe(before);
  expect([...container.querySelectorAll(".stack-items li")].map((li) => li.textContent)).toEqual(STACK.flatMap((g) => g.items));
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(reload).not.toHaveBeenCalled();
});
