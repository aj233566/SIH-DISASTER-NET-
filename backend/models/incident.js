const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            required: [true, "Incident type is required"],
            enum: [
                "landslide",
                "road_blockage",
                "flash_flood",
                "slope_crack",
                "slope_movement",
                "infrastructure_damage"
            ]
        },

        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true
        },

        severity: {
            type: String,
            enum: ["low", "moderate", "high", "critical"],
            default: "moderate"
        },

        location: {
            latitude: {
                type: Number,
                required: [true, "Latitude is required"]
            },

            longitude: {
                type: Number,
                required: [true, "Longitude is required"]
            },

            address: {
                type: String,
                default: ""
            }
        },

        status: {
            type: String,
            enum: [
                "submitted",
                "verified",
                "in_progress",
                "resolved"
            ],
            default: "submitted"
        },

        reportedBy: {
            type: String,
            default: "anonymous"
        },

        images: [
            {
                type: String
            }
        ],

        videos: [
            {
                type: String
            }
        ]
    },
    {
        timestamps: true
    }
);

const Incident = mongoose.model(
    "Incident",
    incidentSchema
);

module.exports = Incident;