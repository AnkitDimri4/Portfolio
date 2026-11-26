import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PROJECTS } from "../../data/profile";
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
    expect(tabs.map((t) => t.querySelector(".ptab-name").textContent)).toEqual(["English Coach", "RN-Wallet", "Todo", "QuickCart"]);
    expect(tabs.map((t) => t.querySelector(".ptab-num").textContent)).toEqual(["03", "04", "05", "06"]);
    expect(screen.getByText("4 projects · pick one")).toBeInTheDocument();
  });

  it("opens the English coach's demo on Google Drive, as it can't play in the page", () => {
    render(<Work />);
    const panel = screen.getAllByRole("tabpanel", { hidden: true }).find((p) => p.id === "ppanel-english-coach");
    const demo = within(panel).getByRole("link", { name: /Watch the demo/ });
    expect(demo).toHaveAttribute("href", expect.stringMatching(/^https:\/\/drive\.google\.com\/file\/d\//));
    expect(demo).toHaveAttribute("target", "_blank");
    expect(demo).toHaveAttribute("rel", "noreferrer");
    expect(panel.querySelector("video")).toBeNull();
    // A still of the coach's page behind the play button: only a picture, as the link already says what it does
    const still = demo.querySelector("img");
    expect(still.getAttribute("src")).toMatch(/assets\/img\/projects\/english-coach\.webp/);
    expect(still).toHaveAttribute("alt", "");
    expect(demo).toHaveAccessibleName("Watch the demo 2 min · opens Google Drive");
  });

  describe("the demo videos", () => {
    const Observer = globalThis.IntersectionObserver;
    afterEach(() => {
      globalThis.IntersectionObserver = Observer;
      vi.resetModules();
    });

    it("each has a still of its own, shown until it plays (an iPhone draws nothing before that)", () => {
      const videos = PROJECTS.flatMap((p) => p.videos ?? []);
      expect(videos.length).toBeGreaterThan(0);
      for (const v of videos) expect(v.poster).toMatch(/assets\/img\/projects\/[a-z0-9-]+\.webp/);
      expect(new Set(videos.map((v) => v.poster)).size).toBe(videos.length);
    });

    it("puts the chosen demo's still on its video", async () => {
      // The video mounts once its card nears the window: an observer that says so at once, and a fresh
      // copy of the page so the one the other tests made (which never says) isn't reused
      globalThis.IntersectionObserver = class {
        constructor(callback) {
          this.callback = callback;
        }
        observe(target) {
          this.callback([{ isIntersecting: true, target }]);
        }
        unobserve() {}
        disconnect() {}
      };
      vi.resetModules();
      const { default: FreshWork } = await import("./Work");
      const { container } = render(<FreshWork />);
      const wallet = PROJECTS.find((p) => p.title === "RN-Wallet");
      const media = container.querySelector("video").closest(".project-media");
      expect(media.querySelector("video")).toHaveAttribute("poster", wallet.videos[0].poster);
      fireEvent.click(within(media).getByRole("tab", { name: /Transactions/ }));
      expect(media.querySelector("video")).toHaveAttribute("poster", wallet.videos[1].poster);
    });
  });
});
