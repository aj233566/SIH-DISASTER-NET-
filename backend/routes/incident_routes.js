const express = require("express");

const {
    createIncident,
    getIncidents,
    getIncidentById,
    updateIncidentStatus,
    getIncidentEvidence
} = require("../controllers/incident_controller");

const uploadEvidence = require("../middlewares/uploadEvidence");

const router = express.Router();

router
    .route("/")
    .get(getIncidents)
    .post(
        uploadEvidence.fields([
            { name: "images", maxCount: 5 },
            { name: "videos", maxCount: 2 }
        ]),
        createIncident
    );

router
    .route("/:id")
    .get(getIncidentById)
    .patch(updateIncidentStatus);

router.get(
    "/evidence/:fileId",
    getIncidentEvidence
);

module.exports = router;