const pool = require("../config/db");
const { validateContact } = require("../lib/contact");
const { notify } = require("../lib/mailer");
const { contactEmail } = require("../lib/emails");

const receivedAt = () =>
  new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }) + " IST";

const sendEmailController = async (req, res) => {
  const result = validateContact(req.body);
  if (!result.ok) return res.status(400).json({ success: false, message: result.message });

  // Honeypot hit: pretend it worked so bots learn nothing, but store/send nothing.
  if (result.spam) return res.status(200).json({ success: true, message: "Message sent and saved successfully" });

  const { name, email, msg } = result.data;

  // Save and notify independently: if one channel fails, the message is still delivered
  // through the other, and the visitor isn't told to resend (which created duplicates).
  const [saved, emailed] = await Promise.allSettled([
    pool.query("INSERT INTO contacts (name, email, message) VALUES ($1, $2, $3)", [name, email, msg]),
    notify({
      subject: `📩 New Portfolio Contact: ${name}`,
      html: contactEmail({ name, email, msg, receivedAt: receivedAt() }),
      replyTo: email,
    }),
  ]);

  if (saved.status === "rejected") console.error("Contact save failed:", saved.reason?.message || saved.reason);
  if (emailed.status === "rejected") console.error("Contact email failed:", emailed.reason?.message || emailed.reason);

  if (saved.status === "rejected" && emailed.status === "rejected") {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while sending your message. Please try again or email me directly.",
    });
  }

  return res.status(200).json({ success: true, message: "Message sent and saved successfully" });
};

module.exports = { sendEmailController };
