const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
    getAllEvaluations,
    getEvaluationById,
    createEvaluation,
    updateEvaluation
} = require("../controllers/evaluationController");


// Get all evaluations
router.get(
    "/",
    authenticate,
    getAllEvaluations
);


// Get evaluation by ID
router.get(
    "/:id",
    authenticate,
    getEvaluationById
);


// Create evaluation
router.post(
    "/",
    authenticate,
    authorize("EVALUATOR"),
    createEvaluation
);


// Update evaluation
router.put(
    "/:id",
    authenticate,
    authorize("EVALUATOR"),
    updateEvaluation
);


module.exports = router;