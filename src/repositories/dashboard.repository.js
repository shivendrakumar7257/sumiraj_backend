const Analytics = require("../models/Analytics");
const Enquiry = require("../models/Enquiry");
const Blog = require("../models/Blog");
const Portfolio = require("../models/Portfolio");

class DashboardRepository {
  /**
   * Record a new analytics event (visitor, page_view, whatsapp_click).
   * @param {Object} eventData
   * @returns {Promise<Object>}
   */
  async recordAnalytics(eventData) {
    return Analytics.create(eventData);
  }

  /**
   * Retrieves aggregated dashboard statistics.
   * @param {Object} options
   * @param {Date} [options.startDate]
   * @param {Date} [options.endDate]
   * @param {number} [options.recentLeadsLimit=10]
   * @param {number} [options.topPagesLimit=5]
   * @returns {Promise<Object>}
   */
  async getDashboardStats({ startDate, endDate, recentLeadsLimit = 10, topPagesLimit = 5 } = {}) {
    const dateQuery = {};
    if (startDate) dateQuery.$gte = startDate;
    if (endDate) dateQuery.$lte = endDate;
    const hasDateFilter = Object.keys(dateQuery).length > 0;

    // 1. Visitors Filter
    const visitorFilter = { type: { $in: ["visitor", "page_view"] } };
    if (hasDateFilter) visitorFilter.createdAt = dateQuery;

    // Distinct visitors count
    const [distinctVisitorIds, distinctIps, visitorTypeCount] = await Promise.all([
      Analytics.distinct("visitorId", { ...visitorFilter, visitorId: { $ne: "" } }),
      Analytics.distinct("ip", { ...visitorFilter, ip: { $ne: "" } }),
      Analytics.countDocuments({ ...visitorFilter, type: "visitor" })
    ]);

    const totalWebsiteVisitors = Math.max(
      distinctVisitorIds.length,
      distinctIps.length,
      visitorTypeCount
    );

    // 2. WhatsApp Clicks
    const whatsappFilter = { type: "whatsapp_click" };
    if (hasDateFilter) whatsappFilter.createdAt = dateQuery;
    const whatsappClicks = await Analytics.countDocuments(whatsappFilter);

    // 3. Top Performing Pages
    const pageViewMatch = { type: "page_view" };
    if (hasDateFilter) pageViewMatch.createdAt = dateQuery;

    const topPagesAggregation = await Analytics.aggregate([
      { $match: pageViewMatch },
      { $group: { _id: "$page", views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: topPagesLimit },
      { $project: { _id: 0, page: "$_id", views: 1 } }
    ]);

    // 4. New Enquiries (status: 'pending')
    const newEnquiriesFilter = { status: "pending" };
    if (hasDateFilter) newEnquiriesFilter.createdAt = dateQuery;
    const newEnquiries = await Enquiry.countDocuments(newEnquiriesFilter);

    // 5. Quote Requests
    const quoteRequestsFilter = {
      $or: [
        { enquiryType: { $regex: /quote/i } },
        { sourceLocation: { $exists: true, $ne: "" } },
        { destinationLocation: { $exists: true, $ne: "" } },
        { shipmentWeight: { $exists: true, $ne: "" } }
      ]
    };
    if (hasDateFilter) quoteRequestsFilter.createdAt = dateQuery;
    const quoteRequests = await Enquiry.countDocuments(quoteRequestsFilter);

    // 6. Recent Leads (latest enquiries)
    const recentLeads = await Enquiry.find()
      .sort({ createdAt: -1 })
      .limit(recentLeadsLimit)
      .select("fullName company email mobile sourceLocation destinationLocation shipmentWeight enquiryType message status createdAt")
      .lean();

    // 7. General System Overview Summary
    const [totalEnquiries, totalBlogs, totalPortfolios] = await Promise.all([
      Enquiry.countDocuments(),
      Blog.countDocuments(),
      Portfolio.countDocuments()
    ]);

    return {
      totalWebsiteVisitors,
      newEnquiries,
      quoteRequests,
      topPerformingPages: topPagesAggregation,
      recentLeads,
      whatsappClicks,
      summary: {
        totalEnquiries,
        totalBlogs,
        totalPortfolios
      }
    };
  }
}

module.exports = new DashboardRepository();
