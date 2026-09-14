import { useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  BrowserRouter,
} from "react-router-dom";

// =========================================================
// AUTHENTICATION
// =========================================================

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./pages/ProtectedRoute";

// =========================================================
// EXISTING DASHBOARDS
// =========================================================

import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CommandCenter from "./pages/CommandCenter";

// =========================================================
// INCIDENTS
// =========================================================

import AuthorityIncidents from "./pages/AuthorityIncidents";
import CitizenIncidents from "./pages/CitizenIncidents";
import ReportIncident from "./pages/ReportIncident";
import IncidentDetails from "./pages/IncidentDetails";

// =========================================================
// EXISTING OTHER PAGES
// =========================================================

import Weather from "./pages/Weather";
import EmergencyResources from "./pages/EmergencyResources";

// =========================================================
// EXISTING COMPONENTS
// =========================================================

import Navbar from "./components/Navbar";
import OfflineBanner from "./components/OfflineBanner";

// =========================================================
// DIVYA PROVIDERS
// =========================================================

import { AlertProvider } from "./context/AlertContext";

// =========================================================
// DIVYA COMMON COMPONENTS
// =========================================================

import Sidebar from "./components/common/Sidebar";

// =========================================================
// DIVYA PAGES
// =========================================================

import OverviewPage from "./pages/OverviewPage";
import AlertsPage from "./pages/AlertsPage";
import EmergencyResponsePage from "./pages/EmergencyResponsePage";
import NotificationsPage from "./pages/NotificationsPage";
import ResourcesPage from "./pages/ResourcesPage";

// =========================================================
// GET USER FROM LOCAL STORAGE
// =========================================================

function getStoredUser() {
  try {
    const storedUser = localStorage.getItem("user");

    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    return null;
  }
}

// =========================================================
// GET HOME PATH BASED ON USER ROLE
// =========================================================

function getHomePath() {
  const user = getStoredUser();

  if (!user) {
    return "/login";
  }

  // Admin
  if (user.role === "admin") {
    return "/admin";
  }

  // Verified authority
  if (user.role === "authority" && user.authorityStatus === "verified") {
    return "/command-center";
  }

  // Citizen
  if (user.role === "citizen") {
    return "/dashboard";
  }

  // Pending/rejected authority
  return "/login";
}

// =========================================================
// EXISTING OPERATIONAL LAYOUT
// =========================================================

function OperationalLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

// =========================================================
// DIVYA OPERATIONS LAYOUT
// =========================================================

function DivyaOperationsLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageInfo = () => {
    switch (location.pathname) {
      case "/alerts":
        return {
          title: "Alerts",
          eyebrow: "EARLY WARNING & GEOTECHNICAL RISK",
        };

      case "/emergency":
        return {
          title: "Emergency Response",
          eyebrow: "AUTOMATED RESPONSE MATRIX",
        };

      case "/notifications":
        return {
          title: "Notifications",
          eyebrow: "MULTI-CHANNEL BROADCAST HUB",
        };
      case "/operations-overview":
      default:
        return {
          title: "Overview",
          eyebrow: "EMERGENCY OPERATIONS COMMAND CENTER",
        };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-content-wrapper">
        {/* Mobile sidebar toggle */}
        {/* <button
          type="button"
          className="mobile-sidebar-toggle"
          onClick={() => setSidebarOpen((previous) => !previous)}
          aria-label="Toggle navigation"
        >
          ☰
        </button> */}

        {/* Page header */}
        <div className="page-header">
          <div>
            {/* <div className="page-eyebrow">{pageInfo.eyebrow}</div> */}

            {/* <h1 className="page-title">{pageInfo.title}</h1> */}
          </div>
        </div>

        <main className="page-body">{children}</main>
      </div>
    </div>
  );
}

// =========================================================
// MAIN APP ROUTES
// =========================================================

function AppRoutes() {
  return (
    <>
      {/* Offline status */}
      <OfflineBanner />

      <Routes>
        {/* =================================================
            HOME
        ================================================= */}

        <Route path="/" element={<Navigate to={getHomePath()} replace />} />

        {/* =================================================
            LOGIN
        ================================================= */}

        <Route
          path="/login"
          element={
            getStoredUser() ? (
              <Navigate to={getHomePath()} replace />
            ) : (
              <Login />
            )
          }
        />

        {/* =================================================
            SIGNUP
        ================================================= */}

        <Route
          path="/signup"
          element={
            getStoredUser() ? (
              <Navigate to={getHomePath()} replace />
            ) : (
              <Signup />
            )
          }
        />

        {/* =================================================
            CITIZEN DASHBOARD
        ================================================= */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["citizen"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            AUTHORITY COMMAND CENTER
        ================================================= */}

        <Route
          path="/command-center"
          element={
            <ProtectedRoute allowedRoles={["authority"]}>
              <CommandCenter />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            INCIDENTS
        ================================================= */}

        <Route
          path="/incidents"
          element={
            <ProtectedRoute allowedRoles={["citizen", "authority", "admin"]}>
              <OperationalLayout>
                <AuthorityIncidents />
              </OperationalLayout>
            </ProtectedRoute>
          }
        />

        {/* =================================================
            AUTHORITY / ADMIN INCIDENT DETAILS
        ================================================= */}

        <Route
          path="/incidents/:id"
          element={
            <ProtectedRoute allowedRoles={["authority", "admin"]}>
              <IncidentDetails />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            CITIZEN INCIDENTS
        ================================================= */}

        <Route
          path="/citizen/incidents"
          element={
            <ProtectedRoute allowedRoles={["citizen"]}>
              <CitizenIncidents />
            </ProtectedRoute>
          }
        />

        <Route
          path="/citizen/incidents/:id"
          element={
            <ProtectedRoute allowedRoles={["citizen"]}>
              <IncidentDetails />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            REPORT INCIDENT
        ================================================= */}

        <Route
          path="/report-incident"
          element={
            <ProtectedRoute allowedRoles={["citizen", "authority"]}>
              <ReportIncident />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            WEATHER
        ================================================= */}

        <Route
          path="/weather"
          element={
            <ProtectedRoute allowedRoles={["citizen", "authority", "admin"]}>
              <OperationalLayout>
                <Weather />
              </OperationalLayout>
            </ProtectedRoute>
          }
        />

        {/* =================================================
            DIVYA ALERTS
        ================================================= */}

        <Route
          path="/alerts"
          element={
            <ProtectedRoute allowedRoles={["authority", "admin"]}>
              <DivyaOperationsLayout>
                <AlertsPage />
              </DivyaOperationsLayout>
            </ProtectedRoute>
          }
        />

        {/* =================================================
            DIVYA EMERGENCY PRIORITISATION
        ================================================= */}

        <Route
          path="/emergency"
          element={
            <ProtectedRoute allowedRoles={["authority", "admin"]}>
              <DivyaOperationsLayout>
                <EmergencyResponsePage />
              </DivyaOperationsLayout>
            </ProtectedRoute>
          }
        />

        {/* =================================================
            DIVYA NOTIFICATIONS
        ================================================= */}

        <Route
          path="/notifications"
          element={
            <ProtectedRoute allowedRoles={["authority", "admin"]}>
              <DivyaOperationsLayout>
                <NotificationsPage />
              </DivyaOperationsLayout>
            </ProtectedRoute>
          }
        />

        {/* =================================================
            DIVYA RESOURCES
        ================================================= */}

        <Route
          path="/resources"
          element={
            <ProtectedRoute allowedRoles={["authority", "admin"]}>
              <DivyaOperationsLayout>
                <NotificationsPage />
              </DivyaOperationsLayout>
            </ProtectedRoute>
          }
        />

        {/* =================================================
            OLD EMERGENCY RESOURCES PAGE
        ================================================= */}

        <Route
          path="/emergency-resources"
          element={
            <ProtectedRoute allowedRoles={["citizen", "authority", "admin"]}>
              <OperationalLayout>
                <EmergencyResources />
              </OperationalLayout>
            </ProtectedRoute>
          }
        />

        {/* =================================================
            DIVYA OVERVIEW
        ================================================= */}

        <Route
          path="/operations-overview"
          element={
            <ProtectedRoute allowedRoles={["authority", "admin"]}>
              <DivyaOperationsLayout>
                <OverviewPage />
              </DivyaOperationsLayout>
            </ProtectedRoute>
          }
        />

        {/* =================================================
            ADMIN
        ================================================= */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            FALLBACK
        ================================================= */}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

// =========================================================
// APP
// =========================================================

function App() {
  return (
    <AlertProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AlertProvider>
  );
}

export default App;
