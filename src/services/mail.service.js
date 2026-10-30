const { getTransporter } = require("../config/mail");
const path = require("path");
const fs = require("fs");

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const resolveFileUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const baseUrl = (
    process.env.BACKEND_URL ||
    process.env.BASE_URL ||
    process.env.FRONTEND_URL?.split(",")[0] ||
    "https://sumiraj.com"
  ).replace(/\/+$/, "");
  return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
};

const isImageFile = (mimetype, url) => {
  if (mimetype && mimetype.startsWith("image/")) return true;
  if (url && /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(url)) return true;
  return false;
};

class MailService {
  /**
   * Sends a general email.
   * @param {Object} options - Email options
   * @param {string} options.to - Recipient email
   * @param {string} options.subject - Subject line
   * @param {string} options.html - HTML body
   * @param {Array} options.attachments - File attachments array
   * @returns {Promise<Object|null>} Info object on success, null on failure
   */
  async sendMail({ to, subject, html, attachments = [] }) {
    const fromName = process.env.MAIL_FROM_NAME || "Sumiraj";
    const fromAddress =
      process.env.MAIL_FROM_ADDRESS ||
      process.env.SMTP_USER ||
      "info@sumiraj.com";

    if (!to) {
      console.error("sendMail error: No recipient specified ('to' is empty)!");
      return null;
    }

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error(
        "sendMail error: Missing SMTP credentials in environment variables (SMTP_HOST, SMTP_USER, SMTP_PASS)!"
      );
      return null;
    }

    const mailOptions = {
      from: `"${fromName}" <${fromAddress}>`,
      to,
      subject,
      html,
      attachments
    };

    try {
      const transporter = getTransporter();
      console.log(`Sending email to ${to} via SMTP host ${process.env.SMTP_HOST}...`);
      const info = await transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${to}: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error(`Failed to send email to ${to}:`, {
        message: error.message,
        code: error.code,
        response: error.response
      });
      // Do not throw to avoid crashing parent callers, return null
      return null;
    }
  }

  /**
   * Sends a test email to verify SMTP credentials on production.
   * @param {string} [targetEmail]
   */
  async sendTestEmail(targetEmail) {
    const recipient =
      targetEmail ||
      process.env.INQUIRY_NOTIFICATION_EMAIL ||
      process.env.QUOTE_NOTIFICATION_EMAIL ||
      process.env.MAIL_FROM_ADDRESS ||
      "info@sumiraj.com";

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error(
        "Missing SMTP credentials in environment variables! Check SMTP_HOST, SMTP_USER, and SMTP_PASS in Vercel settings."
      );
    }

    const subject = "Sumiraj SMTP Connection Test - Verification Successful";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="text-align: center; border-bottom: 2px solid #ff5722; padding-bottom: 12px; margin-bottom: 16px;">
          <h2 style="color: #ff5722; margin: 0;">SMTP Test Successful</h2>
          <p style="color: #718096; margin: 4px 0 0; font-size: 13px;">Sumiraj Backend Mail System</p>
        </div>
        <p>If you received this message, your production SMTP mail delivery to <strong>${recipient}</strong> is working perfectly!</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr style="background-color: #f7fafc;">
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-weight: bold; width: 35%;">SMTP Host:</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">${process.env.SMTP_HOST}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-weight: bold;">SMTP User:</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">${process.env.SMTP_USER}</td>
          </tr>
          <tr style="background-color: #f7fafc;">
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-weight: bold;">Recipient Inbox:</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-weight: bold; color: #ff5722;">${recipient}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-weight: bold;">Timestamp:</td>
            <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">${new Date().toISOString()}</td>
          </tr>
        </table>
        <br/>
        <p style="color: #38a169; font-weight: bold; text-align: center;">All new inquiries submitted on the website will be delivered to this email.</p>
      </div>
    `;

    const transporter = getTransporter();
    // Test the SMTP handshake first
    await transporter.verify();

    const info = await this.sendMail({ to: recipient, subject, html });
    if (!info) {
      throw new Error("Transporter verified, but sending test email failed. Check server logs for details.");
    }

    return {
      success: true,
      recipient,
      messageId: info.messageId,
      smtpHost: process.env.SMTP_HOST
    };
  }

  /**
   * Sends a welcome email to new admins.
   * @param {string} to 
   * @param {string} name 
   */
  async sendWelcomeEmail(to, name) {
    const subject = "Welcome to Sumiraj!";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #0056b3; text-align: center;">Welcome to Sumiraj, ${name}!</h2>
        <p>Dear ${name},</p>
        <p>Your administrator account has been successfully created. You now have full access to manage the Sumiraj platform.</p>
        <p>If you have any questions or require system support, please contact your technical team.</p>
        <br/>
        <p>Best Regards,</p>
        <p><strong>Sumiraj Team</strong></p>
      </div>
    `;
    return this.sendMail({ to, subject, html });
  }

  /**
   * Sends a forgot password request reset link.
   * @param {string} to 
   * @param {string} name 
   * @param {string} resetUrl 
   */
  async sendForgotPasswordEmail(to, name, resetUrl) {
    const subject = "Reset Password - Sumiraj";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #d9534f; text-align: center;">Password Reset Request</h2>
        <p>Dear ${name},</p>
        <p>We received a request to reset your password for Sumiraj dashboard. Click the button below to choose a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #0056b3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p>This link is valid for 1 hour. If you did not make this request, you can safely ignore this email.</p>
        <br/>
        <p>Best Regards,</p>
        <p><strong>Sumiraj Team</strong></p>
      </div>
    `;
    return this.sendMail({ to, subject, html });
  }

  /**
   * Sends password reset confirmation.
   * @param {string} to 
   * @param {string} name 
   */
  async sendResetSuccessEmail(to, name) {
    const subject = "Password Successfully Reset - Sumiraj";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #28a745; text-align: center;">Password Reset Confirmed</h2>
        <p>Dear ${name},</p>
        <p>Your password was successfully updated. If you did not perform this action, please secure your account immediately.</p>
        <br/>
        <p>Best Regards,</p>
        <p><strong>Sumiraj Team</strong></p>
      </div>
    `;
    return this.sendMail({ to, subject, html });
  }

  /**
   * Sends an OTP email.
   * @param {string} to 
   * @param {string} name 
   * @param {string} otp 
   */
  async sendOTPEmail(to, name, otp) {
    const subject = "Your One-Time Password (OTP) - Sumiraj";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #0056b3; text-align: center;">Your Security OTP</h2>
        <p>Dear ${name},</p>
        <p>Use the following One-Time Password (OTP) to complete your transaction or login process. This OTP is valid for 10 minutes.</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0056b3; background-color: #f8f9fa; padding: 10px 20px; border: 1px dashed #0056b3; border-radius: 4px; display: inline-block;">${otp}</span>
        </div>
        <p>If you did not request this, please secure your account.</p>
        <br/>
        <p>Best Regards,</p>
        <p><strong>Sumiraj Team</strong></p>
      </div>
    `;
    return this.sendMail({ to, subject, html });
  }

  /**
   * Sends an email notification when a new business enquiry is received.
   * Displays all inquiry form details, client specifications, and attachment previews/links.
   * @param {Object} enquiry 
   */
  async sendEnquiryNotificationEmail(enquiry) {
    const clientIdentifier = enquiry.fullName || enquiry.company || enquiry.email;
    const projectTypeDisplay = enquiry.projectType || enquiry.enquiryType || "General Enquiry";
    const subject = `New Inquiry: ${projectTypeDisplay} - from ${clientIdentifier}`;

    // Format attachments and physical mail attachments
    let attachmentsHtml = "";
    const mailAttachments = [];

    if (enquiry.attachments && enquiry.attachments.length > 0) {
      attachmentsHtml = `
        <div style="margin-top: 25px; padding-top: 20px; border-top: 2px solid #e2e8f0;">
          <h3 style="color: #1a202c; margin-bottom: 14px; font-size: 16px;">
            📎 Attachments & Uploaded Documents (${enquiry.attachments.length}):
          </h3>
          <div style="display: flex; flex-direction: column; gap: 12px;">
      `;

      for (const att of enquiry.attachments) {
        const fullUrl = resolveFileUrl(att.url);
        const fileName = att.originalname || "attachment";
        const sizeStr = formatFileSize(att.size);
        const imgCheck = isImageFile(att.mimetype, att.url);

        if (imgCheck) {
          attachmentsHtml += `
            <div style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #f7fafc; margin-bottom: 12px;">
              <div style="margin-bottom: 8px;">
                <a href="${fullUrl}" target="_blank">
                  <img src="${fullUrl}" alt="${fileName}" style="max-width: 220px; max-height: 160px; border-radius: 6px; border: 1px solid #cbd5e0; object-fit: cover; display: block;" />
                </a>
              </div>
              <div style="font-weight: 600; color: #2d3748; font-size: 13px;">🖼️ ${fileName} ${sizeStr ? `<span style="color: #718096; font-weight: normal;">(${sizeStr})</span>` : ""}</div>
              <div style="margin-top: 6px;">
                <a href="${fullUrl}" target="_blank" style="display: inline-block; background-color: #ff5722; color: #ffffff; padding: 6px 14px; border-radius: 4px; text-decoration: none; font-size: 12px; font-weight: bold;">View / Download Image</a>
              </div>
            </div>
          `;
        } else {
          attachmentsHtml += `
            <div style="padding: 12px; border: 1px solid #fed7d7; border-radius: 8px; background-color: #fffaf0; border-left: 4px solid #e53e3e; margin-bottom: 12px;">
              <div style="font-weight: 600; color: #2d3748; font-size: 13px;">📄 ${fileName} ${sizeStr ? `<span style="color: #718096; font-weight: normal;">(${sizeStr})</span>` : ""}</div>
              <div style="margin-top: 6px;">
                <a href="${fullUrl}" target="_blank" style="display: inline-block; background-color: #e53e3e; color: #ffffff; padding: 6px 14px; border-radius: 4px; text-decoration: none; font-size: 12px; font-weight: bold;">Open / Download PDF Document</a>
              </div>
            </div>
          `;
        }

        // Add to physical attachments if remote URL or local file exists
        if (att.url && (att.url.startsWith("http://") || att.url.startsWith("https://"))) {
          mailAttachments.push({
            filename: fileName,
            path: att.url
          });
        } else if (att.url && att.url.startsWith("/public/uploads/")) {
          const localPath = path.join(process.cwd(), att.url);
          if (fs.existsSync(localPath)) {
            mailAttachments.push({
              filename: fileName,
              path: localPath
            });
          }
        }
      }

      attachmentsHtml += `
          </div>
        </div>
      `;
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 10px; background-color: #ffffff;">
        <div style="text-align: center; border-bottom: 2px solid #ff5722; padding-bottom: 16px; margin-bottom: 20px;">
          <h2 style="color: #ff5722; margin: 0; font-size: 22px;">New Project Inquiry Received</h2>
          <p style="color: #718096; margin: 6px 0 0; font-size: 14px;">Sumiraj Official Website Contact Form</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <tr style="background-color: #f8fafc;">
            <td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-weight: bold; width: 35%; color: #4a5568;">Full Name:</td>
            <td style="padding: 10px 14px; border: 1px solid #e2e8f0; color: #1a202c; font-weight: 600;">${enquiry.fullName || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-weight: bold; color: #4a5568;">Company:</td>
            <td style="padding: 10px 14px; border: 1px solid #e2e8f0; color: #1a202c;">${enquiry.company || 'N/A'}</td>
          </tr>
          <tr style="background-color: #f8fafc;">
            <td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-weight: bold; color: #4a5568;">Email:</td>
            <td style="padding: 10px 14px; border: 1px solid #e2e8f0; color: #1a202c;">
              <a href="mailto:${enquiry.email}" style="color: #0056b3; text-decoration: none; font-weight: 600;">${enquiry.email}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-weight: bold; color: #4a5568;">Mobile Number:</td>
            <td style="padding: 10px 14px; border: 1px solid #e2e8f0; color: #1a202c;">
              <a href="tel:${enquiry.mobile}" style="color: #0056b3; text-decoration: none; font-weight: 600;">${enquiry.mobile}</a>
            </td>
          </tr>
          <tr style="background-color: #f8fafc;">
            <td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-weight: bold; color: #4a5568;">Project Location:</td>
            <td style="padding: 10px 14px; border: 1px solid #e2e8f0; color: #1a202c;">${enquiry.projectLocation || enquiry.destinationLocation || enquiry.sourceLocation || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-weight: bold; color: #4a5568;">Approximate Area:</td>
            <td style="padding: 10px 14px; border: 1px solid #e2e8f0; color: #1a202c;">${enquiry.approximateArea || enquiry.shipmentWeight || 'N/A'}</td>
          </tr>
          <tr style="background-color: #f8fafc;">
            <td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-weight: bold; color: #4a5568;">Project Type:</td>
            <td style="padding: 10px 14px; border: 1px solid #e2e8f0; color: #ff5722; font-weight: 600;">${enquiry.projectType || enquiry.enquiryType || 'Pre-Engineered Buildings (PEB)'}</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-weight: bold; color: #4a5568; vertical-align: top;">Specification / Message:</td>
            <td style="padding: 10px 14px; border: 1px solid #e2e8f0; color: #2d3748; line-height: 1.5; white-space: pre-wrap;">${enquiry.specification || enquiry.message || 'N/A'}</td>
          </tr>
        </table>

        ${attachmentsHtml}

        <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e2e8f0; text-align: center; color: #a0aec0; font-size: 12px;">
          <p style="margin: 0;">This email was automatically generated by Sumiraj System.</p>
        </div>
      </div>
    `;

    const recipient =
      process.env.INQUIRY_NOTIFICATION_EMAIL ||
      process.env.QUOTE_NOTIFICATION_EMAIL ||
      process.env.MAIL_FROM_ADDRESS ||
      "info@sumiraj.com";

    // Send email with file attachments, fallback to body links if attachment size exceeds limits
    let info = await this.sendMail({
      to: recipient,
      subject,
      html,
      attachments: mailAttachments
    });

    if (!info && mailAttachments.length > 0) {
      console.log("Retrying enquiry notification email without physical attachments...");
      info = await this.sendMail({
        to: recipient,
        subject,
        html,
        attachments: []
      });
    }

    return info;
  }
}

module.exports = new MailService();
