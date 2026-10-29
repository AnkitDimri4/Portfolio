import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import LocalTime from "./LocalTime";

describe("LocalTime", () => {
  afterEach(() => vi.useRealTimers());

  it("shows the time in India with AM and PM in capitals, as the hero and Schedule a call do", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-29T11:42:00Z")); // 5:12 in the evening in India
    const { unmount } = render(<LocalTime />);
    // Between the time and PM: a space the line can't break at (\s matches it)
    expect(screen.getByText(/IST$/).textContent).toMatch(/^05:12\sPM IST$/);
    unmount();

    vi.setSystemTime(new Date("2026-10-29T03:35:00Z")); // 9:05 in the morning
    render(<LocalTime />);
    expect(screen.getByText(/IST$/).textContent).toMatch(/^09:05\sAM IST$/);
  });
});
