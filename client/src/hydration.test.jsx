// The production page is pre-rendered at build time and hydrated in the browser. If the first
// client render doesn't match the pre-rendered markup, React discards that markup and renders
// again from scratch — so render "on the server", then hydrate as a visitor whose browser
// differs from the build machine in every way the page cares about.
import { act, StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { afterEach, expect, test, vi } from "vitest";
import App from "./App";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// Rendering "on the server" inside jsdom still sees `window`, so useIsomorphicLayoutEffect picks
// useLayoutEffect and React warns about it. The real pre-render runs in Node, where it uses useEffect.
const JSDOM_SERVER_ARTIFACT = /useLayoutEffect does nothing on the server/;

const captureErrors = () => {
  const errors = [];
  const spy = vi.spyOn(console, "error").mockImplementation((...args) => {
    const message = args.join(" ");
    if (!JSDOM_SERVER_ARTIFACT.test(message)) errors.push(message);
  });
  return { errors, restore: () => spy.mockRestore() };
};

afterEach(() => {
  vi.useRealTimers();
  document.documentElement.removeAttribute("data-theme");
  document.body.innerHTML = "";
  localStorage.clear();
});

// React marks each <Suspense> boundary's part of the pre-rendered HTML with <!--$--> and <!--/$-->. The
// hero (and the nav) are outside any: React takes them over at once, as the page loads; the parts below
// the first screen are inside one, taken over after it in short slices, so no long task holds the page.
test("the hero is taken over at once, and every part below it later, in pieces", () => {
  const html = renderToString(app);
  const inBoundary = (at) => html.lastIndexOf("<!--$-->", at) > html.lastIndexOf("<!--/$-->", at);
  for (const part of ['id="home"', 'id="hero-name"', 'class="nav']) expect(inBoundary(html.indexOf(part)), part).toBe(false);
  for (const part of ['class="ribbons"', 'id="about"', 'id="work"', 'id="journey"', 'id="stack"', 'id="certificates"', 'id="contact"', 'class="footer"']) {
    expect(html.indexOf(part), part).toBeGreaterThan(0);
    expect(inBoundary(html.indexOf(part)), part).toBe(true);
  }
});

test("pre-rendered HTML contains the page content", () => {
  const html = renderToString(app);
  for (const text of ["Full-Stack Software", "RN-Wallet", "QuickCart", "Technical Mentor", "Kubernetes (K8s)", "MERN Stack Development", "Send message"]) {
    expect(html).toContain(text);
  }
});

test("hydrates without mismatches for a visitor with a saved light theme, reduced motion, a later date and the admin's sign-in", async () => {
  const { errors, restore } = captureErrors();
  const matchMedia = window.matchMedia;
  try {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-01-01T08:00:00Z"));
    const html = renderToString(app);
    expect(html).toContain('aria-label="Sign in"'); // the account icon, as the build can't know who'll visit

    vi.setSystemTime(new Date("2027-03-04T15:42:00Z"));
    document.documentElement.setAttribute("data-theme", "light"); // set by the inline script in index.html
    window.matchMedia = (query) => ({ matches: query.includes("reduce"), media: query, addEventListener() {}, removeEventListener() {} });
    localStorage.setItem("resume-builder:session", JSON.stringify({ token: "S".repeat(43), email: "me@example.com", admin: true, expiresAt: "2027-03-04T20:00:00.000Z" }));

    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.append(container);
    await act(async () => {
      hydrateRoot(container, app, { onRecoverableError: (error) => errors.push(`recoverable: ${error.message}`) });
    });

    expect(errors).toEqual([]);
    // After hydration the page reflects the visitor's browser, not the build machine.
    expect(container.querySelector(".theme-toggle")).toHaveAccessibleName("Switch to dark theme");
    expect(container.querySelector(".footer-bottom")).toHaveTextContent("© 2027");
    expect(container.querySelector(".code-body")).toHaveTextContent('name: "Ankit Dimri"'); // reduced motion: no typing
    expect(container.querySelector(".nav-account")).toHaveAccessibleName("Admin view");
    expect(container.querySelector(".nav-account")).toHaveAttribute("href", "/resume-builder/admin/");
  } finally {
    restore();
    window.matchMedia = matchMedia;
  }
});
