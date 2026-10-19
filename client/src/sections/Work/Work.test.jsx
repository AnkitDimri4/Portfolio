import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Work from "./Work";

const rowOf = (title) => screen.getAllByRole("heading", { level: 3, name: title })[0].closest("article");

describe("the Work section", () => {
  it("shows my work at FileSure, then this site with its activity, as the first two rows", () => {
    render(<Work />);
    const titles = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(titles.slice(0, 2)).toEqual(["FileSure", "This Portfolio"]);

    const site = rowOf("This Portfolio");
    expect(within(site).getByText("02")).toBeInTheDocument();
    expect(within(site).getByText("GitHub activity on this site")).toBeInTheDocument();
    expect(within(site).getByText("Lighthouse, mobile · desktop")).toBeInTheDocument();
    expect(within(site).queryByRole("tablist")).not.toBeInTheDocument(); // the activity card, not a demo
    expect(within(site).getByRole("link", { name: /source/i })).toHaveAttribute("href", "https://github.com/AnkitDimri4/Portfolio");
    expect(rowOf("FileSure")).toHaveTextContent("GitHub activity at FileSure");
  });

  it("keeps this site out of my own projects, which are numbered after it", () => {
    render(<Work />);
    const tabs = within(screen.getByRole("tablist", { name: "My own projects" })).getAllByRole("tab");
    expect(tabs.map((t) => t.querySelector(".ptab-name").textContent)).toEqual(["RN-Wallet", "Todo", "QuickCart"]);
    expect(tabs.map((t) => t.querySelector(".ptab-num").textContent)).toEqual(["03", "04", "05"]);
    expect(screen.getByText("3 projects · pick one")).toBeInTheDocument();
  });
});
