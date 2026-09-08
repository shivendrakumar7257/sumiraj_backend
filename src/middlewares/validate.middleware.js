const { validationResult } = require("express-validator");
const ApiError = require("../utils/ApiError");

/**
 * Validator Middleware: Checks express-validator results.
 * If errors are present, passes them as an ApiError to the error-handling middleware.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  // Extract error messages into a flat list of strings
  const formattedErrors = errors.array().map((err) => err.msg);

  // Pass formatted validation errors to the error middleware
  next(new ApiError(400, "Validation Failed", formattedErrors));
};

module.exports = validate;
