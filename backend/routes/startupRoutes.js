
const express = require("express");

const authenticate = require("../middleware/authMiddleware");

const {
    getStartups,
    getStartupById
} = require("../controllers/startupController");

const router = express.Router();

// Get all startups
router.get(
    "/",
    authenticate,
    getStartups
);

// Get startup by ID
router.get(
    "/:id",
    authenticate,
    getStartupById
);

module.exports = router;
