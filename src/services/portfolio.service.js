const portfolioRepository = require("../repositories/portfolio.repository");
const ApiError = require("../utils/ApiError");
const storageService = require("./storage.service");
const slugify = require("slugify");

class PortfolioService {
  /**
   * Creates a new portfolio item.
   * Auto-generates a URL slug from the title and handles slug duplication.
   * @param {Object} portfolioData 
   * @returns {Promise<Object>}
   */
  async createPortfolio(portfolioData) {
    const baseSlug = this._generateSlug(portfolioData.title);
    
    // Ensure slug uniqueness
    const existingPortfolio = await portfolioRepository.findBySlug(baseSlug);
    if (existingPortfolio) {
      portfolioData.slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    } else {
      portfolioData.slug = baseSlug;
    }

    return portfolioRepository.create(portfolioData);
  }

  /**
   * Retrieves all portfolio items with sorting, search, pagination, and status filters.
   * @param {Object} queryParams 
   * @returns {Promise<Object>}
   */
  async getAllPortfolios(queryParams) {
    return portfolioRepository.findAll(queryParams);
  }

  /**
   * Retrieves a single portfolio item by its unique URL slug.
   * @param {string} slug 
   * @returns {Promise<Object>}
   */
  async getPortfolioBySlug(slug) {
    const portfolio = await portfolioRepository.findBySlug(slug);
    if (!portfolio) {
      throw new ApiError(404, "Portfolio project not found");
    }
    return portfolio;
  }

  /**
   * Updates an existing portfolio item.
   * Regenerates the slug if the title has changed.
   * @param {string} id 
   * @param {Object} portfolioData 
   * @returns {Promise<Object>}
   */
  async updatePortfolio(id, portfolioData) {
    const portfolio = await portfolioRepository.findById(id);
    if (!portfolio) {
      throw new ApiError(404, "Portfolio project not found");
    }

    // Regenerate slug if title is modified
    if (portfolioData.title && portfolioData.title !== portfolio.title) {
      const baseSlug = this._generateSlug(portfolioData.title);
      const existingPortfolio = await portfolioRepository.findBySlug(baseSlug);
      if (existingPortfolio && existingPortfolio._id.toString() !== id) {
        portfolioData.slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
      } else {
        portfolioData.slug = baseSlug;
      }
    }

    return portfolioRepository.update(id, portfolioData);
  }

  /**
   * Deletes a portfolio item by its ID.
   * @param {string} id 
   * @returns {Promise<Object>}
   */
  async deletePortfolio(id) {
    const portfolio = await portfolioRepository.findById(id);
    if (!portfolio) {
      throw new ApiError(404, "Portfolio project not found");
    }

    if (portfolio.thumbnail) {
      await storageService.deleteFile(portfolio.thumbnail);
    }

    if (portfolio.images && Array.isArray(portfolio.images)) {
      for (const imgUrl of portfolio.images) {
        await storageService.deleteFile(imgUrl);
      }
    }

    return portfolioRepository.delete(id);
  }

  /**
   * Generates a web-safe lowercase slug from a string.
   * @param {string} title 
   * @returns {string} slug
   * @private
   */
  _generateSlug(title) {
    return slugify(title, {
      lower: true,
      strict: true,
      trim: true
    });
  }
}

module.exports = new PortfolioService();
