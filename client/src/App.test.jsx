import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import App from "./App";

test("renders the name as the page heading and every section", () => {
  render(<App />);
  // (jsdom has no layout, so assert on text rather than the computed accessible name)
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Ankit Dimri");
  for (const id of ["about", "work", "journey", "stack", "certificates", "contact"]) {
    expect(document.getElementById(id)).toBeInTheDocument();
  }
});

test("names every picture a screen reader meets: an icon in a named link is hidden from it", () => {
  render(<App />);
  const pictures = [...document.querySelectorAll('[role="img"]')];
  expect(pictures.length).toBeGreaterThan(0);
  for (const picture of pictures) {
    const named = picture.getAttribute("aria-label") || picture.getAttribute("aria-labelledby") || picture.querySelector("title");
    expect(named || picture.closest('[aria-hidden="true"]'), picture.parentElement.outerHTML.slice(0, 120)).toBeTruthy();
  }
});
