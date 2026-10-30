const multer = require("multer");

// Use memoryStorage for Vercel Serverless Function compatibility
const storage = multer.memoryStorage();

// Validate allowed file types (Images: JPG, JPEG, PNG, WEBP, GIF, SVG; Documents: PDF)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
    "application/pdf"
  ];

  if (allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Validation Failed: Invalid file format. Only JPG, JPEG, PNG, WEBP, GIF, SVG, and PDF files are allowed."
      ),
      false
    );
  }
};

// Multer upload middleware configuration (10 MB max size per file as specified in inquiry form)
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB maximum limit per file
  }
});

module.exports = upload;
