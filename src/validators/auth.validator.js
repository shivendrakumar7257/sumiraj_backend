const { body } = require("express-validator");

const signupRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must contain at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least 1 uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least 1 lowercase letter")
    .matches(/\d/)
    .withMessage("Password must contain at least 1 number")
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage("Password must contain at least 1 special character")
];

const loginRules = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
];

const refreshTokenRules = [
  body("refreshToken")
    .notEmpty()
    .withMessage("Refresh token is required")
];

module.exports = {
  signupRules,
  loginRules,
  refreshTokenRules
};
