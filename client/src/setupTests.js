// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom/vitest";

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
// Requests never settle, so no state updates land after a test has finished.
globalThis.fetch = () => new Promise(() => {});
