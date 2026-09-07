const express = require("express");

const {
    signup,
    login
} = require("../controllers/auth_controller");

const router = express.Router();


// Signup
router.post("/signup", signup);


// Login
router.post("/login", login);


module.exports = router;