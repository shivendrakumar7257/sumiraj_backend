const Blog = require("../models/Blog");

class BlogRepository {
  /**
   * Creates a new blog post.
   * @param {Object} blogData 
   * @returns {Promise<Object>}
   */
  async create(blogData) {
    return Blog.create(blogData);
  }

  /**
   * Finds a blog post by ID.
   * @param {string} id 
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    return Blog.findById(id).exec();
  }

  /**
   * Finds a blog post by its unique URL slug.
   * @param {string} slug 
   * @returns {Promise<Object|null>}
   */
  async findBySlug(slug) {
    return Blog.findOne({ slug }).exec();
  }

  /**
   * Updates an existing blog post.
   * @param {string} id 
   * @param {Object} blogData 
   * @returns {Promise<Object|null>}
   */
  async update(id, blogData) {
    return Blog.findByIdAndUpdate(
      id,
      blogData,
      { new: true, runValidators: true }
    ).exec();
  }

  /**
   * Deletes a blog post by ID.
   * @param {string} id 
   * @returns {Promise<Object|null>}
   */
  async delete(id) {
    return Blog.findByIdAndDelete(id).exec();
  }

  /**
   * Finds all blog posts matching criteria with pagination, search, sorting, and filtering.
   * @param {Object} queryParams
   * @returns {Promise<Object>} paginated response data
   */
  async findAll({ search, isPublished, sortBy, sortOrder, page = 1, limit = 10 }) {
    const filter = {};

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
      sort.createdAt = -1; // Default: newest first
    }

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (parsedPage - 1) * parsedLimit;

    const total = await Blog.countDocuments(filter);
    const data = await Blog.find(filter)
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

module.exports = new BlogRepository();
