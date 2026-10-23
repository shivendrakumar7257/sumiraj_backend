const dashboardRepository = require("../repositories/dashboard.repository");
const ApiError = require("../utils/ApiError");

class DashboardService {
  /**
   * Calculate date range filters based on human-readable time range string or custom dates.
   * @param {Object} query
   * @returns {{ startDate?: Date, endDate?: Date }}
   */
  _resolveDateRange({ timeRange, startDate, endDate }) {
    if (startDate || endDate) {
      return {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined
      };
    }

    if (!timeRange || timeRange === "all") {
      return {};
    }

    const now = new Date();
    const start = new Date();

    switch (timeRange.toLowerCase()) {
      case "today":
        start.setHours(0, 0, 0, 0);
        return { startDate: start, endDate: now };

      case "yesterday": {
        const yesterdayStart = new Date();
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);
        yesterdayStart.setHours(0, 0, 0, 0);

        const yesterdayEnd = new Date();
        yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
        yesterdayEnd.setHours(23, 59, 59, 999);

        return { startDate: yesterdayStart, endDate: yesterdayEnd };
      }

      case "week":
      case "7days":
        start.setDate(start.getDate() - 7);
        return { startDate: start, endDate: now };

      case "month":
      case "30days":
        start.setDate(start.getDate() - 30);
        return { startDate: start, endDate: now };

      case "year":
      case "365days":
        start.setFullYear(start.getFullYear() - 1);
        return { startDate: start, endDate: now };

      default:
        return {};
    }
  }

  /**
   * Retrieves all dashboard metrics required by the admin dashboard.
   * @param {Object} queryParams
   * @returns {Promise<Object>}
   */
  async getDashboardData(queryParams = {}) {
    const { timeRange, startDate, endDate, recentLeadsLimit, topPagesLimit } = queryParams;

    const { startDate: resolvedStart, endDate: resolvedEnd } = this._resolveDateRange({
      timeRange,
      startDate,
      endDate
    });

    const parsedRecentLeadsLimit = Math.max(1, Math.min(100, parseInt(recentLeadsLimit, 10) || 10));
    const parsedTopPagesLimit = Math.max(1, Math.min(50, parseInt(topPagesLimit, 10) || 5));

    const stats = await dashboardRepository.getDashboardStats({
      startDate: resolvedStart,
      endDate: resolvedEnd,
      recentLeadsLimit: parsedRecentLeadsLimit,
      topPagesLimit: parsedTopPagesLimit
    });

    const topPerformingPage =
      stats.topPerformingPages && stats.topPerformingPages.length > 0
        ? stats.topPerformingPages[0]
        : { page: "/", views: 0 };

    return {
      // Requested core parameters (providing standard camelCase & aliases)
      totalWebsiteVisitors: stats.totalWebsiteVisitors,
      totalWebsiteVisitor: stats.totalWebsiteVisitors,
      newEnquiries: stats.newEnquiries,
      newEnquires: stats.newEnquiries,
      quoteRequests: stats.quoteRequests,
      quoteRequest: stats.quoteRequests,
      topPerformingPage,
      topPerformingPages: stats.topPerformingPages,
      recentLeads: stats.recentLeads,
      whatsappClicks: stats.whatsappClicks,
      whatsappClick: stats.whatsappClicks,

      // Additional system overview information
      summary: {
        ...stats.summary,
        timeRange: timeRange || "all",
        filterApplied: Boolean(resolvedStart || resolvedEnd)
      }
    };
  }

  /**
   * Records tracking event from frontend (visitor, page_view, whatsapp_click).
   * @param {Object} payload
   * @returns {Promise<Object>}
   */
  async recordActivity(payload) {
    const { type, page, visitorId, ip, userAgent, metadata } = payload;

    const validTypes = ["visitor", "page_view", "whatsapp_click", "general_event"];
    if (!type || !validTypes.includes(type)) {
      throw new ApiError(400, `Invalid tracking type. Must be one of: ${validTypes.join(", ")}`);
    }

    const event = await dashboardRepository.recordAnalytics({
      type,
      page: page || "/",
      visitorId: visitorId || "",
      ip: ip || "",
      userAgent: userAgent || "",
      metadata: metadata || {}
    });

    return event;
  }
}

module.exports = new DashboardService();
