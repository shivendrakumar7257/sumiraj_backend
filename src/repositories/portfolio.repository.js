const Portfolio = require("../models/Portfolio");

class PortfolioRepository {
  /**
   * Creates a new portfolio item.
   * @param {Object} portfolioData 
   * @returns {Promise<Object>}
   */
  async create(portfolioData) {
    return Portfolio.create(portfolioData);
  }

  /**
   * Finds a portfolio item by ID.
   * @param {string} id 
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    return Portfolio.findById(id).exec();
  }

  /**
   * Finds a portfolio item by its unique URL slug.
   * @param {string} slug 
   * @returns {Promise<Object|null>}
   */
  async findBySlug(slug) {
    return Portfolio.findOne({ slug }).exec();
  }

  /**
   * Updates an existing portfolio item.
   * @param {string} id 
   * @param {Object} portfolioData 
   * @returns {Promise<Object|null>}
   */
  async update(id, portfolioData) {
    return Portfolio.findByIdAndUpdate(
      id,
      portfolioData,
      { new: true, runValidators: true }
    ).exec();
  }

  /**
   * Deletes a portfolio item by ID.
   * @param {string} id 
   * @returns {Promise<Object|null>}
   */
  async delete(id) {
    return Portfolio.findByIdAndDelete(id).exec();
  }

  /**
   * Finds all portfolio items matching criteria with pagination, search, sorting, and filtering.
   * @param {Object} queryParams
   * @returns {Promise<Object>} paginated response data
   */
  async findAll({ search, category, featured, isPublished, sortBy, sortOrder, page = 1, limit = 10 }) {
    const filter = {};

    // Apply filtering by category
    if (category) {
      filter.category = category;
    }

    // Apply filtering by featured status
    if (featured !== undefined) {
      filter.featured = featured === "true" || featured === true;
    }

    // Apply filtering by publication status
    if (isPublished !== undefined) {
      filter.isPublished = isPublished === "true" || isPublished === true;
    }

    // Apply search query utilizing text index
    if (search) {
      filter.$text = { $search: search };
    }

    // Prepare sorting options
    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === "asc" || sortOrder === "1" ? 1 : -1;
    } else {
      sort.displayOrder = 1;
      sort.createdAt = -1; // Default: lower display order first, then newest
    }

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (parsedPage - 1) * parsedLimit;

    const total = await Portfolio.countDocuments(filter);
    const data = await Portfolio.find(filter)
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

module.exports = new PortfolioRepository();
