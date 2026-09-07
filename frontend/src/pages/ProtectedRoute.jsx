import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    let user;

    try {
        user = storedUser
            ? JSON.parse(storedUser)
            : null;
    } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    // Not logged in
    if (!token || !user) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    // Role check
    if (
        allowedRoles &&
        !allowedRoles.includes(user.role)
    ) {
        if (user.role === "admin") {
            return (
                <Navigate
                    to="/admin"
                    replace
                />
            );
        }

        if (
            user.role === "authority" &&
            user.authorityStatus === "verified"
        ) {
            return (
                <Navigate
                    to="/command-center"
                    replace
                />
            );
        }

        if (user.role === "citizen") {
            return (
                <Navigate
                    to="/dashboard"
                    replace
                />
            );
        }

        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    // Authority approval check
    if (
        user.role === "authority" &&
        user.authorityStatus !== "verified"
    ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    return children;
}

export default ProtectedRoute;
