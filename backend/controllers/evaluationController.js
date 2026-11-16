
const pool = require("../config/db");


// =============================================
// HELPER: VALIDATE EVALUATION SCORE
// =============================================

const validateScore = (score) => {
    if (
        score === undefined ||
        score === null ||
        score === "" ||
        (typeof score === "string" && !score.trim()) ||
        typeof score === "boolean" ||
        !Number.isFinite(Number(score)) ||
        Number(score) < 0 ||
        Number(score) > 10
    ) {
        return null;
    }

    return Number(score);
};


// =============================================
// HELPER: VALIDATE ID
// =============================================

const isValidId = (id) => {
    return Number.isInteger(Number(id)) && Number(id) > 0;
};


// =============================================
// GET ALL EVALUATIONS
// =============================================

const getAllEvaluations = async (req, res) => {
    try {
        let query = `
            SELECT
                e.*,
                p.title AS proposal_title,
                c.title AS challenge_title,
                gd.department_name
            FROM evaluations e
            JOIN proposals p ON e.proposal_id = p.id
            JOIN startups s ON p.startup_id = s.id
            JOIN challenges c ON p.challenge_id = c.id
            JOIN government_departments gd
                ON c.department_id = gd.id
        `;

        const values = [];

        if (req.user.role === "STARTUP") {
            query += ` WHERE s.user_id = $1`;
            values.push(req.user.id);
        }
        else if (req.user.role === "GOVERNMENT") {
            query += ` WHERE gd.user_id = $1`;
            values.push(req.user.id);
        }

        query += ` ORDER BY e.id DESC`;

        const result = await pool.query(query, values);

        return res.status(200).json({
            success: true,
            count: result.rows.length,
            evaluations: result.rows
        });

    } catch (error) {
        console.error("Error fetching evaluations:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch evaluations"
        });
    }
};


// =============================================
// GET EVALUATION BY ID
// =============================================

const getEvaluationById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid evaluation ID"
            });
        }

        let query = `
            SELECT
                e.*,
                p.title AS proposal_title,
                c.title AS challenge_title,
                gd.department_name,
                gd.user_id AS department_owner_id,
                s.user_id AS startup_user_id
            FROM evaluations e
            JOIN proposals p ON e.proposal_id = p.id
            JOIN startups s ON p.startup_id = s.id
            JOIN challenges c ON p.challenge_id = c.id
            JOIN government_departments gd
                ON c.department_id = gd.id
            WHERE e.id = $1
        `;

        const result = await pool.query(query, [Number(id)]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Evaluation not found"
            });
        }

        const evaluation = result.rows[0];

        if (
            req.user.role === "STARTUP" &&
            Number(evaluation.startup_user_id) !== Number(req.user.id)
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to view this evaluation"
            });
        }

        if (
            req.user.role === "GOVERNMENT" &&
            Number(evaluation.department_owner_id) !== Number(req.user.id)
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to view this evaluation"
            });
        }

        delete evaluation.startup_user_id;
        delete evaluation.department_owner_id;

        return res.status(200).json({
            success: true,
            evaluation
        });

    } catch (error) {
        console.error("Error fetching evaluation:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch evaluation"
        });
    }
};


// =============================================
// CREATE EVALUATION
// =============================================

const createEvaluation = async (req, res) => {
    try {
        const {
            proposal_id,
            technical_score,
            innovation_score,
            feasibility_score
        } = req.body;

        const proposalId = Number(proposal_id);

        if (!isValidId(proposalId)) {
            return res.status(400).json({
                success: false,
                message: "A valid proposal ID is required"
            });
        }

        const technicalScore = validateScore(technical_score);
        const innovationScore = validateScore(innovation_score);
        const feasibilityScore = validateScore(feasibility_score);

        if (
            technicalScore === null ||
            innovationScore === null ||
            feasibilityScore === null
        ) {
            return res.status(400).json({
                success: false,
                message: "All scores must be valid numbers between 0 and 10"
            });
        }

        // Evaluator ID comes from authenticated JWT
        const evaluatorId = req.user.id;

        // Verify proposal and find its department owner
        const proposalResult = await pool.query(
            `
            SELECT
                p.id,
                c.title AS challenge_title,
                gd.user_id AS department_owner_id
            FROM proposals p
            JOIN challenges c ON p.challenge_id = c.id
            JOIN government_departments gd
                ON c.department_id = gd.id
            WHERE p.id = $1
            `,
            [proposalId]
        );

        if (proposalResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Proposal not found"
            });
        }

        const proposal = proposalResult.rows[0];

        // Check for existing evaluation
        const existingEvaluation = await pool.query(
            `
            SELECT id
            FROM evaluations
            WHERE proposal_id = $1
              AND evaluator_id = $2
            `,
            [proposalId, evaluatorId]
        );

        if (existingEvaluation.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "You have already evaluated this proposal"
            });
        }

        // Insert evaluation
        const result = await pool.query(
            `
            INSERT INTO evaluations (
                proposal_id,
                evaluator_id,
                technical_score,
                innovation_score,
                feasibility_score
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
            `,
            [
                proposalId,
                evaluatorId,
                technicalScore,
                innovationScore,
                feasibilityScore
            ]
        );

        const evaluation = result.rows[0];

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
                proposal.department_owner_id,
                "Proposal Evaluated",
                `Evaluation has been submitted for proposal #${evaluation.proposal_id} under challenge: ${proposal.challenge_title}.`,
                "EVALUATION"
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Evaluation submitted successfully",
            evaluation
        });

    } catch (error) {
        console.error("Error creating evaluation:", error);

        // Handle database unique constraint
        if (
            error.code === "23505" &&
            error.constraint === "unique_evaluation_per_evaluator"
        ) {
            return res.status(409).json({
                success: false,
                message: "You have already evaluated this proposal"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to submit evaluation"
        });
    }
};


// =============================================
// UPDATE EVALUATION
// =============================================

const updateEvaluation = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid evaluation ID"
            });
        }

        const {
            technical_score,
            innovation_score,
            feasibility_score
        } = req.body;

        const suppliedScores = {
            technical_score,
            innovation_score,
            feasibility_score
        };

        const updates = {};
        const fields = [];

        for (const [field, value] of Object.entries(suppliedScores)) {
            if (value !== undefined) {
                const validatedScore = validateScore(value);

                if (validatedScore === null) {
                    return res.status(400).json({
                        success: false,
                        message: `${field} must be a valid number between 0 and 10`
                    });
                }

                fields.push(field);
                updates[field] = validatedScore;
            }
        }

        if (fields.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one evaluation score must be provided"
            });
        }

        // Check evaluation ownership
        const existingEvaluation = await pool.query(
            `
            SELECT evaluator_id
            FROM evaluations
            WHERE id = $1
            `,
            [Number(id)]
        );

        if (existingEvaluation.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Evaluation not found"
            });
        }

        if (
            Number(existingEvaluation.rows[0].evaluator_id) !==
            Number(req.user.id)
        ) {
            return res.status(403).json({
                success: false,
                message: "You cannot update another evaluator's evaluation"
            });
        }

        // Build partial update query using validated field names
        const setClauses = [];
        const values = [];

        fields.forEach((field) => {
            values.push(updates[field]);
            setClauses.push(`${field} = $${values.length}`);
        });

        values.push(Number(id));
        const idPosition = values.length;

        values.push(req.user.id);
        const evaluatorPosition = values.length;

        const result = await pool.query(
            `
            UPDATE evaluations
            SET ${setClauses.join(", ")}
            WHERE id = $${idPosition}
              AND evaluator_id = $${evaluatorPosition}
            RETURNING *
            `,
            values
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Evaluation not found or no longer accessible"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Evaluation updated successfully",
            evaluation: result.rows[0]
        });

    } catch (error) {
        console.error("Error updating evaluation:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update evaluation"
        });
    }
};


module.exports = {
    getAllEvaluations,
    getEvaluationById,
    createEvaluation,
    updateEvaluation
};
