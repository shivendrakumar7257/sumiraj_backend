const express = require("express");
const enquiryController = require("../controllers/enquiry.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");
const validate = require("../middlewares/validate.middleware");
const upload = require("../middlewares/multer.middleware");
const ApiError = require("../utils/ApiError");
const {
  createEnquiryRules,
  updateEnquiryStatusRules
} = require("../validators/enquiry.validator");

const router = express.Router();

/**
 * Flexible middleware: handles multipart/form-data file uploads (if sent)
 * before running express-validator rules. Allows both JSON and multipart/form-data.
 */
const handleEnquiryUpload = (req, res, next) => {
  const contentType = req.headers["content-type"] || "";
  if (contentType.toLowerCase().includes("multipart/form-data")) {
    return upload.any()(req, res, (err) => {
      if (err) {
        if (err.name === "MulterError") {
          if (err.code === "LIMIT_FILE_SIZE") {
            return next(
              new ApiError(400, "Validation Failed: File size exceeds the 10 MB limit per file.")
            );
          }
          if (err.code === "LIMIT_FILE_COUNT") {
            return next(
              new ApiError(400, "Validation Failed: Too many files uploaded. Maximum 10 files allowed.")
            );
          }
          return next(new ApiError(400, `Upload error: ${err.message}`));
        }
        return next(new ApiError(400, err.message));
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

// Admin Protected Routes: Retrieve and manage enquiries
router.get("/", authMiddleware, adminMiddleware, enquiryController.getAll);
router.get("/:id", authMiddleware, adminMiddleware, enquiryController.getById);
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
