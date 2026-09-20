const express = require("express");

const {
    getDepartments,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment
} = require("../controllers/departmentController");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();


// ==========================================
// GET
// ==========================================

router.get(
    "/",
    authenticate,
    getDepartments
);

router.get(
    "/:id",
    authenticate,
    getDepartmentById
);


// ==========================================
// CREATE
// ==========================================

router.post(
    "/",
    authenticate,
    authorize("GOVERNMENT"),
    createDepartment
);


// ==========================================
// UPDATE
// ==========================================

router.put(
    "/:id",
    authenticate,
    authorize("GOVERNMENT"),
    updateDepartment
);


// ==========================================
// DELETE
// ==========================================

router.delete(
    "/:id",
    authenticate,
    authorize("GOVERNMENT"),
    deleteDepartment
);


module.exports = router;