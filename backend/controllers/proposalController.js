const pool = require("../config/db");


// =============================================
// GET ALL PROPOSALS
// =============================================

const getProposals = async (req, res) => {

    try {

        let result;

        if (req.user.role === "STARTUP") {

            result = await pool.query(
                `
                SELECT
                    p.*,
                    u.name AS startup_name,
                    u.email AS startup_email,
                    s.startup_name AS company_name,
                    c.title AS challenge_title,
                    gd.department_name

                FROM proposals p

                LEFT JOIN startups s
                    ON p.startup_id = s.id

                LEFT JOIN users u
                    ON s.user_id = u.id

                LEFT JOIN challenges c
                    ON p.challenge_id = c.id

                LEFT JOIN government_departments gd
                    ON c.department_id = gd.id

                WHERE s.user_id = $1

                ORDER BY p.id DESC
                `,
                [req.user.id]
            );

        } else {

            result = await pool.query(
                `
                SELECT
                    p.*,
                    u.name AS startup_name,
                    u.email AS startup_email,
                    s.startup_name AS company_name,
                    c.title AS challenge_title,
                    gd.department_name

                FROM proposals p

                LEFT JOIN startups s
                    ON p.startup_id = s.id

                LEFT JOIN users u
                    ON s.user_id = u.id

                LEFT JOIN challenges c
                    ON p.challenge_id = c.id

                LEFT JOIN government_departments gd
                    ON c.department_id = gd.id

                ORDER BY p.id DESC
                `
            );

        }

        res.json({
            proposals: result.rows
        });

    } catch (error) {

        console.error(
            "Error fetching proposals:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });

    }

};


// =============================================
// GET PROPOSAL BY ID
// =============================================

const getProposalById = async (req, res) => {

    try {

        const { id } = req.params;

        const result = await pool.query(
            `
            SELECT
                p.*,
                u.name AS startup_name,
                u.email AS startup_email,
                s.startup_name AS company_name,
                c.title AS challenge_title,
                c.description AS challenge_description,
                c.requirements,
                c.category,
                gd.department_name

            FROM proposals p

            LEFT JOIN startups s
                ON p.startup_id = s.id

            LEFT JOIN users u
                ON s.user_id = u.id

            LEFT JOIN challenges c
                ON p.challenge_id = c.id

            LEFT JOIN government_departments gd
                ON c.department_id = gd.id

            WHERE p.id = $1
            `,
            [id]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                message: "Proposal not found"
            });

        }

        const proposal = result.rows[0];

        // STARTUP USERS CAN ONLY VIEW THEIR OWN PROPOSALS

        if (
            req.user.role === "STARTUP" &&
            Number(proposal.user_id) !== Number(req.user.id)
        ) {

            // Check ownership directly from startups table
            const ownership = await pool.query(
                `
                SELECT id
                FROM startups
                WHERE id = $1
                AND user_id = $2
                `,
                [proposal.startup_id, req.user.id]
            );

            if (ownership.rows.length === 0) {

                return res.status(403).json({
                    message:
                        "You are not authorized to view this proposal."
                });

            }

        }

        res.json({
            proposal
        });

    } catch (error) {

        console.error(
            "Error fetching proposal:",
            error
        );

        res.status(500).json({
            message: "Server error"
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
            technical_approach
        } = req.body;


        // -----------------------------------------
        // VALIDATION
        // -----------------------------------------

        if (
            !challenge_id ||
            !title ||
            !solution_description ||
            !technical_approach
        ) {

            return res.status(400).json({
                message:
                    "Challenge, title, solution description and technical approach are required."
            });

        }


        // -----------------------------------------
        // FIND STARTUP PROFILE
        // -----------------------------------------

        const startupResult = await pool.query(
            `
            SELECT id
            FROM startups
            WHERE user_id = $1
            `,
            [req.user.id]
        );


        if (startupResult.rows.length === 0) {

            return res.status(400).json({
                message:
                    "Startup profile not found for this user."
            });

        }


        const startupId = startupResult.rows[0].id;


        // -----------------------------------------
        // CHECK CHALLENGE
        // -----------------------------------------

        const challengeResult = await pool.query(
            `
            SELECT id, title
            FROM challenges
            WHERE id = $1
            `,
            [challenge_id]
        );


        if (challengeResult.rows.length === 0) {

            return res.status(404).json({
                message:
                    "Challenge not found."
            });

        }


        // -----------------------------------------
        // PREVENT DUPLICATE PROPOSAL
        // -----------------------------------------

        const existingProposal = await pool.query(
            `
            SELECT id
            FROM proposals
            WHERE challenge_id = $1
            AND startup_id = $2
            `,
            [
                challenge_id,
                startupId
            ]
        );


        if (existingProposal.rows.length > 0) {

            return res.status(400).json({
                message:
                    "You have already submitted a proposal for this challenge."
            });

        }


        // -----------------------------------------
        // CREATE PROPOSAL
        // -----------------------------------------

        const result = await pool.query(
            `
            INSERT INTO proposals
            (
                challenge_id,
                startup_id,
                title,
                solution_description,
                technical_approach
            )

            VALUES
            (
                $1,
                $2,
                $3,
                $4,
                $5
            )

            RETURNING *
            `,
            [
                challenge_id,
                startupId,
                title,
                solution_description,
                technical_approach
            ]
        );


        const proposal = result.rows[0];


        // -----------------------------------------
        // NOTIFY GOVERNMENT USERS
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

            SELECT
                id,
                $1,
                $2,
                $3

            FROM users

            WHERE role = 'GOVERNMENT'
            `,
            [
                "New Proposal Submitted",
                `A startup has submitted a new proposal "${proposal.title}" for challenge #${proposal.challenge_id}.`,
                "PROPOSAL"
            ]
        );


        // -----------------------------------------
        // RESPONSE
        // -----------------------------------------

        res.status(201).json({

            message:
                "Proposal submitted successfully.",

            proposal

        });


    } catch (error) {

        console.error(
            "Error creating proposal:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });

    }

};


// =============================================
// EXPORTS
// =============================================

module.exports = {

    getProposals,
    getProposalById,
    createProposal

};