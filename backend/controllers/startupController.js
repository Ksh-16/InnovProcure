const pool = require("../config/db");

// Get all startups
const getStartups = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM startups ORDER BY id DESC"
        );

        res.status(200).json({
            success: true,
            count: result.rows.length,
            startups: result.rows
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch startups"
        });
    }
};


// Get startup by ID
const getStartupById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "SELECT * FROM startups WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Startup not found"
            });
        }

        res.status(200).json({
            success: true,
            startup: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch startup"
        });
    }
};


module.exports = {
    getStartups,
    getStartupById
};