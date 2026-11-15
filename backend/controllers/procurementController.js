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

        if (!proposal_id || !Number.isInteger(Number(proposal_id)) ||
            Number(proposal_id) <= 0) {
            return res.status(400).json({
                success: false,
                message: "A valid Proposal ID is required"
            });
        }

        if (
            contract_value !== undefined &&
            contract_value !== null &&
            (
                contract_value === "" ||
                !Number.isFinite(Number(contract_value)) ||
                Number(contract_value) < 0
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Contract value must be a valid non-negative number"
            });
        }

        const procurementOfficerId = req.user.id;

        // Check whether procurement already exists
        const existingProcurement = await pool.query(
            `SELECT id FROM procurements WHERE proposal_id = $1`,
            [proposal_id]
        );

        if (existingProcurement.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Procurement already exists for this proposal"
            });
        }

        // Find proposal and startup user
        const proposalResult = await pool.query(
            `SELECT
                p.id,
                p.challenge_id,
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

        const proposal = proposalResult.rows[0];

        // Check that the proposal has been evaluated
        const evaluationResult = await pool.query(
            `SELECT id
             FROM evaluations
             WHERE proposal_id = $1
             LIMIT 1`,
            [proposal_id]
        );

        if (evaluationResult.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Proposal must be evaluated before procurement"
            });
        }

        // Check that every challenge KPI has passed pilot validation
        const validationResult = await pool.query(
            `SELECT
                (SELECT COUNT(*)
                 FROM challenge_kpis
                 WHERE challenge_id = $2) AS total_kpis,

                (SELECT COUNT(DISTINCT kpi_id)
                 FROM pilot_validations
                 WHERE proposal_id = $1) AS validated_kpis,

                (SELECT COUNT(DISTINCT kpi_id)
                 FROM pilot_validations
                 WHERE proposal_id = $1
                 AND status = 'PASSED') AS passed_kpis`,
            [proposal_id, proposal.challenge_id]
        );

        const {
            total_kpis,
            validated_kpis,
            passed_kpis
        } = validationResult.rows[0];

        const total = Number(total_kpis);
        const validated = Number(validated_kpis);
        const passed = Number(passed_kpis);

        if (
            total === 0 ||
            validated !== total ||
            passed !== total
        ) {
            return res.status(400).json({
                success: false,
                message: "All challenge KPIs must pass pilot validation before procurement"
            });
        }

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
                procurementOfficerId,
                contract_number || null,
                contract_value ?? null,
                start_date || null
            ]
        );

        const procurement = result.rows[0];

        // Notify startup
        await pool.query(
            `INSERT INTO notifications
            (user_id, title, message, type)
            VALUES ($1, $2, $3, $4)`,
            [
                proposal.startup_user_id,
                "Procurement Initiated",
                `Procurement has been initiated for your proposal #${proposal_id}. Contract ${procurement.contract_number || "details pending"}.`,
                "PROCUREMENT"
            ]
        );

        // Notify government users
        await pool.query(
            `INSERT INTO notifications
            (user_id, title, message, type)
            SELECT id, $1, $2, $3
            FROM users
            WHERE role = 'GOVERNMENT'`,
            [
                "Procurement Created",
                `Procurement has been created for proposal #${proposal_id}. Contract value: ${procurement.contract_value ?? "Not specified"}.`,
                "PROCUREMENT"
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Procurement created successfully",
            procurement
        });

    } catch (error) {
        console.error("Error creating procurement:", error);

        return res.status(500).json({
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