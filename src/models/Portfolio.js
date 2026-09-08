const mongoose = require("mongoose");

const portfolioSchema = new mongoose.Schema(
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
    category: {
      type: String,
      default: "",
      trim: true
    },
    shortDescription: {
      type: String,
      default: "",
      trim: true
    },
    description: {
      type: String,
      default: "",
      trim: true
    },
    thumbnail: {
      type: String,
      default: "",
      trim: true
    },
    images: {
      type: [String],
      default: []
    },
    clientName: {
      type: String,
      default: "",
      trim: true
    },
    projectUrl: {
      type: String,
      default: "",
      trim: true
    },
    technologies: {
      type: [String],
      default: []
    },
    featured: {
      type: Boolean,
      default: false
    },
    isPublished: {
      type: Boolean,
      default: true
    },
    displayOrder: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Index fields for textual search operations
portfolioSchema.index({ title: "text", category: "text", shortDescription: "text", description: "text" });

const Portfolio = mongoose.model("Portfolio", portfolioSchema);
module.exports = Portfolio;
