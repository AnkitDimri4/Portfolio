const express = require("express");
const router = express.Router();
const { sendEmailController } = require("../controllers/portfolioController");

// Contact form route
router.post("/sendEmail", sendEmailController);

module.exports = router;
