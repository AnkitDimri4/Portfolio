// Emails to me: contact-form messages and call bookings, through Resend when RESEND_API_KEY and
// NOTIFY_EMAIL are set (its free plan sends to my own address from onboarding@resend.dev, no domain
// of my own needed), and nothing otherwise. Contact messages are saved in the database too.

const RESEND_URL = "https://api.resend.com/emails";
const RESEND_FROM = "Ankit's portfolio <onboarding@resend.dev>";

const settings = () => ({
  resendKey: process.env.RESEND_API_KEY,
  // Where my notifications go. With Resend's onboarding address, it must be the Resend account's email.
  to: process.env.NOTIFY_EMAIL,
  from: process.env.MAIL_FROM,
});

/** The service that will send: "resend", or null when it isn't set up. */
const provider = () => {
  const s = settings();
  return s.resendKey && s.to ? "resend" : null;
};

/**
 * Emails me. Resolves with the service that sent it, rejects with why it couldn't, and throws
 * "no email service" when it isn't set up (so callers can log it like any other failure).
 */
const notify = async ({ subject, html, replyTo }) => {
  const s = settings();
  const via = provider();
  if (!via) throw new Error("no email service: set RESEND_API_KEY and NOTIFY_EMAIL (docs/runbooks/messages.md)");
  const res = await fetch(RESEND_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${s.resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: s.from || RESEND_FROM, to: [s.to], subject, html, ...(replyTo && { reply_to: replyTo }) }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`Resend: HTTP ${res.status} ${body.message || body.name || ""}`.trim());
  }
  return via;
};

module.exports = { notify, provider };
