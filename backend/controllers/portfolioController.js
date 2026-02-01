require("dotenv").config();
const sgMail = require("@sendgrid/mail");
const pool = require("../config/db");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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

    // Send email using SendGrid
    const message = {
      to: process.env.SENDGRID_SENDER_EMAIL, // your receiving email
      from: process.env.SENDGRID_SENDER_EMAIL, // verified sender email
      replyTo: email, // allow reply to the contact's email
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
              <p>You have received a new message from your portfolio contact form.</p>

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
              Sent from your Portfolio Website
            </div>

          </div>
        </div>
      `,
    };

    await sgMail.send(message);

    return res.status(200).json({
      success: true,
      message: "Message sent and saved successfully",
    });

  } catch (error) {
    console.error("SendGrid Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while sending email",
    });
  }
};

module.exports = { sendEmailController };
