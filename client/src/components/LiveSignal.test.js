import { afterEach, describe, expect, it, vi } from "vitest";
import { timeAgo } from "./LiveSignal";

describe("timeAgo", () => {
  afterEach(() => vi.useRealTimers());

  it("says minutes, then hours, then days", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-19T12:00:00Z"));
    expect(timeAgo("2026-10-19T11:59:50Z")).toBe("just now");
    expect(timeAgo("2026-10-19T11:48:00Z")).toBe("12 min ago");
    expect(timeAgo("2026-10-19T09:00:00Z")).toBe("3 h ago");
    expect(timeAgo("2026-10-18T02:00:00Z")).toBe("34 h ago");
    expect(timeAgo("2026-10-18T00:00:00Z")).toBe("2 days ago"); // 36 hours: from there on, days
    expect(timeAgo("2026-10-12T12:00:00Z")).toBe("7 days ago");
    expect(timeAgo("not a date")).toBe("just now");
  });
});
