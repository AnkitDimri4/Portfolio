const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const portfolioRoutes = require("./routes/portfolioRoutes");

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("<h1>Welcome to Portfolio Backend</h1>");
});

app.use("/api/v1/portfolio", portfolioRoutes);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
