import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JOURNEY } from "../../data/profile";
import Journey from "./Journey";

// Every role that has parts: [the role, its parts' headings]
const roles = JOURNEY.flatMap((item) => item.roles ?? []).filter((r) => r.highlights?.length);

describe("the Journey section", () => {
  it("shows each role's first part and folds the rest under a line that names them", () => {
    const { container } = render(<Journey />);
    expect(roles.length).toBeGreaterThan(0);
    for (const role of roles) {
      const [first, ...rest] = role.highlights.map(([area]) => area);
      expect(screen.getByText(first)).toBeVisible();
      if (!rest.length) continue;
      const fold = screen.getByText(`Show ${rest.length} more`).closest("details");
      expect(fold).not.toHaveAttribute("open");
      expect(fold.querySelector("summary")).toHaveTextContent(rest.length > 1 ? `${rest.slice(0, -1).join(", ")} and ${rest.at(-1)}` : rest[0]);
      // Folded, but still in the page: every line is kept
      for (const area of rest) expect(screen.getByText(area, { selector: "strong" })).not.toBeVisible();
    }
    expect(container.querySelectorAll("details.jitem-more")).toHaveLength(roles.filter((r) => r.highlights.length > 1).length);
  });

  it("keeps every point of every role in the page", () => {
    render(<Journey />);
    for (const role of roles) for (const [, points] of role.highlights) for (const p of points) expect(screen.getByText(p)).toBeInTheDocument();
  });

  it("opens the rest when the line is clicked, and says Show less", () => {
    render(<Journey />);
    const role = roles.find((r) => r.highlights.length > 1);
    const [, second] = role.highlights[1];
    const summary = screen.getByText(`Show ${role.highlights.length - 1} more`).closest("summary");
    fireEvent.click(summary);
    expect(summary.closest("details")).toHaveAttribute("open");
    expect(screen.getByText(second[0])).toBeVisible();
  });
});
