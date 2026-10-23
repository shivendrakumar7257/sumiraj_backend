const express = require("express");
const dashboardController = require("../controllers/dashboard.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");

const router = express.Router();

/**
 * Admin Protected Dashboard Endpoint:
 * GET /api/admin/dashboard
 * GET /api/admin/dashboard/stats
 * Retrieves total website visitor, new enquires, quote request, top performing page, recent leads, whatsapp click
 */
router.get("/dashboard", authMiddleware, adminMiddleware, dashboardController.getDashboardStats);
router.get("/dashboard/stats", authMiddleware, adminMiddleware, dashboardController.getDashboardStats);

module.exports = router;
