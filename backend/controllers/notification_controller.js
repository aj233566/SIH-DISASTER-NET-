const Notification = require("../models/notification");

// GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};

// PATCH /api/notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);

    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
    });
  }
};

// PATCH /api/notifications/read-all
const markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { read: false },
      { $set: { read: true } }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);

    res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read",
    });
  }
};

// POST /api/notifications/broadcast
const sendBroadcast = async (req, res) => {
  try {
    const {
      channel = "in_app",
      type = "info",
      title,
      message,
      targetAudience = "General Public",
    } = req.body;

    const titleEn =
      typeof title === "object"
        ? title.en || "Notification"
        : title || "Notification";

    const titleHi =
      typeof title === "object"
        ? title.hi || titleEn
        : titleEn;

    const messageEn =
      typeof message === "object"
        ? message.en || ""
        : message || "";

    const messageHi =
      typeof message === "object"
        ? message.hi || messageEn
        : messageEn;

    const notification = await Notification.create({
      channel,
      type,
      title: {
        en: titleEn,
        hi: titleHi,
      },
      message: {
        en: messageEn,
        hi: messageHi,
      },
      targetAudience,
      read: false,
      delivered: true,
    });

    res.status(201).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("Error sending broadcast notification:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send notification",
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  sendBroadcast,
};