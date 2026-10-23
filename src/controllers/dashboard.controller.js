const dashboardService = require("../services/dashboard.service");
const ApiResponse = require("../utils/ApiResponse");

class DashboardController {
  /**
   * Admin protected endpoint to fetch aggregated dashboard metrics.
   * Parameters included:
   * - total website visitor
   * - new enquires
   * - quote request
   * - top performing page
   * - recent leads
   * - whatsapp click
   */
  getDashboardStats = async (req, res, next) => {
    try {
      const stats = await dashboardService.getDashboardData(req.query);
      return res
        .status(200)
        .json(new ApiResponse(200, stats, "Dashboard statistics retrieved successfully"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Public tracking endpoint for frontend client website to record visitors,
   * page views, and WhatsApp button clicks.
   */
  trackActivity = async (req, res, next) => {
    try {
      const clientIp =
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.socket?.remoteAddress ||
        req.ip ||
        "";

      const userAgent = req.headers["user-agent"] || "";

      const event = await dashboardService.recordActivity({
        type: req.body.type,
        page: req.body.page,
        visitorId: req.body.visitorId,
        metadata: req.body.metadata,
        ip: clientIp,
        userAgent
      });

      return res
        .status(201)
        .json(new ApiResponse(201, event, "Activity recorded successfully"));
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new DashboardController();
