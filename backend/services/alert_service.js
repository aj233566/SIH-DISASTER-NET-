const Alert = require("../models/alert");
const Notification = require("../models/notification");

const LEVEL_RANK = {
  LOW: 0,
  MODERATE: 1,
  HIGH: 2,
  CRITICAL: 3,
};

const HIGH_THRESHOLD = 65;
const CRITICAL_THRESHOLD = 80;

async function processRiskAlert({
  location,
  disasterType,
  risk,
  aiAssessment,
  recommendations = [],
}) {
  const aiScore =
    typeof aiAssessment?.aiScore === "number"
      ? aiAssessment.aiScore
      : null;

  const baselineScore =
    typeof risk?.score === "number"
      ? risk.score
      : 0;

  const score = aiScore ?? baselineScore;

  const level =
    aiAssessment?.aiLevel ||
    risk?.level ||
    "LOW";

  // Only HIGH and CRITICAL become early-warning alerts.
  if (score < HIGH_THRESHOLD) {
    return null;
  }

  const latitude = Number(location.latitude);
  const longitude = Number(location.longitude);

  const fingerprint =
    `${disasterType}:${latitude.toFixed(3)}:${longitude.toFixed(3)}`;

  let alert = await Alert.findOne({
    fingerprint,
    status: {
      $in: ["Active", "Acknowledged", "Escalated"],
    },
  });

  const previousLevel = alert?.riskLevel || null;

  if (!alert) {
    alert = await Alert.create({
      fingerprint,

      disasterType,

      location: {
        name: location.name || "Unknown location",
        latitude,
        longitude,
      },

      riskScore: score,

      riskLevel: level,

      aiConfidence:
        aiAssessment?.confidence || 0,

      majorContributors:
        risk?.majorContributors || [],

      recommendations,

      status: "Active",

      source: "risk_engine",
    });

    await createNotification({
      alert,
      reason: "new",
    });

    console.log(
      `🚨 NEW ${level} ALERT CREATED: ${location.name}`
    );

    return alert;
  }

  // Update existing alert
  alert.riskScore = score;
  alert.riskLevel = level;
  alert.aiConfidence =
    aiAssessment?.confidence || 0;

  alert.majorContributors =
    risk?.majorContributors || [];

  alert.recommendations = recommendations;

  await alert.save();

  // Notify only if risk level increased.
  if (
    LEVEL_RANK[level] >
    LEVEL_RANK[previousLevel]
  ) {
    await createNotification({
      alert,
      reason: "escalated",
    });

    console.log(
      `🚨 ALERT ESCALATED: ${location.name} → ${level}`
    );
  }

  return alert;
}

async function createNotification({
  alert,
  reason,
}) {
  const isCritical =
    alert.riskLevel === "CRITICAL";

  const disasterName =
    formatDisasterType(alert.disasterType);

  let titleEn;

  let messageEn;

  if (reason === "escalated") {
    titleEn =
      `Risk Escalated: ${disasterName}`;

    messageEn =
      `${alert.location.name} risk increased to ${alert.riskLevel} (${alert.riskScore}/100).`;
  } else {
    titleEn =
      `${alert.riskLevel} Early Warning: ${disasterName}`;

    messageEn =
      `${alert.location.name} has reached ${alert.riskLevel} risk (${alert.riskScore}/100).`;
  }

  const notification =
    await Notification.create({
      alertId: alert._id,

      channel: "in_app",

      type: isCritical
        ? "critical"
        : "warning",

      title: {
        en: titleEn,

        hi:
          isCritical
            ? `गंभीर प्रारंभिक चेतावनी: ${disasterName}`
            : `प्रारंभिक चेतावनी: ${disasterName}`,
      },

      message: {
        en: messageEn,

        hi:
          `${alert.location.name} में जोखिम स्तर ${alert.riskLevel} (${alert.riskScore}/100) है।`,
      },

      targetAudience:
        "Authority & Emergency Response",

      read: false,

      delivered: true,
    });

  return notification;
}

function formatDisasterType(type) {
  return String(type || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}

module.exports = {
  processRiskAlert,
};