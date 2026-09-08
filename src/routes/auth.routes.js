const express = require("express");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { signupRules, loginRules } = require("../validators/auth.validator");

const router = express.Router();

// Public signup (disabled after first admin creation)
router.post("/signup", signupRules, validate, authController.signup);

// Public login
router.post("/login", loginRules, validate, authController.login);

// Protected logout
router.post("/logout", authMiddleware, authController.logout);

// Public token refresh (takes token from body or cookies)
router.post("/refresh-token", authController.refreshToken);

// Protected profile retrieval
router.get("/profile", authMiddleware, authController.getProfile);

module.exports = router;
