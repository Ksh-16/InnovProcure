const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authMiddleware");

const {
    getNotifications,
    getUnreadNotifications,
    createNotification,
    markAsRead,
    markAllAsRead
} = require("../controllers/notificationController");


// Get all notifications
router.get(
    "/",
    authenticate,
    getNotifications
);


// Get unread notifications
router.get(
    "/unread",
    authenticate,
    getUnreadNotifications
);


// Create notification
router.post(
    "/",
    authenticate,
    createNotification
);


// Mark one notification as read
router.put(
    "/:id/read",
    authenticate,
    markAsRead
);


// Mark all notifications as read
router.put(
    "/read-all",
    authenticate,
    markAllAsRead
);


module.exports = router;