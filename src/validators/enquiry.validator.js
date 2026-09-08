const { body } = require("express-validator");

const createEnquiryRules = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),
  body("mobile")
    .trim()
    .notEmpty()
    .withMessage("Mobile number is required"),
  body("fullName")
    .optional({ checkFalsy: false })
    .isString()
    .trim(),
  body("company")
    .optional({ checkFalsy: false })
    .isString()
    .trim(),
  body("sourceLocation")
    .optional({ checkFalsy: false })
    .isString()
    .trim(),
  body("destinationLocation")
    .optional({ checkFalsy: false })
    .isString()
    .trim(),
  body("shipmentWeight")
    .optional({ checkFalsy: false })
    .isString()
    .trim(),
  body("enquiryType")
    .optional({ checkFalsy: false })
    .isString()
    .trim(),
  body("message")
    .optional({ checkFalsy: false })
    .isString()
    .trim()
];

module.exports = {
  createEnquiryRules
};
