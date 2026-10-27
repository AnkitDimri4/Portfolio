const pool = require("../config/db");
const { validateContact } = require("../lib/contact");
const { notify } = require("../lib/mailer");
const { contactEmail } = require("../lib/emails");
const limits = require("../lib/limits");
const { clientKey } = require("../middleware/rateLimit");

// The emails the form sends me go through Resend, whose free plan sends 100 a day, shared with the
// booking and payment notices: the form keeps to a share of it, counted in the database (lib/limits.js,
// so Render's restarts don't forget): a day across everyone, a day from one visitor and a day from one
// inbox. Past any of them the message is still saved (Neon's `contacts`), and only its email waits:
// nothing is lost, and a script can't silence the day's notices (#190).
const DAILY_EMAILS = Number(process.env.CONTACT_DAILY_LIMIT) || 40;
const PER_VISITOR_DAILY = 10;
const PER_ADDRESS_DAILY = 3;
// What's saved is counted too, a day from one visitor and a day across everyone (the 27 October check):
// the shares above only hold back the email, so a script could otherwise save messages until Neon's
// 0.5 GB was full, and then every write on the site would fail. Past either, the message is refused.
const DAILY_SAVES = Number(process.env.CONTACT_SAVE_LIMIT) || 200;
const SAVES_PER_VISITOR = 20;
const TOO_MANY = "Too many messages today. Please try again tomorrow, or email me directly.";

const receivedAt = () =>
  new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }) + " IST";

/** The day's counts an email takes a place in, each with its limit: the visitor's, the inbox's and everyone's. */
const counts = (req, email) => [
  [limits.nameFor("contact-from", clientKey(req)), PER_VISITOR_DAILY],
  [limits.nameFor("contact-by", limits.emailKey(email)), PER_ADDRESS_DAILY],
  ["contacts", DAILY_EMAILS],
];
/** The day's counts a save takes a place in: the visitor's and everyone's. */
const saves = (req) => [
  [limits.nameFor("contact-saved-from", clientKey(req)), SAVES_PER_VISITOR],
  ["contacts-saved", DAILY_SAVES],
];
const giveBack = (names) =>
  Promise.all(names.map((name) => limits.giveBack(name, limits.DAY))).catch((err) => console.error("Contact count give-back failed:", err.message));

/** A place today in each of `places` ([name, limit]), or none: false when one is used up. */
const takeAll = async (places) => {
  const taken = [];
  try {
    for (const [name, max] of places) {
      if (!(await limits.take(name, max, limits.DAY))) {
        await giveBack(taken);
        return false;
      }
      taken.push(name);
    }
    return true;
  } catch (err) {
    await giveBack(taken); // a database that can't count: nothing stays taken
    throw err;
  }
};
/** A place for one more email today, in each of its counts: false when the day's share, the visitor's or the inbox's is used. */
const emailAllowed = (req, email) => takeAll(counts(req, email));

const sendEmailController = async (req, res) => {
  const result = validateContact(req.body);
  if (!result.ok) return res.status(400).json({ success: false, message: result.message });

  // Honeypot hit: pretend it worked so bots learn nothing, but store/send nothing.
  if (result.spam) return res.status(200).json({ success: true, message: "Message sent and saved successfully" });

  const { name, email, msg } = result.data;

  // Saved at most so many a day. A database that can't count can't save either: the email still goes.
  let saveCounted = true;
  const saveable = await takeAll(saves(req)).catch((err) => {
    console.error("Contact save count failed:", err.message);
    saveCounted = false;
    return true;
  });
  if (!saveable) return res.status(429).json({ success: false, message: TOO_MANY });

  // Counted first. A database that can't count is down: the save fails then too, so the email goes.
  let counted = true;
  const allowed = await emailAllowed(req, email).catch((err) => {
    console.error("Contact count failed:", err.message);
    counted = false;
    return true;
  });
  if (!allowed) console.warn("Contact email skipped: the day's share is used; the message is saved");

  // Save and notify independently: if one channel fails, the message is still delivered
  // through the other, and the visitor isn't told to resend (which created duplicates).
  const [saved, emailed] = await Promise.allSettled([
    pool.query("INSERT INTO contacts (name, email, message) VALUES ($1, $2, $3)", [name, email, msg]),
    allowed
      ? notify({
          subject: `📩 New Portfolio Contact: ${name}`,
          html: contactEmail({ name, email, msg, receivedAt: receivedAt() }),
          replyTo: email,
        })
      : Promise.resolve(null),
  ]);

  if (saved.status === "rejected") {
    console.error("Contact save failed:", saved.reason?.message || saved.reason);
    if (saveCounted) await giveBack(saves(req).map(([name]) => name)); // it wasn't saved: its places are free again
  }
  if (emailed.status === "rejected") {
    console.error("Contact email failed:", emailed.reason?.message || emailed.reason);
    if (allowed && counted) await giveBack(counts(req, email).map(([name]) => name)); // it didn't go: its places are free again
  }

  if (saved.status === "rejected" && (emailed.status === "rejected" || !allowed)) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while sending your message. Please try again or email me directly.",
    });
  }

  return res.status(200).json({ success: true, message: "Message sent and saved successfully" });
};

module.exports = { sendEmailController, DAILY_EMAILS };
