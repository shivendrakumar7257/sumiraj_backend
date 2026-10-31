const nodemailer = require("nodemailer");

/**
 * Strips accidental wrapping quotes and leading/trailing whitespace
 * from environment variable strings (common when copy-pasting into Vercel).
 */
const cleanEnv = (val) => {
  if (!val) return "";
  let s = String(val).trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  return s;
};

/**
 * Creates and returns a configured Nodemailer transporter.
 * Dynamically resolves environment variables so it works properly in serverless environments.
 */
const getTransporter = (overrides = {}) => {
  const host = cleanEnv(overrides.host || process.env.SMTP_HOST || "");
  const port = parseInt(overrides.port || process.env.SMTP_PORT || "465", 10);
  const user = cleanEnv(overrides.user || process.env.SMTP_USER || "");
  const pass = cleanEnv(overrides.pass || process.env.SMTP_PASS || "");

  const isSecureEnv =
    process.env.SMTP_SECURE === "true" || process.env.SMTP_SECURE === "1";

  // Port 465 uses direct SSL/TLS; Port 587 uses STARTTLS
  const isSecure =
    overrides.secure !== undefined
      ? Boolean(overrides.secure)
      : port === 465
      ? true
      : isSecureEnv;

  const requireTLS =
    overrides.requireTLS !== undefined
      ? Boolean(overrides.requireTLS)
      : port === 587 || (!isSecure && process.env.SMTP_REQUIRE_TLS !== "false");

  const fromAddress = cleanEnv(
    overrides.fromAddress ||
      process.env.MAIL_FROM_ADDRESS ||
      process.env.SMTP_USER ||
      "info@sumiraj.com"
  );

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
      user: user,
      pass: pass
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
const verifyTransporter = async (overrides = {}) => {
  try {
    const transport = getTransporter(overrides);
    await transport.verify();
    console.log("Mail SMTP connection established successfully.");
    return { success: true };
  } catch (error) {
    console.warn(
      "Mail SMTP connection warning: Check SMTP credentials in environment variables. Error:",
      error.message
    );
    return { success: false, error: error.message };
  }
};

module.exports = {
  cleanEnv,
  getTransporter,
  transporter,
  verifyTransporter,
  fromName: process.env.MAIL_FROM_NAME || "Sumiraj",
  fromAddress:
    process.env.MAIL_FROM_ADDRESS ||
    process.env.SMTP_USER ||
    "info@sumiraj.com"
};
