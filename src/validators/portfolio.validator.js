const { body } = require("express-validator");

const createPortfolioRules = [
  body("title")
    .notEmpty()
    .withMessage("Portfolio title is required")
    .isString()
    .withMessage("Title must be a string")
    .trim(),
  body("category")
    .optional()
    .isString()
    .withMessage("Category must be a string")
    .trim(),
  body("shortDescription")
    .optional()
    .isString()
    .withMessage("Short description must be a string")
    .trim(),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string")
    .trim(),
  body("thumbnail")
    .optional()
    .isString()
    .withMessage("Thumbnail must be a string")
    .trim(),
  body("images")
    .optional()
    .isArray()
    .withMessage("Images must be an array of string URLs"),
  body("clientName")
    .optional()
    .isString()
    .withMessage("Client name must be a string")
    .trim(),
  body("projectUrl")
    .optional()
    .isString()
    .withMessage("Project URL must be a string")
    .trim(),
  body("technologies")
    .optional()
    .isArray()
    .withMessage("Technologies must be an array of strings"),
  body("featured")
    .optional()
    .isBoolean()
    .withMessage("Featured must be a boolean"),
  body("isPublished")
    .optional()
    .isBoolean()
    .withMessage("isPublished must be a boolean"),
  body("displayOrder")
    .optional()
    .isNumeric()
    .withMessage("Display order must be a number")
];

const updatePortfolioRules = [
  body("title")
    .optional()
    .isString()
    .withMessage("Title must be a string")
    .trim(),
  body("category")
    .optional()
    .isString()
    .withMessage("Category must be a string")
    .trim(),
  body("shortDescription")
    .optional()
    .isString()
    .withMessage("Short description must be a string")
    .trim(),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string")
    .trim(),
  body("thumbnail")
    .optional()
    .isString()
    .withMessage("Thumbnail must be a string")
    .trim(),
  body("images")
    .optional()
    .isArray()
    .withMessage("Images must be an array of string URLs"),
  body("clientName")
    .optional()
    .isString()
    .withMessage("Client name must be a string")
    .trim(),
  body("projectUrl")
    .optional()
    .isString()
    .withMessage("Project URL must be a string")
    .trim(),
  body("technologies")
    .optional()
    .isArray()
    .withMessage("Technologies must be an array of strings"),
  body("featured")
    .optional()
    .isBoolean()
    .withMessage("Featured must be a boolean"),
  body("isPublished")
    .optional()
    .isBoolean()
    .withMessage("isPublished must be a boolean"),
  body("displayOrder")
    .optional()
    .isNumeric()
    .withMessage("Display order must be a number")
];

module.exports = {
  createPortfolioRules,
  updatePortfolioRules
};
