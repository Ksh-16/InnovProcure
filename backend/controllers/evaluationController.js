const pool = require("../config/db");

// Get all evaluations
const getAllEvaluations = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM evaluations ORDER BY id DESC"
        );

        res.json({
            success: true,
            count: result.rows.length,
            evaluations: result.rows
        });
    } catch (error) {
        console.error("Error fetching evaluations:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch evaluations"
        });
    }
};


// Get evaluation by ID
const getEvaluationById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "SELECT * FROM evaluations WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Evaluation not found"
            });
        }

        res.json({
            success: true,
            evaluation: result.rows[0]
        });

    } catch (error) {
        console.error("Error fetching evaluation:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch evaluation"
        });
    }
};


// Create evaluation

const createEvaluation = async (req, res) => {
    try {
        const {
            proposal_id,
            technical_score,
            innovation_score,
            feasibility_score
        } = req.body;

        // Validate proposal ID
        if (!proposal_id) {
            return res.status(400).json({
                success: false,
                message: "Proposal ID is required"
            });
        }

        // Validate evaluation scores
        const scores = [
            technical_score,
            innovation_score,
            feasibility_score
        ];

        if (scores.some(score =>
            score === null ||
            score === undefined ||
            score === "" ||
            typeof score === "boolean" ||
            !Number.isFinite(Number(score)) ||
            Number(score) < 0 ||
            Number(score) > 10
        )) {
            return res.status(400).json({
                success: false,
                message: "All scores must be between 0 and 10"
            });
        }

        // Evaluator from logged-in user's JWT
        const evaluator_id = req.user.id;

        // Check if proposal exists
        const proposalResult = await pool.query(
            "SELECT id FROM proposals WHERE id = $1",
            [proposal_id]
        );

        if (proposalResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Proposal not found"
            });
        }

        // Prevent duplicate evaluation
        const existingEvaluation = await pool.query(
            `SELECT id
             FROM evaluations
             WHERE proposal_id = $1
             AND evaluator_id = $2`,
            [proposal_id, evaluator_id]
        );

        if (existingEvaluation.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: "You have already evaluated this proposal"
            });
        }

        // Create evaluation
        const result = await pool.query(
            `INSERT INTO evaluations
            (
                proposal_id,
                evaluator_id,
                technical_score,
                innovation_score,
                feasibility_score
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [
                proposal_id,
                evaluator_id,
                Number(technical_score),
                Number(innovation_score),
                Number(feasibility_score)
            ]
        );

        const evaluation = result.rows[0];

        // Notify government users
        await pool.query(
            `INSERT INTO notifications
            (
                user_id,
                title,
                message,
                type
            )
            SELECT id, $1, $2, $3
            FROM users
            WHERE role = 'GOVERNMENT'`,
            [
                "Proposal Evaluated",
                `Evaluation has been submitted for proposal #${evaluation.proposal_id}. Technical: ${evaluation.technical_score}, Innovation: ${evaluation.innovation_score}, Feasibility: ${evaluation.feasibility_score}.`,
                "EVALUATION"
            ]
        );

        res.status(201).json({
            success: true,
            message: "Evaluation submitted successfully",
            evaluation: evaluation
        });

    } catch (error) {
        console.error("Error creating evaluation:", error);

        res.status(500).json({
            success: false,
            message: "Failed to submit evaluation"
        });
    }
};

// Update evaluation

const updateEvaluation = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            technical_score,
            innovation_score,
            feasibility_score
        } = req.body;

        // Validate all scores
        const scores = [
            technical_score,
            innovation_score,
            feasibility_score
        ];

        if (scores.some(score =>
            score === null ||
            score === undefined ||
            score === "" ||
            typeof score === "boolean" ||
            !Number.isFinite(Number(score)) ||
            Number(score) < 0 ||
            Number(score) > 10
        )) {
            return res.status(400).json({
                success: false,
                message: "All scores must be between 0 and 10"
            });
        }

        // Check whether evaluation exists
        const existingEvaluation = await pool.query(
            "SELECT evaluator_id FROM evaluations WHERE id = $1",
            [id]
        );

        if (existingEvaluation.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Evaluation not found"
            });
        }

        // Only the original evaluator can update
        if (
            Number(existingEvaluation.rows[0].evaluator_id) !==
            Number(req.user.id)
        ) {
            return res.status(403).json({
                success: false,
                message: "You cannot update another evaluator's evaluation"
            });
        }

        // Update evaluation
        const result = await pool.query(
            `UPDATE evaluations
             SET
                technical_score = $1,
                innovation_score = $2,
                feasibility_score = $3
             WHERE id = $4
             AND evaluator_id = $5
             RETURNING *`,
            [
                Number(technical_score),
                Number(innovation_score),
                Number(feasibility_score),
                id,
                req.user.id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Evaluation not found or no longer accessible"
            });
        }

        res.json({
            success: true,
            message: "Evaluation updated successfully",
            evaluation: result.rows[0]
        });

    } catch (error) {
        console.error("Error updating evaluation:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update evaluation"
        });
    }
};
