import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import NeuralField from "./NeuralField";

// The hero's background waits for an idle moment before its first frame: requestIdleCallback in a
// browser, 300 ms here (jsdom has none). Frames are only counted: jsdom's canvas can't draw.
beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  vi.stubGlobal("requestAnimationFrame", vi.fn(() => 1));
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("the hero's moving background", () => {
  it("starts once the page has had an idle moment", () => {
    render(<NeuralField />);
    expect(requestAnimationFrame).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
  });

  it("never starts when it's taken off the page before then", () => {
    const { unmount } = render(<NeuralField />);
    unmount();
    vi.runAllTimers();
    expect(requestAnimationFrame).not.toHaveBeenCalled();
  });

  it("in a browser, cancels its idle callback the same way", () => {
    vi.stubGlobal("requestIdleCallback", vi.fn(() => 7));
    vi.stubGlobal("cancelIdleCallback", vi.fn());
    const { unmount } = render(<NeuralField />);
    unmount();
    expect(cancelIdleCallback).toHaveBeenCalledWith(7);
  });
});
