import {
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./pages/ProtectedRoute";


function getStoredUser() {

    const storedUser =
        localStorage.getItem("user");

    if (!storedUser) {
        return null;
    }

    try {

        return JSON.parse(storedUser);

    } catch {

        localStorage.removeItem("user");
        localStorage.removeItem("token");

        return null;
    }
}


function getHomePath(user) {

    if (!user) {
        return "/login";
    }


    // ADMIN
    if (user.role === "admin") {
        return "/admin";
    }


    // CITIZEN
    if (user.role === "citizen") {
        return "/dashboard";
    }


    // Authority is not integrated yet.
    // CommandCenter will be added during integration.
    if (user.role === "authority") {
        return "/login";
    }


    return "/login";
}


function App() {

    const token =
        localStorage.getItem("token");

    const user =
        getStoredUser();

    const isLoggedIn =
        Boolean(token && user);


    return (

        <Routes>

            {/* =========================
                HOME
            ========================= */}

            <Route
                path="/"
                element={
                    <Navigate
                        to={
                            isLoggedIn
                                ? getHomePath(user)
                                : "/login"
                        }
                        replace
                    />
                }
            />


            {/* =========================
                LOGIN
            ========================= */}

            <Route
                path="/login"
                element={
                    isLoggedIn ? (
                        <Navigate
                            to={getHomePath(user)}
                            replace
                        />
                    ) : (
                        <Login />
                    )
                }
            />


            {/* =========================
                SIGNUP
            ========================= */}

            <Route
                path="/signup"
                element={
                    isLoggedIn ? (
                        <Navigate
                            to={getHomePath(user)}
                            replace
                        />
                    ) : (
                        <Signup />
                    )
                }
            />


            {/* =========================
                CITIZEN DASHBOARD
            ========================= */}

            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute
                        allowedRoles={["citizen"]}
                    >
                        <Dashboard />
                    </ProtectedRoute>
                }
            />


            {/* =========================
                ADMIN DASHBOARD
            ========================= */}

            <Route
                path="/admin"
                element={
                    <ProtectedRoute
                        allowedRoles={["admin"]}
                    >
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />


            {/* =========================
                UNKNOWN ROUTE
            ========================= */}

            <Route
                path="*"
                element={
                    <Navigate
                        to="/"
                        replace
                    />
                }
            />

        </Routes>
    );
}


export default App;