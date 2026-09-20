const pool = require("../config/db");

// Get all KPIs
const getAllKpis = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM challenge_kpis ORDER BY id DESC"
        );

        res.json({
            success: true,
            count: result.rows.length,
            kpis: result.rows
        });
    } catch (error) {
        console.error("Error fetching KPIs:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch KPIs"
        });
    }
};


// Get KPIs for a specific challenge
const getKpisByChallenge = async (req, res) => {
    try {
        const { challengeId } = req.params;

        const result = await pool.query(
            `SELECT *
             FROM challenge_kpis
             WHERE challenge_id = $1
             ORDER BY id DESC`,
            [challengeId]
        );

        res.json({
            success: true,
            count: result.rows.length,
            kpis: result.rows
        });
    } catch (error) {
        console.error("Error fetching challenge KPIs:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch challenge KPIs"
        });
    }
};


// Get KPI by ID
const getKpiById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "SELECT * FROM challenge_kpis WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "KPI not found"
            });
        }

        res.json({
            success: true,
            kpi: result.rows[0]
        });
    } catch (error) {
        console.error("Error fetching KPI:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch KPI"
        });
    }
};


// Create KPI
const createKpi = async (req, res) => {
    try {
        const {
            challenge_id,
            name,
            description,
            target_value,
            unit
        } = req.body;

        if (!challenge_id || !name) {
            return res.status(400).json({
                success: false,
                message: "Challenge ID and KPI name are required"
            });
        }

        // Verify challenge exists
        const challenge = await pool.query(
            "SELECT id FROM challenges WHERE id = $1",
            [challenge_id]
        );

        if (challenge.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Challenge not found"
            });
        }

        const result = await pool.query(
            `INSERT INTO challenge_kpis
            (
                challenge_id,
                name,
                description,
                target_value,
                unit
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [
                challenge_id,
                name,
                description || null,
                target_value || null,
                unit || null
            ]
        );

        res.status(201).json({
            success: true,
            message: "KPI created successfully",
            kpi: result.rows[0]
        });

    } catch (error) {
        console.error("Error creating KPI:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create KPI"
        });
    }
};


// Update KPI
const updateKpi = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            description,
            target_value,
            unit
        } = req.body;

        const result = await pool.query(
            `UPDATE challenge_kpis
             SET
                name = $1,
                description = $2,
                target_value = $3,
                unit = $4
             WHERE id = $5
             RETURNING *`,
            [
                name,
                description || null,
                target_value || null,
                unit || null,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "KPI not found"
            });
        }

        res.json({
            success: true,
            message: "KPI updated successfully",
            kpi: result.rows[0]
        });

    } catch (error) {
        console.error("Error updating KPI:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update KPI"
        });
    }
};


// Delete KPI
const deleteKpi = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "DELETE FROM challenge_kpis WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "KPI not found"
            });
        }

        res.json({
            success: true,
            message: "KPI deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting KPI:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete KPI"
        });
    }
};


module.exports = {
    getAllKpis,
    getKpisByChallenge,
    getKpiById,
    createKpi,
    updateKpi,
    deleteKpi
};