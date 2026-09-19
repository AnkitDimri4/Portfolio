const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const portfolioRoutes = require("./routes/portfolioRoutes");

dotenv.config();

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

// CORS: set CORS_ORIGIN (comma-separated) to lock the API to the portfolio's domain(s),
// e.g. "https://portfolio-nine-orcin-33.vercel.app,http://localhost:3000".
// Left unset, any origin is allowed (previous behaviour).
const allowed = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
app.use(cors(allowed.length ? { origin: allowed } : undefined));

app.use(express.json({ limit: "20kb" }));

// Routes
app.get("/", (req, res) => {
  res.send("<h1>Welcome to Portfolio Backend</h1>");
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

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
