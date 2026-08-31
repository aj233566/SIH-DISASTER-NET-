const express = require("express");

const {
    createIncident,
    getIncidents,
    getIncidentById,
    updateIncidentStatus
} = require("../controllers/incident_controller");

const router = express.Router();


// GET all incidents
// POST new incident
router
    .route("/")
    .get(getIncidents)
    .post(createIncident);


// GET single incident
// PATCH incident status
router
    .route("/:id")
    .get(getIncidentById)
    .patch(updateIncidentStatus);


module.exports = router;