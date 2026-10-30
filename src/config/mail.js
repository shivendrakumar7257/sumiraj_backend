const nodemailer = require("nodemailer");

/**
 * Creates and returns a configured Nodemailer transporter.
 * Dynamically resolves environment variables so it works properly in serverless environments.
 */
const getTransporter = () => {
  const host = process.env.SMTP_HOST || "";
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const isSecureEnv = process.env.SMTP_SECURE === "true" || process.env.SMTP_SECURE === "1";

  // Port 465 uses SSL/TLS direct; Port 587 uses STARTTLS
  const isSecure = port === 465 ? true : isSecureEnv;
  const requireTLS = port === 587 || (!isSecure && process.env.SMTP_REQUIRE_TLS !== "false");

  const fromAddress =
    process.env.MAIL_FROM_ADDRESS ||
    process.env.SMTP_USER ||
    "info@sumiraj.com";

  const fromDomain = fromAddress.includes("@")
    ? fromAddress.split("@")[1]
    : "sumiraj.com";

  return nodemailer.createTransport({
    host: host,
    port: port,
    secure: isSecure,
    requireTLS: requireTLS,
    name: process.env.SMTP_HELO_HOST || fromDomain,
    auth: {
      user: process.env.SMTP_USER || "",
      pass: process.env.SMTP_PASS || ""
    },
    tls: {
      // Allow self-signed or shared hosting domain certificates on custom cPanel / webmail servers
      rejectUnauthorized: false
    },
    // Serverless-safe timeouts (prevents serverless functions from hanging indefinitely)
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 20000
  });
};

const transporter = getTransporter();

/**
 * Verifies connection to the SMTP server.
 */
const verifyTransporter = async () => {
  try {
    const transport = getTransporter();
    await transport.verify();
    console.log("Mail SMTP connection established successfully.");
    return { success: true };
  } catch (error) {
    console.warn(
      "Mail SMTP connection warning: Check SMTP credentials in the .env file. Error:",
      error.message
    );
    return { success: false, error: error.message };
  }
};

module.exports = {
  getTransporter,
  transporter,
  verifyTransporter,
  fromName: process.env.MAIL_FROM_NAME || "Sumiraj",
  fromAddress: process.env.MAIL_FROM_ADDRESS || process.env.SMTP_USER || "info@sumiraj.com"
};
