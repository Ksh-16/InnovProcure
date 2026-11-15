
const pool = require("../config/db");

// Validate optional numeric KPI values.
const validateTargetValue = (value) => {
    if (value === undefined || value === null || value === "") {
        return { valid: true, value: null };
    }

    if (typeof value === "boolean" || String(value).trim() === "") {
        return { valid: false };
    }

    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
        return { valid: false };
    }

    return { valid: true, value: numericValue };
};

// Validate positive integer IDs.
const isPositiveInteger = (value) => {
    return Number.isInteger(Number(value)) && Number(value) > 0;
};


// Get all KPIs
const getAllKpis = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM challenge_kpis ORDER BY id DESC"
        );

        return res.json({
            success: true,
            count: result.rows.length,
            kpis: result.rows
        });
    } catch (error) {
        console.error("Error fetching KPIs:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch KPIs"
        });
    }
};


// Get KPIs for a specific challenge
const getKpisByChallenge = async (req, res) => {
    try {
        const { challengeId } = req.params;

        if (!isPositiveInteger(challengeId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid challenge ID"
            });
        }

        const result = await pool.query(
            `SELECT *
             FROM challenge_kpis
             WHERE challenge_id = $1
             ORDER BY id DESC`,
            [Number(challengeId)]
        );

        return res.json({
            success: true,
            count: result.rows.length,
            kpis: result.rows
        });
    } catch (error) {
        console.error("Error fetching challenge KPIs:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch challenge KPIs"
        });
    }
};


// Get KPI by ID
const getKpiById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isPositiveInteger(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid KPI ID"
            });
        }

        const result = await pool.query(
            "SELECT * FROM challenge_kpis WHERE id = $1",
            [Number(id)]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "KPI not found"
            });
        }

        return res.json({
            success: true,
            kpi: result.rows[0]
        });
    } catch (error) {
        console.error("Error fetching KPI:", error);

        return res.status(500).json({
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

        if (!isPositiveInteger(challenge_id)) {
            return res.status(400).json({
                success: false,
                message: "A valid challenge ID is required"
            });
        }

        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "KPI name is required"
            });
        }

        const target = validateTargetValue(target_value);

        if (!target.valid) {
            return res.status(400).json({
                success: false,
                message: "Target value must be a valid finite number"
            });
        }

        // Verify challenge ownership.
        const challenge = await pool.query(
            `SELECT c.id
             FROM challenges c
             JOIN government_departments gd
                ON c.department_id = gd.id
             WHERE c.id = $1 AND gd.user_id = $2`,
            [Number(challenge_id), req.user.id]
        );

        if (challenge.rows.length === 0) {
            return res.status(403).json({
                success: false,
                message: "You can only add KPIs to your own department's challenges"
            });
        }

        const result = await pool.query(
            `INSERT INTO challenge_kpis
             (challenge_id, name, description, target_value, unit)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [
                Number(challenge_id),
                name.trim(),
                description ?? null,
                target.value,
                unit ?? null
            ]
        );

        return res.status(201).json({
            success: true,
            message: "KPI created successfully",
            kpi: result.rows[0]
        });

    } catch (error) {
        console.error("Error creating KPI:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create KPI"
        });
    }
};


// Update KPI
const updateKpi = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isPositiveInteger(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid KPI ID"
            });
        }

        const updates = [];
        const values = [];

        const addUpdate = (column, value) => {
            values.push(value);
            updates.push(`${column} = $${values.length}`);
        };

        // Update only fields supplied in the request.
        if (Object.prototype.hasOwnProperty.call(req.body, "name")) {
            if (typeof req.body.name !== "string" || !req.body.name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "KPI name cannot be empty"
                });
            }

            addUpdate("name", req.body.name.trim());
        }

        if (Object.prototype.hasOwnProperty.call(req.body, "description")) {
            addUpdate("description", req.body.description);
        }

        if (Object.prototype.hasOwnProperty.call(req.body, "target_value")) {
            const target = validateTargetValue(req.body.target_value);

            if (!target.valid) {
                return res.status(400).json({
                    success: false,
                    message: "Target value must be a valid finite number"
                });
            }

            addUpdate("target_value", target.value);
        }

        if (Object.prototype.hasOwnProperty.call(req.body, "unit")) {
            addUpdate("unit", req.body.unit);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one field must be provided for update"
            });
        }

        values.push(Number(id));
        const idIndex = values.length;

        values.push(req.user.id);
        const userIndex = values.length;

        const result = await pool.query(
            `UPDATE challenge_kpis
             SET ${updates.join(", ")}
             WHERE id = $${idIndex}
             AND challenge_id IN (
                 SELECT c.id
                 FROM challenges c
                 JOIN government_departments gd
                    ON c.department_id = gd.id
                 WHERE gd.user_id = $${userIndex}
             )
             RETURNING *`,
            values
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "KPI not found in your department"
            });
        }

        return res.json({
            success: true,
            message: "KPI updated successfully",
            kpi: result.rows[0]
        });

    } catch (error) {
        console.error("Error updating KPI:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update KPI"
        });
    }
};


// Delete KPI
const deleteKpi = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isPositiveInteger(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid KPI ID"
            });
        }

        const result = await pool.query(
            `DELETE FROM challenge_kpis
             WHERE id = $1
             AND challenge_id IN (
                 SELECT c.id
                 FROM challenges c
                 JOIN government_departments gd
                    ON c.department_id = gd.id
                 WHERE gd.user_id = $2
             )
             RETURNING *`,
            [Number(id), req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "KPI not found in your department"
            });
        }

        return res.json({
            success: true,
            message: "KPI deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting KPI:", error);

        return res.status(500).json({
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
