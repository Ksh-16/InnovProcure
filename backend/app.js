
const express = require("express");
const cors = require("cors");
const pool = require("./config/db");

const authenticate = require("./middleware/authMiddleware");

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

// Middleware
const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",").map(origin => origin.trim())
    : ["http://localhost:5173"];

app.use(cors({
    origin: allowedOrigins
}));

app.use(express.json({ limit: "1mb" }));

// API Routes
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

// Root route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "InnovProcure API is running"
    });
});

// Protected database health check
app.get("/api/test-db", authenticate, async (req, res, next) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            success: true,
            message: "Database connection is working",
            databaseTime: result.rows[0].now
        });

    } catch (error) {
        next(error);
    }
});

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found"
    });
});

// Central error handler
app.use((error, req, res, next) => {
    console.error("Server error:", error.message);

    res.status(500).json({
        success: false,
        message: "Internal server error"
    });
});

module.exports = app;
