const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true
    },
    shortDescription: {
      type: String,
      required: [true, "Short description is required"],
      trim: true
    },
    content: {
      type: String,
      required: [true, "Content is required"]
    },
    featuredImage: {
      type: String,
      default: ""
    },
    metaTitle: {
      type: String,
      trim: true,
      default: ""
    },
    metaDescription: {
      type: String,
      trim: true,
      default: ""
    },
    author: {
      type: String,
      default: "Admin",
      trim: true
    },
    isPublished: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Index fields for textual search operations
blogSchema.index({ title: "text", shortDescription: "text", content: "text" });

const Blog = mongoose.model("Blog", blogSchema);
module.exports = Blog;
