import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import VideoPlayer, { SPEEDS, clock } from "./VideoPlayer";

const SRC = "https://github.com/user-attachments/assets/00000000-0000-4000-8000-000000000000";

// jsdom has <video> but plays nothing: play and pause send the events a browser would
beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function play() {
    this.dispatchEvent(new Event("play"));
    return Promise.resolve();
  });
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function pause() {
    this.dispatchEvent(new Event("pause"));
  });
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

/** A player whose video is 2:05 long and at its start. */
const setup = (props = {}) => {
  const view = render(<VideoPlayer src={SRC} poster="/still.webp" label="RN-Wallet demo: Dashboard" {...props} />);
  const video = view.container.querySelector("video");
  Object.defineProperty(video, "duration", { configurable: true, value: 125 });
  Object.defineProperty(video, "currentTime", { configurable: true, writable: true, value: 0 });
  fireEvent.loadedMetadata(video);
  return { video, box: screen.getAllByRole("group", { name: "RN-Wallet demo: Dashboard" }).at(-1) };
};

const start = () => fireEvent.click(screen.getByRole("button", { name: /Watch the demo/ }));

describe("clock", () => {
  it("writes seconds as a video's time", () => {
    expect(clock(0)).toBe("0:00");
    expect(clock(75.9)).toBe("1:15");
    expect(clock(3725)).toBe("1:02:05");
    expect(clock(NaN)).toBe("0:00");
  });
});

describe("the video player", () => {
  it("shows its still and one big button with its length, and loads only the length until then", () => {
    const { video } = setup();
    expect(video).toHaveAttribute("poster", "/still.webp");
    expect(video).toHaveAttribute("preload", "metadata");
    expect(video).not.toHaveAttribute("controls"); // the site's own, below
    expect(screen.getByRole("button", { name: "Watch the demo 2:05" })).toBeInTheDocument();
    expect(screen.queryByRole("slider")).toBeNull();
  });

  it("starts loading the rest when a pointer comes over it, so a press plays at once", () => {
    const { video, box } = setup();
    fireEvent.pointerEnter(box);
    expect(video.preload).toBe("auto");
  });

  it("plays from the big button, then shows its bar", () => {
    setup();
    start();
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("button", { name: /Watch the demo/ })).toBeNull();
    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Seek" })).toHaveAttribute("aria-valuetext", "0:00 of 2:05");
    expect(screen.getByText("0:00 / 2:05")).toBeInTheDocument();
  });

  it("plays and pauses with its button, Space and K", () => {
    const { box } = setup();
    start();
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
    fireEvent.keyDown(box, { key: " " });
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(2);
    fireEvent.keyDown(box, { key: "K" });
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalledTimes(2);
  });

  it("leaves Space to a button that has the focus, so it isn't pressed twice", () => {
    setup();
    start();
    fireEvent.keyDown(screen.getByRole("button", { name: "Pause" }), { key: " " });
    expect(HTMLMediaElement.prototype.pause).not.toHaveBeenCalled();
  });

  it("moves 5 seconds with the arrows, anywhere with the seek bar, and never past either end", () => {
    const { video, box } = setup();
    start();
    video.currentTime = 10;
    fireEvent.keyDown(box, { key: "ArrowRight" });
    expect(video.currentTime).toBe(15);
    fireEvent.keyDown(box, { key: "ArrowLeft" });
    fireEvent.keyDown(box, { key: "ArrowLeft" });
    expect(video.currentTime).toBe(5);
    const seek = screen.getByRole("slider", { name: "Seek" });
    fireEvent.change(seek, { target: { value: "60" } });
    expect(video.currentTime).toBe(60);
    expect(seek).toHaveAttribute("aria-valuetext", "1:00 of 2:05");
    video.currentTime = 123;
    fireEvent.keyDown(box, { key: "ArrowRight" });
    expect(video.currentTime).toBe(125);
    video.currentTime = 2;
    fireEvent.keyDown(seek, { key: "ArrowDown" });
    expect(video.currentTime).toBe(0);
  });

  it("steps through the speeds, then back to the first", () => {
    const { video } = setup();
    start();
    for (const next of [...SPEEDS.slice(1), SPEEDS[0]]) {
      fireEvent.click(screen.getByRole("button", { name: /^Speed / }));
      expect(video.playbackRate).toBe(next);
      expect(screen.getByRole("button", { name: `Speed ${next}×` })).toHaveTextContent(`${next}×`);
    }
  });

  it("mutes and unmutes with its button and M", () => {
    const { video, box } = setup();
    start();
    fireEvent.click(screen.getByRole("button", { name: "Mute" }));
    expect(video.muted).toBe(true);
    fireEvent.keyDown(box, { key: "m" });
    expect(video.muted).toBe(false);
    expect(screen.getByRole("button", { name: "Mute" })).toBeInTheDocument();
  });

  it("plays one video at a time: the one started pauses the one before", () => {
    const first = setup();
    start();
    const paused = vi.fn();
    first.video.addEventListener("pause", paused);
    render(<VideoPlayer src={`${SRC}1`} poster="/other.webp" label="Todo demo: Demo" />);
    fireEvent.click(screen.getAllByRole("button", { name: /Watch the demo/ }).at(-1));
    expect(paused).toHaveBeenCalledTimes(1);
  });

  it("offers it again when it ends", () => {
    const { video } = setup();
    start();
    fireEvent.pause(video);
    fireEvent.ended(video);
    expect(screen.queryByRole("slider")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Watch again 2:05" }));
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("slider", { name: "Seek" })).toBeInTheDocument();
  });

  it("says so when the video can't play, with a link to open it on its own", () => {
    const { video } = setup();
    fireEvent.error(video);
    expect(screen.getByText("This video can't play here.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Open it in a new tab/ })).toHaveAttribute("href", SRC);
    expect(screen.queryByRole("button", { name: /Watch the demo/ })).toBeNull();
  });

  it("pauses when it leaves the window, as when another project's tab is picked", () => {
    let seen;
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(callback) {
          seen = callback;
        }
        observe() {}
        disconnect() {}
      }
    );
    setup();
    start();
    act(() => seen([{ isIntersecting: false }]));
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalledTimes(1);
  });
});
