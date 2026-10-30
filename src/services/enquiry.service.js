const enquiryRepository = require("../repositories/enquiry.repository");
const mailService = require("./mail.service");
const storageService = require("./storage.service");
const ApiError = require("../utils/ApiError");

class EnquiryService {
  /**
   * Creates a new business enquiry and sends an email notification.
   * @param {Object} enquiryData 
   * @returns {Promise<Object>}
   */
  async createEnquiry(enquiryData) {
    const enquiry = await enquiryRepository.create(enquiryData);

    // CRITICAL: Await on Vercel Serverless so execution doesn't terminate before email sends!
    try {
      await mailService.sendEnquiryNotificationEmail(enquiry);
    } catch (err) {
      console.error("Enquiry notification email failed:", err.message);
    }

    return enquiry;
  }

  /**
   * Sends a test email to verify production SMTP connection.
   * @param {string} [targetEmail]
   */
  async sendTestEmail(targetEmail) {
    return mailService.sendTestEmail(targetEmail);
  }

  /**
   * Retrieves all business enquiries with pagination, sorting, and search.
   * @param {Object} queryParams 
   * @returns {Promise<Object>}
   */
  async getAllEnquiries(queryParams) {
    return enquiryRepository.findAll(queryParams);
  }

  /**
   * Retrieves an enquiry by its ID.
   * @param {string} id 
   * @returns {Promise<Object>}
   */
  async getEnquiryById(id) {
    const enquiry = await enquiryRepository.findById(id);
    if (!enquiry) {
      throw new ApiError(404, "Enquiry not found");
    }
    return enquiry;
  }

  /**
   * Updates an enquiry status.
   * @param {string} id 
   * @param {string} status 
   * @returns {Promise<Object>}
   */
  async updateEnquiryStatus(id, status) {
    const enquiry = await enquiryRepository.findById(id);
    if (!enquiry) {
      throw new ApiError(404, "Enquiry not found");
    }
    return enquiryRepository.updateStatus(id, status);
  }

  /**
   * Deletes an enquiry by ID and cleans up any attached files from storage.
   * @param {string} id 
   * @returns {Promise<Object>}
   */
  async deleteEnquiry(id) {
    const enquiry = await enquiryRepository.findById(id);
    if (!enquiry) {
      throw new ApiError(404, "Enquiry not found");
    }

    // Delete attached files from storage if present
    if (enquiry.attachments && Array.isArray(enquiry.attachments)) {
      for (const att of enquiry.attachments) {
        const fileUrl = typeof att === "string" ? att : att?.url;
        if (fileUrl) {
          await storageService.deleteFile(fileUrl);
        }
      }
    }

    return enquiryRepository.delete(id);
  }
}

module.exports = new EnquiryService();
