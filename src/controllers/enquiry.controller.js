const enquiryService = require("../services/enquiry.service");
const storageService = require("../services/storage.service");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

class EnquiryController {
  /**
   * Submit a new business / quote enquiry with support for file attachments.
   */
  create = async (req, res, next) => {
    try {
      const attachments = [];

      // 1. Process files uploaded directly via multipart/form-data
      if (req.files && req.files.length > 0) {
        const uploadPromises = req.files.map((file) =>
          storageService.uploadFile(file, "uploads/enquiries")
        );
        const uploadedResults = await Promise.all(uploadPromises);

        uploadedResults.forEach((result, idx) => {
          const file = req.files[idx];
          attachments.push({
            url: result.url,
            pathname: result.pathname,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
          });
        });
      }

      // 2. Process attachments passed in req.body (e.g. JSON array or pre-uploaded URLs)
      if (req.body.attachments) {
        let existingAttachments = req.body.attachments;
        if (typeof existingAttachments === "string") {
          try {
            existingAttachments = JSON.parse(existingAttachments);
          } catch (e) {
            existingAttachments = [existingAttachments];
          }
        }

        if (Array.isArray(existingAttachments)) {
          existingAttachments.forEach((att) => {
            if (typeof att === "string" && att.trim()) {
              attachments.push({
                url: att.trim(),
                originalname: att.split("/").pop() || "document",
                mimetype: att.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image/jpeg",
                size: 0
              });
            } else if (att && typeof att === "object" && att.url) {
              attachments.push({
                url: att.url,
                pathname: att.pathname || "",
                originalname: att.originalname || att.url.split("/").pop() || "document",
                mimetype: att.mimetype || "",
                size: att.size || 0
              });
            }
          });
        }
      }

      const enquiryData = {
        ...req.body,
        specification: req.body.specification || req.body.message || "",
        message: req.body.message || req.body.specification || "",
        attachments
      };

      const enquiry = await enquiryService.createEnquiry(enquiryData);
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
   * Update enquiry status (Admin).
   */
  updateStatus = async (req, res, next) => {
    try {
      const { status } = req.body;
      const enquiry = await enquiryService.updateEnquiryStatus(req.params.id, status);
      return res
        .status(200)
        .json(new ApiResponse(200, enquiry, "Enquiry status updated successfully"));
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

  /**
   * Diagnostic endpoint to test SMTP email delivery directly.
   * Useful to verify credentials on production (e.g. Vercel).
   */
  testEmail = async (req, res, next) => {
    try {
      const target = req.query.to || req.body?.to;
      const result = await enquiryService.sendTestEmail(target);
      return res
        .status(200)
        .json(new ApiResponse(200, result, "Test email sent successfully!"));
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to send test email",
        error: error.message,
        smtpConfigStatus: {
          SMTP_HOST: process.env.SMTP_HOST || "MISSING",
          SMTP_PORT: process.env.SMTP_PORT || "465",
          SMTP_SECURE: process.env.SMTP_SECURE || "true",
          SMTP_USER: process.env.SMTP_USER || "MISSING",
          SMTP_PASS: process.env.SMTP_PASS ? "CONFIGURED (hidden)" : "MISSING",
          RECIPIENT:
            process.env.INQUIRY_NOTIFICATION_EMAIL ||
            process.env.QUOTE_NOTIFICATION_EMAIL ||
            process.env.MAIL_FROM_ADDRESS ||
            "info@sumiraj.com"
        }
      });
    }
  };
}

module.exports = new EnquiryController();
