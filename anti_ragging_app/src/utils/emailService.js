const nodemailer = require("nodemailer");

// Create a transporter using the configuration from environment variables
const transporter = nodemailer.createTransport({
  host: process.env.EmailService || "smtp.gmail.com",
  port: 465, // Use 465 for secure, or 587 if using STARTTLS
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EmailSender,
    pass: process.env.EmailPass,
  },
});

/**
 * Sends an email using the configured transporter.
 *
 * @param {Object} options - The email options.
 * @param {string} options.to - The recipient's email address.
 * @param {string} options.subject - The subject of the email.
 * @param {string} options.html - The HTML content of the email.
 * @returns {Promise<Object>} The result of the send operation.
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    const mailOptions = {
      from: `"Anti-Ragging System" <${process.env.EmailSender}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    // Don't throw the error here, just log it. 
    // We don't want a failure to send an email to break the main application flow (like registering or updating a complaint).
    // In a more robust system, you might want to retry or queue these.
    return null; 
  }
};

/**
 * Generates a styled HTML email template.
 *
 * @param {string} title - The title of the email.
 * @param {string} content - The HTML content of the email body.
 * @returns {string} The complete HTML string.
 */
const getEmailTemplate = (title, content) => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
      <div style="background-color: #1e3a8a; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 0.5px;">SafeCampus</h1>
      </div>
      <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #1f2937; margin-top: 0; margin-bottom: 20px; border-bottom: 2px solid #f3f4f6; padding-bottom: 15px; font-size: 20px;">${title}</h2>
        <div style="color: #4b5563; line-height: 1.6; font-size: 16px;">
          ${content}
        </div>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0 20px 0;" />
        <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">
          Best regards,<br/>
          <strong style="color: #4b5563;">The SafeCampus Team</strong>
        </p>
      </div>
      <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
        <p style="margin: 0;">This is an automated platform message. Please do not reply to this email.</p>
        <p style="margin: 5px 0 0 0;">&copy; ${new Date().getFullYear()} SafeCampus. All rights reserved.</p>
      </div>
    </div>
  `;
};

module.exports = {
  sendEmail,
  getEmailTemplate,
};
