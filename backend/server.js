const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const portfolioRoutes = require("./routes/portfolioRoutes");

dotenv.config();

const app = express();

// Render sits behind a proxy; needed so req.ip is the visitor's IP (rate limiting).
app.set("trust proxy", 1);

// Middlewares
app.use(cors());
app.use(express.json({ limit: "20kb" }));

// Routes
app.get("/", (req, res) => {
  res.send("<h1>Welcome to Portfolio Backend</h1>");
});

app.use("/api/v1/portfolio", portfolioRoutes);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
