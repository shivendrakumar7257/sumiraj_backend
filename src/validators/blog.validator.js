const { body } = require("express-validator");

const createBlogRules = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Blog title is required"),
  body("shortDescription")
    .trim()
    .notEmpty()
    .withMessage("Blog short description is required"),
  body("content")
    .notEmpty()
    .withMessage("Blog content is required"),
  body("featuredImage")
    .optional()
    .isString()
    .withMessage("Featured image must be a valid path/URL"),
  body("metaTitle")
    .optional()
    .isString()
    .withMessage("Meta title must be a string"),
  body("metaDescription")
    .optional()
    .isString()
    .withMessage("Meta description must be a string"),
  body("author")
    .optional()
    .isString()
    .withMessage("Author must be a string"),
  body("isPublished")
    .optional()
    .isBoolean()
    .withMessage("isPublished must be a boolean")
];

const updateBlogRules = [
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Blog title cannot be empty"),
  body("shortDescription")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Blog short description cannot be empty"),
  body("content")
    .optional()
    .notEmpty()
    .withMessage("Blog content cannot be empty"),
  body("featuredImage")
    .optional()
    .isString()
    .withMessage("Featured image must be a valid path/URL"),
  body("metaTitle")
    .optional()
    .isString()
    .withMessage("Meta title must be a string"),
  body("metaDescription")
    .optional()
    .isString()
    .withMessage("Meta description must be a string"),
  body("author")
    .optional()
    .isString()
    .withMessage("Author must be a string"),
  body("isPublished")
    .optional()
    .isBoolean()
    .withMessage("isPublished must be a boolean")
];

module.exports = {
  createBlogRules,
  updateBlogRules
};
