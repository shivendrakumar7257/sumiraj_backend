const nodemailer = require("nodemailer");

// Extract domain from MAIL_FROM_ADDRESS to provide a valid FQDN for HELO/EHLO identification
const fromAddress = process.env.MAIL_FROM_ADDRESS || "";
const fromDomain = fromAddress.includes("@") ? fromAddress.split("@")[1] : "localhost";

const port = parseInt(process.env.SMTP_PORT || "465", 10);
const isSecureEnv = process.env.SMTP_SECURE === "true" || process.env.SMTP_SECURE === "1";

const isSecure = port === 465 ? true : isSecureEnv;
const requireTLS = port === 587 || (!isSecure && process.env.SMTP_REQUIRE_TLS !== "false");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "",
  port: port,
  secure: isSecure,
  requireTLS: requireTLS,
  name: process.env.SMTP_HELO_HOST || fromDomain,
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || ""
  }
});

/**
 * Verifies connection to the SMTP server.
 */
const verifyTransporter = async () => {
  try {
    await transporter.verify();
    console.log("Mail SMTP connection established successfully.");
  } catch (error) {
    console.warn("Mail SMTP connection warning: Check SMTP credentials in the .env file. Error:", error.message);
  }
};

module.exports = {
  transporter,
  verifyTransporter,
  fromName: process.env.MAIL_FROM_NAME || "Sumiraj",
  fromAddress: fromAddress
};
