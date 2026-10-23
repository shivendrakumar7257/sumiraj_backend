const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["visitor", "page_view", "whatsapp_click", "general_event"],
      required: [true, "Analytics event type is required"],
      index: true
    },
    page: {
      type: String,
      default: "/",
      trim: true,
      index: true
    },
    visitorId: {
      type: String,
      default: "",
      trim: true,
      index: true
    },
    ip: {
      type: String,
      default: "",
      trim: true
    },
    userAgent: {
      type: String,
      default: "",
      trim: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for fast metric aggregation
analyticsSchema.index({ type: 1, createdAt: -1 });
analyticsSchema.index({ type: 1, page: 1 });
analyticsSchema.index({ createdAt: -1 });

const Analytics = mongoose.model("Analytics", analyticsSchema);
module.exports = Analytics;
