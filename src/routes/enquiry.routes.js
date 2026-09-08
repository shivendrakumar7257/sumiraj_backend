const express = require("express");
const enquiryController = require("../controllers/enquiry.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");
const validate = require("../middlewares/validate.middleware");
const { createEnquiryRules } = require("../validators/enquiry.validator");

const router = express.Router();

// Public Route: Submit business / quote enquiry (POST /api/enquiry)
router.post("/", createEnquiryRules, validate, enquiryController.create);

// Admin Protected Routes: Retrieve and manage enquiries
router.get("/", authMiddleware, adminMiddleware, enquiryController.getAll);
router.get("/:id", authMiddleware, adminMiddleware, enquiryController.getById);
router.delete("/:id", authMiddleware, adminMiddleware, enquiryController.delete);

module.exports = router;
