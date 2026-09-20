const pool = require("../config/db");

// Get all notifications for logged-in user
const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            `SELECT *
             FROM notifications
             WHERE user_id = $1
             ORDER BY id DESC`,
            [userId]
        );

        res.json({
            success: true,
            count: result.rows.length,
            notifications: result.rows
        });

    } catch (error) {
        console.error("Error fetching notifications:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch notifications"
        });
    }
};


// Get unread notifications
const getUnreadNotifications = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            `SELECT *
             FROM notifications
             WHERE user_id = $1
             AND is_read = false
             ORDER BY id DESC`,
            [userId]
        );

        res.json({
            success: true,
            count: result.rows.length,
            notifications: result.rows
        });

    } catch (error) {
        console.error("Error fetching unread notifications:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch unread notifications"
        });
    }
};


// Create notification
const createNotification = async (req, res) => {
    try {
        const {
            user_id,
            title,
            message,
            type
        } = req.body;

        if (!user_id || !title || !message) {
            return res.status(400).json({
                success: false,
                message: "User ID, title and message are required"
            });
        }

        const result = await pool.query(
            `INSERT INTO notifications
            (
                user_id,
                title,
                message,
                type
            )
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [
                user_id,
                title,
                message,
                type || "GENERAL"
            ]
        );

        res.status(201).json({
            success: true,
            message: "Notification created successfully",
            notification: result.rows[0]
        });

    } catch (error) {
        console.error("Error creating notification:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create notification"
        });
    }
};


// Mark notification as read
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const result = await pool.query(
            `UPDATE notifications
             SET is_read = true
             WHERE id = $1
             AND user_id = $2
             RETURNING *`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        res.json({
            success: true,
            message: "Notification marked as read",
            notification: result.rows[0]
        });

    } catch (error) {
        console.error("Error marking notification as read:", error);

        res.status(500).json({
            success: false,
            message: "Failed to mark notification as read"
        });
    }
};


// Mark all notifications as read
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;

        await pool.query(
            `UPDATE notifications
             SET is_read = true
             WHERE user_id = $1`,
            [userId]
        );

        res.json({
            success: true,
            message: "All notifications marked as read"
        });

    } catch (error) {
        console.error("Error marking all notifications as read:", error);

        res.status(500).json({
            success: false,
            message: "Failed to mark all notifications as read"
        });
    }
};


module.exports = {
    getNotifications,
    getUnreadNotifications,
    createNotification,
    markAsRead,
    markAllAsRead
};