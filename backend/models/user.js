const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
        },

        phone: {
            type: String,
            required: true,
            trim: true,
        },

        role: {
            type: String,
            enum: ["citizen", "authority", "admin"],
            default: "citizen",
        },

        location: {
            state: {
                type: String,
                required: true,
                trim: true,
            },

            district: {
                type: String,
                required: true,
                trim: true,
            },
        },

        // Authority information
        department: {
            type: String,
            default: "",
            trim: true,
        },

        designation: {
            type: String,
            default: "",
            trim: true,
        },

        employeeId: {
            type: String,
            default: "",
            trim: true,
        },

        authorityStatus: {
            type: String,
            enum: [
                "not_applicable",
                "pending",
                "verified",
                "rejected",
            ],
            default: "not_applicable",
        },

        verifiedAt: {
            type: Date,
            default: null,
        },

        rejectedAt: {
            type: Date,
            default: null,
        },

        rejectionReason: {
            type: String,
            default: "",
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("User", userSchema);