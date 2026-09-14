const mongoose = require("mongoose");

const Incident = require("../models/incident");

const EmergencyDispatchModel = require(
    "../models/emergency_dispatch"
);

const Resource = require("../models/resource");

// ============================================================
// PRIORITY / RISK HELPERS
// ============================================================

const severityScore = {
    low: 25,
    moderate: 50,
    high: 75,
    critical: 95
};

const getRiskLevel = (severity) => {
    switch (severity) {
        case "critical":
            return "Critical";

        case "high":
            return "High";

        case "moderate":
            return "Moderate";

        case "low":
        default:
            return "Low";
    }
};

const getTypeWeight = (type) => {
    switch (type) {
        case "flash_flood":
            return 8;

        case "slope_movement":
            return 7;

        case "landslide":
            return 6;

        case "road_blockage":
            return 5;

        case "slope_crack":
            return 4;

        case "infrastructure_damage":
            return 3;

        default:
            return 0;
    }
};

const calculateRiskScore = (incident) => {
    const base =
        severityScore[incident.severity] || 50;

    const typeWeight =
        getTypeWeight(incident.type);

    const statusWeight =
        incident.status === "verified" ? 5 : 0;

    const score = Math.min(
        100,
        base + typeWeight + statusWeight
    );

    return score;
};

const calculatePriority = (
    riskScore,
    severity,
    nearbyIncidentCount
) => {
    /*
     * Priority 1:
     * Critical incidents or extremely high risk.
     *
     * Priority 2:
     * High/moderate risk requiring response.
     *
     * Priority 3:
     * Lower-risk monitoring cases.
     */

    if (
        severity === "critical" ||
        riskScore >= 85 ||
        (
            riskScore >= 75 &&
            nearbyIncidentCount >= 2
        )
    ) {
        return 1;
    }

    if (
        severity === "high" ||
        riskScore >= 55 ||
        (
            riskScore >= 45 &&
            nearbyIncidentCount >= 2
        )
    ) {
        return 2;
    }

    return 3;
};

// ============================================================
// DISTANCE CALCULATION
// ============================================================

const calculateDistanceKm = (
    lat1,
    lon1,
    lat2,
    lon2
) => {
    const earthRadius = 6371;

    const dLat =
        ((lat2 - lat1) * Math.PI) / 180;

    const dLon =
        ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return earthRadius * c;
};

// ============================================================
// FIND NEARBY INCIDENTS
// ============================================================

const getNearbyIncidentCount = (
    incident,
    allIncidents
) => {
    const latitude =
        incident.location?.latitude;

    const longitude =
        incident.location?.longitude;

    if (
        typeof latitude !== "number" ||
        typeof longitude !== "number"
    ) {
        return 0;
    }

    const radiusKm = 10;

    return allIncidents.filter((other) => {
        if (
            String(other._id) ===
            String(incident._id)
        ) {
            return false;
        }

        if (
            !other.location ||
            typeof other.location.latitude !==
            "number" ||
            typeof other.location.longitude !==
            "number"
        ) {
            return false;
        }

        const distance =
            calculateDistanceKm(
                latitude,
                longitude,
                other.location.latitude,
                other.location.longitude
            );

        return distance <= radiusKm;
    }).length;
};

// ============================================================
// RESPONSE STATUS
// ============================================================

const getResponseStatus = (
    incident,
    dispatch
) => {
    if (incident.status === "resolved") {
        return "Resolved";
    }

    if (dispatch) {
        switch (dispatch.status) {
            case "en_route":
                return "Dispatching";

            case "arrived":
                return "Under Response";

            case "completed":
                return "Resolved";

            case "cancelled":
                return "Awaiting Dispatch";

            case "dispatched":
            default:
                return "Dispatching";
        }
    }

    if (incident.status === "in_progress") {
        return "Under Response";
    }

    return "Awaiting Dispatch";
};

// ============================================================
// FORMAT INCIDENT FOR FRONTEND
// ============================================================

const formatEmergencyArea = (
    incident,
    nearbyIncidentCount,
    dispatch
) => {
    const riskScore =
        calculateRiskScore(incident);

    const priority =
        calculatePriority(
            riskScore,
            incident.severity,
            nearbyIncidentCount
        );

    const risk =
        getRiskLevel(incident.severity);

    let roadStatus = "Unknown";

    if (
        incident.type === "road_blockage"
    ) {
        roadStatus = "Blocked";
    } else {
        roadStatus = "Open";
    }

    const responseStatus =
        getResponseStatus(
            incident,
            dispatch
        );

    /*
     * Use the incident address when available.
     *
     * If address is unavailable, expose coordinates
     * instead of displaying "Unknown location".
     */

    let location = "Unknown location";

    if (
        incident.location?.address &&
        incident.location.address.trim()
    ) {
        location =
            incident.location.address.trim();
    } else if (
        typeof incident.location?.latitude ===
        "number" &&
        typeof incident.location?.longitude ===
        "number"
    ) {
        location =
            `${incident.location.latitude.toFixed(4)}, ` +
            `${incident.location.longitude.toFixed(4)}`;
    }

    return {
        id: incident._id,
        _id: incident._id,

        incidentId: incident._id,

        location,

        address:
            incident.location?.address ||
            "",

        latitude:
            incident.location?.latitude,

        longitude:
            incident.location?.longitude,

        type:
            incident.type,

        description:
            incident.description,

        severity:
            incident.severity,

        riskScore,

        risk,

        riskLevel: risk,

        priority,

        priorityRank: priority,

        priorityQueue:
            `Priority ${priority}`,

        priorityLabel:
            `Priority ${priority}`,

        /*
         * These fields are not currently stored
         * in the Incident model.
         *
         * Keep them null instead of falsely
         * claiming that the population is zero.
         */

        affectedPopulation: null,

        vulnerablePopulation: null,

        roadStatus,

        roadDetails:
            roadStatus === "Blocked"
                ? "Road blockage reported"
                : "No road blockage reported",

        nearestHospital:
            "Not available",

        nearestShelter:
            "Not available",

        availableResources: 0,

        requiredResources: 0,

        nearbyIncidentCount,

        responseStatus,

        assignedTeam:
            dispatch?.unitName || "",

        assignedUnits:
            dispatch ? 1 : 0,

        incidentStatus:
            incident.status,

        reportedBy:
            incident.reportedBy,

        reportedAt:
            incident.createdAt,

        lastUpdated:
            incident.updatedAt
    };
};

// ============================================================
// GET PRIORITISED AREAS
// GET /api/emergency-priority
// ============================================================

const getPrioritisedAreas = async (
    req,
    res
) => {
    try {
        const incidents =
            await Incident.find({
                status: {
                    $ne: "resolved"
                }
            })
                .sort({
                    createdAt: -1
                })
                .lean();

        const incidentIds =
            incidents.map(
                (incident) => incident._id
            );

        /*
         * Get active dispatch records for
         * the incidents returned above.
         */

        const dispatches =
            incidentIds.length > 0
                ? await EmergencyDispatchModel.find({
                    incidentId: {
                        $in: incidentIds
                    },

                    status: {
                        $nin: [
                            "completed",
                            "cancelled"
                        ]
                    }
                })
                    .sort({
                        createdAt: -1
                    })
                    .lean()
                : [];

        /*
         * One incident can theoretically have
         * multiple dispatch records.
         *
         * Keep the newest active dispatch.
         */

        const dispatchMap = new Map();

        dispatches.forEach((dispatch) => {
            const key =
                String(dispatch.incidentId);

            if (!dispatchMap.has(key)) {
                dispatchMap.set(
                    key,
                    dispatch
                );
            }
        });

        /*
         * Convert incidents into the structure
         * expected by the Emergency Priority UI.
         */

        const emergencyAreas =
            incidents.map((incident) => {
                const nearbyCount =
                    getNearbyIncidentCount(
                        incident,
                        incidents
                    );

                const dispatch =
                    dispatchMap.get(
                        String(incident._id)
                    );

                return formatEmergencyArea(
                    incident,
                    nearbyCount,
                    dispatch
                );
            });

        /*
         * Sort:
         *
         * Priority 1 first
         * then Priority 2
         * then Priority 3
         *
         * Within each priority:
         * highest risk first.
         */

        emergencyAreas.sort(
            (a, b) => {
                if (
                    a.priority !==
                    b.priority
                ) {
                    return (
                        a.priority -
                        b.priority
                    );
                }

                if (
                    a.riskScore !==
                    b.riskScore
                ) {
                    return (
                        b.riskScore -
                        a.riskScore
                    );
                }

                return (
                    b.nearbyIncidentCount -
                    a.nearbyIncidentCount
                );
            }
        );

        res.status(200).json({
            success: true,

            count:
                emergencyAreas.length,

            data:
                emergencyAreas
        });
    } catch (error) {
        console.error(
            "Emergency priority error:",
            error
        );

        res.status(500).json({
            success: false,

            message:
                "Failed to calculate emergency priority."
        });
    }
};

// ============================================================
// GET SINGLE PRIORITY AREA
// GET /api/emergency-priority/:id
// ============================================================

const getPrioritisedAreaById =
    async (req, res) => {
        try {
            if (
                !mongoose.Types.ObjectId.isValid(
                    req.params.id
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid incident ID."
                });
            }

            const incident =
                await Incident.findById(
                    req.params.id
                ).lean();

            if (!incident) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Incident not found."
                });
            }

            const activeIncidents =
                await Incident.find({
                    status: {
                        $ne: "resolved"
                    }
                }).lean();

            const nearbyCount =
                getNearbyIncidentCount(
                    incident,
                    activeIncidents
                );

            const dispatch =
                await EmergencyDispatchModel.findOne({
                    incidentId:
                        incident._id,

                    status: {
                        $nin: [
                            "completed",
                            "cancelled"
                        ]
                    }
                })
                    .sort({
                        createdAt: -1
                    })
                    .lean();

            const area =
                formatEmergencyArea(
                    incident,
                    nearbyCount,
                    dispatch
                );

            res.status(200).json({
                success: true,
                data: area
            });
        } catch (error) {
            console.error(
                "Emergency area fetch error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to fetch emergency area."
            });
        }
    };

// ============================================================
// DISPATCH TEAM
// POST /api/emergency-priority/:id/dispatch
// ============================================================

const dispatchTeam = async (
    req,
    res
) => {
    try {
        const {
            unitName,
            notes = ""
        } = req.body;

        // ----------------------------------------------------
        // VALIDATE RESPONSE UNIT
        // ----------------------------------------------------

        if (
            !unitName ||
            !unitName.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Response unit name is required."
            });
        }

        // ----------------------------------------------------
        // VALIDATE INCIDENT ID
        // ----------------------------------------------------

        if (
            !mongoose.Types.ObjectId.isValid(
                req.params.id
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid incident ID."
            });
        }

        // ----------------------------------------------------
        // FIND INCIDENT
        // ----------------------------------------------------

        const incident =
            await Incident.findById(
                req.params.id
            );

        if (!incident) {
            return res.status(404).json({
                success: false,
                message:
                    "Incident not found."
            });
        }

        // ----------------------------------------------------
        // PREVENT DISPATCH TO RESOLVED INCIDENT
        // ----------------------------------------------------

        if (
            incident.status ===
            "resolved"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Cannot dispatch to a resolved incident."
            });
        }

        // ----------------------------------------------------
        // CREATE DISPATCH RECORD
        // ----------------------------------------------------

        const dispatch =
            await EmergencyDispatchModel.create({
                incidentId:
                    incident._id,

                unitName:
                    unitName.trim(),

                status:
                    "dispatched",

                notes:
                    typeof notes === "string"
                        ? notes.trim()
                        : ""
            });

        // ----------------------------------------------------
        // MARK INCIDENT AS IN PROGRESS
        // ----------------------------------------------------

        incident.status =
            "in_progress";

        await incident.save();

        // ----------------------------------------------------
        // UPDATE MATCHING RESOURCE
        // ----------------------------------------------------

        /*
         * A response team can optionally correspond
         * to a Resource document.
         *
         * If no matching resource exists, dispatch
         * still succeeds because dispatching a team
         * should not depend on the Resource collection.
         */

        try {
            const escapedUnitName =
                unitName
                    .trim()
                    .replace(
                        /[.*+?^${}()|[\]\\]/g,
                        "\\$&"
                    );

            const resource =
                await Resource.findOne({
                    name: {
                        $regex:
                            `^${escapedUnitName}$`,
                        $options: "i"
                    }
                });

            if (
                resource &&
                resource.available > 0
            ) {
                resource.available -= 1;

                resource.deployed =
                    (resource.deployed || 0) + 1;

                if (
                    resource.available === 0
                ) {
                    resource.status =
                        "Deployed";
                } else {
                    resource.status =
                        "Available";
                }

                await resource.save();
            }
        } catch (resourceError) {
            /*
             * Resource update should not invalidate
             * a successful emergency dispatch.
             */

            console.warn(
                "Resource update skipped:",
                resourceError.message
            );
        }

        // ----------------------------------------------------
        // SUCCESS RESPONSE
        // ----------------------------------------------------

        res.status(201).json({
            success: true,

            message:
                "Emergency response unit dispatched successfully.",

            data: {
                dispatchId:
                    dispatch._id,

                incidentId:
                    incident._id,

                unitName:
                    dispatch.unitName,

                status:
                    dispatch.status,

                incidentStatus:
                    incident.status,

                dispatchedAt:
                    dispatch.dispatchedAt
            }
        });
    } catch (error) {
        console.error(
            "Emergency dispatch error:",
            error
        );

        res.status(500).json({
            success: false,

            message:
                "Failed to dispatch emergency unit.",

            error:
                process.env.NODE_ENV ===
                    "development"
                    ? error.message
                    : undefined
        });
    }
};

// ============================================================
// EXPORT CONTROLLERS
// ============================================================

module.exports = {
    getPrioritisedAreas,
    getPrioritisedAreaById,
    dispatchTeam
};