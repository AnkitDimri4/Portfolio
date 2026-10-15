import { describe, expect, it } from "vitest";
import NOTICE from "../data/notice.json";
import { PLACES, noticeFor } from "./notice";

const at = (iso) => Date.parse(iso);
const notice = (patch) => ({ message: "Booking a call is paused for an update.", from: "", until: "", where: ["builder", "scheduler"], ...patch });

describe("the site's notice", () => {
  it("shows its message, trimmed, only where it's meant to", () => {
    expect(noticeFor("builder", { notice: notice({ message: "  Paused.  " }) })).toMatchObject({ message: "Paused." });
    expect(noticeFor("scheduler", { notice: notice({ where: ["builder"] }) })).toBeNull();
    expect(noticeFor("builder", { notice: notice({ message: " " }) })).toBeNull();
  });

  it("shows from its start until its end, and not at the end itself", () => {
    const timed = notice({ from: "2026-10-16T07:00:00Z", until: "2026-10-16T18:30:00Z" });
    expect(noticeFor("builder", { notice: timed, now: at("2026-10-16T06:59:59Z") })).toBeNull();
    expect(noticeFor("builder", { notice: timed, now: at("2026-10-16T07:00:00Z") })).not.toBeNull();
    expect(noticeFor("builder", { notice: timed, now: at("2026-10-16T18:29:59Z") })).not.toBeNull();
    expect(noticeFor("builder", { notice: timed, now: at("2026-10-16T18:30:00Z") })).toBeNull();
    expect(noticeFor("builder", { notice: notice({ until: "2026-10-16T18:30:00Z" }), now: at("2020-01-01T00:00:00Z") })).not.toBeNull();
  });

  it("is a notice as it's committed: these four keys, and places the site knows", () => {
    expect(Object.keys(NOTICE)).toEqual(["message", "from", "until", "where"]);
    expect(NOTICE.where.every((place) => place in PLACES)).toBe(true);
  });
});
