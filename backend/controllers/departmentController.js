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
            LEFT JOIN users u
                ON gd.user_id = u.id
            ORDER BY gd.id DESC
        `);

        res.json({
            success: true,
            count: result.rows.length,
            departments: result.rows
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
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

        const { id } = req.params;

        const result = await pool.query(`
            SELECT 
                gd.id,
                gd.user_id,
                gd.department_name,
                u.name AS user_name,
                u.email AS user_email
            FROM government_departments gd
            LEFT JOIN users u
                ON gd.user_id = u.id
            WHERE gd.id = $1
        `, [id]);

        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Department not found"
            });
        }

        res.json({
            success: true,
            department: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
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

        if (!department_name || department_name.trim() === "") {

            return res.status(400).json({
                success: false,
                message: "Department name is required"
            });
        }

        const result = await pool.query(
            `
            INSERT INTO government_departments
            (user_id, department_name)
            VALUES ($1, $2)
            RETURNING *
            `,
            [
                req.user.id,
                department_name.trim()
            ]
        );

        res.status(201).json({
            success: true,
            message: "Department created successfully",
            department: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
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

        const { id } = req.params;
        const { department_name } = req.body;

        if (!department_name || department_name.trim() === "") {

            return res.status(400).json({
                success: false,
                message: "Department name is required"
            });
        }

        const result = await pool.query(
            `
            UPDATE government_departments
            SET department_name = $1
            WHERE id = $2
            RETURNING *
            `,
            [
                department_name.trim(),
                id
            ]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Department not found"
            });
        }

        res.json({
            success: true,
            message: "Department updated successfully",
            department: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
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

        const { id } = req.params;

        const result = await pool.query(
            `
            DELETE FROM government_departments
            WHERE id = $1
            RETURNING *
            `,
            [id]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Department not found"
            });
        }

        res.json({
            success: true,
            message: "Department deleted successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
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