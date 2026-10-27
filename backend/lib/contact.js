// Pure helpers for the contact form (kept free of I/O so they are easy to test).

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Limits match the `contacts` table: name VARCHAR(100), email VARCHAR(150), message TEXT.
const LIMITS = { name: 100, email: 150, msg: 5000 };

// Visitor input is interpolated into the notification email's HTML, so it must be escaped.
const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/**
 * Validates a contact request body.
 * Returns { ok: true, data } with trimmed fields, { ok: true, spam: true } when the
 * hidden honeypot field was filled in (bots), or { ok: false, message }.
 */
const validateContact = (body = {}) => {
  // Honeypot: the "company" field is visually hidden; people never fill it in.
  if (String(body.company ?? "").trim()) return { ok: true, spam: true };

  // The name goes into my email's subject: one line, without control characters (as the booking's, lib/schedule.js)
  const name = String(body.name ?? "")
    .replace(/\p{Cc}+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  const email = String(body.email ?? "").trim();
  const msg = String(body.msg ?? "").trim();

  if (!name || !email || !msg) return { ok: false, message: "Name, email, and message are required" };
  // The length first: on a long made-up address, the pattern takes time that grows with its square
  if (email.length > LIMITS.email || !EMAIL_RE.test(email)) return { ok: false, message: "Please enter a valid email address" };
  if (name.length > LIMITS.name || msg.length > LIMITS.msg) return { ok: false, message: "Name or message is too long" };

  return { ok: true, data: { name, email, msg } };
};

module.exports = { EMAIL_RE, escapeHtml, validateContact, LIMITS };
