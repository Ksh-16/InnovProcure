
const pool = require("../config/db");

// =============================================
// HELPER: VALIDATE NUMERIC ACTUAL VALUE
// =============================================

const validateActualValue = (value) => {
    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return { valid: true, value: null };
    }

    if (
        typeof value === "boolean" ||
        !Number.isFinite(Number(value))
    ) {
        return { valid: false, value: null };
    }

    return {
        valid: true,
        value: Number(value)
    };
};


// =============================================
// GET ALL PILOT VALIDATIONS
// =============================================

const getPilotValidations = async (req, res) => {
    try {
        let query = `
            SELECT
                pv.*,
                p.title AS proposal_title,
                p.challenge_id,
                p.startup_id,
                k.name AS kpi_name,
                k.description AS kpi_description,
                k.target_value,
                k.unit,
                u.name AS validator_name
            FROM pilot_validations pv
            JOIN proposals p ON pv.proposal_id = p.id
            JOIN startups s ON p.startup_id = s.id
            JOIN challenges c ON p.challenge_id = c.id
            JOIN government_departments gd
                ON c.department_id = gd.id
            LEFT JOIN challenge_kpis k ON pv.kpi_id = k.id
            LEFT JOIN users u ON pv.validated_by = u.id
        `;

        let params = [];

        if (req.user.role === "STARTUP") {
            query += " WHERE s.user_id = $1";
            params.push(req.user.id);
        } else if (req.user.role === "GOVERNMENT") {
            query += " WHERE gd.user_id = $1";
            params.push(req.user.id);
        }

        query += " ORDER BY pv.id DESC";

        const result = await pool.query(query, params);

        return res.json({
            validations: result.rows
        });

    } catch (error) {
        console.error("Error fetching pilot validations:", error);

        return res.status(500).json({
            message: "Failed to fetch pilot validations"
        });
    }
};


// =============================================
// GET PILOT VALIDATIONS FOR A PROPOSAL
// =============================================

const getPilotValidationsByProposal = async (req, res) => {
    try {
        const { proposalId } = req.params;

        let query = `
            SELECT
                pv.*,
                p.title AS proposal_title,
                p.challenge_id,
                p.startup_id,
                k.name AS kpi_name,
                k.description AS kpi_description,
                k.target_value,
                k.unit,
                u.name AS validator_name
            FROM pilot_validations pv
            JOIN proposals p ON pv.proposal_id = p.id
            JOIN startups s ON p.startup_id = s.id
            JOIN challenges c ON p.challenge_id = c.id
            JOIN government_departments gd
                ON c.department_id = gd.id
            LEFT JOIN challenge_kpis k ON pv.kpi_id = k.id
            LEFT JOIN users u ON pv.validated_by = u.id
            WHERE p.id = $1
        `;

        const params = [proposalId];

        if (req.user.role === "STARTUP") {
            query += " AND s.user_id = $2";
            params.push(req.user.id);
        } else if (req.user.role === "GOVERNMENT") {
            query += " AND gd.user_id = $2";
            params.push(req.user.id);
        }

        query += " ORDER BY pv.id DESC";

        const result = await pool.query(query, params);

        return res.json({
            validations: result.rows
        });

    } catch (error) {
        console.error(
            "Error fetching proposal pilot validations:",
            error
        );

        return res.status(500).json({
            message: "Failed to fetch proposal pilot validations"
        });
    }
};


// =============================================
// CREATE PILOT VALIDATION
// GOVERNMENT ONLY
// =============================================

const createPilotValidation = async (req, res) => {
    try {
        const {
            proposal_id,
            kpi_id,
            actual_value,
            status,
            remarks
        } = req.body;

        if (
            !Number.isInteger(Number(proposal_id)) ||
            Number(proposal_id) <= 0 ||
            !Number.isInteger(Number(kpi_id)) ||
            Number(kpi_id) <= 0
        ) {
            return res.status(400).json({
                message: "Valid proposal and KPI IDs are required."
            });
        }

        if (
            status &&
            !["PENDING", "PASSED", "FAILED"].includes(status)
        ) {
            return res.status(400).json({
                message: "Invalid pilot validation status."
            });
        }

        const actualValueResult =
            validateActualValue(actual_value);

        if (!actualValueResult.valid) {
            return res.status(400).json({
                message: "Actual value must be a valid number."
            });
        }

        // Verify proposal belongs to this government user's department.
        const proposalResult = await pool.query(
            `
            SELECT
                p.id,
                p.challenge_id,
                p.startup_id,
                s.user_id AS startup_user_id
            FROM proposals p
            JOIN startups s ON p.startup_id = s.id
            JOIN challenges c ON p.challenge_id = c.id
            JOIN government_departments gd
                ON c.department_id = gd.id
            WHERE p.id = $1
            AND gd.user_id = $2
            `,
            [proposal_id, req.user.id]
        );

        if (proposalResult.rows.length === 0) {
            return res.status(404).json({
                message: "Proposal not found in your department."
            });
        }

        const proposal = proposalResult.rows[0];

        // Verify KPI exists and belongs to the proposal's challenge.
        const kpiResult = await pool.query(
            `
            SELECT id
            FROM challenge_kpis
            WHERE id = $1
            AND challenge_id = $2
            `,
            [kpi_id, proposal.challenge_id]
        );

        if (kpiResult.rows.length === 0) {
            return res.status(400).json({
                message:
                    "This KPI does not belong to the proposal's challenge."
            });
        }

        // Prevent duplicate validation.
        const existingValidation = await pool.query(
            `
            SELECT id
            FROM pilot_validations
            WHERE proposal_id = $1
            AND kpi_id = $2
            `,
            [proposal_id, kpi_id]
        );

        if (existingValidation.rows.length > 0) {
            return res.status(409).json({
                message:
                    "This KPI has already been validated for this proposal."
            });
        }

        const finalStatus = status || "PENDING";

        const result = await pool.query(
            `
            INSERT INTO pilot_validations
            (
                proposal_id,
                kpi_id,
                actual_value,
                status,
                remarks,
                validated_by
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
            `,
            [
                proposal_id,
                kpi_id,
                actualValueResult.value,
                finalStatus,
                remarks || null,
                req.user.id
            ]
        );

        // Notify the startup account, not the startup profile ID.
        await pool.query(
            `
            INSERT INTO notifications
            (user_id, title, message, type)
            VALUES ($1, $2, $3, $4)
            `,
            [
                proposal.startup_user_id,
                "Pilot Validation Updated",
                `Pilot validation for KPI #${kpi_id} has been recorded for your proposal #${proposal_id}. Status: ${finalStatus}.`,
                "PILOT"
            ]
        );

        return res.status(201).json({
            message: "Pilot validation created successfully.",
            validation: result.rows[0]
        });

    } catch (error) {
        console.error("Error creating pilot validation:", error);

        return res.status(500).json({
            message: "Failed to create pilot validation"
        });
    }
};


// =============================================
// UPDATE PILOT VALIDATION
// GOVERNMENT ONLY
// =============================================

const updatePilotValidation = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            actual_value,
            status,
            remarks
        } = req.body;

        if (
            status !== undefined &&
            !["PENDING", "PASSED", "FAILED"].includes(status)
        ) {
            return res.status(400).json({
                message: "Invalid pilot validation status."
            });
        }

        const actualValueResult =
            validateActualValue(actual_value);

        if (!actualValueResult.valid) {
            return res.status(400).json({
                message: "Actual value must be a valid number."
            });
        }

        const result = await pool.query(
            `
            UPDATE pilot_validations pv
            SET
                actual_value = COALESCE($1, pv.actual_value),
                status = COALESCE($2, pv.status),
                remarks = COALESCE($3, pv.remarks),
                validated_by = $4,
                validated_at = CURRENT_TIMESTAMP
            WHERE pv.id = $5
            AND EXISTS (
                SELECT 1
                FROM proposals p
                JOIN challenges c ON p.challenge_id = c.id
                JOIN government_departments gd
                    ON c.department_id = gd.id
                WHERE p.id = pv.proposal_id
                AND gd.user_id = $6
            )
            RETURNING pv.*
            `,
            [
                actualValueResult.value,
                status ?? null,
                remarks ?? null,
                req.user.id,
                id,
                req.user.id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message:
                    "Pilot validation not found in your department."
            });
        }

        return res.json({
            message: "Pilot validation updated successfully.",
            validation: result.rows[0]
        });

    } catch (error) {
        console.error("Error updating pilot validation:", error);

        return res.status(500).json({
            message: "Failed to update pilot validation"
        });
    }
};


// =============================================
// DELETE PILOT VALIDATION
// GOVERNMENT ONLY
// =============================================

const deletePilotValidation = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `
            DELETE FROM pilot_validations pv
            WHERE pv.id = $1
            AND EXISTS (
                SELECT 1
                FROM proposals p
                JOIN challenges c ON p.challenge_id = c.id
                JOIN government_departments gd
                    ON c.department_id = gd.id
                WHERE p.id = pv.proposal_id
                AND gd.user_id = $2
            )
            RETURNING pv.*
            `,
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message:
                    "Pilot validation not found in your department."
            });
        }

        return res.json({
            message: "Pilot validation deleted successfully."
        });

    } catch (error) {
        console.error("Error deleting pilot validation:", error);

        return res.status(500).json({
            message: "Failed to delete pilot validation"
        });
    }
};


module.exports = {
    getPilotValidations,
    getPilotValidationsByProposal,
    createPilotValidation,
    updatePilotValidation,
    deletePilotValidation
};
