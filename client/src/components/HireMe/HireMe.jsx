// "Hire me", from the hero: a card over the page with every way to reach me, to pick from: a call (the
// scheduler), a message through the form further down, WhatsApp, and email (in the email app, in
// Gmail, or copied). The hero's button is a link to the form (#contact-form), so before React runs,
// or without it, a click still lands there; once it runs, the click opens this card instead.
import { useEffect, useRef, useState } from "react";
import { FiArrowUpRight, FiCalendar, FiCheck, FiCopy, FiEdit3, FiMail, FiX } from "react-icons/fi";
import { BOOKING, PROFILE } from "../../data/profile";
import { bookingEnabled, openBooking, prefetchBooking } from "../../lib/booking";
import { SiGmail, SiWhatsapp } from "../brandIcons";
import "./HireMe.css";

/** The contact form's card (Contact.jsx), where "Send a message" and the button before React runs take you. */
export const FORM_ID = "contact-form";

/** A click that would follow a link in this tab: not one for a new tab or window. */
export const plainClick = (e) => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

export default function HireMe({ onClose }) {
  const dialog = useRef(null);
  const pressedBackdrop = useRef(false);
  const [copied, setCopied] = useState(false);

  // Opened as it mounts. Never closed on unmount: StrictMode runs this twice in development, and a close
  // queued by a cleanup would shut the card right after it opened (taking it off the page is enough).
  useEffect(() => {
    if (!dialog.current.open) dialog.current.showModal();
    dialog.current.querySelector(".hire-inner").focus({ preventScroll: true });
  }, []);

  const close = () => dialog.current?.close(); // the dialog's close event then calls onClose

  const toCall = () => {
    close();
    openBooking();
  };
  // To the form's card, with the focus in it, so the keyboard carries on from there
  const toForm = (e) => {
    if (!plainClick(e)) return;
    e.preventDefault();
    close();
    const form = document.getElementById(FORM_ID);
    if (!form) return;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    form.scrollIntoView({ behavior, block: "start" });
    form.focus({ preventScroll: true });
    // A section on the way can grow as it comes into view (Stack fills in its logos), which leaves a long
    // scroll short of the form: once the scroll stops, it goes the rest of the way (within a few seconds,
    // so a visitor who has scrolled off since isn't pulled back).
    const started = Date.now();
    const settle = () => {
      if (Date.now() - started > 4000) return;
      const offset = (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0) + (parseFloat(getComputedStyle(form).scrollMarginTop) || 0);
      // 40 px: more than the form's own rise-in as it's revealed (32 px) can account for
      if (Math.abs(form.getBoundingClientRect().top - offset) > 40) form.scrollIntoView({ behavior, block: "start" });
    };
    if ("onscrollend" in window) window.addEventListener("scrollend", settle, { once: true });
    else setTimeout(settle, 1600);
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${PROFILE.email}`;
    }
  };

  return (
    <dialog
      ref={dialog}
      className="hire"
      aria-labelledby="hire-title"
      onClose={onClose}
      // Close on a click outside the card, but not when a drag (say, selecting text) ends there.
      onPointerDown={(e) => (pressedBackdrop.current = e.target === dialog.current)}
      onClick={(e) => pressedBackdrop.current && e.target === dialog.current && close()}
    >
      <div className="hire-inner" tabIndex={-1}>
        <p className="label">Hire me</p>
        <h2 id="hire-title">Let's talk</h2>
        <p className="hire-lede">Pick whatever suits you.</p>
        <ul className="hire-ways">
          {bookingEnabled && (
            <li>
              <button className="hire-way" type="button" onClick={toCall} onPointerEnter={prefetchBooking} onFocus={prefetchBooking}>
                <FiCalendar aria-hidden="true" />
                <span className="hire-way-text">
                  <strong>Schedule a call</strong>
                  <span className="label">{BOOKING.minutes} min · Google Meet · pick a time</span>
                </span>
                <FiArrowUpRight className="hire-arrow" aria-hidden="true" />
              </button>
            </li>
          )}
          <li>
            <a className="hire-way" href={`#${FORM_ID}`} onClick={toForm}>
              <FiEdit3 aria-hidden="true" />
              <span className="hire-way-text">
                <strong>Send a message</strong>
                <span className="label">The form on this page</span>
              </span>
              <FiArrowUpRight className="hire-arrow" aria-hidden="true" />
            </a>
          </li>
          <li>
            <a className="hire-way" href={PROFILE.whatsapp} target="_blank" rel="noreferrer" onClick={close}>
              <SiWhatsapp aria-hidden="true" />
              <span className="hire-way-text">
                <strong>WhatsApp</strong>
                <span className="label">Chat with me there</span>
              </span>
              <FiArrowUpRight className="hire-arrow" aria-hidden="true" />
            </a>
          </li>
          <li className="hire-email">
            <FiMail aria-hidden="true" />
            <span className="hire-way-text">
              <strong>Email</strong>
              <a href={`mailto:${PROFILE.email}`} onClick={close}>
                {PROFILE.email}
              </a>
            </span>
            <span className="hire-email-actions">
              <a className="btn btn-sm" href={PROFILE.gmail} target="_blank" rel="noreferrer" onClick={close}>
                <SiGmail aria-hidden="true" /> Gmail
              </a>
              <button className="icon-btn" type="button" onClick={copy} aria-label={copied ? "Email copied" : "Copy email address"}>
                {copied ? <FiCheck /> : <FiCopy />}
              </button>
              <span className="sr-only" aria-live="polite">
                {copied ? "Email address copied to clipboard" : ""}
              </span>
            </span>
          </li>
        </ul>
        <button className="icon-btn hire-close" type="button" onClick={close} aria-label="Close">
          <FiX />
        </button>
      </div>
    </dialog>
  );
}
