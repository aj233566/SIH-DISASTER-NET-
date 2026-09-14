import React from "react";
import { NavLink } from "react-router-dom";
import { useAlerts } from "../../context/AlertContext";

import {
  LayoutDashboard,
  AlertTriangle,
  Flame,
  Bell,
  Truck,
} from "lucide-react";

export const Sidebar = ({ isOpen, onClose }) => {
  const { alerts = [], notifications = [], emergencyAreas = [] } = useAlerts();

  /* =====================================================
     BADGE COUNTS
  ===================================================== */

  const criticalAlertsCount = alerts.filter(
    (alert) =>
      String(alert.riskLevel || alert.risk || "").toUpperCase() === "CRITICAL",
  ).length;

  const unreadNotifsCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  const p1Count = emergencyAreas.filter(
    (area) => String(area.priorityQueue || "").toLowerCase() === "priority 1",
  ).length;

  /* =====================================================
     CLOSE MOBILE SIDEBAR
  ===================================================== */

  const handleNavigation = () => {
    if (onClose) {
      onClose();
    }
  };

  /* =====================================================
     NAVIGATION CLASS
  ===================================================== */

  const getNavClass = ({ isActive }) =>
    `sidebar-nav-link ${isActive ? "active" : ""}`;

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`mobile-sidebar-overlay ${isOpen ? "show" : ""}`}
        onClick={handleNavigation}
        aria-hidden={!isOpen}
      />

      {/* Sidebar */}
      <aside
        className={`ops-sidebar ${isOpen ? "open" : ""}`}
        aria-label="Authority navigation"
      >
        <nav className="sidebar-nav-container">
          {/* =================================================
              BACK TO COMMAND CENTER
          ================================================= */}

          <NavLink
            to="/command-center"
            end
            className={getNavClass}
            onClick={handleNavigation}
          >
            <div className="nav-left">
              <LayoutDashboard size={17} className="nav-icon" />

              <span>Back to Dashboard</span>
            </div>
          </NavLink>

          {/* =================================================
              ALERTS
          ================================================= */}

          {/* <NavLink
            to="/alerts"
            className={getNavClass}
            onClick={handleNavigation}
          >
            <div className="nav-left">
              <AlertTriangle size={17} className="nav-icon" />

              <span>Alerts</span>
            </div>

            {criticalAlertsCount > 0 && (
              <span
                className="nav-badge-count"
                title={`${criticalAlertsCount} Critical Alerts`}
                aria-label={`${criticalAlertsCount} critical alerts`}
              >
                {criticalAlertsCount}
              </span>
            )}
          </NavLink> */}

          {/* =================================================
              EMERGENCY
          ================================================= */}

          <NavLink
            to="/emergency"
            className={getNavClass}
            onClick={handleNavigation}
          >
            <div className="nav-left">
              <Flame size={17} className="nav-icon" />

              <span>Emergency</span>
            </div>

            {p1Count > 0 && (
              <span
                className="nav-badge-count"
                style={{
                  backgroundColor: "var(--high-risk)",
                }}
                title={`${p1Count} Priority 1 Zones`}
                aria-label={`${p1Count} Priority 1 zones`}
              >
                {p1Count}
              </span>
            )}
          </NavLink>

          {/* =================================================
              NOTIFICATIONS
          ================================================= */}

          <NavLink
            to="/notifications"
            className={getNavClass}
            onClick={handleNavigation}
          >
            <div className="nav-left">
              <Bell size={17} className="nav-icon" />

              <span>Notifications</span>
            </div>

            {unreadNotifsCount > 0 && (
              <span
                className="nav-badge-count"
                style={{
                  backgroundColor: "var(--info)",
                }}
                title={`${unreadNotifsCount} Unread Notifications`}
                aria-label={`${unreadNotifsCount} unread notifications`}
              >
                {unreadNotifsCount}
              </span>
            )}
          </NavLink>

          {/* =================================================
              RESOURCES
          ================================================= */}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
