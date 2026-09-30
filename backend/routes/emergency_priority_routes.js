const express = require("express");
const { protect, optionalProtect, authorizeAuthorityOrAdmin } = require("../middlewares/auth_middleware");

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
    optionalProtect,
    getPrioritisedAreas
);

// Get one emergency area.
router.get(
    "/:id",
    optionalProtect,
    getPrioritisedAreaById
);

// Dispatch emergency response unit.
router.post(
    "/:id/dispatch",
    protect,
    authorizeAuthorityOrAdmin,
    dispatchTeam
);

module.exports = router;