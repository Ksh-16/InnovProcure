const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
    getAllKpis,
    getKpisByChallenge,
    getKpiById,
    createKpi,
    updateKpi,
    deleteKpi
} = require("../controllers/kpiController");


// Get all KPIs
router.get(
    "/",
    authenticate,
    getAllKpis
);


// Get KPIs for a challenge
router.get(
    "/challenge/:challengeId",
    authenticate,
    getKpisByChallenge
);


// Get KPI by ID
router.get(
    "/:id",
    authenticate,
    getKpiById
);


// Create KPI
router.post(
    "/",
    authenticate,
    authorize("GOVERNMENT"),
    createKpi
);


// Update KPI
router.put(
    "/:id",
    authenticate,
    authorize("GOVERNMENT"),
    updateKpi
);


// Delete KPI
router.delete(
    "/:id",
    authenticate,
    authorize("GOVERNMENT"),
    deleteKpi
);


module.exports = router;