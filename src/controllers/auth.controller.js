const authService = require("../services/auth.service");
const ApiResponse = require("../utils/ApiResponse");

// Secure cookie options for Refresh Token
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 15 * 24 * 60 * 60 * 1000 // 15 days in milliseconds
};

class AuthController {
  /**
   * Signup the first admin user.
   */
  signup = async (req, res, next) => {
    try {
      const user = await authService.signup(req.body);
      return res
        .status(201)
        .json(new ApiResponse(201, user, "Administrator signed up successfully"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Log in user and generate JWT tokens.
   */
  login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const { user, accessToken, refreshToken } = await authService.login(email, password);

      // Set cookie for refresh token and access token
      return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(new ApiResponse(200, { accessToken, refreshToken, user }, "Logged in successfully"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Log out user and revoke refresh token.
   */
  logout = async (req, res, next) => {
    try {
      // req.user is attached by authMiddleware
      await authService.logout(req.user._id);

      return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, {}, "Logged out successfully"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Refresh token endpoint to rotate token pairs.
   */
  refreshToken = async (req, res, next) => {
    try {
      const token = req.body.refreshToken || req.cookies.refreshToken;
      const { accessToken, refreshToken } = await authService.refreshToken(token);

      return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(new ApiResponse(200, { accessToken, refreshToken }, "Token refreshed successfully"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get currently logged-in user profile.
   */
  getProfile = async (req, res, next) => {
    try {
      const user = await authService.getProfile(req.user._id);
      return res
        .status(200)
        .json(new ApiResponse(200, user, "Profile details retrieved successfully"));
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new AuthController();
