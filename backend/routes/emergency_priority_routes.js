const express = require("express");

const {
    getPrioritisedAreas,
    getPrioritisedAreaById,
    dispatchTeam
} = require(
    "../controllers/emergency_priority_controller"
);

const router = express.Router();

// Get all active incidents as prioritised
// emergency areas.
router.get(
    "/",
    getPrioritisedAreas
);

// Get one emergency area.
router.get(
    "/:id",
    getPrioritisedAreaById
);

// Dispatch emergency response unit.
router.post(
    "/:id/dispatch",
    dispatchTeam
);

module.exports = router;