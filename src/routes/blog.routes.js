const express = require("express");
const blogController = require("../controllers/blog.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");
const validate = require("../middlewares/validate.middleware");
const { createBlogRules, updateBlogRules } = require("../validators/blog.validator");

const router = express.Router();

// Public Routes: Anyone can browse blogs
router.get("/", blogController.getAll);
router.get("/:slug", blogController.getBySlug);

// Admin Protected Routes: Only logged-in admin users can manage blog entries
router.post("/", authMiddleware, adminMiddleware, createBlogRules, validate, blogController.create);
router.put("/:id", authMiddleware, adminMiddleware, updateBlogRules, validate, blogController.update);
router.delete("/:id", authMiddleware, adminMiddleware, blogController.delete);

module.exports = router;
