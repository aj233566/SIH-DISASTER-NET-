const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    fingerprint: {
      type: String,
      required: true,
      index: true,
    },

    disasterType: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      name: {
        type: String,
        required: true,
      },

      latitude: {
        type: Number,
        required: true,
      },

      longitude: {
        type: Number,
        required: true,
      },
    },

    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    riskLevel: {
      type: String,
      enum: ["LOW", "MODERATE", "HIGH", "CRITICAL"],
      required: true,
    },

    aiConfidence: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    majorContributors: [
      {
        key: String,
        label: String,
        level: String,
        contribution: Number,
        reason: String,
      },
    ],

    recommendations: [
      {
        type: String,
      },
    ],

    status: {
      type: String,
      enum: ["Active", "Acknowledged", "Resolved", "Escalated"],
      default: "Active",
    },

    source: {
      type: String,
      default: "risk_engine",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Alert", alertSchema);