const { body } = require("express-validator");

const createEnquiryRules = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isString()
    .withMessage("Full name must be a string"),
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
  body("company")
    .optional({ checkFalsy: false })
    .isString()
    .trim(),
  body("projectLocation")
    .optional({ checkFalsy: false })
    .isString()
    .trim(),
  body("approximateArea")
    .optional({ checkFalsy: false })
    .isString()
    .trim(),
  body("projectType")
    .optional({ checkFalsy: false })
    .isString()
    .trim(),
  body("specification")
    .optional({ checkFalsy: false })
    .isString()
    .trim(),
  body("message")
    .optional({ checkFalsy: false })
    .isString()
    .trim(),
  body().custom((value, { req }) => {
    // Ensure either specification or message is provided
    const spec = req.body.specification;
    const msg = req.body.message;
    if ((!spec || !spec.trim()) && (!msg || !msg.trim())) {
      throw new Error("Specification / Message is required");
    }
    return true;
  }),
  body("attachments")
    .optional()
    .custom((value) => {
      if (typeof value === "string") {
        try {
          JSON.parse(value);
        } catch {
          // Allowed as a single string URL
        }
      }
      return true;
    }),
  // Backward compatibility fields
  body("sourceLocation").optional().isString().trim(),
  body("destinationLocation").optional().isString().trim(),
  body("shipmentWeight").optional().isString().trim(),
  body("enquiryType").optional().isString().trim()
];

const updateEnquiryStatusRules = [
  body("status")
    .trim()
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["pending", "contacted", "closed"])
    .withMessage("Status must be one of: pending, contacted, closed")
];

module.exports = {
  createEnquiryRules,
  updateEnquiryStatusRules
};
