
const pool = require("../config/db");

// =============================================
// HELPER: VALIDATE ID
// =============================================

const isValidId = (id) => {
    return Number.isInteger(Number(id)) && Number(id) > 0;
};


// =============================================
// GET ALL STARTUPS
// =============================================

const getStartups = async (req, res) => {
    try {
        let query = `
            SELECT *
            FROM startups
        `;

        const values = [];

        // Startups can view only their own profile
        if (req.user.role === "STARTUP") {
            query += ` WHERE user_id = $1`;
            values.push(req.user.id);
        }

        query += ` ORDER BY id DESC`;

        const result = await pool.query(query, values);

        return res.status(200).json({
            success: true,
            count: result.rows.length,
            startups: result.rows
        });

    } catch (error) {
        console.error("Error fetching startups:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch startups"
        });
    }
};


// =============================================
// GET STARTUP BY ID
// =============================================

const getStartupById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid startup ID"
            });
        }

        const result = await pool.query(
            `SELECT * FROM startups WHERE id = $1`,
            [Number(id)]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Startup not found"
            });
        }

        const startup = result.rows[0];

        // A startup user can access only their own profile
        if (
            req.user.role === "STARTUP" &&
            Number(startup.user_id) !== Number(req.user.id)
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to view this startup profile"
            });
        }

        return res.status(200).json({
            success: true,
            startup
        });

    } catch (error) {
        console.error("Error fetching startup:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch startup"
        });
    }
};


module.exports = {
    getStartups,
    getStartupById
};
