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

        if (!proposal_id) {
            return res.status(400).json({
                success: false,
                message: "Proposal ID is required"
            });
        }

        // Evaluator comes from logged-in user's JWT
        const evaluator_id = req.user.id;


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
                technical_score || null,
                innovation_score || null,
                feasibility_score || null
            ]
        );

        const evaluation = result.rows[0];


        // Find all government users
        const governments = await pool.query(
            `SELECT id
             FROM users
             WHERE role = 'GOVERNMENT'`
        );


        // Notify every government user
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
                    "Proposal Evaluated",
                    `Evaluation has been submitted for proposal #${evaluation.proposal_id}. Technical: ${evaluation.technical_score}, Innovation: ${evaluation.innovation_score}, Feasibility: ${evaluation.feasibility_score}.`,
                    "EVALUATION"
                ]
            );

        }


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

        const result = await pool.query(
            `UPDATE evaluations
             SET
                technical_score = $1,
                innovation_score = $2,
                feasibility_score = $3
             WHERE id = $4
             RETURNING *`,
            [
                technical_score || null,
                innovation_score || null,
                feasibility_score || null,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Evaluation not found"
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


module.exports = {
    getAllEvaluations,
    getEvaluationById,
    createEvaluation,
    updateEvaluation
};