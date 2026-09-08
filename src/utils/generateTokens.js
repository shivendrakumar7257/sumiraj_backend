const jwt = require("jsonwebtoken");

/**
 * Generates an Access Token valid for 15 days.
 * @param {string} userId 
 * @param {string} email 
 * @param {string} role 
 * @returns {string} Signed JWT Access Token
 */
const generateAccessToken = (userId, email, role) => {
  if (!process.env.JWT_ACCESS_SECRET) {
    throw new Error("JWT_ACCESS_SECRET environment variable is missing.");
  }
  return jwt.sign(
    { _id: userId, email, role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15d" }
  );
};

/**
 * Generates a Refresh Token valid for 15 days.
 * @param {string} userId 
 * @returns {string} Signed JWT Refresh Token
 */
const generateRefreshToken = (userId) => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET environment variable is missing.");
  }
  return jwt.sign(
    { _id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "15d" }
  );
};

module.exports = {
  generateAccessToken,
  generateRefreshToken
};
