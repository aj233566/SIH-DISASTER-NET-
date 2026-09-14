const express = require("express");

const {
  getAlerts,
  getAlertById,
  updateAlertStatus,
} = require("../controllers/alert_controller");

const router = express.Router();

router.get("/", getAlerts);

router.get("/:id", getAlertById);

router.patch("/:id/status", updateAlertStatus);

module.exports = router;