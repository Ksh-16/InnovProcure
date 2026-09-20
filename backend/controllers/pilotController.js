const pool = require("../config/db");


// =============================================
// GET ALL PILOT VALIDATIONS
// =============================================

const getPilotValidations = async (req, res) => {

    try {

        const result = await pool.query(`
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

            LEFT JOIN proposals p
                ON pv.proposal_id = p.id

            LEFT JOIN challenge_kpis k
                ON pv.kpi_id = k.id

            LEFT JOIN users u
                ON pv.validated_by = u.id

            ORDER BY pv.id DESC
        `);

        res.json({
            validations: result.rows
        });

    } catch (error) {

        console.error(
            "Error fetching pilot validations:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });

    }

};


// =============================================
// GET PILOT VALIDATIONS FOR A PROPOSAL
// =============================================

const getPilotValidationsByProposal = async (req, res) => {

    try {

        const { proposalId } = req.params;

        const result = await pool.query(`
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

            LEFT JOIN proposals p
                ON pv.proposal_id = p.id

            LEFT JOIN challenge_kpis k
                ON pv.kpi_id = k.id

            LEFT JOIN users u
                ON pv.validated_by = u.id

            WHERE pv.proposal_id = $1

            ORDER BY pv.id DESC
        `, [proposalId]);

        res.json({
            validations: result.rows
        });

    } catch (error) {

        console.error(
            "Error fetching proposal pilot validations:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });

    }

};


// =============================================
// CREATE PILOT VALIDATION
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


        // -----------------------------------------
        // BASIC VALIDATION
        // -----------------------------------------

        if (!proposal_id || !kpi_id) {

            return res.status(400).json({
                message:
                    "Proposal and KPI are required."
            });

        }


        if (
            status &&
            ![
                "PENDING",
                "PASSED",
                "FAILED"
            ].includes(status)
        ) {

            return res.status(400).json({
                message:
                    "Invalid pilot validation status."
            });

        }


        // -----------------------------------------
        // CHECK PROPOSAL
        // -----------------------------------------

        const proposalResult = await pool.query(
            `
            SELECT
                id,
                challenge_id,
                startup_id
            FROM proposals
            WHERE id = $1
            `,
            [proposal_id]
        );


        if (proposalResult.rows.length === 0) {

            return res.status(404).json({
                message: "Proposal not found."
            });

        }


        const proposal =
            proposalResult.rows[0];


        // -----------------------------------------
        // CHECK KPI
        // -----------------------------------------

        const kpiResult = await pool.query(
            `
            SELECT
                id,
                challenge_id,
                target_value,
                unit
            FROM challenge_kpis
            WHERE id = $1
            `,
            [kpi_id]
        );


        if (kpiResult.rows.length === 0) {

            return res.status(404).json({
                message: "KPI not found."
            });

        }


        const kpi = kpiResult.rows[0];


        // -----------------------------------------
        // KPI MUST BELONG TO SAME CHALLENGE
        // -----------------------------------------

        if (
            Number(kpi.challenge_id) !==
            Number(proposal.challenge_id)
        ) {

            return res.status(400).json({
                message:
                    "This KPI does not belong to the proposal's challenge."
            });

        }


        // -----------------------------------------
        // CHECK DUPLICATE VALIDATION
        // -----------------------------------------

        const existingValidation =
            await pool.query(
                `
                SELECT id
                FROM pilot_validations
                WHERE proposal_id = $1
                AND kpi_id = $2
                `,
                [
                    proposal_id,
                    kpi_id
                ]
            );


        if (
            existingValidation.rows.length > 0
        ) {

            return res.status(400).json({
                message:
                    "This KPI has already been validated for this proposal."
            });

        }


        // -----------------------------------------
        // INSERT VALIDATION
        // -----------------------------------------

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

            VALUES
            (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6
            )

            RETURNING *
            `,
            [
                proposal_id,
                kpi_id,
                actual_value || null,
                status || "PENDING",
                remarks || null,
                req.user.id
            ]
        );


        // -----------------------------------------
        // NOTIFY STARTUP
        // -----------------------------------------

        await pool.query(
            `
            INSERT INTO notifications
            (
                user_id,
                title,
                message,
                type
            )

            VALUES
            (
                $1,
                $2,
                $3,
                $4
            )
            `,
            [
                proposal.startup_id,
                "Pilot Validation Updated",
                `Pilot validation for KPI #${kpi_id} has been recorded for your proposal #${proposal_id}. Status: ${status || "PENDING"}.`,
                "PILOT"
            ]
        );


        res.status(201).json({
            message:
                "Pilot validation created successfully.",
            validation: result.rows[0]
        });

    } catch (error) {

        console.error(
            "Error creating pilot validation:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });

    }

};


// =============================================
// UPDATE PILOT VALIDATION
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
            status &&
            ![
                "PENDING",
                "PASSED",
                "FAILED"
            ].includes(status)
        ) {

            return res.status(400).json({
                message:
                    "Invalid pilot validation status."
            });

        }


        const result = await pool.query(
            `
            UPDATE pilot_validations

            SET
                actual_value = COALESCE($1, actual_value),
                status = COALESCE($2, status),
                remarks = COALESCE($3, remarks),
                validated_by = $4,
                validated_at = CURRENT_TIMESTAMP

            WHERE id = $5

            RETURNING *
            `,
            [
                actual_value,
                status,
                remarks,
                req.user.id,
                id
            ]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({
                message:
                    "Pilot validation not found."
            });

        }


        res.json({
            message:
                "Pilot validation updated successfully.",
            validation: result.rows[0]
        });

    } catch (error) {

        console.error(
            "Error updating pilot validation:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });

    }

};


// =============================================
// DELETE PILOT VALIDATION
// =============================================

const deletePilotValidation = async (req, res) => {

    try {

        const { id } = req.params;

        const result = await pool.query(
            `
            DELETE FROM pilot_validations
            WHERE id = $1
            RETURNING *
            `,
            [id]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({
                message:
                    "Pilot validation not found."
            });

        }


        res.json({
            message:
                "Pilot validation deleted successfully."
        });

    } catch (error) {

        console.error(
            "Error deleting pilot validation:",
            error
        );

        res.status(500).json({
            message: "Server error"
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