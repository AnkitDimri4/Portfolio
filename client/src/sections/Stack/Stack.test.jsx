import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { page } from "../../lib/reload";
import Stack from "./Stack";

// A tab opened before a deploy: the grid's file, asked for by its old name, is gone (404)
vi.mock("./StackGrid", () => {
  throw new TypeError("Failed to fetch dynamically imported module: https://example.test/assets/StackGrid-old.js");
});

// jsdom reports an error React has caught as uncaught too, unless the page says it's handled
const handled = (event) => event.preventDefault();
beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", undefined); // no observer: near at once
  window.history.replaceState(null, "", "/");
  window.addEventListener("error", handled);
  vi.spyOn(console, "error").mockImplementation(() => {}); // React reports the error it caught
});
afterEach(() => {
  window.removeEventListener("error", handled);
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

test("a tab from before a deploy: the section says its grid didn't load, with a reload, and doesn't reload by itself", async () => {
  const reload = vi.spyOn(page, "reload").mockImplementation(() => {});
  render(<Stack />);
  expect(await screen.findByRole("alert")).toHaveTextContent("The stack didn't load. The connection may have dropped, or the site has changed since this page opened.");
  expect(screen.getByRole("heading", { name: "The stack I build with." })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
  expect(reload).not.toHaveBeenCalled();

  fireEvent.click(screen.getByRole("button", { name: "Load the page again" }));
  expect(reload).toHaveBeenCalledTimes(1);
  expect(window.location.hash).toBe("#stack");
});
