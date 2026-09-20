const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
    getAllProcurements,
    getProcurementById,
    createProcurement,
    updateProcurement,
    deleteProcurement
} = require("../controllers/procurementController");


// Get all procurements
router.get(
    "/",
    authenticate,
    getAllProcurements
);


// Get procurement by ID
router.get(
    "/:id",
    authenticate,
    getProcurementById
);


// Create procurement
router.post(
    "/",
    authenticate,
    authorize("PROCUREMENT_OFFICER"),
    createProcurement
);


// Update procurement
router.put(
    "/:id",
    authenticate,
    authorize("PROCUREMENT_OFFICER"),
    updateProcurement
);


// Delete procurement
router.delete(
    "/:id",
    authenticate,
    authorize("PROCUREMENT_OFFICER"),
    deleteProcurement
);


module.exports = router;