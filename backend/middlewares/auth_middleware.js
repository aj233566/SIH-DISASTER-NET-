const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};


const authorize = (...roles) => {
    return (req, res, next) => {

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        next();
    };
};

const authorizeAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Admin access required",
        });
    }

    next();
};

const authorizeVerifiedAuthority = (req, res, next) => {

    if (
        !req.user ||
        req.user.role !== "authority"
    ) {

        return res.status(403).json({
            success: false,
            message: "Authority access required."
        });
    }


    if (
        req.user.authorityStatus !== "verified"
    ) {

        return res.status(403).json({
            success: false,
            message:
                "Your authority account has not been approved."
        });
    }


    next();
};


module.exports = {
    protect,
    authorize,
    authorizeAdmin,
    authorizeVerifiedAuthority
};