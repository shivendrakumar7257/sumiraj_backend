const userRepository = require("../repositories/user.repository");
const { generateAccessToken, generateRefreshToken } = require("../utils/generateTokens");
const ApiError = require("../utils/ApiError");
const mailService = require("./mail.service");
const jwt = require("jsonwebtoken");

class AuthService {
  /**
   * Registers the very first admin user.
   * If there is already any user in the database, registration is blocked.
   * @param {Object} userData 
   * @returns {Promise<Object>}
   */
  async signup(userData) {
    const userCount = await userRepository.countUsers();
    
    if (userCount > 0) {
      throw new ApiError(403, "Admin already exists");
    }

    // Force values for the first user
    const newUser = await userRepository.createUser({
      ...userData,
      role: "admin",
      isVerified: true // First admin verified automatically
    });

    // Remove password field for response representation
    const userResponse = newUser.toObject();
    delete userResponse.password;

    // Send Welcome Email asynchronously
    mailService.sendWelcomeEmail(userResponse.email, userResponse.name);

    return userResponse;
  }

  /**
   * Logs in the admin user and returns tokens.
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<Object>}
   */
  async login(email, password) {
    const user = await userRepository.findUserByEmail(email, true);
    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      throw new ApiError(401, "Invalid email or password");
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.email, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to database
    await userRepository.updateRefreshToken(user._id, refreshToken);

    const loggedInUser = user.toObject();
    delete loggedInUser.password;
    delete loggedInUser.refreshToken;

    return {
      user: loggedInUser,
      accessToken,
      refreshToken
    };
  }

  /**
   * Logs out the user by removing their refresh token.
   * @param {string} userId 
   */
  async logout(userId) {
    await userRepository.removeRefreshToken(userId);
  }

  /**
   * Refreshes the access token using a valid refresh token.
   * @param {string} token 
   * @returns {Promise<Object>}
   */
  async refreshToken(token) {
    if (!token) {
      throw new ApiError(401, "Refresh token is required");
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    const user = await userRepository.findUserById(decoded._id);
    if (!user) {
      throw new ApiError(401, "User not found");
    }

    // Retrieve full user including refreshToken
    const fullUser = await userRepository.findUserById(user._id, "+refreshToken");
    if (!fullUser.refreshToken || fullUser.refreshToken !== token) {
      throw new ApiError(401, "Refresh token is invalid or has been revoked");
    }

    // Generate new token pair
    const newAccessToken = generateAccessToken(user._id, user.email, user.role);
    const newRefreshToken = generateRefreshToken(user._id);

    // Update refresh token in DB
    await userRepository.updateRefreshToken(user._id, newRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }

  /**
   * Retrieves profile details for the authenticated user.
   * @param {string} userId 
   * @returns {Promise<Object>}
   */
  async getProfile(userId) {
    const user = await userRepository.findUserById(userId);
    if (!user) {
      throw new ApiError(404, "User profile not found");
    }
    return user;
  }
}

module.exports = new AuthService();
