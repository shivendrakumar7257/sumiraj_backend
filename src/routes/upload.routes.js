const express = require("express");
const uploadController = require("../controllers/upload.controller");
const upload = require("../middlewares/multer.middleware");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// Protected upload routes (Admin / Auth token required)
router.post("/single", authMiddleware, upload.single("image"), uploadController.uploadSingle);
router.post("/multiple", authMiddleware, upload.array("images", 10), uploadController.uploadMultiple);
router.post("/", authMiddleware, upload.single("file"), uploadController.uploadSingle);
router.delete("/", authMiddleware, uploadController.deleteImage);

module.exports = router;
