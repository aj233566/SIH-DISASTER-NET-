const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");


// =====================================================
// SIGNUP
// =====================================================

const signup = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            password,
            state,
            district,
            role,
            department,
            designation,
            employeeId
        } = req.body;


        // ---------------------------------------------
        // Basic validation
        // ---------------------------------------------

        if (
            !name ||
            !email ||
            !phone ||
            !password ||
            !state ||
            !district
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Name, email, phone, password, state and district are required."
            });
        }


        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must contain at least 6 characters."
            });
        }


        // ---------------------------------------------
        // Validate role
        // ---------------------------------------------

        const selectedRole =
            role === "authority" ? "authority" : "citizen";


        // ---------------------------------------------
        // Authority validation
        // ---------------------------------------------

        if (selectedRole === "authority") {

            if (
                !department ||
                !designation ||
                !employeeId
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Department, designation and employee/authority ID are required for authority accounts."
                });
            }
        }


        // ---------------------------------------------
        // Normalize email
        // ---------------------------------------------

        const normalizedEmail =
            email.trim().toLowerCase();


        // ---------------------------------------------
        // Check existing account
        // ---------------------------------------------

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message:
                    "An account with this email already exists."
            });
        }


        // ---------------------------------------------
        // Hash password
        // ---------------------------------------------

        const hashedPassword =
            await bcrypt.hash(password, 10);


        // ---------------------------------------------
        // Create user
        // ---------------------------------------------

        const user = await User.create({

            name: name.trim(),

            email: normalizedEmail,

            phone: phone.trim(),

            password: hashedPassword,

            role: selectedRole,

            location: {
                state: state.trim(),
                district: district.trim()
            },

            department:
                selectedRole === "authority"
                    ? department.trim()
                    : "",

            designation:
                selectedRole === "authority"
                    ? designation.trim()
                    : "",

            employeeId:
                selectedRole === "authority"
                    ? employeeId.trim()
                    : "",

            authorityStatus:
                selectedRole === "authority"
                    ? "pending"
                    : "not_applicable"
        });


        // ---------------------------------------------
        // Response
        // ---------------------------------------------

        return res.status(201).json({
            success: true,
            message:
                selectedRole === "authority"
                    ? "Authority account created successfully. Your account is waiting for admin approval."
                    : "Account created successfully.",

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                authorityStatus: user.authorityStatus
            }
        });

    } catch (error) {

        console.error("Signup error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while creating account."
        });
    }
};


// =====================================================
// LOGIN
// =====================================================

const login = async (req, res) => {

    try {

        const { email, password } = req.body;


        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }


        const normalizedEmail =
            email.trim().toLowerCase();


        // ---------------------------------------------
        // Find user
        // ---------------------------------------------

        const user = await User.findOne({
            email: normalizedEmail
        });


        if (!user) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }


        // ---------------------------------------------
        // Check password
        // ---------------------------------------------

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }


        // ---------------------------------------------
        // Authority approval check
        // ---------------------------------------------

        if (
            user.role === "authority" &&
            user.authorityStatus !== "verified"
        ) {

            if (user.authorityStatus === "rejected") {

                return res.status(403).json({
                    success: false,
                    message:
                        user.rejectionReason
                            ? `Your authority application was rejected: ${user.rejectionReason}`
                            : "Your authority application was rejected.",

                    authorityStatus: "rejected"
                });
            }


            return res.status(403).json({
                success: false,
                message:
                    "Your authority account is awaiting admin approval.",

                authorityStatus: "pending"
            });
        }


        // ---------------------------------------------
        // Generate JWT
        // ---------------------------------------------

        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "7d"
            }
        );


        // ---------------------------------------------
        // Response
        // ---------------------------------------------

        return res.status(200).json({

            success: true,

            message: "Login successful.",

            token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,

                location: user.location,

                department: user.department,
                designation: user.designation,
                employeeId: user.employeeId,

                authorityStatus:
                    user.authorityStatus
            }
        });

    } catch (error) {

        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while logging in."
        });
    }
};


module.exports = {
    signup,
    login
};