// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom/vitest";
import { beforeEach } from "vitest";

// The browser tests (jsdom). Files that say `@vitest-environment node`, like the PDF function's, skip this.
if (typeof window !== "undefined") {
  // jsdom lacks these browser APIs
  globalThis.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  globalThis.ResizeObserver = class {
    observe() {}
    disconnect() {}
  };
  window.matchMedia = (query) => ({ matches: false, media: query, addEventListener() {}, removeEventListener() {} });
  HTMLCanvasElement.prototype.getContext = () => null;
  // jsdom has <dialog> but not its modal methods
  HTMLDialogElement.prototype.showModal ??= function () {
    this.open = true;
  };
  HTMLDialogElement.prototype.close ??= function () {
    if (!this.open) return;
    this.open = false;
    this.dispatchEvent(new Event("close"));
  };
  // Requests never settle, so no state updates land after a test has finished.
  globalThis.fetch = () => new Promise(() => {});
  // Each test opens its page at a bare address, as a browser opens a new tab: the admin view writes
  // its part and filters after # (admin/adminLink.js), and one test's would open the next on it.
  beforeEach(() => {
    if (window.location.hash) window.history.replaceState(null, "", window.location.pathname + window.location.search);
  });
}
