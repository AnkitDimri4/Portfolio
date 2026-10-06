const express = require("express");
const cors = require("cors");
const portfolioRoutes = require("./routes/portfolioRoutes");

const app = express();

// Render sits behind a proxy; needed so req.ip is the visitor's IP (rate limiting).
app.set("trust proxy", 1);
// Don't advertise the framework.
app.disable("x-powered-by");

// Basic security headers (JSON API: nothing here is meant to be framed or sniffed).
app.use((req, res, next) => {
  res.set({
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Cross-Origin-Resource-Policy": "cross-origin",
  });
  next();
});

// CORS allow-list. CORS_ORIGIN (comma-separated) overrides the defaults below:
// the production site, its Vercel team/preview/branch URLs and local development.
const DEFAULT_ORIGINS = [
  "https://portfolio-nine-orcin-33.vercel.app",
  /^https:\/\/portfolio(-[a-z0-9-]+)?-ankit-dimris-projects\.vercel\.app$/,
  "http://localhost:3000",
  "http://localhost:5173",
];
const configured = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
app.use(cors({ origin: configured.length ? configured : DEFAULT_ORIGINS }));

app.use(express.json({ limit: "20kb" }));

// Routes
app.get("/", (req, res) => {
  res.send("<h1>Welcome to Portfolio Backend</h1>");
});

// Lightweight liveness check for uptime monitors / Render health checks.
app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: Math.round(process.uptime()) });
});

app.use("/api/v1/portfolio", portfolioRoutes);

// Unknown routes → JSON 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Not found" });
});

// Errors (e.g. malformed JSON bodies) → JSON without stack traces or file paths
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({
    success: false,
    message: status === 400 ? "Invalid request body" : status === 413 ? "Request too large" : "Something went wrong",
  });
});

module.exports = app;
