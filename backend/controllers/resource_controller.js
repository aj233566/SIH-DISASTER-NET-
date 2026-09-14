const Resource = require("../models/resource");

// ============================================================
// FORMAT RESOURCE
// ============================================================

const formatResource = (resource) => {
    const total =
        Number(resource.total || 0);

    const available =
        Number(resource.available || 0);

    const deployed =
        Number(resource.deployed || 0);

    const percentage =
        total > 0
            ? Math.round(
                (available / total) * 100
            )
            : 0;

    return {
        id: resource._id,

        _id: resource._id,

        resourceId:
            resource.resourceId,

        name:
            resource.name,

        category:
            resource.category,

        description:
            resource.description,

        total,

        available,

        deployed,

        reserved:
            resource.reserved || 0,

        totalUnits:
            total,

        availableUnits:
            available,

        deployedUnits:
            deployed,

        percentage,

        status:
            resource.status,

        location:
            resource.location,

        updatedBy:
            resource.updatedBy,

        createdAt:
            resource.createdAt,

        updatedAt:
            resource.updatedAt
    };
};

// ============================================================
// GET RESOURCES
// GET /api/resources
// ============================================================

const getResources = async (
    req,
    res
) => {
    try {
        const resources =
            await Resource.find({})
                .sort({
                    category: 1,
                    name: 1
                })
                .lean();

        const data =
            resources.map(
                formatResource
            );

        res.status(200).json({
            success: true,

            count:
                data.length,

            data
        });
    } catch (error) {
        console.error(
            "Resource fetch error:",
            error
        );

        res.status(500).json({
            success: false,

            message:
                "Failed to fetch resources."
        });
    }
};

// ============================================================
// GET RESOURCE BY ID
// GET /api/resources/:id
// ============================================================

const getResourceById =
    async (req, res) => {
        try {
            const resource =
                await Resource.findById(
                    req.params.id
                ).lean();

            if (!resource) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Resource not found."
                });
            }

            res.status(200).json({
                success: true,

                data:
                    formatResource(
                        resource
                    )
            });
        } catch (error) {
            console.error(
                "Resource fetch error:",
                error
            );

            res.status(500).json({
                success: false,

                message:
                    "Failed to fetch resource."
            });
        }
    };

// ============================================================
// CREATE RESOURCE
// POST /api/resources
// ============================================================

const createResource = async (
    req,
    res
) => {
    try {
        const {
            resourceId,
            name,
            category,
            description = "",
            total = 0,
            available = 0,
            deployed = 0,
            reserved = 0,
            location = "",
            updatedBy = "system"
        } = req.body;

        if (
            !name ||
            !name.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Resource name is required."
            });
        }

        if (
            !category ||
            !category.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Resource category is required."
            });
        }

        if (
            available > total
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Available resources cannot exceed total resources."
            });
        }

        const resource =
            await Resource.create({
                resourceId,
                name:
                    name.trim(),
                category:
                    category.trim(),
                description,
                total,
                available,
                deployed,
                reserved,
                location,
                updatedBy,
                status:
                    calculateResourceStatus(
                        total,
                        available,
                        deployed
                    )
            });

        res.status(201).json({
            success: true,

            message:
                "Resource created successfully.",

            data:
                formatResource(
                    resource.toObject()
                )
        });
    } catch (error) {
        console.error(
            "Resource creation error:",
            error
        );

        res.status(500).json({
            success: false,

            message:
                "Failed to create resource."
        });
    }
};

// ============================================================
// UPDATE RESOURCE
// PATCH /api/resources/:id
// ============================================================

const updateResource = async (
    req,
    res
) => {
    try {
        const allowedFields = [
            "name",
            "category",
            "description",
            "total",
            "available",
            "deployed",
            "reserved",
            "location",
            "updatedBy"
        ];

        const updates = {};

        allowedFields.forEach(
            (field) => {
                if (
                    req.body[field] !==
                    undefined
                ) {
                    updates[field] =
                        req.body[field];
                }
            }
        );

        const current =
            await Resource.findById(
                req.params.id
            );

        if (!current) {
            return res.status(404).json({
                success: false,
                message:
                    "Resource not found."
            });
        }

        const total =
            updates.total ??
            current.total;

        const available =
            updates.available ??
            current.available;

        const deployed =
            updates.deployed ??
            current.deployed;

        if (
            total < 0 ||
            available < 0 ||
            deployed < 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Resource quantities cannot be negative."
            });
        }

        if (
            available > total
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Available resources cannot exceed total resources."
            });
        }

        updates.status =
            calculateResourceStatus(
                total,
                available,
                deployed
            );

        const resource =
            await Resource.findByIdAndUpdate(
                req.params.id,
                updates,
                {
                    new: true,
                    runValidators: true
                }
            ).lean();

        res.status(200).json({
            success: true,

            message:
                "Resource updated successfully.",

            data:
                formatResource(
                    resource
                )
        });
    } catch (error) {
        console.error(
            "Resource update error:",
            error
        );

        res.status(500).json({
            success: false,

            message:
                "Failed to update resource."
        });
    }
};

// ============================================================
// RESOURCE STATUS
// ============================================================

const calculateResourceStatus = (
    total,
    available,
    deployed
) => {
    if (total === 0) {
        return "Unavailable";
    }

    if (available === 0) {
        return "Deployed";
    }

    const percentage =
        (available / total) * 100;

    if (percentage <= 25) {
        return "Limited";
    }

    return "Available";
};

module.exports = {
    getResources,
    getResourceById,
    createResource,
    updateResource
};