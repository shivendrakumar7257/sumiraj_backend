const express = require("express");
const dashboardController = require("../controllers/dashboard.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");

const router = express.Router();

/**
 * Admin Protected Routes:
 * GET /api/dashboard
 * GET /api/dashboard/stats
 * Retrieves total website visitors, new enquires, quote requests, top performing page, recent leads, whatsapp clicks
 */
router.get("/", authMiddleware, adminMiddleware, dashboardController.getDashboardStats);
router.get("/stats", authMiddleware, adminMiddleware, dashboardController.getDashboardStats);

/**
 * Public Event Tracking Route:
 * POST /api/dashboard/track
 * Allows client frontend to record page views, visitors, and whatsapp clicks
 */
router.post("/track", dashboardController.trackActivity);

module.exports = router;
