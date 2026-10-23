# Sumiraj Backend API

A complete, production-ready, clean MVC architecture backend for **Sumiraj** built with **Node.js**, **Express.js**, and **MongoDB**. 

This project is built using JavaScript (ES6+), following standard SOLID principles, separating concerns using the **Repository Pattern** and **Service Layer**, and implementing comprehensive web security measures.

---

## Folder Structure

```
Sumiraj-backend/
├── public/                 # Static files & uploads directory
│   └── uploads/            # Programmatically managed directory for images
├── src/
│   ├── config/             # Core configurations
│   │   ├── database.js     # MongoDB connection setup
│   │   ├── jwt.js          # JWT secrets and expirations
│   │   └── mail.js         # Nodemailer SMTP transporter
│   ├── controllers/        # Express Route handlers
│   │   ├── auth.controller.js
│   │   ├── blog.controller.js
│   │   ├── dashboard.controller.js
│   │   ├── enquiry.controller.js
│   │   └── portfolio.controller.js
│   ├── middlewares/        # Express request hooks
│   │   ├── admin.middleware.js     # Gates routes for role = admin
│   │   ├── auth.middleware.js      # Verifies Access Token
│   │   ├── error.middleware.js     # Centralized Exception Handler
│   │   ├── multer.middleware.js    # File storage configuration
│   │   └── validate.middleware.js  # Intercepts express-validator results
│   ├── models/             # Mongoose schemas
│   │   ├── Analytics.js
│   │   ├── Blog.js
│   │   ├── Enquiry.js
│   │   ├── Portfolio.js
│   │   └── User.js
│   ├── repositories/       # Mongoose CRUD abstraction
│   │   ├── blog.repository.js
│   │   ├── dashboard.repository.js
│   │   ├── enquiry.repository.js
│   │   ├── portfolio.repository.js
│   │   └── user.repository.js
│   ├── services/           # Core business logic layer
│   │   ├── auth.service.js
│   │   ├── blog.service.js
│   │   ├── dashboard.service.js
│   │   ├── enquiry.service.js
│   │   ├── portfolio.service.js
│   │   └── mail.service.js         # Mail transporter templates & sender
│   ├── utils/              # Application utilities
│   │   ├── ApiError.js     # Structured error class
│   │   ├── ApiResponse.js  # Structured success class
│   │   └── generateTokens.js       # Tokens signing utility
│   ├── validators/         # Input validation schemas
│   │   ├── auth.validator.js
│   │   ├── blog.validator.js
│   │   ├── enquiry.validator.js
│   │   └── portfolio.validator.js
│   ├── routes/             # API Router definitions
│   │   ├── auth.routes.js
│   │   ├── blog.routes.js
│   │   ├── admin.routes.js
│   │   ├── dashboard.routes.js
│   │   ├── enquiry.routes.js
│   │   └── portfolio.routes.js
│   ├── app.js              # Express app bootstrap & middleware mounting
│   └── server.js           # Server runner and connection manager
├── .env                    # Active local environment variables
├── .env.example            # Environment variables template
├── package.json            # Node dependencies and scripts
└── postman_collection.json # Ready-to-import Postman Collection
```

---

## Technology Stack & Security Features

*   **Node.js & Express.js**
*   **MongoDB Atlas & Mongoose**
*   **JWT Authentication**: Implements double token verification (15-day Access Tokens + 15-day Refresh Tokens).
*   **Helmet**: Enforces secure HTTP headers.
*   **CORS**: Confines client access to designated domains.
*   **Morgan**: Console logger for network queries.
*   **Cookie Parser**: Reads cookies securely.
*   **Compression**: Gzip compression for faster network responses.
*   **Rate Limiter**: Mitigates DDoS and brute force request flooding.
*   **Mongo Sanitize**: Sanitizes parameters to prevent NoSQL injection.
*   **XSS Clean**: Deeply sanitizes incoming request payloads utilizing the `xss` library.
*   **Nodemailer**: Email service integrated with HTML templates.
*   **Multer**: Configured with size controls and image filters for file-upload support.

---

## Installation & Local Setup

### 1. Prerequisites
Ensure you have [Node.js (>= 18)](https://nodejs.org) and [MongoDB](https://www.mongodb.com) installed locally (or have a MongoDB Atlas cluster URI).

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Copy `.env.example` to `.env` and fill in your configuration:
```bash
cp .env.example .env
```

Define the configuration variables inside `.env`:
*   `PORT`: Port for the backend server to run (Default: `5000`).
*   `MONGODB_URI`: Local MongoDB or MongoDB Atlas URI string.
*   `JWT_ACCESS_SECRET`: Secret string for signed Access Tokens.
*   `JWT_REFRESH_SECRET`: Secret string for signed Refresh Tokens.
*   `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`: Credentials of your SMTP Server.
*   `MAIL_FROM_NAME`: Sender display name (e.g. `Sumiraj`).
*   `MAIL_FROM_ADDRESS`: Sender email address.
*   `QUOTE_NOTIFICATION_EMAIL`: Recipient email for enquiry notifications.

---

## Run Project

*   **Development Mode**:
    ```bash
    npm run dev
    ```
*   **Production Mode**:
    ```bash
    npm start
    ```

---

## API Documentation

### Response Standard Formatting

*   **Success Response (HTTP 200/201)**:
    ```json
    {
      "success": true,
      "message": "Success description",
      "data": { ... }
    }
    ```
*   **Error Response (HTTP 4xx/5xx)**:
    ```json
    {
      "success": false,
      "message": "Error description message",
      "errors": ["detailed error message 1", "..."]
    }
    ```

### Endpoints List

#### 1. Authentication (`/api/auth`)
*   `POST /signup` - Registers first administrator. Public.
*   `POST /login` - Authenticates administrator. Public.
*   `POST /logout` - Revokes refresh token and clears cookies. Protected.
*   `POST /refresh-token` - Updates Access & Refresh tokens. Public.
*   `GET /profile` - Resolves details of current logged-in admin. Protected.

#### 2. Blog Module (`/api/blog`)
*   `GET /` - Gets all blogs. Supports pagination, full-text search, sorting, isPublished filter. Public.
*   `GET /:slug` - Gets single blog details by its unique URL slug. Public.
*   `POST /` - Creates a blog post (Slug auto-generated from title). Protected (Admin only).
*   `PUT /:id` - Updates a blog post. Protected (Admin only).
*   `DELETE /:id` - Deletes a blog post by object ID. Protected (Admin only).

#### 3. Enquiry Module (`/api/enquiry`)
*   `POST /` - Submits a new business enquiry / quote request. Public.
*   `GET /` - Gets all enquiries. Protected (Admin only).
*   `GET /:id` - Gets single enquiry by ID. Protected (Admin only).
*   `PATCH /:id/status` - Updates enquiry status. Protected (Admin only).
*   `DELETE /:id` - Deletes an enquiry. Protected (Admin only).

#### 4. Portfolio Module (`/api/portfolio`)
*   `GET /` - Gets all portfolio items. Supports search, category, featured, and pagination filters. Public.
*   `GET /:slug` - Gets single portfolio item details by unique URL slug. Public.
*   `POST /` - Creates a new portfolio item (Slug auto-generated from title). Protected (Admin only).
*   `PUT /:id` - Updates a portfolio item. Protected (Admin only).
*   `DELETE /:id` - Deletes a portfolio item. Protected (Admin only).

#### 5. Admin Dashboard Module (`/api/admin/dashboard` & `/api/dashboard`)
*   `GET /api/admin/dashboard` (or `GET /api/dashboard`) - Retrieves comprehensive metrics for the admin dashboard:
    *   **Total Website Visitors** (`totalWebsiteVisitors` / `totalWebsiteVisitor`)
    *   **New Enquiries** (`newEnquiries` / `newEnquires`)
    *   **Quote Requests** (`quoteRequests` / `quoteRequest`)
    *   **Top Performing Page** (`topPerformingPage` / `topPerformingPages`)
    *   **Recent Leads** (`recentLeads` - latest enquiries with contact & shipping details)
    *   **WhatsApp Clicks** (`whatsappClicks` / `whatsappClick`)
    *   Supports optional filtering query parameters: `?timeRange=today|yesterday|week|month|year|all` or `?startDate=...&endDate=...`. Protected (Admin only).
*   `POST /api/dashboard/track` - Public client tracking endpoint to record page views, visitors, and WhatsApp button clicks (`{ "type": "page_view" | "visitor" | "whatsapp_click", "page": "/services" }`). Public.

---

## Vercel Deployment

This Express backend is fully configured for deployment on **Vercel Serverless Functions**.

### Step 1: Push Project to GitHub
1. Initialize Git repository if not done already:
   ```bash
   git init
   git add .
   git commit -m "Convert Express backend for Vercel Serverless deployment"
   ```
2. Create a repository on GitHub and push your code:
   ```bash
   git remote add origin https://github.com/your-username/sumiraj-backend.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Import into Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New** -> **Project**.
3. Import your GitHub repository (`sumiraj-backend`).

### Step 3: Deployment Settings
* **Root Directory**: Select the repository root (`./`).
* **Framework Preset**: Select `Other` (Vercel automatically detects `vercel.json` and `@vercel/node`).
* **Build Command**: Leave empty.
* **Output Directory**: Leave empty.

### Step 4: Environment Variables Configuration
In the Vercel project settings, add the following Environment Variables:

| Variable | Description / Example Value |
| :--- | :--- |
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/sumiraj` |
| `JWT_ACCESS_SECRET` | Strong secret key for signing access tokens |
| `JWT_REFRESH_SECRET` | Strong secret key for signing refresh tokens |
| `BLOB_READ_WRITE_TOKEN` | Token provided by Vercel Blob store |
| `FRONTEND_URL` | `https://your-frontend-domain.com` |
| `CORS_ORIGIN` | `https://your-frontend-domain.com,http://localhost:5173` |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_SECURE` | `false` |
| `SMTP_USER` | `your-email@gmail.com` |
| `SMTP_PASS` | `your-app-password` |
| `MAIL_FROM_NAME` | `Sumiraj` |
| `MAIL_FROM_ADDRESS` | `your-email@gmail.com` |
| `QUOTE_NOTIFICATION_EMAIL` | `admin@your-domain.com` |

### Step 5: Vercel Blob Setup
For image and file uploads in production, Vercel Blob object storage is used:

1. Open your project on the [Vercel Dashboard](https://vercel.com).
2. Go to the **Storage** tab.
3. Click **Create Database / Storage** and select **Blob**.
4. Click **Create** and connect it to your project (`sumiraj-backend`).
5. Vercel will automatically generate and attach the `BLOB_READ_WRITE_TOKEN` environment variable to your project.
6. Redeploy your backend.
7. Test an image upload request (`POST /api/upload/single`).
8. Verify that the returned image URL is a public Vercel Blob URL (e.g. `https://xxxxx.public.blob.vercel-storage.com/...`).

> [!CAUTION]
> Never commit `BLOB_READ_WRITE_TOKEN` to GitHub or expose it to frontend client code. It must remain server-side only.

### Step 6: Deploy & Obtain API URL
Click **Deploy**. Upon completion, Vercel will assign a production URL, such as:
`https://sumiraj-backend.vercel.app`

### Step 7: Test Production API
Verify that the deployment was successful by sending a `GET` request:
```bash
curl https://sumiraj-backend.vercel.app/
```
Expected response:
```json
{
  "success": true,
  "message": "Sumiraj Backend API is running successfully."
}
```

Test an existing route:
```bash
curl https://sumiraj-backend.vercel.app/api/blog
```

### Step 8: Connect Frontend API Base URL
In your React / Next.js / Vue frontend environment configuration (`.env` or `.env.production`), set your backend API base URL:

```env
# React (Vite)
VITE_API_BASE_URL=https://sumiraj-backend.vercel.app/api

# Next.js
NEXT_PUBLIC_API_BASE_URL=https://sumiraj-backend.vercel.app/api
```

---

## Deployment Checklist

- [ ] GitHub repository created
- [ ] `.env` excluded from Git
- [ ] Vercel project created
- [ ] Vercel Blob store connected
- [ ] Environment variables added (`BLOB_READ_WRITE_TOKEN`, `MONGODB_URI`, etc.)
- [ ] Deployment successful
- [ ] Production API URL obtained
- [ ] API endpoint & image upload tested
- [ ] Frontend CORS configured
- [ ] Frontend connected to production API


