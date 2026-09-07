const express = require("express");

const router = express.Router();

const {
    getAdminStats,
    getPendingAuthorities,
    getAllAuthorities,
    approveAuthority,
    rejectAuthority
} = require("../controllers/admin_controller");

const {
    protect,
    authorizeAdmin
} = require("../middlewares/auth_middleware");


router.get(
    "/stats",
    protect,
    authorizeAdmin,
    getAdminStats
);


router.get(
    "/authorities/pending",
    protect,
    authorizeAdmin,
    getPendingAuthorities
);


router.get(
    "/authorities",
    protect,
    authorizeAdmin,
    getAllAuthorities
);


router.patch(
    "/authorities/:id/approve",
    protect,
    authorizeAdmin,
    approveAuthority
);


router.patch(
    "/authorities/:id/reject",
    protect,
    authorizeAdmin,
    rejectAuthority
);


module.exports = router;