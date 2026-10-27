import { StrictMode } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PROFILE } from "../../data/profile";
import Hero from "../../sections/Hero/Hero";
import HireMe, { FORM_ID } from "./HireMe";

const card = () => screen.queryByRole("dialog", { name: "Let's talk" });
const hireMe = () => screen.getByRole("link", { name: /hire me/i });

afterEach(() => vi.restoreAllMocks());

describe("Hire me", () => {
  it("is a link to the contact form, and a click opens the card of ways to reach me instead", () => {
    render(<Hero />);
    expect(hireMe()).toHaveAttribute("href", `#${FORM_ID}`); // before React runs, or without it
    expect(hireMe()).not.toHaveAttribute("target");
    expect(card()).toBeNull();
    fireEvent.click(hireMe());
    expect(card()).toHaveAttribute("open");
    expect(card().querySelector(".hire-inner")).toHaveFocus(); // so a screen reader starts at its title
  });

  it("leaves a click for a new tab or window to the browser", () => {
    render(<Hero />);
    for (const key of ["ctrlKey", "metaKey", "shiftKey"]) fireEvent.click(hireMe(), { [key]: true });
    expect(card()).toBeNull();
  });

  it("offers a call, the form, WhatsApp, and email in the email app, in Gmail or copied", () => {
    render(<HireMe onClose={vi.fn()} />);
    const ways = within(card());
    expect(ways.getByRole("button", { name: /schedule a call/i })).toBeInTheDocument();
    expect(ways.getByRole("link", { name: /send a message/i })).toHaveAttribute("href", `#${FORM_ID}`);
    expect(ways.getByRole("link", { name: /whatsapp/i })).toHaveAttribute("href", PROFILE.whatsapp);
    expect(ways.getByRole("link", { name: PROFILE.email })).toHaveAttribute("href", `mailto:${PROFILE.email}`);
    const gmail = ways.getByRole("link", { name: "Gmail" });
    expect(gmail).toHaveAttribute("target", "_blank");
    expect(new URL(gmail.href).searchParams.get("to")).toBe(PROFILE.email); // Gmail's compose window, to me
    expect(ways.getByRole("button", { name: "Copy email address" })).toBeInTheDocument();
  });

  it("takes “Send a message” to the form, with the focus on it, the card closed", () => {
    const scrolled = vi.fn();
    Element.prototype.scrollIntoView = scrolled;
    const onClose = vi.fn();
    render(
      <>
        <HireMe onClose={onClose} />
        <form id={FORM_ID} tabIndex={-1} />
      </>
    );
    fireEvent.click(within(card()).getByRole("link", { name: /send a message/i }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(document.getElementById(FORM_ID)).toHaveFocus();
    expect(scrolled).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
  });

  it("closes for “Schedule a call” and opens the scheduler", () => {
    const opened = vi.fn();
    window.addEventListener("schedule:open", opened);
    const onClose = vi.fn();
    render(<HireMe onClose={onClose} />);
    fireEvent.click(within(card()).getByRole("button", { name: /schedule a call/i }));
    window.removeEventListener("schedule:open", opened);
    expect([onClose.mock.calls.length, opened.mock.calls.length]).toEqual([1, 1]);
  });

  it("closes with its button and on a click outside it, and stays open in StrictMode", () => {
    const onClose = vi.fn();
    const { unmount } = render(
      <StrictMode>
        <HireMe onClose={onClose} />
      </StrictMode>
    );
    expect(card()).toHaveAttribute("open"); // StrictMode's second run of the effect doesn't shut it
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.pointerDown(card());
    fireEvent.click(card()); // the backdrop: a click on the dialog itself, outside its panel
    expect(onClose).toHaveBeenCalledOnce();
    unmount();
    render(<HireMe onClose={onClose} />);
    fireEvent.click(within(card()).getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
