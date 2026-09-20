const express = require("express");

const {
    register,
    login
} = require("../controllers/authController");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get("/me", authenticate, (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});

router.get(
    "/admin-test",
    authenticate,
    authorize("admin"),
    (req, res) => {
        res.json({
            success: true,
            message: "Welcome Admin"
        });
    }
);

module.exports = router;