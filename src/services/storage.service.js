const { put, del } = require("@vercel/blob");
const fs = require("fs");
const path = require("path");
const ApiError = require("../utils/ApiError");

class StorageService {
  /**
   * Uploads a file buffer to Vercel Blob or local disk storage.
   * @param {Object} file - Multer file object (memoryStorage)
   * @param {string} folder - Target path prefix (e.g. "uploads/images")
   * @returns {Promise<{ url: string, pathname: string }>}
   */
  async uploadFile(file, folder = "uploads/images") {
    if (!file || !file.buffer) {
      throw new ApiError(400, "Validation Failed: No file payload provided.");
    }

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    const sanitizeBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, "");
    const filename = `${sanitizeBase || "file"}-${uniqueSuffix}${ext}`;
    const blobPathname = `${folder}/${filename}`;

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    const isVercel = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";

    // Use Vercel Blob if token is set OR if running in Vercel / Production environment
    if (token || isVercel) {
      if (!token) {
        throw new ApiError(500, "Vercel Blob configuration error: BLOB_READ_WRITE_TOKEN environment variable is not defined.");
      }

      try {
        const blob = await put(blobPathname, file.buffer, {
          access: "public",
          contentType: file.mimetype,
          token: token
        });

        return {
          url: blob.url,
          pathname: blob.pathname
        };
      } catch (error) {
        console.error("Vercel Blob Upload Failed:", error);
        throw new ApiError(500, `Image upload to Vercel Blob failed: ${error.message}`);
      }
    } else {
      // Local development fallback to /public/uploads
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const localFilePath = path.join(uploadDir, filename);
      fs.writeFileSync(localFilePath, file.buffer);

      const localUrl = `/public/uploads/${filename}`;
      return {
        url: localUrl,
        pathname: filename
      };
    }
  }

  /**
   * Deletes an uploaded image from Vercel Blob or local storage.
   * @param {string} fileUrlOrPath - Blob URL or local relative path
   * @returns {Promise<boolean>}
   */
  async deleteFile(fileUrlOrPath) {
    if (!fileUrlOrPath) return false;

    try {
      const token = process.env.BLOB_READ_WRITE_TOKEN;

      if (fileUrlOrPath.includes("blob.vercel-storage.com")) {
        if (token) {
          await del(fileUrlOrPath, { token });
          console.log(`Deleted object from Vercel Blob: ${fileUrlOrPath}`);
          return true;
        } else {
          console.warn("BLOB_READ_WRITE_TOKEN missing. Cannot delete Vercel Blob object:", fileUrlOrPath);
        }
      } else if (fileUrlOrPath.includes("/public/uploads/")) {
        const filename = path.basename(fileUrlOrPath);
        const localPath = path.join(process.cwd(), "public", "uploads", filename);
        if (fs.existsSync(localPath)) {
          fs.unlinkSync(localPath);
          console.log(`Deleted local file: ${localPath}`);
          return true;
        }
      }
    } catch (error) {
      console.warn(`Failed to delete storage file (${fileUrlOrPath}):`, error.message);
    }

    return false;
  }
}

module.exports = new StorageService();
