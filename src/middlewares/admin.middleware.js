const ApiError = require("../utils/ApiError");

/**
 * Authorization Middleware: Verifies the authenticated user is an administrator.
 */
const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    next(new ApiError(403, "Access denied. Administrator privileges required."));
  }
};

module.exports = adminMiddleware;
