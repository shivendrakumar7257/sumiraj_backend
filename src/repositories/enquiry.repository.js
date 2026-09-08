const Enquiry = require("../models/Enquiry");

class EnquiryRepository {
  /**
   * Creates a new business enquiry.
   * @param {Object} enquiryData 
   * @returns {Promise<Object>}
   */
  async create(enquiryData) {
    return Enquiry.create(enquiryData);
  }

  /**
   * Finds an enquiry by ID.
   * @param {string} id 
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    return Enquiry.findById(id).exec();
  }

  /**
   * Deletes an enquiry by ID.
   * @param {string} id 
   * @returns {Promise<Object|null>}
   */
  async delete(id) {
    return Enquiry.findByIdAndDelete(id).exec();
  }

  /**
   * Updates an enquiry status.
   * @param {string} id 
   * @param {string} status 
   * @returns {Promise<Object|null>}
   */
  async updateStatus(id, status) {
    return Enquiry.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).exec();
  }

  /**
   * Finds all enquiries matching query criteria with pagination, search, and sorting.
   * @param {Object} queryParams 
   * @returns {Promise<Object>}
   */
  async findAll({ search, status, sortBy, sortOrder, page = 1, limit = 10 }) {
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === "asc" || sortOrder === "1" ? 1 : -1;
    } else {
      sort.createdAt = -1; // Default: newest first
    }

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (parsedPage - 1) * parsedLimit;

    const total = await Enquiry.countDocuments(filter);
    const data = await Enquiry.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parsedLimit)
      .exec();

    return {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit),
      data
    };
  }
}

module.exports = new EnquiryRepository();
