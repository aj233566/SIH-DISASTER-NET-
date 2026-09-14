import { Navigate, useLocation } from "react-router-dom";

function getStoredUser() {
  try {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
}

function ProtectedRoute({ children, allowedRoles = [] }) {
  const location = useLocation();

  const token = localStorage.getItem("token");
  const user = getStoredUser();

  // -----------------------------------------
  // NOT LOGGED IN
  // -----------------------------------------
  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // -----------------------------------------
  // AUTHORITY MUST BE VERIFIED
  // -----------------------------------------
  if (user.role === "authority" && user.authorityStatus !== "verified") {
    return <Navigate to="/login" replace />;
  }

  // -----------------------------------------
  // ROLE CHECK
  // -----------------------------------------
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (user.role === "admin") {
      return <Navigate to="/admin" replace />;
    }

    if (user.role === "authority" && user.authorityStatus === "verified") {
      return <Navigate to="/command-center" replace />;
    }

    return <Navigate to="/dashboard" replace />;
  }

  // -----------------------------------------
  // AUTHORIZED
  // -----------------------------------------
  return children;
}

export default ProtectedRoute;
