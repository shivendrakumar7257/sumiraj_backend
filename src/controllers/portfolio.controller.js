const portfolioService = require("../services/portfolio.service");
const ApiResponse = require("../utils/ApiResponse");

class PortfolioController {
  /**
   * Create a new portfolio item.
   */
  create = async (req, res, next) => {
    try {
      const portfolio = await portfolioService.createPortfolio(req.body);
      return res
        .status(201)
        .json(new ApiResponse(201, portfolio, "Portfolio item created successfully"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all portfolio items with support for pagination, sorting, text search, and filters.
   */
  getAll = async (req, res, next) => {
    try {
      const { search, category, featured, isPublished, sortBy, sortOrder, page, limit } = req.query;
      const result = await portfolioService.getAllPortfolios({
        search,
        category,
        featured,
        isPublished,
        sortBy,
        sortOrder,
        page,
        limit
      });
      return res
        .status(200)
        .json(new ApiResponse(200, result, "Portfolio items retrieved successfully"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get a single portfolio item by its unique URL slug.
   */
  getBySlug = async (req, res, next) => {
    try {
      const portfolio = await portfolioService.getPortfolioBySlug(req.params.slug);
      return res
        .status(200)
        .json(new ApiResponse(200, portfolio, "Portfolio item retrieved successfully"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update an existing portfolio item by its ID.
   */
  update = async (req, res, next) => {
    try {
      const portfolio = await portfolioService.updatePortfolio(req.params.id, req.body);
      return res
        .status(200)
        .json(new ApiResponse(200, portfolio, "Portfolio item updated successfully"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete a portfolio item by its ID.
   */
  delete = async (req, res, next) => {
    try {
      await portfolioService.deletePortfolio(req.params.id);
      return res
        .status(200)
        .json(new ApiResponse(200, null, "Portfolio item deleted successfully"));
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new PortfolioController();
