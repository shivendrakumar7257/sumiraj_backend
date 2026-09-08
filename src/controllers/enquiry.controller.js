const enquiryService = require("../services/enquiry.service");
const ApiResponse = require("../utils/ApiResponse");

class EnquiryController {
  /**
   * Submit a new business / quote enquiry.
   */
  create = async (req, res, next) => {
    try {
      const enquiry = await enquiryService.createEnquiry(req.body);
      return res
        .status(201)
        .json(new ApiResponse(201, enquiry, "Enquiry submitted successfully"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all business enquiries with pagination, search, sorting, and status filter (Admin).
   */
  getAll = async (req, res, next) => {
    try {
      const { search, status, sortBy, sortOrder, page, limit } = req.query;
      const result = await enquiryService.getAllEnquiries({
        search,
        status,
        sortBy,
        sortOrder,
        page,
        limit
      });
      return res
        .status(200)
        .json(new ApiResponse(200, result, "Enquiries retrieved successfully"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get single enquiry by ID (Admin).
   */
  getById = async (req, res, next) => {
    try {
      const enquiry = await enquiryService.getEnquiryById(req.params.id);
      return res
        .status(200)
        .json(new ApiResponse(200, enquiry, "Enquiry details retrieved successfully"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete an enquiry by ID (Admin).
   */
  delete = async (req, res, next) => {
    try {
      await enquiryService.deleteEnquiry(req.params.id);
      return res
        .status(200)
        .json(new ApiResponse(200, null, "Enquiry deleted successfully"));
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new EnquiryController();
