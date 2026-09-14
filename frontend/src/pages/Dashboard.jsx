import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../css/Dashboard.css";
import "../css/notifications.css";

import GisCommandCenter from "../components/gis/GisCommandCenter";
import { analyzeRisk } from "../services/riskApi";
import { useAlerts } from "../context/AlertContext";

// ============================================================
// USER
// ============================================================

function getStoredUser() {
  try {
    const stored = localStorage.getItem("user");

    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Unable to read stored user:", error);

    return null;
  }
}

// ============================================================
// WEATHER
// ============================================================

function getWeatherCondition(weatherCode) {
  if (weatherCode == null) {
    return "Unknown";
  }

  if (weatherCode === 0) {
    return "Clear sky";
  }

  if ([1, 2, 3].includes(weatherCode)) {
    return "Cloudy";
  }

  if ([45, 48].includes(weatherCode)) {
    return "Foggy";
  }

  if ([51, 53, 55, 56, 57].includes(weatherCode)) {
    return "Drizzle";
  }

  if ([61, 63, 65, 66, 67].includes(weatherCode)) {
    return "Rain";
  }

  if ([71, 73, 75, 77].includes(weatherCode)) {
    return "Snow";
  }

  if ([80, 81, 82].includes(weatherCode)) {
    return "Rain showers";
  }

  if ([85, 86].includes(weatherCode)) {
    return "Snow showers";
  }

  if ([95, 96, 99].includes(weatherCode)) {
    return "Thunderstorm";
  }

  return "Unknown";
}

// ============================================================
// NOTIFICATION HELPERS
// ============================================================

function getNotificationText(value, fallback = "") {
  if (!value) {
    return fallback;
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object") {
    return (
      value.en ||
      value.english ||
      value.hi ||
      Object.values(value)[0] ||
      fallback
    );
  }

  return fallback;
}

function getNotificationTime(notification) {
  const date =
    notification?.createdAt ||
    notification?.updatedAt ||
    notification?.timestamp;

  if (!date) {
    return "Recently";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Recently";
  }

  return parsed.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getNotificationTypeClass(type) {
  const normalized = String(type || "info").toLowerCase();

  if (normalized === "critical") {
    return "status-danger";
  }

  if (normalized === "warning") {
    return "status-warning";
  }

  return "status-safe";
}

// ============================================================
// NOTIFICATION AUDIENCE
// ============================================================

function isCitizenNotification(notification) {
  const audience = String(notification?.targetAudience || "").toLowerCase();

  /*
   * Citizens should only see notifications
   * intended for citizens/public/general
   * audiences.
   */

  if (!audience) {
    return true;
  }

  if (
    audience.includes("citizen") ||
    audience.includes("public") ||
    audience.includes("general") ||
    audience.includes("all")
  ) {
    return true;
  }

  return false;
}

// ============================================================
// RISK BADGE
// ============================================================

function getRiskBadgeClass(level) {
  const normalized = String(level || "").toLowerCase();

  if (normalized.includes("critical")) {
    return "status-danger";
  }

  if (normalized.includes("high")) {
    return "status-danger";
  }

  if (normalized.includes("moderate")) {
    return "status-moderate";
  }

  if (normalized.includes("low")) {
    return "status-safe";
  }

  return "status-moderate";
}

// ============================================================
// INCIDENT SEVERITY
// ============================================================

function getIncidentSeverityClass(severity) {
  const normalized = String(severity || "reported").toLowerCase();

  if (normalized === "critical" || normalized === "high") {
    return "status-danger";
  }

  if (normalized === "moderate" || normalized === "medium") {
    return "status-moderate";
  }

  return "status-safe";
}

// ============================================================
// INCIDENT NAME
// ============================================================

function formatIncidentType(type) {
  if (!type) {
    return "Incident";
  }

  return String(type)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

// ============================================================
// LOCATION TEXT
// ============================================================

function getIncidentLocation(incident) {
  const location = incident?.location;

  if (location?.address && String(location.address).trim()) {
    return location.address;
  }

  if (
    typeof location?.latitude === "number" &&
    typeof location?.longitude === "number"
  ) {
    return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  }

  return "Location unavailable";
}

// ============================================================
// DASHBOARD
// ============================================================

function Dashboard() {
  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const navigate = useNavigate();

  // ==========================================================
  // USER
  // ==========================================================

  const user = useMemo(() => getStoredUser(), []);

  const displayName = user?.name || "Citizen";

  const district = user?.location?.district || "Your district";

  const state = user?.location?.state || "";

  // ==========================================================
  // CITIZEN LOCATION
  // ==========================================================

  const [citizenLocation, setCitizenLocation] = useState(null);

  const [locationLoading, setLocationLoading] = useState(true);

  const [locationError, setLocationError] = useState("");

  // ==========================================================
  // GLOBAL OPERATIONAL DATA
  // ==========================================================

  const { notifications = [], markNotificationRead } = useAlerts();

  // ==========================================================
  // RISK
  // ==========================================================

  const [riskData, setRiskData] = useState(null);

  const [riskLoading, setRiskLoading] = useState(true);

  const [riskError, setRiskError] = useState("");

  // ==========================================================
  // REPORTS
  // ==========================================================

  const [reports, setReports] = useState([]);

  const [reportsLoading, setReportsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  // ==========================================================
  // ROAD INCIDENTS
  // ==========================================================

  const roadIncidents =
    riskData?.incidents?.nearby?.filter(
      (incident) =>
        String(incident?.type || "").toLowerCase() === "road_blockage",
    ) || [];

  // ==========================================================
  // REQUEST CITIZEN GPS LOCATION
  // ==========================================================

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Location services are not supported by this browser.");

      setLocationLoading(false);

      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;

        const longitude = position.coords.longitude;

        if (typeof latitude !== "number" || typeof longitude !== "number") {
          setLocationError("Unable to determine your current location.");

          setLocationLoading(false);

          return;
        }

        const location = {
          latitude,
          longitude,
        };

        console.log("[Citizen Dashboard] GPS location:", location);

        setCitizenLocation(location);

        setLocationError("");

        setLocationLoading(false);
      },

      (error) => {
        console.warn("[Citizen Dashboard] Geolocation unavailable:", error);

        let message = "Unable to access your location.";

        if (error.code === error.PERMISSION_DENIED) {
          message =
            "Location access was denied. Enable location permission for personalized local risk information.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = "Your current location is unavailable.";
        } else if (error.code === error.TIMEOUT) {
          message = "Location request timed out.";
        }

        setLocationError(message);

        setLocationLoading(false);
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      },
    );
  }, []);

  // ==========================================================
  // RISK ANALYSIS USING GPS
  // ==========================================================

  useEffect(() => {
    if (!citizenLocation) {
      return;
    }

    let cancelled = false;

    async function fetchRisk() {
      try {
        setRiskLoading(true);

        setRiskError("");

        console.log(
          "[Citizen Dashboard] Requesting local risk for:",
          citizenLocation,
        );

        const result = await analyzeRisk({
          latitude: citizenLocation.latitude,

          longitude: citizenLocation.longitude,

          name: district && state ? `${district}, ${state}` : district,

          disasterType: "landslide",
        });

        if (cancelled) {
          return;
        }

        console.log("[Citizen Dashboard] Local risk response:", result);

        /*
         * riskApi.js may already unwrap
         * the backend response.
         *
         * Handle both possible shapes
         * safely.
         */

        const data =
          result?.data &&
          !result?.weather &&
          !result?.risk &&
          !result?.incidents
            ? result.data
            : result;

        setRiskData(data || null);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("[Citizen Dashboard] Risk API error:", error);

        setRiskError("Unable to load live local risk data.");

        setRiskData(null);
      } finally {
        if (!cancelled) {
          setRiskLoading(false);
        }
      }
    }

    fetchRisk();

    return () => {
      cancelled = true;
    };
  }, [citizenLocation, district, state]);

  // ==========================================================
  // CITIZEN REPORTS
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    async function fetchReports() {
      try {
        setReportsLoading(true);

        const response = await fetch("http://localhost:5000/api/incidents");

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.message || "Failed to fetch reports");
        }

        if (cancelled) {
          return;
        }

        const incidents = Array.isArray(result?.data) ? result.data : [];

        /*
         * The backend currently stores
         * reportedBy differently for some
         * anonymous reports.
         *
         * Only show reports belonging to
         * this logged-in account when an
         * account ID is available.
         */

        const userId = user?._id || user?.id;

        const userReports = userId
          ? incidents.filter(
              (incident) =>
                String(incident?.reportedBy || "") === String(userId),
            )
          : [];

        setReports(userReports);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("[Citizen Dashboard] Reports API error:", error);

        setReports([]);
      } finally {
        if (!cancelled) {
          setReportsLoading(false);
        }
      }
    }

    if (user?._id || user?.id) {
      fetchReports();
    } else {
      setReportsLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [user]);

  // ==========================================================
  // CITIZEN NOTIFICATIONS
  // ==========================================================

  const citizenNotifications = useMemo(() => {
    return [...notifications]

      .filter(isCitizenNotification)

      .sort((a, b) => {
        const dateA = new Date(
          a?.createdAt || a?.updatedAt || a?.timestamp || 0,
        ).getTime();

        const dateB = new Date(
          b?.createdAt || b?.updatedAt || b?.timestamp || 0,
        ).getTime();

        return dateB - dateA;
      });
  }, [notifications]);

  const unreadNotifications = citizenNotifications.filter(
    (notification) => !notification?.read,
  );

  const visibleNotifications = citizenNotifications.slice(0, 5);

  // ==========================================================
  // MARK NOTIFICATION READ
  // ==========================================================

  const handleNotificationClick = async (notification) => {
    const notificationId = notification?._id || notification?.id;

    if (!notificationId) {
      return;
    }

    if (notification.read) {
      return;
    }

    try {
      await markNotificationRead(notificationId);
    } catch (error) {
      console.error(
        "[Citizen Dashboard] Unable to mark notification as read:",
        error,
      );
    }
  };

  // ==========================================================
  // SCROLL TO NOTIFICATIONS
  // ==========================================================

  const scrollToNotifications = () => {
    const element = document.getElementById("citizen-notifications");

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",

        block: "start",
      });
    }
  };

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout = () => {
    localStorage.removeItem("token");

    localStorage.removeItem("user");

    navigate("/login", {
      replace: true,
    });
  };

  // ==========================================================
  // REPORT INCIDENT
  // ==========================================================

  const handleReportIncident = () => {
    navigate("/report-incident");
  };

  // ==========================================================
  // RISK VALUES
  // ==========================================================

  const riskScore =
    riskData?.aiAssessment?.aiScore ?? riskData?.risk?.score ?? null;

  const riskLevel =
    riskData?.aiAssessment?.aiLevel ?? riskData?.risk?.level ?? null;

  const riskBadgeClass = getRiskBadgeClass(riskLevel);

  const weather = riskData?.weather || null;

  const nearbyIncidents = Array.isArray(riskData?.incidents?.nearby)
    ? riskData.incidents.nearby
    : [];

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <main className="citizen-dashboard">
      <div className="citizen-container">
        {/* ==================================================
            HEADER
        ================================================== */}

        <header className="citizen-topbar">
          <div>
            <div className="citizen-eyebrow">CASCADE-NET • Citizen Portal</div>

            <h1 className="citizen-title">Welcome, {displayName}</h1>

            <p className="citizen-subtitle">
              Local disaster awareness for {district}
              {state ? `, ${state}` : ""}.
            </p>

            <div
              className="citizen-card-muted"
              style={{
                marginTop: "6px",
              }}
            >
              {locationLoading
                ? "📍 Detecting your current location..."
                : citizenLocation
                ? "📍 Using your current location for local risk intelligence"
                : "📍 Location unavailable"}
            </div>
          </div>

          <div className="citizen-actions">
            {/* Notifications */}

            <button
              type="button"
              className="citizen-btn citizen-btn-secondary"
              onClick={scrollToNotifications}
            >
              Notifications
              {unreadNotifications.length > 0 && (
                <span className="citizen-notification-count">
                  {unreadNotifications.length}
                </span>
              )}
            </button>

            {/* Report */}

            <button
              type="button"
              className="citizen-btn citizen-btn-danger"
              onClick={handleReportIncident}
            >
              Report an Incident
            </button>

            {/* Logout */}

            <button
              type="button"
              className="citizen-btn citizen-btn-secondary"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </header>

        {/* ==================================================
            LOCATION WARNING
        ================================================== */}

        {locationError && (
          <section
            className="citizen-alert"
            style={{
              marginBottom: "16px",
            }}
          >
            <div>
              <strong>Location access unavailable</strong>

              <p>{locationError}</p>
            </div>
          </section>
        )}

        {/* ==================================================
            CURRENT WARNING
        ================================================== */}

        <section className="citizen-alert" aria-label="Current warning">
          <div>
            <strong>
              {riskLoading
                ? "Assessing local risk..."
                : riskLevel
                ? `${riskLevel} Risk Conditions`
                : "Risk Assessment"}
            </strong>

            <p>
              {riskError
                ? riskError
                : riskData?.risk?.explanation ||
                  riskData?.aiAssessment?.explanation ||
                  "Risk assessment is based on current weather, terrain, hazard information and reported incidents."}
            </p>
          </div>
        </section>

        {/* ==================================================
            TOP CARDS
        ================================================== */}

        <div className="row g-3">
          {/* =================================================
              LOCAL RISK
          ================================================= */}

          <div className="col-12 col-xl-5">
            <section className="citizen-card risk-card">
              <div className="citizen-card-header">
                <div>
                  <h2 className="citizen-card-title">Local Risk Level</h2>

                  <div className="citizen-card-muted">
                    {citizenLocation
                      ? "Assessment based on your current location"
                      : "Current area assessment"}
                  </div>
                </div>

                <span className={`status-badge ${riskBadgeClass}`}>
                  {riskLoading ? "LOADING" : riskLevel || "UNKNOWN"}
                </span>
              </div>

              <div>
                <div className="risk-value-row">
                  <span className="risk-value">
                    {riskScore != null ? riskScore : "--"}
                  </span>

                  <span className="citizen-card-muted mb-2">/ 100</span>
                </div>

                <div className="risk-scale" aria-label="Risk score">
                  <div
                    className="risk-scale-fill"
                    style={{
                      width: `${Math.max(
                        0,
                        Math.min(100, Number(riskScore || 0)),
                      )}%`,
                    }}
                  />
                </div>

                <div className="citizen-card-muted mt-2">
                  Risk can change with rainfall, terrain conditions and verified
                  incidents.
                </div>

                {riskData?.aiAssessment?.confidence != null && (
                  <div className="citizen-card-muted mt-2">
                    AI confidence: {riskData.aiAssessment.confidence}%
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* =================================================
              WEATHER
          ================================================= */}

          <div className="col-12 col-md-6 col-xl-4">
            <section className="citizen-card">
              <div className="citizen-card-header">
                <div>
                  <h2 className="citizen-card-title">Weather</h2>

                  <div className="citizen-card-muted">Local conditions</div>
                </div>

                <div className="weather-icon" aria-hidden="true">
                  ☁
                </div>
              </div>

              <div className="weather-main">
                <div>
                  <div className="weather-temperature">
                    {weather?.temperature != null
                      ? `${weather.temperature}°C`
                      : "--"}
                  </div>

                  <div className="weather-condition">
                    {getWeatherCondition(weather?.weatherCode)}
                  </div>
                </div>
              </div>

              <div className="metric-grid mt-4">
                <div className="metric-item">
                  <div className="metric-label">Rainfall</div>

                  <div className="metric-value">
                    {weather?.rain != null ? `${weather.rain} mm` : "--"}
                  </div>

                  <div className="citizen-card-muted">Current rainfall</div>
                </div>

                <div className="metric-item">
                  <div className="metric-label">Humidity</div>

                  <div className="metric-value">
                    {weather?.humidity != null ? `${weather.humidity}%` : "--"}
                  </div>
                </div>

                <div className="metric-item">
                  <div className="metric-label">Incidents</div>

                  <div className="metric-value">
                    {riskData?.incidents?.count ?? "--"}
                  </div>

                  <div className="citizen-card-muted">within 100 km</div>
                </div>
              </div>
            </section>
          </div>

          {/* =================================================
              EMERGENCY HELP
          ================================================= */}

          <div className="col-12 col-md-6 col-xl-3">
            <section className="citizen-card">
              <div className="citizen-card-header">
                <div>
                  <h2 className="citizen-card-title">Emergency Help</h2>

                  <div className="citizen-card-muted">Quick access</div>
                </div>
              </div>

              <div className="resource-grid">
                <div className="resource-box">
                  <div className="resource-number">112</div>

                  <div className="resource-label">National emergency</div>
                </div>

                <div className="resource-box">
                  <div className="resource-number">108</div>

                  <div className="resource-label">Ambulance</div>
                </div>

                <div className="resource-box">
                  <div className="resource-number">101</div>

                  <div className="resource-label">Fire service</div>
                </div>

                <div className="resource-box">
                  <div className="resource-number">1077</div>

                  <div className="resource-label">Disaster helpline</div>
                </div>
              </div>

              <button
                type="button"
                className="citizen-btn citizen-btn-danger w-100 mt-3"
                onClick={() => {
                  window.location.href = "tel:112";
                }}
              >
                Call 112
              </button>
            </section>
          </div>

          {/* =================================================
              NEARBY WARNINGS & INCIDENTS
          ================================================= */}

          <div className="col-12 col-lg-6">
            <section className="citizen-card">
              <div className="citizen-card-header">
                <div>
                  <h2 className="citizen-card-title">
                    Nearby Warnings & Incidents
                  </h2>

                  <div className="citizen-card-muted">
                    Active incidents detected around your location
                  </div>
                </div>

                <span
                  className={`status-badge ${
                    nearbyIncidents.length > 0
                      ? "status-warning"
                      : "status-safe"
                  }`}
                >
                  {riskLoading
                    ? "LOADING"
                    : `${nearbyIncidents.length} within 100 km`}
                </span>
              </div>

              <div className="data-list">
                {locationLoading ? (
                  <div className="citizen-card-muted">
                    Determining your location...
                  </div>
                ) : locationError ? (
                  <div className="citizen-card-muted">
                    Enable location access to see nearby warnings and incidents.
                  </div>
                ) : riskLoading ? (
                  <div className="citizen-card-muted">
                    Loading nearby incidents...
                  </div>
                ) : nearbyIncidents.length > 0 ? (
                  nearbyIncidents.map((incident) => {
                    const severity = String(
                      incident?.severity || "reported",
                    ).toLowerCase();

                    const statusClass = getIncidentSeverityClass(severity);

                    return (
                      <div
                        className="data-row"
                        key={incident?._id || incident?.id}
                      >
                        <div>
                          <div className="data-name">
                            {formatIncidentType(incident?.type)}
                          </div>

                          <div className="data-meta">
                            {getIncidentLocation(incident)}
                          </div>

                          {incident?.description && (
                            <div
                              className="data-meta"
                              style={{
                                marginTop: "4px",
                              }}
                            >
                              {incident.description}
                            </div>
                          )}
                        </div>

                        <span className={`status-badge ${statusClass}`}>
                          {severity.charAt(0).toUpperCase() + severity.slice(1)}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="citizen-card-muted">
                    No active incidents detected within 100 km.
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* =================================================
              ROAD STATUS
          ================================================= */}

          <div className="col-12 col-lg-6">
            <section className="citizen-card">
              <div className="citizen-card-header">
                <div>
                  <h2 className="citizen-card-title">Road Status</h2>

                  <div className="citizen-card-muted">
                    Based on nearby road-blockage reports
                  </div>
                </div>

                <span
                  className={`status-badge ${
                    roadIncidents.length > 0 ? "status-warning" : "status-safe"
                  }`}
                >
                  {riskLoading
                    ? "LOADING"
                    : roadIncidents.length > 0
                    ? `${roadIncidents.length} road issue${
                        roadIncidents.length > 1 ? "s" : ""
                      }`
                    : "No blockages"}
                </span>
              </div>

              <div className="data-list">
                {locationLoading ? (
                  <div className="citizen-card-muted">
                    Determining your location...
                  </div>
                ) : locationError ? (
                  <div className="citizen-card-muted">
                    Location unavailable.
                  </div>
                ) : riskLoading ? (
                  <div className="citizen-card-muted">
                    Checking nearby road conditions...
                  </div>
                ) : roadIncidents.length > 0 ? (
                  roadIncidents.map((incident) => {
                    const severity = String(
                      incident?.severity || "",
                    ).toLowerCase();

                    const blocked =
                      severity === "critical" || severity === "high";

                    return (
                      <div
                        className="data-row"
                        key={incident?._id || incident?.id}
                      >
                        <div>
                          <div className="data-name">Road blockage</div>

                          <div className="data-meta">
                            {getIncidentLocation(incident)}
                          </div>

                          {incident?.description && (
                            <div
                              className="data-meta"
                              style={{
                                marginTop: "4px",
                              }}
                            >
                              {incident.description}
                            </div>
                          )}
                        </div>

                        <span
                          className={`road-status ${
                            blocked ? "road-blocked" : "road-partial"
                          }`}
                        >
                          {blocked ? "Blocked" : "Partially blocked"}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="citizen-card-muted">
                    No reported road blockages within 100 km.
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* =================================================
              LIVE SAFETY MAP
          ================================================= */}

          <div className="col-12">
            <section className="mt-2">
              <GisCommandCenter
                role="citizen"
                initialHudMode="minimal"
                initialMapStyle="map"
                citizenLocation={
                  citizenLocation
                    ? {
                        lat: citizenLocation.latitude,
                        lng: citizenLocation.longitude,
                      }
                    : null
                }
              />
            </section>
          </div>

          {/* =================================================
              AUTHORITY NOTIFICATIONS
          ================================================= */}

          <div className="col-12" id="citizen-notifications">
            <section className="citizen-card">
              <div className="citizen-card-header">
                <div>
                  <h2 className="citizen-card-title">
                    Authority Notifications
                  </h2>

                  <div className="citizen-card-muted">
                    Official alerts and announcements for citizens
                  </div>
                </div>

                {unreadNotifications.length > 0 && (
                  <span className="status-badge status-danger">
                    {unreadNotifications.length} unread
                  </span>
                )}
              </div>

              <div className="data-list">
                {visibleNotifications.length > 0 ? (
                  visibleNotifications.map((notification) => {
                    const title = getNotificationText(
                      notification?.title,
                      "Authority Notification",
                    );

                    const message = getNotificationText(
                      notification?.message,
                      "No message available.",
                    );

                    const typeClass = getNotificationTypeClass(
                      notification?.type,
                    );

                    const notificationId =
                      notification?._id || notification?.id;

                    return (
                      <button
                        type="button"
                        key={notificationId}
                        onClick={() => handleNotificationClick(notification)}
                        className="citizen-notification-item"
                        aria-label={`Read notification: ${title}`}
                      >
                        <div
                          className={`citizen-notification-row ${
                            notification?.read ? "is-read" : "is-unread"
                          }`}
                        >
                          {/* Unread indicator */}

                          <span
                            className={`citizen-notification-dot ${
                              notification?.read ? "read" : "unread"
                            }`}
                            aria-hidden="true"
                          />

                          <div className="citizen-notification-content">
                            <div className="citizen-notification-title-row">
                              <div className="data-name">{title}</div>

                              <span className={`status-badge ${typeClass}`}>
                                {String(
                                  notification?.type || "info",
                                ).toUpperCase()}
                              </span>
                            </div>

                            <div className="citizen-notification-message">
                              {message}
                            </div>

                            <div className="citizen-notification-meta">
                              {getNotificationTime(notification)}

                              {" • "}

                              {notification?.read ? "Read" : "Unread"}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div
                    className="citizen-card-muted"
                    style={{
                      padding: "18px 0",
                    }}
                  >
                    No authority notifications available right now.
                  </div>
                )}
              </div>

              {citizenNotifications.length > 5 && (
                <div
                  className="citizen-card-muted"
                  style={{
                    marginTop: "12px",
                    paddingTop: "12px",
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  Showing the 5 most recent notifications.
                </div>
              )}
            </section>
          </div>

          {/* =================================================
              MY REPORTS
          ================================================= */}
          {/* =================================================
    MY RECENT REPORTS
================================================= */}

          <div className="col-12">
            <section className="citizen-card">
              <div className="citizen-card-header">
                <div>
                  <h2 className="citizen-card-title">My Recent Reports</h2>

                  <div className="citizen-card-muted">
                    Reports submitted from your account
                  </div>
                </div>

                <button
                  type="button"
                  className="citizen-btn citizen-btn-secondary"
                  onClick={() => navigate("/report-incident")}
                >
                  New Report
                </button>
              </div>

              {/* LOADING */}

              {reportsLoading ? (
                <div className="citizen-card-muted">
                  Loading your reports...
                </div>
              ) : reports.length > 0 ? (
                <div className="citizen-reports-list">
                  {reports.slice(0, 5).map((report) => {
                    const reportId = report?._id || report?.id;

                    const incidentType = formatIncidentType(report?.type);

                    const reportStatus = String(report?.status || "submitted")
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (char) => char.toUpperCase());

                    const severity = String(
                      report?.severity || "unknown",
                    ).replace(/\b\w/g, (char) => char.toUpperCase());

                    const reportDate =
                      report?.createdAt || report?.reportedAt || report?.time;

                    return (
                      <div className="citizen-report-row" key={reportId}>
                        {/* LEFT */}

                        <div className="citizen-report-main">
                          <div className="citizen-report-title">
                            {incidentType}
                          </div>

                          <div className="citizen-report-meta">
                            {reportDate
                              ? new Date(reportDate).toLocaleString([], {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                })
                              : "Date unavailable"}
                          </div>

                          <div className="citizen-report-location">
                            📍 {getIncidentLocation(report)}
                          </div>
                        </div>

                        {/* MIDDLE */}

                        <div className="citizen-report-status">
                          <span
                            className={`status-badge ${getIncidentSeverityClass(
                              report?.severity,
                            )}`}
                          >
                            {severity}
                          </span>

                          <span className="citizen-report-status-text">
                            {reportStatus}
                          </span>
                        </div>

                        {/* RIGHT */}

                        <button
                          type="button"
                          className="citizen-btn citizen-btn-secondary citizen-report-view-btn"
                          onClick={() => setSelectedReport(report)}
                        >
                          View Details
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="citizen-empty-reports">
                  <div className="citizen-empty-icon">📋</div>

                  <div>
                    <div className="citizen-empty-title">No reports yet</div>

                    <div className="citizen-card-muted">
                      You have not submitted any incidents from this account.
                    </div>
                  </div>

                  <button
                    type="button"
                    className="citizen-btn citizen-btn-secondary"
                    onClick={() => navigate("/report-incident")}
                  >
                    Report an Incident
                  </button>
                </div>
              )}

              {/* SHOW MORE */}

              {reports.length > 5 && (
                <div
                  className="citizen-card-muted"
                  style={{
                    marginTop: "14px",
                    paddingTop: "12px",
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  Showing your 5 most recent reports.
                </div>
              )}
            </section>
          </div>

          {/* =================================================
    INCIDENT DETAILS MODAL
================================================= */}

          {selectedReport && (
            <div
              className="citizen-report-modal-backdrop"
              onClick={() => setSelectedReport(null)}
            >
              <div
                className="citizen-report-modal"
                onClick={(event) => event.stopPropagation()}
              >
                {/* HEADER */}

                <div className="citizen-report-modal-header">
                  <div>
                    <div className="citizen-eyebrow">INCIDENT REPORT</div>

                    <h2>{formatIncidentType(selectedReport.type)}</h2>
                  </div>

                  <button
                    type="button"
                    className="citizen-modal-close"
                    onClick={() => setSelectedReport(null)}
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>

                {/* STATUS */}

                <div className="citizen-report-detail-status">
                  <span
                    className={`status-badge ${getIncidentSeverityClass(
                      selectedReport.severity,
                    )}`}
                  >
                    {String(selectedReport.severity || "Unknown").toUpperCase()}
                  </span>

                  <span className="citizen-report-detail-status-text">
                    {String(selectedReport.status || "Submitted")
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (char) => char.toUpperCase())}
                  </span>
                </div>

                {/* DESCRIPTION */}

                <div className="citizen-report-detail-section">
                  <div className="citizen-report-detail-label">DESCRIPTION</div>

                  <div className="citizen-report-detail-value">
                    {selectedReport.description || "No description provided."}
                  </div>
                </div>

                {/* LOCATION */}

                <div className="citizen-report-detail-section">
                  <div className="citizen-report-detail-label">LOCATION</div>

                  <div className="citizen-report-detail-value">
                    📍 {getIncidentLocation(selectedReport)}
                  </div>

                  {typeof selectedReport?.location?.latitude === "number" &&
                    typeof selectedReport?.location?.longitude === "number" && (
                      <div className="citizen-report-coordinates">
                        Latitude: {selectedReport.location.latitude}
                        <br />
                        Longitude: {selectedReport.location.longitude}
                      </div>
                    )}
                </div>

                {/* DATE */}

                <div className="citizen-report-detail-section">
                  <div className="citizen-report-detail-label">REPORTED</div>

                  <div className="citizen-report-detail-value">
                    {selectedReport?.createdAt
                      ? new Date(selectedReport.createdAt).toLocaleString([], {
                          dateStyle: "full",
                          timeStyle: "short",
                        })
                      : selectedReport?.reportedAt
                      ? new Date(selectedReport.reportedAt).toLocaleString([], {
                          dateStyle: "full",
                          timeStyle: "short",
                        })
                      : "Date unavailable"}
                  </div>
                </div>

                {/* EVIDENCE */}

                {(selectedReport?.images?.length > 0 ||
                  selectedReport?.videos?.length > 0) && (
                  <div className="citizen-report-detail-section">
                    <div className="citizen-report-detail-label">EVIDENCE</div>

                    <div className="citizen-report-detail-value">
                      Evidence attached to this incident report.
                    </div>
                  </div>
                )}

                {/* FOOTER */}

                <div className="citizen-report-modal-footer">
                  <button
                    type="button"
                    className="citizen-btn citizen-btn-secondary"
                    onClick={() => setSelectedReport(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
