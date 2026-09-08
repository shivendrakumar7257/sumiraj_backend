const blogRepository = require("../repositories/blog.repository");
const ApiError = require("../utils/ApiError");
const storageService = require("./storage.service");
const slugify = require("slugify");

class BlogService {
  /**
   * Creates a new blog post.
   * Auto-generates a URL slug from the title and handles slug duplication.
   * @param {Object} blogData 
   * @returns {Promise<Object>}
   */
  async createBlog(blogData) {
    const baseSlug = this._generateSlug(blogData.title);
    
    // Ensure slug uniqueness
    const existingBlog = await blogRepository.findBySlug(baseSlug);
    if (existingBlog) {
      blogData.slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    } else {
      blogData.slug = baseSlug;
    }

    return blogRepository.create(blogData);
  }

  /**
   * Retrieves all blog posts with sorting, search, pagination, and status filters.
   * @param {Object} queryParams 
   * @returns {Promise<Object>}
   */
  async getAllBlogs(queryParams) {
    return blogRepository.findAll(queryParams);
  }

  /**
   * Retrieves a single blog post by its unique URL slug.
   * @param {string} slug 
   * @returns {Promise<Object>}
   */
  async getBlogBySlug(slug) {
    const blog = await blogRepository.findBySlug(slug);
    if (!blog) {
      throw new ApiError(404, "Blog post not found");
    }
    return blog;
  }

  /**
   * Updates an existing blog post.
   * Regenerates the slug if the title has changed.
   * @param {string} id 
   * @param {Object} blogData 
   * @returns {Promise<Object>}
   */
  async updateBlog(id, blogData) {
    const blog = await blogRepository.findById(id);
    if (!blog) {
      throw new ApiError(404, "Blog post not found");
    }

    // Regenerate slug if title is modified
    if (blogData.title && blogData.title !== blog.title) {
      const baseSlug = this._generateSlug(blogData.title);
      const existingBlog = await blogRepository.findBySlug(baseSlug);
      if (existingBlog && existingBlog._id.toString() !== id) {
        blogData.slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
      } else {
        blogData.slug = baseSlug;
      }
    }

    return blogRepository.update(id, blogData);
  }

  /**
   * Deletes a blog post by its ID.
   * @param {string} id 
   * @returns {Promise<Object>}
   */
  async deleteBlog(id) {
    const blog = await blogRepository.findById(id);
    if (!blog) {
      throw new ApiError(404, "Blog post not found");
    }

    if (blog.featuredImage) {
      await storageService.deleteFile(blog.featuredImage);
    }

    return blogRepository.delete(id);
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

module.exports = new BlogService();
