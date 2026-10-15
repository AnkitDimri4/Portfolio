import { useSyncExternalStore } from "react";

// The theme lives on <html data-theme>, set before first paint by the inline script in
// index.html. Reading it through useSyncExternalStore lets the pre-rendered markup
// (always "dark") hydrate cleanly and then update to the visitor's saved theme.
const listeners = new Set();

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getTheme = () => (document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark");
const getServerTheme = () => "dark";

const setTheme = (theme) => {
  document.documentElement.setAttribute("data-theme", theme);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#0a0a0c" : "#f3f0e8");
  try {
    localStorage.setItem("theme", theme);
  } catch {
    /* storage unavailable (private mode) — theme still works for this visit */
  }
  listeners.forEach((listener) => listener());
};

/** [theme, setTheme] — same shape as useState. */
export const useTheme = () => [useSyncExternalStore(subscribe, getTheme, getServerTheme), setTheme];
