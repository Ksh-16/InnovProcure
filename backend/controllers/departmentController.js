
const pool = require("../config/db");

// ==========================================
// GET ALL DEPARTMENTS
// ==========================================

const getDepartments = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                gd.id,
                gd.user_id,
                gd.department_name,
                u.name AS user_name,
                u.email AS user_email
            FROM government_departments gd
            LEFT JOIN users u ON gd.user_id = u.id
            ORDER BY gd.id DESC
        `);

        return res.json({
            success: true,
            count: result.rows.length,
            departments: result.rows
        });

    } catch (error) {
        console.error("Get departments error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch departments"
        });
    }
};


// ==========================================
// GET DEPARTMENT BY ID
// ==========================================

const getDepartmentById = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid department ID"
            });
        }

        const result = await pool.query(`
            SELECT
                gd.id,
                gd.user_id,
                gd.department_name,
                u.name AS user_name,
                u.email AS user_email
            FROM government_departments gd
            LEFT JOIN users u ON gd.user_id = u.id
            WHERE gd.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Department not found"
            });
        }

        return res.json({
            success: true,
            department: result.rows[0]
        });

    } catch (error) {
        console.error("Get department error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch department"
        });
    }
};


// ==========================================
// CREATE DEPARTMENT
// ==========================================

const createDepartment = async (req, res) => {
    try {
        const { department_name } = req.body;

        if (
            typeof department_name !== "string" ||
            department_name.trim() === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "A valid department name is required"
            });
        }

        const name = department_name.trim();

        const result = await pool.query(
            `
            INSERT INTO government_departments
                (user_id, department_name)
            VALUES ($1, $2)
            RETURNING *
            `,
            [req.user.id, name]
        );

        return res.status(201).json({
            success: true,
            message: "Department created successfully",
            department: result.rows[0]
        });

    } catch (error) {
        console.error("Create department error:", error);

        // Unique constraint: one department per government user
        if (
            error.code === "23505" &&
            error.constraint === "government_departments_user_id_key"
        ) {
            return res.status(409).json({
                success: false,
                message: "A department is already registered for this government account"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to create department"
        });
    }
};


// ==========================================
// UPDATE DEPARTMENT
// ==========================================

const updateDepartment = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { department_name } = req.body;

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid department ID"
            });
        }

        if (
            typeof department_name !== "string" ||
            department_name.trim() === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "A valid department name is required"
            });
        }

        const result = await pool.query(
            `
            UPDATE government_departments
            SET department_name = $1
            WHERE id = $2
              AND user_id = $3
            RETURNING *
            `,
            [
                department_name.trim(),
                id,
                req.user.id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Department not found or you do not have permission to update it"
            });
        }

        return res.json({
            success: true,
            message: "Department updated successfully",
            department: result.rows[0]
        });

    } catch (error) {
        console.error("Update department error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update department"
        });
    }
};


// ==========================================
// DELETE DEPARTMENT
// ==========================================

const deleteDepartment = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid department ID"
            });
        }

        const result = await pool.query(
            `
            DELETE FROM government_departments
            WHERE id = $1
              AND user_id = $2
            RETURNING *
            `,
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Department not found or you do not have permission to delete it"
            });
        }

        return res.json({
            success: true,
            message: "Department deleted successfully"
        });

    } catch (error) {
        console.error("Delete department error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete department"
        });
    }
};


module.exports = {
    getDepartments,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment
};
