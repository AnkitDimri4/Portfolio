// The first screen leaves the page's main thread free: what it animates forever moves by transform or
// opacity alone, which the browser animates without the main thread. The status pill's beam turned a
// gradient's angle instead (a registered custom property), and that repainted the pill on every frame:
// on a slow phone, or GitHub's machine measuring Site health, every frame then cost the page.
import { readFileSync } from "node:fs";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Hero from "./Hero";

const read = (file) => readFileSync(`${import.meta.dirname}/${file}`, "utf8").replace(/\/\*[\s\S]*?\*\//g, ""); // as files: the tests' CSS imports come empty
const FILES = ["Hero.css", "../../components/CodeCard/CodeCard.css"];

/** Each @keyframes' name and the properties its frames set. */
const keyframes = (css) => {
  const found = {};
  for (const m of css.matchAll(/@keyframes\s+([\w-]+)\s*\{/g)) {
    let depth = 1;
    let i = m.index + m[0].length;
    for (; depth && i < css.length; i++) depth += css[i] === "{" ? 1 : css[i] === "}" ? -1 : 0;
    const body = css.slice(m.index + m[0].length, i - 1);
    found[m[1]] = [...body.matchAll(/([\w-]+)\s*:/g)].map((p) => p[1]);
  }
  return found;
};

/** The keyframes a stylesheet runs forever: each `infinite` animation's name. */
const KEYWORDS = /^(linear|ease|ease-in|ease-out|ease-in-out|step-start|step-end|infinite|alternate|alternate-reverse|normal|reverse|forwards|backwards|both|none|running|paused)$/;
const endless = (css) =>
  [...css.matchAll(/animation\s*:\s*([^;]+);/g)].flatMap(([, value]) =>
    value
      .split(/,(?![^(]*\))/)
      .filter((one) => /\binfinite\b/.test(one))
      .map((one) => one.replace(/[\w-]+\([^)]*\)/g, " ").trim().split(/\s+/).find((word) => !KEYWORDS.test(word) && !/^-?[\d.]+m?s?$/.test(word)))
  );

describe("the hero's first screen", () => {
  it("draws the status pill's beam in a span of its own, hidden from screen readers", () => {
    render(<Hero />);
    const beam = document.querySelector(".hero-status > .hero-beam");
    expect(beam).toHaveAttribute("aria-hidden", "true");
    expect(beam).toBeEmptyDOMElement();
  });

  it("animates nothing forever but by transform or opacity", () => {
    const frames = Object.assign({}, ...FILES.map((f) => keyframes(read(f))));
    const names = FILES.flatMap((f) => endless(read(f)));
    expect(names).toEqual(expect.arrayContaining(["beam", "radar-sweep", "radar-blip", "blink", "nudge", "code-sway"]));
    for (const name of names) {
      expect(frames[name], name).toBeDefined();
      for (const property of frames[name]) expect(["transform", "opacity"], `${name} animates ${property}`).toContain(property);
    }
  });

  it("registers no custom property to animate, as the beam's old angle was", () => {
    for (const file of FILES) expect(read(file), file).not.toMatch(/@property/);
  });
});
