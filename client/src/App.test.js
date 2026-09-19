import { render, screen } from "@testing-library/react";
import App from "./App";
import { ThemeProvider } from "./context/ThemeContext";

beforeAll(() => {
  // jsdom lacks these browser APIs
  global.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  global.ResizeObserver = class {
    observe() {}
    disconnect() {}
  };
  window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  HTMLCanvasElement.prototype.getContext = () => null;
  global.fetch = () => Promise.reject(new Error("offline"));
});

test("renders the name as the page heading and every section", () => {
  render(
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
  // (jsdom has no layout, so assert on text rather than the computed accessible name)
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Ankit Dimri");
  for (const id of ["about", "work", "journey", "stack", "certificates", "contact"]) {
    expect(document.getElementById(id)).toBeInTheDocument();
  }
});
