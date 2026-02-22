const express = require("express");
const router = express.Router();
const { sendEmailController } = require("../controllers/portfolioController");
const { getLeetcodeStats } = require("../controllers/leetcodeController");

// Contact form route
router.post("/sendEmail", sendEmailController);
router.get("/leetcode", getLeetcodeStats);

module.exports = router;
