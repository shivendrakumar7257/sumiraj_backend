const blogService = require("../services/blog.service");
const ApiResponse = require("../utils/ApiResponse");

class BlogController {
  /**
   * Create a new blog post.
   */
  create = async (req, res, next) => {
    try {
      const blog = await blogService.createBlog(req.body);
      return res
        .status(201)
        .json(new ApiResponse(201, blog, "Blog post created successfully"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all blog posts with support for pagination, sorting, text search, and filters.
   */
  getAll = async (req, res, next) => {
    try {
      const { search, isPublished, sortBy, sortOrder, page, limit } = req.query;
      const result = await blogService.getAllBlogs({
        search,
        isPublished,
        sortBy,
        sortOrder,
        page,
        limit
      });
      return res
        .status(200)
        .json(new ApiResponse(200, result, "Blog posts retrieved successfully"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get a single blog post by its unique URL slug.
   */
  getBySlug = async (req, res, next) => {
    try {
      const blog = await blogService.getBlogBySlug(req.params.slug);
      return res
        .status(200)
        .json(new ApiResponse(200, blog, "Blog post retrieved successfully"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update an existing blog post by its ID.
   */
  update = async (req, res, next) => {
    try {
      const blog = await blogService.updateBlog(req.params.id, req.body);
      return res
        .status(200)
        .json(new ApiResponse(200, blog, "Blog post updated successfully"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete a blog post by its ID.
   */
  delete = async (req, res, next) => {
    try {
      await blogService.deleteBlog(req.params.id);
      return res
        .status(200)
        .json(new ApiResponse(200, null, "Blog post deleted successfully"));
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new BlogController();
