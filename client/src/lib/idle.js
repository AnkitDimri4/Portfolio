/**
 * Runs `callback` once the page has loaded, shown its first frame and the browser has a quiet moment
 * (within `timeout` ms of asking): for work the first screen doesn't need, so it never competes with
 * the first paint. Returns a function that cancels it.
 */
export const afterLoad = (callback, { timeout = 2000 } = {}) => {
  const idle = window.requestIdleCallback ? (cb) => window.requestIdleCallback(cb, { timeout }) : (cb) => setTimeout(cb, 300);
  const cancelIdle = window.requestIdleCallback ? (id) => window.cancelIdleCallback(id) : (id) => clearTimeout(id);
  let frame = 0;
  let timer = 0;
  let waiting = 0;
  // A frame callback runs only once the browser draws, so this waits for the first frame to be shown
  const start = () => {
    frame = requestAnimationFrame(() => {
      timer = setTimeout(() => {
        waiting = idle(callback);
      });
    });
  };
  if (document.readyState === "complete") start();
  else window.addEventListener("load", start, { once: true });
  return () => {
    window.removeEventListener("load", start);
    cancelAnimationFrame(frame);
    clearTimeout(timer);
    cancelIdle(waiting);
  };
};
