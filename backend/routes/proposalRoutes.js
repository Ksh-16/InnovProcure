const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
    getProposals,
    getProposalById,
    createProposal
} = require("../controllers/proposalController");


// Get all proposals
router.get(
    "/",
    authenticate,
    getProposals
);


// Get proposal by ID
router.get(
    "/:id",
    authenticate,
    getProposalById
);


// Submit proposal - Startup only
router.post(
    "/",
    authenticate,
    authorize("STARTUP"),
    createProposal
);


module.exports = router;