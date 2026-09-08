require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/database");
const { verifyTransporter } = require("./config/mail");

// Handle uncaught exceptions immediately (prevent silent crashes)
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! Server is shutting down...");
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

// Connect to Database and start server
connectDB()
  .then(async () => {
    // Verify Mail SMTP connection on startup
    await verifyTransporter();

    const server = app.listen(PORT, () => {
      console.log(`Sumiraj Backend running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
    });

    // Handle unhandled promise rejections gracefully
    process.on("unhandledRejection", (err) => {
      console.error("UNHANDLED REJECTION! Graceful shutdown initiated...");
      console.error(err.name, err.message, err.stack);
      server.close(() => {
        process.exit(1);
      });
    });
  })
  .catch((err) => {
    console.error("Initialization Failed: Database connection could not be established.", err);
    process.exit(1);
  });
