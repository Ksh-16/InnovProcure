
const pool = require("../config/db");


// =============================================
// GET ALL PROPOSALS
// =============================================

const getProposals = async (req, res) => {
    try {
        let query = `
            SELECT
                p.*,
                u.name AS startup_name,
                u.email AS startup_email,
                s.startup_name AS company_name,
                c.title AS challenge_title,
                gd.department_name
            FROM proposals p
            JOIN startups s ON p.startup_id = s.id
            JOIN users u ON s.user_id = u.id
            JOIN challenges c ON p.challenge_id = c.id
            JOIN government_departments gd ON c.department_id = gd.id
        `;

        let values = [];

        if (req.user.role === "STARTUP") {
            query += ` WHERE s.user_id = $1`;
            values.push(req.user.id);
        }
        else if (req.user.role === "GOVERNMENT") {
            query += ` WHERE gd.user_id = $1`;
            values.push(req.user.id);
        }

        query += ` ORDER BY p.id DESC`;

        const result = await pool.query(query, values);

        return res.status(200).json(result.rows);

    } catch (error) {
        console.error("Get proposals error:", error);

        return res.status(500).json({
            message: "Server error while fetching proposals"
        });
    }
};


// =============================================
// GET PROPOSAL BY ID
// =============================================

const getProposalById = async (req, res) => {
    try {
        const proposalId = Number(req.params.id);

        if (!Number.isInteger(proposalId) || proposalId <= 0) {
            return res.status(400).json({
                message: "Invalid proposal ID"
            });
        }

        let query = `
            SELECT
                p.*,
                u.name AS startup_name,
                u.email AS startup_email,
                s.startup_name AS company_name,
                c.title AS challenge_title,
                gd.department_name,
                gd.user_id AS department_owner_id,
                s.user_id AS startup_user_id
            FROM proposals p
            JOIN startups s ON p.startup_id = s.id
            JOIN users u ON s.user_id = u.id
            JOIN challenges c ON p.challenge_id = c.id
            JOIN government_departments gd ON c.department_id = gd.id
            WHERE p.id = $1
        `;

        const result = await pool.query(query, [proposalId]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Proposal not found"
            });
        }

        const proposal = result.rows[0];

        if (
            req.user.role === "STARTUP" &&
            Number(proposal.startup_user_id) !== Number(req.user.id)
        ) {
            return res.status(403).json({
                message: "You are not authorized to view this proposal"
            });
        }

        if (
            req.user.role === "GOVERNMENT" &&
            Number(proposal.department_owner_id) !== Number(req.user.id)
        ) {
            return res.status(403).json({
                message: "You are not authorized to view this proposal"
            });
        }

        delete proposal.startup_user_id;
        delete proposal.department_owner_id;

        return res.status(200).json(proposal);

    } catch (error) {
        console.error("Get proposal by ID error:", error);

        return res.status(500).json({
            message: "Server error while fetching proposal"
        });
    }
};


// =============================================
// CREATE PROPOSAL
// =============================================

const createProposal = async (req, res) => {
    try {
        const {
            challenge_id,
            title,
            solution_description,
            technical_approach,
            proposed_budget
        } = req.body;

        // Validate challenge ID
        const challengeId = Number(challenge_id);

        if (
            !Number.isInteger(challengeId) ||
            challengeId <= 0
        ) {
            return res.status(400).json({
                message: "A valid challenge ID is required"
            });
        }

        // Validate required text fields
        if (
            typeof title !== "string" ||
            !title.trim() ||
            title.trim().length > 250
        ) {
            return res.status(400).json({
                message: "Title is required and must not exceed 250 characters"
            });
        }

        if (
            typeof solution_description !== "string" ||
            !solution_description.trim()
        ) {
            return res.status(400).json({
                message: "Solution description is required"
            });
        }

        if (
            typeof technical_approach !== "string" ||
            !technical_approach.trim()
        ) {
            return res.status(400).json({
                message: "Technical approach is required"
            });
        }

        // Validate optional budget
        let budget = null;

        if (
            proposed_budget !== undefined &&
            proposed_budget !== null &&
            proposed_budget !== ""
        ) {
            if (
                typeof proposed_budget === "boolean" ||
                !Number.isFinite(Number(proposed_budget)) ||
                Number(proposed_budget) < 0
            ) {
                return res.status(400).json({
                    message: "Proposed budget must be a valid non-negative number"
                });
            }

            budget = Number(proposed_budget);
        }

        // Get startup profile using authenticated user ID
        const startupResult = await pool.query(
            `SELECT id FROM startups WHERE user_id = $1`,
            [req.user.id]
        );

        if (startupResult.rows.length === 0) {
            return res.status(404).json({
                message: "Startup profile not found"
            });
        }

        const startupId = startupResult.rows[0].id;

        // Verify challenge and its department
        const challengeResult = await pool.query(
            `
            SELECT
                c.id,
                c.title,
                c.department_id,
                gd.user_id AS department_owner_id
            FROM challenges c
            JOIN government_departments gd
                ON c.department_id = gd.id
            WHERE c.id = $1
            `,
            [challengeId]
        );

        if (challengeResult.rows.length === 0) {
            return res.status(404).json({
                message: "Challenge not found"
            });
        }

        const challenge = challengeResult.rows[0];

        // Check for an existing proposal
        const existingProposal = await pool.query(
            `
            SELECT id
            FROM proposals
            WHERE challenge_id = $1
              AND startup_id = $2
            `,
            [challengeId, startupId]
        );

        if (existingProposal.rows.length > 0) {
            return res.status(409).json({
                message: "You have already submitted a proposal for this challenge"
            });
        }

        // Insert proposal
        const result = await pool.query(
            `
            INSERT INTO proposals (
                challenge_id,
                startup_id,
                title,
                solution_description,
                technical_approach,
                proposed_budget
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
            `,
            [
                challengeId,
                startupId,
                title.trim(),
                solution_description.trim(),
                technical_approach.trim(),
                budget
            ]
        );

        const proposal = result.rows[0];

        // Notify only the government department owner
        await pool.query(
            `
            INSERT INTO notifications (
                user_id,
                title,
                message,
                type
            )
            VALUES ($1, $2, $3, $4)
            `,
            [
                challenge.department_owner_id,
                "New Proposal Received",
                `A startup has submitted a proposal for the challenge: ${challenge.title}`,
                "PROPOSAL"
            ]
        );

        return res.status(201).json({
            message: "Proposal submitted successfully",
            proposal
        });

    } catch (error) {
        console.error("Create proposal error:", error);

        // Handle database-level duplicate constraint
        if (
            error.code === "23505" &&
            error.constraint === "proposals_challenge_id_startup_id_key"
        ) {
            return res.status(409).json({
                message: "You have already submitted a proposal for this challenge"
            });
        }

        return res.status(500).json({
            message: "Server error while creating proposal"
        });
    }
};


module.exports = {
    getProposals,
    getProposalById,
    createProposal
};
