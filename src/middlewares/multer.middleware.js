const multer = require("multer");

// Use memoryStorage for Vercel Serverless Function compatibility
const storage = multer.memoryStorage();

// Validate image file types
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml"
  ];

  if (allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error("Validation Failed: Only valid image files (JPEG, PNG, WEBP, GIF, SVG) are allowed."), false);
  }
};

// Multer upload middleware configuration (5 MB max size)
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB maximum limit
  }
});

module.exports = upload;
