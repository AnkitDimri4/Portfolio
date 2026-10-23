const express = require("express");
const cors = require("cors");
const rateLimit = require("./middleware/rateLimit");
const portfolioRoutes = require("./routes/portfolioRoutes");

const app = express();

// Render sits behind a proxy; needed so req.ip is the visitor's IP (rate limiting).
app.set("trust proxy", 1);
// Don't advertise the framework.
app.disable("x-powered-by");

// Basic security headers (JSON API: nothing here is meant to be framed or sniffed). HSTS: Cloudflare and
// Render end TLS, so every request the app sees came over https, and a client that once reached it is
// told to stay there for a year; a browser ignores the header over plain http, so local work is unchanged.
app.use((req, res, next) => {
  res.set({
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Cross-Origin-Resource-Policy": "cross-origin",
    "Strict-Transport-Security": "max-age=31536000",
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
app.set("cors origins", configured.length ? configured : DEFAULT_ORIGINS); // for Site health's check of them (lib/siteHealth.js)

// Every request counts toward one ceiling per visitor, whatever its path (/health, an unknown one, a
// route added later): a safety net under each route's own, lower limit (routes/portfolioRoutes.js).
// After CORS, so a browser can read the 429; before the body is read, so a flood costs little.
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 600,
    message: "Too many requests. Please try again in a minute.",
  })
);

// Razorpay's webhook is signed over its body exactly as it was sent, so that one stays raw
// (controllers/paymentController.js).
app.use("/api/v1/portfolio/payments/razorpay", express.raw({ type: "*/*", limit: "100kb" }));
// Two bodies can run to megabytes: the laptop's whole history of My progress, brought in once (the
// coach's own limit is 16 MB), and the Site health workflow's report (about 80 kB). Their routes read
// them, only once the request has shown it's mine (routes/portfolioRoutes.js), so these pass them by:
// read before that, a few sent at once by anyone could run the API out of memory (one 15 MB body took
// it from 60 MB to 450 MB, and Render's free instance has 512 MB).
const READ_BY_ROUTE = ["/api/v1/portfolio/english/progress/import", "/api/v1/portfolio/site-health"];
const json = (limit) => {
  const read = express.json({ limit });
  return (req, res, next) => (READ_BY_ROUTE.includes(req.originalUrl.split("?")[0]) ? next() : read(req, res, next));
};
// A resume or a draft from the builder can be longer than a contact message (lib/resumes.js caps each field).
app.use(["/api/v1/portfolio/resumes", "/api/v1/portfolio/me/drafts", "/api/v1/portfolio/admin/site-resume"], json("100kb"));
// The English coach online: a Talk conversation can pass 20 KB (the coach's own limit is 64)
app.use("/api/v1/portfolio/english", json("64kb"));
app.use(json("20kb"));

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

// Errors (e.g. malformed JSON bodies, or a handler that failed: middleware/caught.js) → JSON without
// stack traces or file paths. One that fails after answering is only logged.
app.use((err, req, res, next) => {
  if (res.headersSent) {
    console.error(err);
    return next(err);
  }
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({
    success: false,
    message: status === 400 ? "Invalid request body" : status === 413 ? "Request too large" : "Something went wrong",
  });
});

module.exports = app;
