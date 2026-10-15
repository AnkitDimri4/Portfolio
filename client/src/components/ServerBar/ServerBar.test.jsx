import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sendJSON } from "../../lib/api";
import ServerBar, { clock } from "./ServerBar";

const reply = (body, status = 200) => ({ ok: status < 400, status, json: async () => body });
const unreachable = () => {
  throw new TypeError("Failed to fetch");
};

// How the API and its /health answer, per test.
let api, health, fetchMock;
const checks = () => fetchMock.mock.calls.filter(([url]) => url.endsWith("/health")).length;
const bar = () => screen.queryByRole("complementary", { name: "Server status" });
const later = (ms) => act(() => vi.advanceTimersByTimeAsync(ms));
const failingCall = async () => {
  await act(() => expect(sendJSON("/api/v1/portfolio/auth/options")).rejects.toThrow());
  await later(0);
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(Date.parse("2026-10-15T09:00:00Z"));
  api = () => reply({ success: true });
  health = () => reply({ status: "ok", uptime: 5 });
  fetchMock = vi.fn(async (url) => (url.endsWith("/health") ? health() : api()));
  globalThis.fetch = fetchMock;
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  globalThis.fetch = () => new Promise(() => {});
});

describe("the bar when the server can't be reached", () => {
  it("stays away while the API answers, its own errors included", async () => {
    render(<ServerBar place="builder" />);
    await sendJSON("/api/v1/portfolio/auth/options");
    api = () => reply({ success: false, message: "Too many requests." }, 429);
    await expect(sendJSON("/api/v1/portfolio/auth/link", { method: "POST", body: {} })).rejects.toThrow("Too many requests.");
    api = () => reply({ success: false, message: "Something went wrong on the server." }, 500);
    await expect(sendJSON("/api/v1/portfolio/me/resumes")).rejects.toThrow("Something went wrong on the server.");
    await later(0);
    expect(checks()).toBe(0);
    expect(bar()).toBeNull();
  });

  it("checks when a call gets no answer; while that fails too, it says what's paused, for how long, and when it tries again", async () => {
    render(<ServerBar place="builder" />);
    api = unreachable;
    health = unreachable;
    await failingCall();
    expect(checks()).toBe(1);
    expect(bar()).toHaveTextContent("Can't reach the server. Signing in, saving to your account and emailing your PDF are paused.");
    expect(bar()).toHaveTextContent("Down for 0:00");
    expect(bar()).toHaveTextContent("Trying again in 0:15");

    await later(10_000);
    expect(bar()).toHaveTextContent("Down for 0:10");
    expect(bar()).toHaveTextContent("Trying again in 0:05");
    await later(5_000);
    expect(checks()).toBe(2);
    expect(bar()).toHaveTextContent("Trying again in 0:30"); // a little less often each time
    await later(30_000);
    expect(checks()).toBe(3);
    expect(bar()).toHaveTextContent("Down for 0:45");
    expect(bar()).toHaveTextContent("Trying again in 1:00");
  });

  it("tries again when asked, and once the server answers, says it's back for a few seconds", async () => {
    render(<ServerBar place="scheduler" />);
    api = unreachable;
    health = unreachable;
    await failingCall();
    expect(bar()).toHaveTextContent("Can't reach the server. Booking a call is paused until it's back. You can still email me.");

    health = () => reply({ status: "ok", uptime: 1 });
    fireEvent.click(screen.getByRole("button", { name: /try now/i }));
    await later(0);
    expect(checks()).toBe(2);
    expect(bar()).toHaveTextContent("The server is back. If something didn't work, try it again.");
    await later(6_000);
    expect(bar()).toBeNull();
    await later(120_000);
    expect(checks()).toBe(2); // and stops checking
  });

  it("counts a gateway's error (Render's 503 page) and a call still waiting after a minute", async () => {
    const { unmount } = render(<ServerBar place="builder" />);
    health = unreachable;
    // Render's page while the server is down: HTML, not the API's JSON.
    api = () => ({ ok: false, status: 503, json: async () => JSON.parse("<html>Service Unavailable</html>") });
    await failingCall();
    expect(bar()).not.toBeNull();
    // It fails as no answer does (no status), so the pages say the server couldn't be reached.
    const gateway = await sendJSON("/api/v1/portfolio/me/resumes").catch((err) => err);
    expect(gateway).toBeInstanceOf(TypeError);
    expect(gateway.status).toBeUndefined();
    // The API's own 503 (say, a part that isn't set up) keeps its message.
    api = () => reply({ success: false, message: "Emailing isn't set up yet." }, 503);
    const own = await sendJSON("/api/v1/portfolio/resumes").catch((err) => err);
    expect([own.status, own.message]).toEqual([503, "Emailing isn't set up yet."]);
    unmount();

    render(<ServerBar place="builder" />);
    api = () => new Promise(() => {});
    sendJSON("/api/v1/portfolio/me/resumes");
    await later(59_000);
    expect(checks()).toBe(1); // only the first part's
    await later(1_000);
    expect(checks()).toBe(2);
    expect(bar()).toHaveTextContent("Can't reach the server.");
  });

  it("checks only while a bar is on the page, and then checks the trouble it missed", async () => {
    api = unreachable;
    health = unreachable;
    await expect(sendJSON("/api/v1/portfolio/auth/options")).rejects.toThrow();
    expect(checks()).toBe(0);
    render(<ServerBar place="builder" />);
    await later(0);
    expect(checks()).toBe(1);
    expect(bar()).toHaveTextContent("Can't reach the server.");
  });

  it("says when the browser itself is offline, and tries again once it's back online", async () => {
    const online = vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    render(<ServerBar place="builder" />);
    health = unreachable;
    await act(() => window.dispatchEvent(new Event("offline")));
    await later(0);
    expect(bar()).toHaveTextContent("You're offline. Signing in, saving to your account and emailing your PDF are paused.");

    online.mockReturnValue(true);
    health = () => reply({ status: "ok", uptime: 1 });
    await act(() => window.dispatchEvent(new Event("online")));
    await later(0);
    expect(bar()).toHaveTextContent("The server is back.");
  });

  it("shows times as minutes and seconds, and hours once it's that long", () => {
    expect(clock(0)).toBe("0:00");
    expect(clock(75_000)).toBe("1:15");
    expect(clock(3_723_000)).toBe("1:02:03");
    expect(clock(-5_000)).toBe("0:00");
  });
});
