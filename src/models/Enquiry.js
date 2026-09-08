const mongoose = require("mongoose");

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
    message: {
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
enquirySchema.index({ fullName: "text", company: "text", email: "text", message: "text" });

const Enquiry = mongoose.model("Enquiry", enquirySchema);
module.exports = Enquiry;
