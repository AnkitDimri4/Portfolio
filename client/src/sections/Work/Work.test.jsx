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

  it("plays the English coach's narrated demo in its card, from the site itself, over a still of its page", () => {
    const coach = PROJECTS.find((p) => p.repo === "english-coach");
    expect(coach.videos).toEqual([
      {
        src: expect.stringMatching(/assets\/video\/english-coach-demo\.mp4$/),
        label: "Demo",
        poster: expect.stringMatching(/assets\/img\/projects\/english-coach\.webp$/),
      },
    ]);
    expect(coach.links).toEqual([{ label: "Demo video", play: true }]);
    expect(JSON.stringify(coach)).not.toContain("drive.google.com"); // the site plays its own copy
  });

  it("shows how much work went into the English coach: its commits and pull requests, counted from git", () => {
    const { commits, pullRequests, updated } = PROJECTS.find((p) => p.repo === "english-coach").counts;
    expect(Number.isInteger(commits) && commits > 0).toBe(true);
    expect(Number.isInteger(pullRequests) && pullRequests > 0).toBe(true);
    expect(updated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    render(<Work />);
    const panel = screen.getAllByRole("tabpanel", { hidden: true }).find((p) => p.id === "ppanel-english-coach");
    const stats = panel.querySelector(".project-stats");
    expect(stats).toHaveTextContent(`${commits} commits`);
    expect(stats).toHaveTextContent(`${pullRequests} pull requests`);
    expect(stats).toHaveTextContent(/Updated [A-Z][a-z]{2} \d{4}/);
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
      render(<FreshWork />);
      const wallet = PROJECTS.find((p) => p.title === "RN-Wallet");
      const media = rowOf("RN-Wallet").querySelector(".project-media");
      expect(media.querySelector("video")).toHaveAttribute("poster", wallet.videos[0].poster);
      fireEvent.click(within(media).getByRole("tab", { name: /Transactions/ }));
      expect(media.querySelector("video")).toHaveAttribute("poster", wallet.videos[1].poster);
    });

    it("plays the English coach's demo from its Demo video button too", async () => {
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
      const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function play() {
        this.dispatchEvent(new Event("play"));
        return Promise.resolve();
      });
      const { default: FreshWork } = await import("./Work");
      const { container } = render(<FreshWork />);
      const panel = container.querySelector("#ppanel-english-coach");
      expect(panel.querySelector("video").getAttribute("src")).toMatch(/english-coach-demo\.mp4$/);
      fireEvent.click(within(panel).getByRole("button", { name: "Demo video" }));
      expect(play).toHaveBeenCalledTimes(1);
      expect(within(panel).getByRole("button", { name: "Pause" })).toBeInTheDocument();
      play.mockRestore();
    });
  });
});
