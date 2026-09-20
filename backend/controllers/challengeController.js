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

        // Create the challenge
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

        // Find all startup users
        const startups = await pool.query(
            `SELECT id
             FROM users
             WHERE role = 'STARTUP'`
        );

        // Create a notification for every startup
        for (const startup of startups.rows) {

            await pool.query(
                `INSERT INTO notifications
                (
                    user_id,
                    title,
                    message,
                    type
                )
                VALUES ($1, $2, $3, $4)`,
                [
                    startup.id,
                    "New Challenge Available",
                    `A new government challenge "${challenge.title}" has been published. Check it out and submit your proposal.`,
                    "CHALLENGE"
                ]
            );

        }

        res.status(201).json({
            success: true,
            message: "Challenge created successfully",
            challenge: challenge
        });

    } catch (error) {
        console.error("Error creating challenge:", error);

        res.status(500).json({
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

        const result = await pool.query(
            `UPDATE challenges
             SET department_id = $1,
                 title = $2,
                 description = $3,
                 requirements = $4,
                 category = $5
             WHERE id = $6
             RETURNING *`,
            [
                department_id,
                title,
                description,
                requirements,
                category,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Challenge not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Challenge updated successfully",
            challenge: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
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
            "DELETE FROM challenges WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Challenge not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Challenge deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
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