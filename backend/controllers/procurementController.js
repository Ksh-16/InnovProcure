const pool = require("../config/db");

// Get all procurements
const getAllProcurements = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM procurements ORDER BY id DESC"
        );

        res.json({
            success: true,
            count: result.rows.length,
            procurements: result.rows
        });
    } catch (error) {
        console.error("Error fetching procurements:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch procurements"
        });
    }
};


// Get procurement by ID
const getProcurementById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "SELECT * FROM procurements WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Procurement not found"
            });
        }

        res.json({
            success: true,
            procurement: result.rows[0]
        });

    } catch (error) {
        console.error("Error fetching procurement:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch procurement"
        });
    }
};


const createProcurement = async (req, res) => {
    try {
        const {
            proposal_id,
            contract_number,
            contract_value,
            start_date
        } = req.body;

        if (!proposal_id) {
            return res.status(400).json({
                success: false,
                message: "Proposal ID is required"
            });
        }

        const procurement_officer_id = req.user.id;

        // Check proposal and find startup's USER id
        const proposalResult = await pool.query(
            `SELECT 
                p.id,
                s.user_id AS startup_user_id
             FROM proposals p
             JOIN startups s ON p.startup_id = s.id
             WHERE p.id = $1`,
            [proposal_id]
        );

        if (proposalResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Proposal not found"
            });
        }

        const startupUserId = proposalResult.rows[0].startup_user_id;

        // Create procurement
        const result = await pool.query(
            `INSERT INTO procurements
            (
                proposal_id,
                procurement_officer_id,
                contract_number,
                contract_value,
                start_date
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [
                proposal_id,
                procurement_officer_id,
                contract_number || null,
                contract_value || null,
                start_date || null
            ]
        );

        const procurement = result.rows[0];

        // Notify startup
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
                startupUserId,
                "Procurement Initiated",
                `Procurement has been initiated for your proposal #${proposal_id}. Contract ${procurement.contract_number || "details pending"}.`,
                "PROCUREMENT"
            ]
        );

        // Find all government users
        const governments = await pool.query(
            `SELECT id
             FROM users
             WHERE role = 'GOVERNMENT'`
        );

        // Notify government users
        for (const government of governments.rows) {
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
                    government.id,
                    "Procurement Created",
                    `Procurement has been created for proposal #${proposal_id}. Contract value: ${procurement.contract_value || "Not specified"}.`,
                    "PROCUREMENT"
                ]
            );
        }

        res.status(201).json({
            success: true,
            message: "Procurement created successfully",
            procurement: procurement
        });

    } catch (error) {
        console.error("Error creating procurement:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create procurement"
        });
    }
};

// Update procurement
const updateProcurement = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            contract_number,
            contract_value,
            start_date
        } = req.body;

        const result = await pool.query(
            `UPDATE procurements
             SET
                contract_number = $1,
                contract_value = $2,
                start_date = $3
             WHERE id = $4
             RETURNING *`,
            [
                contract_number || null,
                contract_value || null,
                start_date || null,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Procurement not found"
            });
        }

        res.json({
            success: true,
            message: "Procurement updated successfully",
            procurement: result.rows[0]
        });

    } catch (error) {
        console.error("Error updating procurement:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update procurement"
        });
    }
};


// Delete procurement
const deleteProcurement = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "DELETE FROM procurements WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Procurement not found"
            });
        }

        res.json({
            success: true,
            message: "Procurement deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting procurement:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete procurement"
        });
    }
};


module.exports = {
    getAllProcurements,
    getProcurementById,
    createProcurement,
    updateProcurement,
    deleteProcurement
};