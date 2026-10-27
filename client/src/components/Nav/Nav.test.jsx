// The nav's account icon, left of the brain map's: where this browser's sign-in takes you. The session is
// written here as the resume builder keeps it; accountIcon.test.jsx (not in the public copy, which has no
// builder) checks it against the builder's own code.
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import Nav from "./Nav";

const inHours = (hours) => new Date(Date.now() + hours * 3_600_000).toISOString();
const signIn = ({ admin = false, expiresAt = inHours(12) } = {}) =>
  localStorage.setItem("resume-builder:session", JSON.stringify({ token: "S".repeat(43), email: admin ? "me@example.com" : "jane@example.com", admin, expiresAt }));
/** The icon in the bar, and the same place in the phone menu (opened). */
const account = () => document.querySelector(".nav-actions").querySelector("a");
const inMenu = (name) => {
  if (screen.queryByRole("button", { name: "Open menu" })) fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
  return within(screen.getByRole("navigation", { name: "Mobile" })).getByRole("link", { name });
};

afterEach(() => localStorage.clear());

describe("the nav's account icon", () => {
  it("says Sign in, left of the brain map's icon, and opens the sign-in page; in the phone menu too, after the brain map", () => {
    render(<Nav />);
    const [first, second] = within(document.querySelector(".nav-actions")).getAllByRole("link");
    expect(first).toHaveAccessibleName("Sign in");
    expect(first).toHaveAttribute("href", "/resume-builder/account/");
    expect(first).toHaveAttribute("title", "Sign in");
    expect(second).toHaveAccessibleName("Brain map: my work, mapped");
    const entry = inMenu("Sign in");
    expect(entry).toHaveAttribute("href", "/resume-builder/account/");
    expect(entry.previousElementSibling).toHaveTextContent("Brain map");
  });

  it("goes to My resumes once someone's signed in, and to the admin view for the site's owner", () => {
    signIn();
    const { unmount } = render(<Nav />);
    expect(account()).toHaveAccessibleName("My resumes");
    expect(account()).toHaveAttribute("href", "/resume-builder/account/");
    expect(inMenu("My resumes")).toHaveAttribute("href", "/resume-builder/account/");
    unmount();

    signIn({ admin: true });
    render(<Nav />);
    expect(account()).toHaveAccessibleName("Admin view");
    expect(account()).toHaveAttribute("href", "/resume-builder/admin/");
    expect(inMenu("Admin view")).toHaveAttribute("href", "/resume-builder/admin/");
  });

  it("says Sign in for a session that's over, and for one it can't read", () => {
    signIn({ admin: true, expiresAt: inHours(-1) });
    const { unmount } = render(<Nav />);
    expect(account()).toHaveAccessibleName("Sign in");
    unmount();

    localStorage.setItem("resume-builder:session", "{not json");
    render(<Nav />);
    expect(account()).toHaveAccessibleName("Sign in");
  });

  it("follows a sign-in or a sign-out in another tab, without a reload", () => {
    render(<Nav />);
    expect(account()).toHaveAccessibleName("Sign in");
    act(() => {
      signIn({ admin: true });
      window.dispatchEvent(new StorageEvent("storage", { key: "resume-builder:session" }));
    });
    expect(account()).toHaveAccessibleName("Admin view");
    act(() => {
      localStorage.removeItem("resume-builder:session");
      window.dispatchEvent(new StorageEvent("storage", { key: "resume-builder:session" }));
    });
    expect(account()).toHaveAccessibleName("Sign in");
  });
});
