// The Stack section is in the page at its full size from the start: every group and tool, each logo's
// place held by a blank of a logo's size. Only the logos (stackIcons.js) come later, as it approaches,
// so it never changes height: it grew by ~2,200 px on a phone, which left long scrolls past it short.
import { render, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, expect, test, vi } from "vitest";
import Stack from "./Stack";
import { STACK } from "./stackData";
import { ICONS } from "./stackIcons";

const TOOLS = STACK.flatMap((g) => g.items);
const items = (root) => [...root.querySelectorAll(".stack-items li")];
const drawn = (root) => root.querySelectorAll(".stack-items svg > *").length;

// The grid's markup with each logo's drawing and look left out, its box kept: what decides its size
const layout = (root) => {
  const grid = root.querySelector(".stack-grid").cloneNode(true);
  for (const svg of grid.querySelectorAll(".stack-items svg")) {
    const box = ["width", "height", "aria-hidden"].map((name) => [name, svg.getAttribute(name)]);
    for (const { name } of [...svg.attributes]) svg.removeAttribute(name);
    for (const [name, value] of box) svg.setAttribute(name, value);
    svg.replaceChildren();
  }
  return grid.outerHTML;
};

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

test("pre-rendered, it's at its full size: every group and tool, each logo's place held by a blank 1em square", () => {
  document.body.innerHTML = renderToString(<Stack />);
  expect([...document.querySelectorAll(".stack-group")].map((h) => h.textContent)).toEqual(STACK.map((g) => g.group));
  expect(items(document).map((li) => li.textContent)).toEqual(TOOLS);
  for (const li of items(document)) {
    const svg = li.firstElementChild;
    expect(svg.tagName, li.textContent).toBe("svg");
    expect(["width", "height", "aria-hidden"].map((name) => svg.getAttribute(name))).toEqual(["1em", "1em", "true"]);
  }
  expect(drawn(document)).toBe(0);
});

test("asks for no logos while the section is far", async () => {
  const { container } = render(<Stack />); // the tests' IntersectionObserver never says "near"
  await new Promise((done) => setTimeout(done, 50));
  expect(items(container)).toHaveLength(TOOLS.length);
  expect(drawn(container)).toBe(0);
});

test("as it comes near, each logo takes its blank's place, the same size, and nothing else in the grid changes", async () => {
  vi.stubGlobal("IntersectionObserver", undefined); // no observer: near at once
  const { container } = render(<Stack />);
  const before = layout(container);
  expect(drawn(container)).toBe(0);

  await waitFor(() => expect(drawn(container)).toBeGreaterThan(0));
  for (const li of items(container)) {
    const svg = li.firstElementChild;
    expect(svg.childElementCount, li.textContent).toBeGreaterThan(0);
    expect([svg.getAttribute("width"), svg.getAttribute("height")]).toEqual(["1em", "1em"]);
  }
  expect(layout(container)).toBe(before);
});

test("every tool has a logo, and every logo is a tool's", () => {
  expect(new Set(TOOLS).size).toBe(TOOLS.length); // names are the logos' keys, and React's
  expect(Object.keys(ICONS).sort()).toEqual([...TOOLS].sort());
  for (const [name, Icon] of Object.entries(ICONS)) expect(typeof Icon, name).toBe("function");
});
