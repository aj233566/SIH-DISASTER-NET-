const User = require("../models/user");
const Incident = require("../models/incident");


// =============================================
// ADMIN STATISTICS
// =============================================

const getAdminStats = async (req, res) => {

    try {

        const [
            totalCitizens,
            totalAuthorities,
            pendingAuthorities,
            verifiedAuthorities,
            rejectedAuthorities
        ] = await Promise.all([

            User.countDocuments({
                role: "citizen"
            }),

            User.countDocuments({
                role: "authority"
            }),

            User.countDocuments({
                role: "authority",
                authorityStatus: "pending"
            }),

            User.countDocuments({
                role: "authority",
                authorityStatus: "verified"
            }),

            User.countDocuments({
                role: "authority",
                authorityStatus: "rejected"
            })

        ]);


        return res.status(200).json({

            success: true,

            stats: {
                totalCitizens,
                totalAuthorities,
                pendingAuthorities,
                verifiedAuthorities,
                rejectedAuthorities
            }

        });

    } catch (error) {

        console.error(
            "Admin stats error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to load admin statistics."

        });

    }
};


// =============================================
// PENDING AUTHORITIES
// =============================================

const getPendingAuthorities = async (req, res) => {

    try {

        const authorities =
            await User.find({
                role: "authority",
                authorityStatus: "pending"
            })
            .select("-password")
            .sort({
                createdAt: -1
            });


        return res.status(200).json({

            success: true,

            authorities

        });

    } catch (error) {

        console.error(
            "Pending authorities error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to load pending authorities."

        });

    }
};


// =============================================
// ALL AUTHORITIES
// =============================================

const getAllAuthorities = async (req, res) => {

    try {

        const authorities =
            await User.find({
                role: "authority"
            })
            .select("-password")
            .sort({
                createdAt: -1
            });


        return res.status(200).json({

            success: true,

            authorities

        });

    } catch (error) {

        console.error(
            "All authorities error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to load authorities."

        });

    }
};


// =============================================
// APPROVE AUTHORITY
// =============================================

const approveAuthority = async (req, res) => {

    try {

        const authority =
            await User.findOne({
                _id: req.params.id,
                role: "authority"
            });


        if (!authority) {

            return res.status(404).json({

                success: false,

                message:
                    "Authority account not found."

            });

        }


        authority.authorityStatus =
            "verified";

        authority.verifiedAt =
            new Date();

        authority.rejectedAt =
            null;

        authority.rejectionReason =
            "";


        await authority.save();


        return res.status(200).json({

            success: true,

            message:
                "Authority approved successfully."

        });

    } catch (error) {

        console.error(
            "Approve authority error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to approve authority."

        });

    }
};


// =============================================
// REJECT AUTHORITY
// =============================================

const rejectAuthority = async (req, res) => {

    try {

        const {
            reason
        } = req.body;


        if (!reason || !reason.trim()) {

            return res.status(400).json({

                success: false,

                message:
                    "Rejection reason is required."

            });

        }


        const authority =
            await User.findOne({
                _id: req.params.id,
                role: "authority"
            });


        if (!authority) {

            return res.status(404).json({

                success: false,

                message:
                    "Authority account not found."

            });

        }


        authority.authorityStatus =
            "rejected";

        authority.rejectedAt =
            new Date();

        authority.rejectionReason =
            reason.trim();


        await authority.save();


        return res.status(200).json({

            success: true,

            message:
                "Authority application rejected."

        });

    } catch (error) {

        console.error(
            "Reject authority error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to reject authority."

        });

    }
};


module.exports = {
    getAdminStats,
    getPendingAuthorities,
    getAllAuthorities,
    approveAuthority,
    rejectAuthority
};