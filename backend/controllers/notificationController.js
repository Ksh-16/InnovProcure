
const pool = require("../config/db");

// =============================================
// HELPER: VALIDATE POSITIVE INTEGER ID
// =============================================

const isValidId = (id) => {
    return Number.isInteger(Number(id)) && Number(id) > 0;
};


// =============================================
// GET ALL NOTIFICATIONS FOR LOGGED-IN USER
// =============================================

const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            `
            SELECT *
            FROM notifications
            WHERE user_id = $1
            ORDER BY id DESC
            `,
            [userId]
        );

        return res.status(200).json({
            success: true,
            count: result.rows.length,
            notifications: result.rows
        });

    } catch (error) {
        console.error("Error fetching notifications:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch notifications"
        });
    }
};


// =============================================
// GET UNREAD NOTIFICATIONS
// =============================================

const getUnreadNotifications = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            `
            SELECT *
            FROM notifications
            WHERE user_id = $1
              AND is_read = false
            ORDER BY id DESC
            `,
            [userId]
        );

        return res.status(200).json({
            success: true,
            count: result.rows.length,
            notifications: result.rows
        });

    } catch (error) {
        console.error("Error fetching unread notifications:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch unread notifications"
        });
    }
};


// =============================================
// CREATE NOTIFICATION
// ADMIN ONLY - ENFORCED BY ROUTE MIDDLEWARE
// =============================================

const createNotification = async (req, res) => {
    try {
        const {
            user_id,
            title,
            message,
            type
        } = req.body;

        const userId = Number(user_id);

        if (!isValidId(userId)) {
            return res.status(400).json({
                success: false,
                message: "A valid recipient user ID is required"
            });
        }

        if (
            typeof title !== "string" ||
            !title.trim() ||
            typeof message !== "string" ||
            !message.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Title and message are required"
            });
        }

        if (
            type !== undefined &&
            type !== null &&
            typeof type !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Notification type must be a string"
            });
        }

        // Verify recipient exists
        const userResult = await pool.query(
            `SELECT id FROM users WHERE id = $1`,
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Recipient user not found"
            });
        }

        const notificationType =
            type && type.trim() ? type.trim() : "GENERAL";

        const result = await pool.query(
            `
            INSERT INTO notifications (
                user_id,
                title,
                message,
                type
            )
            VALUES ($1, $2, $3, $4)
            RETURNING *
            `,
            [
                userId,
                title.trim(),
                message.trim(),
                notificationType
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Notification created successfully",
            notification: result.rows[0]
        });

    } catch (error) {
        console.error("Error creating notification:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create notification"
        });
    }
};


// =============================================
// MARK ONE NOTIFICATION AS READ
// =============================================

const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid notification ID"
            });
        }

        const result = await pool.query(
            `
            UPDATE notifications
            SET is_read = true
            WHERE id = $1
              AND user_id = $2
            RETURNING *
            `,
            [Number(id), userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Notification marked as read",
            notification: result.rows[0]
        });

    } catch (error) {
        console.error("Error marking notification as read:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to mark notification as read"
        });
    }
};


// =============================================
// MARK ALL NOTIFICATIONS AS READ
// =============================================

const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;

        await pool.query(
            `
            UPDATE notifications
            SET is_read = true
            WHERE user_id = $1
              AND is_read = false
            `,
            [userId]
        );

        return res.status(200).json({
            success: true,
            message: "All notifications marked as read"
        });

    } catch (error) {
        console.error("Error marking all notifications as read:", error);

        return res.status(500).json({
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
