const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const procurementRoutes = require("./routes/procurementRoutes");
const startupRoutes = require("./routes/startupRoutes");
const evaluationRoutes = require("./routes/evaluationRoutes");
const challengeRoutes = require("./routes/challengeRoutes");
const kpiRoutes = require("./routes/kpiRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const proposalRoutes = require("./routes/proposalRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const pilotRoutes = require("./routes/pilotRoutes");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/procurements", procurementRoutes);
app.use("/api/startups", startupRoutes);
app.use("/api/evaluations", evaluationRoutes);
app.use("/api/kpis", kpiRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/proposals", proposalRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/pilot-validations", pilotRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "InnovProcure API is running"
    });
});

app.get("/api/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            success: true,
            message: "Database connection is working",
            databaseTime: result.rows[0].now
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Database connection failed"
        });
    }
});

module.exports = app;