const mongoose = require("mongoose");

/**
 * Connects to MongoDB database using MONGODB_URI environment variable.
 * Implements connection caching for Vercel serverless execution.
 */
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not set.");
  }

  try {
    const connectionInstance = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected successfully! DB Host: ${connectionInstance.connection.host}`);

    // Setup event listeners for connection monitoring
    if (mongoose.connection.listeners("error").length === 0) {
      mongoose.connection.on("error", (err) => {
        console.error(`MongoDB connection error: ${err}`);
      });
    }

    if (mongoose.connection.listeners("disconnected").length === 0) {
      mongoose.connection.on("disconnected", () => {
        console.warn("MongoDB connection disconnected.");
      });
    }

    return connectionInstance;
  } catch (error) {
    console.error("MongoDB connection FAILED: ", error.message);
    throw error;
  }
};

module.exports = connectDB;
