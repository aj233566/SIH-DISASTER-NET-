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

const optionalProtect = (req, res, next) => {
    const authHeader = req.headers?.authorization;
    if (!authHeader) {
        return next();
    }
    if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Invalid authorization header"
        });
    }
    try {
        req.user = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
        return next();
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

const authorizeAuthorityOrAdmin = (req, res, next) => {
    if (req.user?.role === "admin") {
        return next();
    }

    if (req.user?.role === "authority" && req.user.authorityStatus === "verified") {
        return next();
    }

    return res.status(403).json({
        success: false,
        message: "Verified authority or admin access required."
    });
};


module.exports = {
    protect,
    optionalProtect,
    authorize,
    authorizeAdmin,
    authorizeVerifiedAuthority,
    authorizeAuthorityOrAdmin
};