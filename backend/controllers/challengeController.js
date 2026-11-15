const pool = require("../config/db");

// Get all challenges
const getChallenges = async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                c.*,
                gd.department_name
            FROM challenges c
            LEFT JOIN government_departments gd
                ON c.department_id = gd.id
            ORDER BY c.id DESC
        `);

        res.json({
            challenges: result.rows
        });

    } catch (error) {

        console.error("Error fetching challenges:", error);

        res.status(500).json({
            message: "Server error"
        });

    }

};

// Get single challenge
const getChallengeById = async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                c.*,
                gd.department_name
            FROM challenges c
            LEFT JOIN government_departments gd
                ON c.department_id = gd.id
            WHERE c.id = $1
        `, [req.params.id]);

        if (result.rows.length === 0) {

            return res.status(404).json({
                message: "Challenge not found"
            });

        }

        res.json({
            challenge: result.rows[0]
        });

    } catch (error) {

        console.error(
            "Error fetching challenge:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });

    }

};

// Create challenge


const createChallenge = async (req, res) => {
    try {
        const {
            department_id,
            title,
            description,
            requirements,
            category
        } = req.body;

        if (!department_id || !title || !description) {
            return res.status(400).json({
                success: false,
                message: "department_id, title and description are required"
            });
        }

        // Verify that this department belongs to the logged-in government user.
        const department = await pool.query(
            `SELECT id
             FROM government_departments
             WHERE id = $1 AND user_id = $2`,
            [department_id, req.user.id]
        );

        if (department.rows.length === 0) {
            return res.status(403).json({
                success: false,
                message: "You can only create challenges for your own department"
            });
        }

        const result = await pool.query(
            `INSERT INTO challenges
             (department_id, title, description, requirements, category)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [
                department_id,
                title,
                description,
                requirements || null,
                category || null
            ]
        );

        const challenge = result.rows[0];

        // Notify all startup users about the new challenge.
        await pool.query(
            `INSERT INTO notifications (user_id, title, message, type)
             SELECT id, $1, $2, $3
             FROM users
             WHERE role = 'STARTUP'`,
            [
                "New Challenge Available",
                `A new government challenge "${challenge.title}" has been published. Check it out and submit your proposal.`,
                "CHALLENGE"
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Challenge created successfully",
            challenge
        });

    } catch (error) {
        console.error("Error creating challenge:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create challenge"
        });
    }
};

// Update challenge

const updateChallenge = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            department_id,
            title,
            description,
            requirements,
            category
        } = req.body;

        // Find the department owned by the logged-in government user.
        const department = await pool.query(
            `SELECT id
             FROM government_departments
             WHERE user_id = $1`,
            [req.user.id]
        );

        if (department.rows.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Government department not found"
            });
        }

        const ownDepartmentId = department.rows[0].id;

        // Prevent changing the challenge to another department.
        if (
            department_id &&
            Number(department_id) !== Number(ownDepartmentId)
        ) {
            return res.status(403).json({
                success: false,
                message: "You cannot modify another department's challenge"
            });
        }

        const result = await pool.query(
            `UPDATE challenges
             SET title = $1,
                 description = $2,
                 requirements = $3,
                 category = $4
             WHERE id = $5 AND department_id = $6
             RETURNING *`,
            [
                title,
                description,
                requirements || null,
                category || null,
                id,
                ownDepartmentId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Challenge not found in your department"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Challenge updated successfully",
            challenge: result.rows[0]
        });

    } catch (error) {
        console.error("Error updating challenge:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update challenge"
        });
    }
};



// Delete challenge

const deleteChallenge = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM challenges
             WHERE id = $1
             AND department_id IN (
                 SELECT id
                 FROM government_departments
                 WHERE user_id = $2
             )
             RETURNING *`,
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Challenge not found in your department"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Challenge deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting challenge:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete challenge"
        });
    }
};



module.exports = {
    getChallenges,
    getChallengeById,
    createChallenge,
    updateChallenge,
    deleteChallenge
};