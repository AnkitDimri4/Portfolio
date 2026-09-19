const express = require("express");
const router = express.Router();
const { sendEmailController } = require("../controllers/portfolioController");
const { getLeetcodeStats } = require("../controllers/leetcodeController");
const { getGithubStats } = require("../controllers/githubController");
const rateLimit = require("../middleware/rateLimit");

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many messages. Please try again in a few minutes.",
});

// Contact form route
router.post("/sendEmail", contactLimiter, sendEmailController);
router.get("/leetcode", getLeetcodeStats);
router.get("/github", getGithubStats);

module.exports = router;
