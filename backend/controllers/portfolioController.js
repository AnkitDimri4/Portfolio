const sgMail = require("@sendgrid/mail");
const pool = require("../config/db");
const { escapeHtml, validateContact } = require("../lib/contact");

if (process.env.SENDGRID_API_KEY) sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const receivedAt = () =>
  new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }) + " IST";

const emailHtml = ({ name, email, msg }) => {
  const safe = { name: escapeHtml(name), email: escapeHtml(email), msg: escapeHtml(msg).replace(/\n/g, "<br>") };
  return `
        <div style="font-family: Arial, Helvetica, sans-serif; background-color: #f4f6f8; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">

            <!-- Header -->
            <div style="background: #0d6efd; color: #ffffff; padding: 16px 20px;">
              <h2 style="margin: 0; font-size: 20px;">New Mail</h2>
            </div>

            <!-- Body -->
            <div style="padding: 20px; color: #333333;">
              <p>You have received a new message from your portfolio contact form.</p>

              <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <tr>
                  <td style="padding: 8px; font-weight: bold; width: 120px;">Name:</td>
                  <td style="padding: 8px;">${safe.name}</td>
                </tr>
                <tr style="background: #f9f9f9;">
                  <td style="padding: 8px; font-weight: bold;">Email:</td>
                  <td style="padding: 8px;">
                    <a href="mailto:${safe.email}" style="color: #0d6efd; text-decoration: none;">
                      ${safe.email}
                    </a>
                  </td>
                </tr>
              </table>

              <div style="margin-top: 20px;">
                <p style="font-weight: bold; margin-bottom: 6px;">Message:</p>
                <div style="background: #f1f3f5; padding: 12px; border-radius: 4px; line-height: 1.6;">
                  ${safe.msg}
                </div>
              </div>

              <p style="font-size: 12px; color: #777; margin-top: 20px;">
                Received on ${receivedAt()}
              </p>
            </div>

            <!-- Footer -->
            <div style="background: #f1f3f5; padding: 12px 20px; text-align: center; font-size: 12px; color: #666;">
              Sent from your Portfolio Website
            </div>

          </div>
        </div>
      `;
};

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
    sgMail.send({
      to: process.env.SENDGRID_RECEIVER_EMAIL || process.env.SENDGRID_SENDER_EMAIL,
      from: process.env.SENDGRID_SENDER_EMAIL, // verified sender
      replyTo: email,
      subject: "📩 New Portfolio Contact",
      html: emailHtml({ name, email, msg }),
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
