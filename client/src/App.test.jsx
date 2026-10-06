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
