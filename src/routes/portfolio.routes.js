const express = require("express");
const portfolioController = require("../controllers/portfolio.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");
const validate = require("../middlewares/validate.middleware");
const { createPortfolioRules, updatePortfolioRules } = require("../validators/portfolio.validator");

const router = express.Router();

// Public Routes: Anyone can view portfolio projects
router.get("/", portfolioController.getAll);
router.get("/:slug", portfolioController.getBySlug);

// Admin Protected Routes: Only logged-in admin users can manage portfolio entries
router.post("/", authMiddleware, adminMiddleware, createPortfolioRules, validate, portfolioController.create);
router.put("/:id", authMiddleware, adminMiddleware, updatePortfolioRules, validate, portfolioController.update);
router.delete("/:id", authMiddleware, adminMiddleware, portfolioController.delete);

module.exports = router;
