const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const userRepository = require("../repositories/user.repository");

/**
 * Authentication Middleware: Extracts, decodes, and verifies the access token.
 * Attaches the authenticated user to the request object as `req.user`.
 */
const authMiddleware = async (req, res, next) => {
  try {
    let token = "";

    // Extract Bearer token from Authorization header or cookie
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new ApiError(401, "Authentication required. Access token is missing.");
    }

    // Decode and verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (err) {
      throw new ApiError(401, "Access token is invalid or has expired.");
    }

    // Retrieve user from DB
    const user = await userRepository.findUserById(decoded._id);
    if (!user) {
      throw new ApiError(401, "The user account associated with this token no longer exists.");
    }

    // Attach user information to request context
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authMiddleware;
