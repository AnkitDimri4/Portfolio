require("dotenv").config();
const nodemailer = require("nodemailer");
const pool = require("../config/db");

// Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Optional: verify SMTP connection
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Error:", error);
  } else {
    console.log("Gmail SMTP ready");
  }
});

const sendEmailController = async (req, res) => {
  try {
    const { name, email, msg } = req.body;

    // Validation
    if (!name || !email || !msg) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required",
      });
    }

    // Save contact to Neon/Postgres
    await pool.query(
      "INSERT INTO contacts (name, email, message) VALUES ($1, $2, $3)",
      [name, email, msg]
    );

    // Send styled email
    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      replyTo: email,
      subject: "📩 New Portfolio Contact",
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; background-color: #f4f6f8; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: #0d6efd; color: #ffffff; padding: 16px 20px;">
              <h2 style="margin: 0; font-size: 20px;">New Mail</h2>
            </div>

            <!-- Body -->
            <div style="padding: 20px; color: #333333;">
              <p style="margin: 0 0 12px;">
                You have received a new message from your portfolio contact form.
              </p>

              <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <tr>
                  <td style="padding: 8px; font-weight: bold; width: 120px;">Name:</td>
                  <td style="padding: 8px;">${name}</td>
                </tr>
                <tr style="background: #f9f9f9;">
                  <td style="padding: 8px; font-weight: bold;">Email:</td>
                  <td style="padding: 8px;">
                    <a href="mailto:${email}" style="color: #0d6efd; text-decoration: none;">
                      ${email}
                    </a>
                  </td>
                </tr>
              </table>

              <div style="margin-top: 20px;">
                <p style="font-weight: bold; margin-bottom: 6px;">Message:</p>
                <div style="background: #f1f3f5; padding: 12px; border-radius: 4px; line-height: 1.6;">
                  ${msg}
                </div>
              </div>

              <p style="font-size: 12px; color: #777; margin-top: 20px;">
                Received on ${new Date().toLocaleString()}
              </p>
            </div>

            <!-- Footer -->
            <div style="background: #f1f3f5; padding: 12px 20px; text-align: center; font-size: 12px; color: #666;">
              <p style="margin: 0;">
                Sent from your Portfolio Website
              </p>
            </div>

          </div>
        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "Message sent and saved successfully",
    });

  } catch (error) {
    console.error("SendEmail Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while sending email",
    });
  }
};

module.exports = { sendEmailController };
