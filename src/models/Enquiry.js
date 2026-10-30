const mongoose = require("mongoose");

const enquiryAttachmentSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true
    },
    pathname: {
      type: String,
      default: "",
      trim: true
    },
    originalname: {
      type: String,
      default: "",
      trim: true
    },
    mimetype: {
      type: String,
      default: "",
      trim: true
    },
    size: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

const enquirySchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      default: "",
      trim: true
    },
    company: {
      type: String,
      default: "",
      trim: true
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true
    },
    // New Project / Inquiry Form fields
    projectLocation: {
      type: String,
      default: "",
      trim: true
    },
    approximateArea: {
      type: String,
      default: "",
      trim: true
    },
    projectType: {
      type: String,
      default: "",
      trim: true
    },
    specification: {
      type: String,
      default: "",
      trim: true
    },
    message: {
      type: String,
      default: "",
      trim: true
    },
    attachments: {
      type: [enquiryAttachmentSchema],
      default: []
    },

    // Legacy fields maintained for backward compatibility
    sourceLocation: {
      type: String,
      default: "",
      trim: true
    },
    destinationLocation: {
      type: String,
      default: "",
      trim: true
    },
    shipmentWeight: {
      type: String,
      default: "",
      trim: true
    },
    enquiryType: {
      type: String,
      default: "",
      trim: true
    },

    status: {
      type: String,
      enum: ["pending", "contacted", "closed"],
      default: "pending"
    }
  },
  {
    timestamps: true
  }
);

// Index fields for textual search operations
enquirySchema.index({
  fullName: "text",
  company: "text",
  email: "text",
  projectLocation: "text",
  projectType: "text",
  specification: "text",
  message: "text"
});

const Enquiry = mongoose.model("Enquiry", enquirySchema);
module.exports = Enquiry;
