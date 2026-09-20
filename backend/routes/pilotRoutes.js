const express = require("express");

const {
    getPilotValidations,
    getPilotValidationsByProposal,
    createPilotValidation,
    updatePilotValidation,
    deletePilotValidation
} = require("../controllers/pilotController");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();


// =============================================
// GET ALL PILOT VALIDATIONS
// =============================================

router.get(
    "/",
    authenticate,
    getPilotValidations
);


// =============================================
// GET PILOT VALIDATIONS FOR A PROPOSAL
// =============================================

router.get(
    "/proposal/:proposalId",
    authenticate,
    getPilotValidationsByProposal
);


// =============================================
// CREATE PILOT VALIDATION
// GOVERNMENT ONLY
// =============================================

router.post(
    "/",
    authenticate,
    authorize("GOVERNMENT"),
    createPilotValidation
);


// =============================================
// UPDATE PILOT VALIDATION
// GOVERNMENT ONLY
// =============================================

router.put(
    "/:id",
    authenticate,
    authorize("GOVERNMENT"),
    updatePilotValidation
);


// =============================================
// DELETE PILOT VALIDATION
// GOVERNMENT ONLY
// =============================================

router.delete(
    "/:id",
    authenticate,
    authorize("GOVERNMENT"),
    deletePilotValidation
);


module.exports = router;