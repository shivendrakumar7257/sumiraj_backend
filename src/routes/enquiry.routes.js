const express = require("express");
const enquiryController = require("../controllers/enquiry.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");
const validate = require("../middlewares/validate.middleware");
const upload = require("../middlewares/multer.middleware");
const enquiryUpload = upload.enquiryUpload || upload;
const ApiError = require("../utils/ApiError");
const {
  createEnquiryRules,
  updateEnquiryStatusRules
} = require("../validators/enquiry.validator");

const router = express.Router();

/**
 * Flexible middleware: handles multipart/form-data file uploads (if sent)
 * before running express-validator rules. Allows both JSON and multipart/form-data.
 * Enforces maximum 10 files and 10 MB limit per file, restricted to JPG, JPEG, PNG, WEBP, and PDF.
 */
const handleEnquiryUpload = (req, res, next) => {
  const contentType = req.headers["content-type"] || "";
  if (contentType.toLowerCase().includes("multipart/form-data")) {
    return enquiryUpload.any()(req, res, (err) => {
      if (err) {
        if (err.name === "MulterError") {
          if (err.code === "LIMIT_FILE_SIZE") {
            return next(
              new ApiError(400, "Validation Failed: File size exceeds the 10 MB limit per file.")
            );
          }
          if (err.code === "LIMIT_FILE_COUNT" || err.code === "LIMIT_UNEXPECTED_FILE") {
            return next(
              new ApiError(400, "Validation Failed: Too many files uploaded. Maximum 10 files allowed.")
            );
          }
          return next(new ApiError(400, `Upload error: ${err.message}`));
        }
        return next(new ApiError(400, err.message));
      }

      if (req.files && req.files.length > 10) {
        return next(
          new ApiError(400, "Validation Failed: Too many files uploaded. Maximum 10 files allowed.")
        );
      }

      next();
    });
  }
  next();
};

// Public Route: Submit business / quote enquiry (POST /api/enquiry)
router.post(
  "/",
  handleEnquiryUpload,
  createEnquiryRules,
  validate,
  enquiryController.create
);

// Diagnostic route: Test email connection (Public / Debugging)
router.get("/test-email", enquiryController.testEmail);
router.post("/test-email", enquiryController.testEmail);

// Diagnostic route: Test storage / Vercel Blob connection (Public / Debugging)
router.get("/test-storage", enquiryController.testStorage);
router.post("/test-storage", enquiryController.testStorage);

// Admin Protected Routes: Retrieve and manage enquiries
router.get("/", authMiddleware, adminMiddleware, enquiryController.getAll);
router.get("/:id", authMiddleware, adminMiddleware, enquiryController.getById);
router.get(
  "/:id/attachments/:filename",
  authMiddleware,
  adminMiddleware,
  enquiryController.downloadAttachment
);
router.get(
  "/:id/attachments",
  authMiddleware,
  adminMiddleware,
  enquiryController.downloadAttachment
);
router.patch(
  "/:id/status",
  authMiddleware,
  adminMiddleware,
  updateEnquiryStatusRules,
  validate,
  enquiryController.updateStatus
);
router.put(
  "/:id/status",
  authMiddleware,
  adminMiddleware,
  updateEnquiryStatusRules,
  validate,
  enquiryController.updateStatus
);
router.delete("/:id", authMiddleware, adminMiddleware, enquiryController.delete);

module.exports = router;
