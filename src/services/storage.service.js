const vercelBlob = require("@vercel/blob");
const fs = require("fs");
const path = require("path");
const ApiError = require("../utils/ApiError");

class StorageService {
  /**
   * Strips accidental wrapping quotes and leading/trailing whitespace
   * from environment variable strings (common when copy-pasting into Vercel).
   * @param {*} val 
   * @returns {string}
   */
  cleanEnv(val) {
    if (!val) return "";
    let s = String(val).trim();
    if (
      (s.startsWith('"') && s.endsWith('"')) ||
      (s.startsWith("'") && s.endsWith("'"))
    ) {
      s = s.slice(1, -1).trim();
    }
    return s;
  }

  /**
   * Retrieves the Vercel Blob read-write token safely.
   * Checks both BLOB_READ_WRITE_TOKEN and VERCEL_BLOB_READ_WRITE_TOKEN.
   * @returns {string}
   */
  getBlobToken() {
    return (
      this.cleanEnv(process.env.BLOB_READ_WRITE_TOKEN) ||
      this.cleanEnv(process.env.VERCEL_BLOB_READ_WRITE_TOKEN) ||
      ""
    );
  }

  /**
   * Unambiguously detects whether execution is occurring in Vercel or any production / serverless environment.
   * On Vercel / AWS Lambda, the local filesystem at /var/task is strictly read-only (EROFS).
   * @returns {boolean}
   */
  isProductionEnvironment() {
    // 1. Direct Vercel environment flags
    const vercel = this.cleanEnv(process.env.VERCEL);
    if (vercel === "1" || vercel.toLowerCase() === "true") return true;

    if (this.cleanEnv(process.env.VERCEL_ENV)) return true;
    if (this.cleanEnv(process.env.VERCEL_URL)) return true;
    if (this.cleanEnv(process.env.VERCEL_REGION)) return true;
    if (this.cleanEnv(process.env.NOW_REGION)) return true;

    // 2. AWS Lambda / Serverless container indicators (Vercel Node functions run on AWS Lambda)
    if (this.cleanEnv(process.env.AWS_LAMBDA_FUNCTION_NAME)) return true;
    if (this.cleanEnv(process.env.LAMBDA_TASK_ROOT)) return true;
    if (this.cleanEnv(process.env.AWS_EXECUTION_ENV)) return true;

    // 3. Current working directory check - /var/task is always the read-only Lambda root
    const cwd = typeof process.cwd === "function" ? process.cwd() : "";
    if (cwd.startsWith("/var/task") || cwd.startsWith("/var/runtime")) return true;

    // 4. Standard NODE_ENV production check
    const nodeEnv = this.cleanEnv(process.env.NODE_ENV).toLowerCase();
    if (nodeEnv === "production") return true;

    // 5. If BLOB_READ_WRITE_TOKEN is explicitly configured, always use Vercel Blob
    if (this.getBlobToken()) return true;

    return false;
  }

  /**
   * Uploads a file buffer to Vercel Blob or local disk storage.
   * In Vercel / Production, files are ALWAYS routed to Vercel Blob storage.
   * Writing to /var/task/public/uploads is strictly prevented to avoid EROFS errors.
   * @param {Object} file - Multer file object (memoryStorage)
   * @param {string} folder - Target path prefix (e.g. "uploads/enquiries")
   * @returns {Promise<{ url: string, pathname: string }>}
   */
  async uploadFile(file, folder = "uploads/images") {
    if (!file || !file.buffer) {
      throw new ApiError(400, "Validation Failed: No file payload provided.");
    }

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    const sanitizeBase = path
      .basename(file.originalname || "file", ext)
      .replace(/[^a-zA-Z0-9-_]/g, "");
    const filename = `${sanitizeBase || "file"}-${uniqueSuffix}${ext}`;
    const blobPathname = `${folder}/${filename}`;

    const isProd = this.isProductionEnvironment();
    const token = this.getBlobToken();

    // 1. Production / Vercel / Serverless OR Token Present -> Vercel Blob Storage
    if (isProd || token) {
      if (!token) {
        throw new ApiError(
          500,
          "Vercel Blob configuration error: BLOB_READ_WRITE_TOKEN environment variable is not defined or is empty in Vercel settings. Please configure BLOB_READ_WRITE_TOKEN in Vercel Project Settings -> Environment Variables to enable file uploads in production."
        );
      }

      try {
        const blob = await vercelBlob.put(blobPathname, file.buffer, {
          access: "public",
          contentType: file.mimetype || "application/octet-stream",
          token: token
        });

        return {
          url: blob.url,
          pathname: blob.pathname
        };
      } catch (error) {
        console.error("Vercel Blob Upload Failed:", error);
        throw new ApiError(500, `File upload to Vercel Blob failed: ${error.message}`);
      }
    }

    // 2. Strict Safeguard: NEVER write to read-only container filesystems (/var/task)
    const cwd = typeof process.cwd === "function" ? process.cwd() : "";
    if (cwd.startsWith("/var/task") || cwd.startsWith("/var/runtime")) {
      throw new ApiError(
        500,
        "Serverless environment detected at /var/task but BLOB_READ_WRITE_TOKEN is missing. Cannot write to read-only filesystem. Please configure BLOB_READ_WRITE_TOKEN in Vercel."
      );
    }

    // 3. Local Development Fallback only -> /public/uploads
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

  /**
   * Deletes an uploaded file from Vercel Blob or local storage.
   * @param {string} fileUrlOrPath - Blob URL or local relative path
   * @returns {Promise<boolean>}
   */
  async deleteFile(fileUrlOrPath) {
    if (!fileUrlOrPath) return false;

    try {
      const token = this.getBlobToken();

      if (
        fileUrlOrPath.includes("blob.vercel-storage.com") ||
        fileUrlOrPath.startsWith("http://") ||
        fileUrlOrPath.startsWith("https://")
      ) {
        if (token) {
          await vercelBlob.del(fileUrlOrPath, { token });
          console.log(`Deleted object from Vercel Blob: ${fileUrlOrPath}`);
          return true;
        } else {
          console.warn(
            "BLOB_READ_WRITE_TOKEN missing. Cannot delete Vercel Blob object:",
            fileUrlOrPath
          );
        }
      } else if (fileUrlOrPath.includes("/public/uploads/")) {
        const cwd = typeof process.cwd === "function" ? process.cwd() : "";
        if (this.isProductionEnvironment() || cwd.startsWith("/var/task")) {
          return false;
        }

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

  /**
   * Diagnostic method to test Vercel Blob connectivity.
   * Uploads and deletes a 2-byte verification payload to verify active read-write credentials.
   * @param {string} [overrideToken]
   * @returns {Promise<Object>}
   */
  async testStorageConnection(overrideToken = "") {
    const isProd = this.isProductionEnvironment();
    const token = this.cleanEnv(overrideToken) || this.getBlobToken();

    if (isProd || token) {
      if (!token) {
        throw new Error(
          "BLOB_READ_WRITE_TOKEN is missing or empty. Please set BLOB_READ_WRITE_TOKEN in Vercel Project Settings -> Environment Variables."
        );
      }

      const testPathname = `health-check/probe-${Date.now()}.txt`;
      const testBuffer = Buffer.from("OK");

      // Attempt live upload to Vercel Blob
      const blob = await vercelBlob.put(testPathname, testBuffer, {
        access: "public",
        contentType: "text/plain",
        token: token
      });

      // Cleanup probe
      try {
        await vercelBlob.del(blob.url, { token });
      } catch (delErr) {
        console.warn("Probe cleanup warning:", delErr.message);
      }

      return {
        status: "connected",
        provider: "vercel-blob",
        verified: true,
        sampleUrl: blob.url,
        message: "Vercel Blob storage is properly configured and operational!"
      };
    }

    // Local disk verification
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    return {
      status: "connected",
      provider: "local-disk",
      verified: true,
      uploadDir,
      message: "Local disk storage is operational for development mode."
    };
  }
}

module.exports = new StorageService();
