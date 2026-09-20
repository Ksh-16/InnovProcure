const express = require("express");

const {
    getStartups,
    getStartupById
} = require("../controllers/startupController");

const router = express.Router();


// Get all startups
router.get("/", getStartups);


// Get startup by ID
router.get("/:id", getStartupById);


module.exports = router;