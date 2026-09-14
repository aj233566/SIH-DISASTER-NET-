const Incident = require("../models/incident");
const { getGridFSBucket } = require("../config/gridfs");
const mongoose = require("mongoose");

const createIncident = async (req, res) => {
    try {
        const images = req.files?.images || [];
        const videos = req.files?.videos || [];

        // Evidence is mandatory
        if (images.length === 0 && videos.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Photo or video evidence is required."
            });
        }

        const bucket = getGridFSBucket();

        const uploadFile = (file) => {
            return new Promise((resolve, reject) => {
                const uploadStream = bucket.openUploadStream(
                    file.originalname,
                    {
                        contentType: file.mimetype,
                        metadata: {
                            originalName: file.originalname,
                            uploadedBy: req.body.reportedBy || "anonymous",
                            evidenceType: file.mimetype.startsWith("image/")
                                ? "image"
                                : "video"
                        }
                    }
                );

                uploadStream.on("error", reject);

                uploadStream.on("finish", () => {
                    resolve(uploadStream.id.toString());
                });

                uploadStream.end(file.buffer);
            });
        };

        const imageIds = [];

        for (const file of images) {
            const fileId = await uploadFile(file);
            imageIds.push(fileId);
        }

        const videoIds = [];

        for (const file of videos) {
            const fileId = await uploadFile(file);
            videoIds.push(fileId);
        }

        const incident = await Incident.create({
            type: req.body.type,
            description: req.body.description,
            severity: req.body.severity,

            location: {
                latitude: Number(req.body.latitude),
                longitude: Number(req.body.longitude),
                address: req.body.address || ""
            },

            status: "submitted",

            reportedBy: req.body.reportedBy || "anonymous",

            images: imageIds,
            videos: videoIds
        });

        res.status(201).json({
            success: true,
            message: "Incident reported successfully",
            data: incident
        });

    } catch (error) {
        console.error("Incident creation error:", error);

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// GET ALL INCIDENTS
// GET RECENT SUBMITTED INCIDENTS
const getIncidents = async (req, res) => {
    try {
        const incidents = await Incident.find({
            status: "submitted"
        })
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            success: true,
            count: incidents.length,
            data: incidents
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// GET SINGLE INCIDENT
const getIncidentById = async (req, res) => {
    try {
        const incident = await Incident.findById(req.params.id);

        if (!incident) {
            return res.status(404).json({
                success: false,
                message: "Incident not found"
            });
        }

        res.status(200).json({
            success: true,
            data: incident
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// UPDATE INCIDENT STATUS
const updateIncidentStatus = async (req, res) => {
    try {
        const incident = await Incident.findByIdAndUpdate(
            req.params.id,
            {
                status: req.body.status
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!incident) {
            return res.status(404).json({
                success: false,
                message: "Incident not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Incident status updated",
            data: incident
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


const getIncidentEvidence = async (req, res) => {
    try {
        const fileId = new mongoose.Types.ObjectId(
            req.params.fileId
        );

        const bucket = getGridFSBucket();

        const files = await bucket
            .find({ _id: fileId })
            .toArray();

        if (!files.length) {
            return res.status(404).json({
                success: false,
                message: "Evidence not found"
            });
        }

        const file = files[0];

        res.set(
            "Content-Type",
            file.contentType || "application/octet-stream"
        );

        res.set(
            "Content-Disposition",
            `inline; filename="${file.filename}"`
        );

        bucket
            .openDownloadStream(fileId)
            .pipe(res);

    } catch (error) {
        console.error("Evidence retrieval error:", error);

        res.status(400).json({
            success: false,
            message: "Unable to retrieve evidence"
        });
    }
};


module.exports = {
    createIncident,
    getIncidents,
    getIncidentById,
    updateIncidentStatus,
    getIncidentEvidence
};