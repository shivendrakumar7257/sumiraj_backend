const multer = require("multer");
const path = require("path");

// Use memoryStorage for Vercel Serverless Function compatibility
const storage = multer.memoryStorage();

// Allowed file extensions and MIME types for Enquiry Form attachments (JPG, JPEG, PNG, WEBP, PDF)
const ALLOWED_ENQUIRY_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];
const ALLOWED_ENQUIRY_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/pjpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/x-pdf"
];

// Validate allowed file types for Enquiry Form attachments
const enquiryFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || "").toLowerCase();
  const mime = (file.mimetype || "").toLowerCase();

  const isExtAllowed = ALLOWED_ENQUIRY_EXTENSIONS.includes(ext);
  const isMimeAllowed = ALLOWED_ENQUIRY_MIME_TYPES.includes(mime);

  if (isExtAllowed && isMimeAllowed) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Validation Failed: Invalid file format. Only JPG, JPEG, PNG, WEBP, and PDF files are allowed."
      ),
      false
    );
  }
};

// Multer upload middleware configuration for Enquiry Form attachments:
// Maximum 10 MB per file, maximum 10 files
const enquiryUpload = multer({
  storage: storage,
  fileFilter: enquiryFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB maximum limit per file
    files: 10 // Maximum 10 files
  }
});

// General allowed file types (Images: JPG, JPEG, PNG, WEBP, GIF, SVG; Documents: PDF) for generic upload routes
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

  if (allowedMimeTypes.includes((file.mimetype || "").toLowerCase())) {
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

// Generic upload middleware configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB maximum limit per file
  }
});

upload.enquiryUpload = enquiryUpload;
upload.ALLOWED_ENQUIRY_EXTENSIONS = ALLOWED_ENQUIRY_EXTENSIONS;
upload.ALLOWED_ENQUIRY_MIME_TYPES = ALLOWED_ENQUIRY_MIME_TYPES;

module.exports = upload;
module.exports.enquiryUpload = enquiryUpload;
module.exports.ALLOWED_ENQUIRY_EXTENSIONS = ALLOWED_ENQUIRY_EXTENSIONS;
module.exports.ALLOWED_ENQUIRY_MIME_TYPES = ALLOWED_ENQUIRY_MIME_TYPES;
