import React, { useState } from "react";

import {
  AlertTriangle,
  Flame,
  Bell,
  Truck,
  Radio,
  ArrowRight,
  Layers,
} from "lucide-react";

import { Link } from "react-router-dom";

import { useAlerts } from "../../context/AlertContext";

import WarningBanner from "../alerts/WarningBanner";
import ThresholdSimulator from "../alerts/ThresholdSimulator";
import AlertCard from "../alerts/AlertCard";
// import GISMap from "../emergency/GISMap";
import ResourceStatus from "../emergency/ResourceStatus";
import Modal from "../common/Modal";
import AlertDetails from "../alerts/AlertDetails";

export const OperationalOverview = () => {
  const { alerts = [], emergencyAreas = [], notifications = [] } = useAlerts();

  const [selectedAlert, setSelectedAlert] = useState(null);

  /*
   * Normalize risk level because backend values may
   * arrive as uppercase while older mock data used
   * title case.
   */
  const getRiskLevel = (alert) => {
    return String(
      alert?.riskLevel || alert?.risk?.level || "LOW",
    ).toUpperCase();
  };

  /*
   * Critical alerts
   */
  const criticalAlerts = alerts.filter(
    (alert) => getRiskLevel(alert) === "CRITICAL",
  );

  /*
   * High-risk alerts
   */
  const highAlerts = alerts.filter((alert) => getRiskLevel(alert) === "HIGH");

  /*
   * Priority 1 emergency areas
   */
  const p1Areas = emergencyAreas.filter(
    (area) =>
      String(area?.priorityQueue || "").toLowerCase() ===
      "priority 1".toLowerCase(),
  );

  /*
   * Get alert ID
   */
  const getAlertId = (alert) => {
    return alert?.id || alert?._id || "Alert";
  };

  /*
   * Get location name.
   *
   * Backend:
   * location: {
   *   name,
   *   latitude,
   *   longitude
   * }
   *
   * Older data may have location as a string.
   */
  const getLocationName = (alert) => {
    if (!alert?.location) {
      return "Unknown Location";
    }

    if (typeof alert.location === "string") {
      return alert.location;
    }

    return alert.location.name || alert.location.district || "Unknown Location";
  };

  /*
   * Get notification title
   */
  const getNotificationTitle = (notification) => {
    if (!notification?.title) {
      return "Notification";
    }

    if (typeof notification.title === "string") {
      return notification.title;
    }

    return notification.title.en || "Notification";
  };

  /*
   * Get notification message
   */
  const getNotificationMessage = (notification) => {
    if (!notification?.message) {
      return "";
    }

    if (typeof notification.message === "string") {
      return notification.message;
    }

    return notification.message.en || "";
  };

  /*
   * Get notification timestamp
   */
  const getNotificationTime = (notification) => {
    const timestamp = notification?.timestamp || notification?.createdAt;

    if (!timestamp) {
      return "";
    }

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /*
   * Select alert from GIS area.
   *
   * Supports both the old string location
   * structure and the newer backend structure.
   */
  const handleSelectArea = (area) => {
    if (!area) {
      return;
    }

    const district = String(area?.district || "").toLowerCase();

    const state = String(area?.state || "").toLowerCase();

    const matchedAlert = alerts.find((alert) => {
      const location = alert?.location;

      if (typeof location === "string") {
        const normalizedLocation = location.toLowerCase();

        return (
          (district && normalizedLocation.includes(district)) ||
          (state && normalizedLocation.includes(state))
        );
      }

      const alertName = String(location?.name || "").toLowerCase();

      const alertDistrict = String(location?.district || "").toLowerCase();

      const alertState = String(location?.state || "").toLowerCase();

      return (
        (district &&
          (alertName.includes(district) || alertDistrict.includes(district))) ||
        (state && alertState.includes(state))
      );
    });

    if (matchedAlert) {
      setSelectedAlert(matchedAlert);
    }
  };

  return (
    <div className="container-fluid p-0 overview-container">
      {/* ================================================================ */}
      {/* Warning Banner */}
      {/* ================================================================ */}

      <WarningBanner onSelectAlert={(alert) => setSelectedAlert(alert)} />

      {/* ================================================================ */}
      {/* KPI Summary */}
      {/* ================================================================ */}

      <div className="row g-3 mb-4">
        {/* Critical Risk Zones */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className="kpi-metric-card h-100"
            style={{
              borderLeft: "4px solid var(--critical)",
            }}
          >
            <div className="kpi-metric-header">
              <span>Critical AI Risk Zones</span>

              <Flame size={16} color="var(--critical)" />
            </div>

            <div
              className="kpi-metric-value"
              style={{
                color: "var(--critical)",
              }}
            >
              {criticalAlerts.length}
            </div>

            <div className="kpi-metric-sub">AI-assisted monitoring</div>
          </div>
        </div>

        {/* High Priority Zones */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className="kpi-metric-card h-100"
            style={{
              borderLeft: "4px solid var(--high-risk)",
            }}
          >
            <div className="kpi-metric-header">
              <span>High-Priority Risk Zones</span>

              <Layers size={16} color="var(--high-risk)" />
            </div>

            <div
              className="kpi-metric-value"
              style={{
                color: "var(--high-risk)",
              }}
            >
              {p1Areas.length}
            </div>

            <div className="kpi-metric-sub">
              Ranked by risk and operational impact
            </div>
          </div>
        </div>

        {/* Notification Channels */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className="kpi-metric-card h-100"
            style={{
              borderLeft: "4px solid var(--info)",
            }}
          >
            <div className="kpi-metric-header">
              <span>Active Broadcast Channels</span>

              <Radio size={16} color="var(--info)" />
            </div>

            <div className="kpi-metric-value">4</div>

            <div className="kpi-metric-sub">In-App, Push, SMS, Email</div>
          </div>
        </div>

        {/* Relief Shelters */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className="kpi-metric-card h-100"
            style={{
              borderLeft: "4px solid var(--safe)",
            }}
          >
            <div className="kpi-metric-header">
              <span>Relief Shelters Online</span>

              <Truck size={16} color="var(--safe)" />
            </div>

            <div className="kpi-metric-value">27</div>

            <div className="kpi-metric-sub">Across 8 NER States</div>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* Risk / Threshold Simulator */}
      {/* ================================================================ */}

      <ThresholdSimulator />

      {/* ================================================================ */}
      {/* GIS Map */}
      {/* ================================================================ */}

      <GISMap areas={emergencyAreas} onSelectArea={handleSelectArea} />

      {/* ================================================================ */}
      {/* Alerts + Notifications */}
      {/* ================================================================ */}

      <div className="row g-4 mb-4">
        {/* ============================================================ */}
        {/* Active Risk Alerts */}
        {/* ============================================================ */}

        <div className="col-12 col-lg-7">
          <div className="ops-panel h-100">
            <div className="ops-panel-header">
              <h3 className="ops-panel-title">
                <AlertTriangle size={18} color="var(--critical)" />

                <span>Active High-Severity Risk Alerts</span>
              </h3>

              <Link to="/alerts" className="btn-ops btn-ops-sm">
                <span>View All ({alerts.length})</span>

                <ArrowRight size={12} />
              </Link>
            </div>

            <div className="d-flex flex-column gap-3">
              {alerts.length === 0 ? (
                <div
                  className="ops-card text-center p-4"
                  style={{
                    color: "var(--text-muted)",
                  }}
                >
                  No active risk alerts.
                </div>
              ) : (
                alerts
                  .slice(0, 2)
                  .map((alert) => (
                    <AlertCard
                      key={getAlertId(alert)}
                      alert={alert}
                      onSelect={(selected) => setSelectedAlert(selected)}
                    />
                  ))
              )}
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* Recent Notifications */}
        {/* ============================================================ */}

        <div className="col-12 col-lg-5">
          <div className="ops-panel h-100">
            <div className="ops-panel-header">
              <h3 className="ops-panel-title">
                <Bell size={18} color="var(--info)" />

                <span>Latest Notifications</span>
              </h3>

              <Link to="/notifications" className="btn-ops btn-ops-sm">
                <span>Hub</span>

                <ArrowRight size={12} />
              </Link>
            </div>

            <div className="d-flex flex-column gap-2">
              {notifications.length === 0 ? (
                <div
                  className="ops-card text-center p-4"
                  style={{
                    color: "var(--text-muted)",
                  }}
                >
                  No notifications.
                </div>
              ) : (
                notifications.slice(0, 3).map((notification) => {
                  const id = notification.id || notification._id;

                  return (
                    <div
                      key={id}
                      className={`ops-card ${
                        !notification.read ? "elevated" : ""
                      } p-3`}
                    >
                      {/* Channel + Time */}
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <span
                          className={`notif-channel-badge ${
                            notification.channel || "in_app"
                          }`}
                          style={{
                            fontSize: "0.65rem",
                          }}
                        >
                          {String(
                            notification.channel || "IN_APP",
                          ).toUpperCase()}
                        </span>

                        <span
                          style={{
                            fontSize: "0.68rem",
                            color: "var(--text-muted)",
                          }}
                        >
                          {getNotificationTime(notification)}
                        </span>
                      </div>

                      {/* Title */}
                      <strong
                        style={{
                          fontSize: "0.82rem",
                          color: "var(--text-primary)",
                          display: "block",
                          marginBottom: "2px",
                        }}
                      >
                        {getNotificationTitle(notification)}
                      </strong>

                      {/* Message */}
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-secondary)",
                          margin: 0,
                          lineHeight: 1.35,
                        }}
                      >
                        {getNotificationMessage(notification)}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* Emergency Resources */}
      {/* ================================================================ */}

      <ResourceStatus />

      {/* ================================================================ */}
      {/* Alert Details Modal */}
      {/* ================================================================ */}

      <Modal
        isOpen={Boolean(selectedAlert)}
        onClose={() => setSelectedAlert(null)}
        title={
          selectedAlert
            ? `${getAlertId(selectedAlert)} - ${getLocationName(selectedAlert)}`
            : "Alert Details"
        }
        maxWidth="720px"
      >
        <AlertDetails
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
        />
      </Modal>
    </div>
  );
};

export default OperationalOverview;
