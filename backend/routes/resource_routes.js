const express = require("express");

const {
    getResources,
    getResourceById,
    createResource,
    updateResource
} = require(
    "../controllers/resource_controller"
);

const router = express.Router();

// Get all resources.
router.get(
    "/",
    getResources
);

// Get one resource.
router.get(
    "/:id",
    getResourceById
);

// Create resource.
router.post(
    "/",
    createResource
);

// Update resource.
router.patch(
    "/:id",
    updateResource
);

module.exports = router;