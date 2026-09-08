const ApiError = require("../utils/ApiError");

/**
 * Centralized error handler middleware.
 * Formats all exceptions and operational errors to standard JSON response format.
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Normalize operational or system errors to ApiError
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || (error.name === "ValidationError" ? 400 : 500);
    const message = error.message || "Internal Server Error";
    
    // Extract validation sub-errors if mongoose validation failed
    let errorsList = [];
    if (error.errors) {
      errorsList = Object.values(error.errors).map((el) => el.message);
    }
    
    error = new ApiError(statusCode, message, errorsList, err.stack);
  }

  // Handle MongoDB Duplicate Key (e.g. email duplication)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
    error = new ApiError(409, message);
  }

  // Handle MongoDB CastError (e.g. invalid Hex ID format)
  if (err.name === "CastError") {
    const message = `Invalid resource identifier format: ${err.value}`;
    error = new ApiError(400, message);
  }

  // Structure output according to requested API response design
  const responsePayload = {
    success: false,
    message: error.message,
    errors: error.errors || []
  };

  // Expose stack trace only in development mode
  if (process.env.NODE_ENV === "development") {
    responsePayload.stack = error.stack;
  }

  res.status(error.statusCode || 500).json(responsePayload);
};

module.exports = errorHandler;
