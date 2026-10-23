const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss");
const path = require("path");

const authRouter = require("./routes/auth.routes");
const blogRouter = require("./routes/blog.routes");
const enquiryRouter = require("./routes/enquiry.routes");
const portfolioRouter = require("./routes/portfolio.routes");
const uploadRouter = require("./routes/upload.routes");
const dashboardRouter = require("./routes/dashboard.routes");
const adminRouter = require("./routes/admin.routes");

const connectDB = require("./config/database");

const errorHandler = require("./middlewares/error.middleware");
const ApiError = require("./utils/ApiError");

const app = express();

// Helmet for security headers protection
app.use(helmet());

// CORS configuration (enabling credentials support for explicit production and local origins)
const defaultAllowedOrigins = [
  "https://sumiraj.com",
  "https://www.sumiraj.com",
  "http://localhost:5173",
  "http://localhost:3000"
];

const parseOrigins = (envVar) =>
  envVar
    ? envVar
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    : [];

const envOrigins = parseOrigins(process.env.CORS_ORIGIN);
const frontendOrigins = parseOrigins(process.env.FRONTEND_URL);

const allowedOrigins = [
  ...new Set([...defaultAllowedOrigins, ...envOrigins, ...frontendOrigins])
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);

      // Normalize origin by stripping trailing slash for comparison
      const normalizedOrigin = origin.replace(/\/+$/, "");
      const isAllowed = allowedOrigins.some((allowed) => {
        const normalizedAllowed = allowed.replace(/\/+$/, "");
        return normalizedAllowed === normalizedOrigin;
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
  })
);

// Logging request middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Request parsers with size limit controls (10mb to allow base64 images in payloads)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Response body compression
app.use(compression());

// Prevent NoSQL parameter query injection
app.use(mongoSanitize());

// Custom XSS Sanitizer middleware utilizing "xss" package
const xssClean = (req, res, next) => {
  const sanitize = (data) => {
    if (typeof data === "string") {
      return xss(data);
    }
    if (Array.isArray(data)) {
      return data.map(sanitize);
    }
    if (typeof data === "object" && data !== null) {
      const clean = {};
      for (const key in data) {
        clean[key] = sanitize(data[key]);
      }
      return clean;
    }
    return data;
  };

  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);

  next();
};
app.use(xssClean);

// Express rate limiter to protect public endpoints
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // Limit each IP to 150 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP address, please try again after 15 minutes.",
    errors: ["Rate limit exceeded"]
  }
});
app.use("/api", limiter);

// Serverless-safe Database connection middleware
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

// Root route health / welcome check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Sumiraj Backend API is running successfully."
  });
});

// Serve uploads as static resources
app.use("/public", express.static(path.join(process.cwd(), "public")));

// Route bindings
app.use("/api/auth", authRouter);
app.use("/api/blog", blogRouter);
app.use("/api/enquiry", enquiryRouter);
app.use("/api/portfolio", portfolioRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/admin", adminRouter);
app.use("/api/dashboard", dashboardRouter);

// Undefined API routes handler
app.all("*", (req, res, next) => {
  next(new ApiError(404, `Can't find ${req.originalUrl} on this server`));
});

// Centralized error handler mounting
app.use(errorHandler);

module.exports = app;
