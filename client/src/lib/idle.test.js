// afterLoad: work the first screen doesn't need waits for the load, the first frame shown and a quiet moment
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { afterLoad } from "./idle";

let frames;
beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  // A frame callback runs only when the browser draws: here, when the test says it drew
  frames = [];
  vi.stubGlobal("requestAnimationFrame", vi.fn((cb) => frames.push(cb)));
  vi.stubGlobal("cancelAnimationFrame", vi.fn((id) => (frames[id - 1] = null)));
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
const draw = () => frames.splice(0).forEach((cb) => cb?.(performance.now()));
const loading = () => vi.spyOn(document, "readyState", "get").mockReturnValue("loading");

describe("afterLoad", () => {
  it("waits for the page's load, then its first frame, then a quiet moment", () => {
    const spy = loading();
    const callback = vi.fn();
    afterLoad(callback);
    vi.runAllTimers();
    expect(requestAnimationFrame).not.toHaveBeenCalled();

    spy.mockRestore();
    window.dispatchEvent(new Event("load"));
    vi.runAllTimers();
    expect(callback).not.toHaveBeenCalled(); // no frame drawn yet

    draw();
    expect(callback).not.toHaveBeenCalled();
    vi.runAllTimers(); // jsdom has no requestIdleCallback: 300 ms stands in for the quiet moment
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("starts at once on a page that has already loaded", () => {
    const callback = vi.fn();
    afterLoad(callback);
    draw();
    vi.runAllTimers();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("in a browser, asks for an idle moment with a time limit, so a busy page still gets it", () => {
    vi.stubGlobal("requestIdleCallback", vi.fn((cb) => (cb(), 7)));
    vi.stubGlobal("cancelIdleCallback", vi.fn());
    const callback = vi.fn();
    afterLoad(callback, { timeout: 1500 });
    draw();
    vi.runAllTimers();
    expect(requestIdleCallback).toHaveBeenCalledWith(callback, { timeout: 1500 });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("never runs once cancelled, at whichever step it was waiting", () => {
    const callback = vi.fn();
    const spy = loading();
    afterLoad(callback)(); // cancelled while waiting for the load
    spy.mockRestore();
    window.dispatchEvent(new Event("load"));

    afterLoad(callback)(); // cancelled while waiting for a frame
    const cancel = afterLoad(callback);
    draw();
    vi.advanceTimersByTime(1);
    cancel(); // cancelled while waiting for the quiet moment
    draw();
    vi.runAllTimers();
    expect(callback).not.toHaveBeenCalled();
  });

  it("in a browser, cancels the idle callback it asked for", () => {
    vi.stubGlobal("requestIdleCallback", vi.fn(() => 7));
    vi.stubGlobal("cancelIdleCallback", vi.fn());
    const cancel = afterLoad(vi.fn());
    draw();
    vi.runAllTimers();
    cancel();
    expect(cancelIdleCallback).toHaveBeenCalledWith(7);
  });
});
