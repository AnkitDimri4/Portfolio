import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { orReload, page } from "./reload";

// A tab opened before a deploy asks for a part's file by its old name: gone (404)
const gone = () => Promise.reject(new TypeError("Failed to fetch dynamically imported module: https://example.test/assets/Scheduler-old.js"));
const turn = () => new Promise((done) => setTimeout(done, 0));

let reload;
beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(Date.parse("2026-10-23T12:00:00Z"));
  reload = vi.spyOn(page, "reload").mockImplementation(() => {});
  sessionStorage.clear();
  window.history.replaceState(null, "", "/");
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

test("a part that arrives is drawn as it is", async () => {
  const part = { default: () => null };
  await expect(orReload(() => Promise.resolve(part), "#schedule")()).resolves.toBe(part);
  expect(reload).not.toHaveBeenCalled();
});

test("a part whose file is gone loads the page again at its place, and waits for that", async () => {
  let settled = false;
  orReload(gone, "#schedule")().finally(() => (settled = true));
  await turn();
  expect(reload).toHaveBeenCalledTimes(1);
  expect(window.location.pathname + window.location.hash).toBe("/#schedule");
  expect(settled).toBe(false);
});

test("once a minute at most: a reload that didn't bring the file isn't tried again, so no loop", async () => {
  orReload(gone, "#schedule")();
  await turn();
  await expect(orReload(gone, "#schedule")()).rejects.toThrow("Failed to fetch dynamically imported module");
  vi.setSystemTime(Date.now() + 59_000);
  await expect(orReload(gone)()).rejects.toThrow(TypeError);
  expect(reload).toHaveBeenCalledTimes(1);

  // A later deploy, in the same tab
  vi.setSystemTime(Date.now() + 2_000);
  orReload(gone)();
  await turn();
  expect(reload).toHaveBeenCalledTimes(2);
});

test("offline, it fails rather than reload: the browser would show its own error page", async () => {
  vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
  await expect(orReload(gone, "#schedule")()).rejects.toThrow(TypeError);
  expect(reload).not.toHaveBeenCalled();
  expect(window.location.hash).toBe("");
});

test("where the browser keeps no session storage, it fails rather than reload: a loop couldn't be told", async () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new DOMException("The operation is insecure.", "SecurityError");
  });
  await expect(orReload(gone, "#schedule")()).rejects.toThrow(TypeError);
  expect(reload).not.toHaveBeenCalled();
  expect(window.location.hash).toBe("");
});
