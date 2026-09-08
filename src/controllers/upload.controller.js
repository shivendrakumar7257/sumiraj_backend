const storageService = require("../services/storage.service");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

class UploadController {
  /**
   * Upload single image handler.
   */
  uploadSingle = async (req, res, next) => {
    try {
      if (!req.file) {
        throw new ApiError(400, "Validation Failed: Image file is required.");
      }

      const result = await storageService.uploadFile(req.file, "uploads/images");

      // Preserve response property names ("url" top level & nested in "data")
      return res.status(200).json({
        success: true,
        message: "Image uploaded successfully",
        url: result.url,
        data: {
          url: result.url,
          pathname: result.pathname,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Upload multiple images handler.
   */
  uploadMultiple = async (req, res, next) => {
    try {
      if (!req.files || req.files.length === 0) {
        throw new ApiError(400, "Validation Failed: At least one image file is required.");
      }

      const uploadPromises = req.files.map((file) =>
        storageService.uploadFile(file, "uploads/images")
      );
      const results = await Promise.all(uploadPromises);

      const urls = results.map((r) => r.url);

      return res.status(200).json({
        success: true,
        message: "Images uploaded successfully",
        urls: urls,
        data: {
          urls: urls,
          files: results
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete image from storage handler.
   */
  deleteImage = async (req, res, next) => {
    try {
      const { url } = req.body;
      if (!url) {
        throw new ApiError(400, "Validation Failed: Image URL is required for deletion.");
      }

      const deleted = await storageService.deleteFile(url);
      return res.status(200).json(
        new ApiResponse(200, { deleted, url }, "Image deleted successfully")
      );
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new UploadController();
