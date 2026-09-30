const express = require("express");

const {
    getNotifications,
    markAsRead,
    markAllAsRead,
    sendBroadcast,
} = require("../controllers/notification_controller");

const router = express.Router();

// Get all notifications
router.get("/", getNotifications);

// Send broadcast notification
router.post("/broadcast", sendBroadcast);

// Mark one notification as read
router.patch("/:id/read", markAsRead);

// Mark all notifications as read
router.patch("/read-all", markAllAsRead);

module.exports = router;