import React from "react";

import {
  Users,
  CloudRain,
  Droplets,
  TrendingUp,
  Activity,
  Building,
  Home,
  CheckCircle,
  ShieldAlert,
  PhoneCall,
  Navigation,
} from "lucide-react";

import { useAlerts } from "../../context/AlertContext";
import RiskBadge from "./RiskBadge";

export const AlertDetails = ({ alert, onClose }) => {
  const { acknowledgeAlert, resolveAlert, escalateAlert } = useAlerts();

  if (!alert) {
    return null;
  }

  /*
   * --------------------------------------------------------------------------
   * Current authenticated user
   * --------------------------------------------------------------------------
   */

  const getCurrentUser = () => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        return null;
      }

      return JSON.parse(storedUser);
    } catch (error) {
      console.warn("Unable to read logged-in user:", error);

      return null;
    }
  };

  const currentUser = getCurrentUser();

  const userRole = currentUser?.role || "citizen";

  const isCitizen = userRole === "citizen";

  const isAuthority = userRole === "authority" || userRole === "admin";

  const roleLabel =
    userRole === "admin"
      ? "Admin"
      : userRole === "authority"
      ? "Authority"
      : "Citizen";

  /*
   * --------------------------------------------------------------------------
   * Backend-compatible values
   * --------------------------------------------------------------------------
   */

  const locationName =
    typeof alert.location === "string"
      ? alert.location
      : alert.location?.name || "Unknown Location";

  const latitude = alert.coordinates?.[0] ?? alert.location?.latitude;

  const longitude = alert.coordinates?.[1] ?? alert.location?.longitude;

  const riskScore = alert.riskScore ?? alert.risk?.score ?? 0;

  const riskLevel = alert.riskLevel || alert.risk?.level || "LOW";

  const affectedPopulation =
    alert.affectedPopulation ?? alert.populationExposure;

  /*
   * --------------------------------------------------------------------------
   * Alert actions
   * --------------------------------------------------------------------------
   */

  const handleAcknowledge = () => {
    acknowledgeAlert(alert.id || alert._id);

    onClose();
  };

  const handleResolve = () => {
    resolveAlert(alert.id || alert._id);

    onClose();
  };

  const handleEscalate = () => {
    escalateAlert(alert.id || alert._id);

    onClose();
  };

  /*
   * --------------------------------------------------------------------------
   * Guidance
   * --------------------------------------------------------------------------
   */

  const getGuidance = (guidance) => {
    if (!guidance) {
      return [];
    }

    if (Array.isArray(guidance)) {
      return guidance;
    }

    if (Array.isArray(guidance.en)) {
      return guidance.en;
    }

    if (typeof guidance.en === "string") {
      return [guidance.en];
    }

    return [];
  };

  const citizenGuidance = getGuidance(alert.guidance?.citizen);

  const authorityGuidance = getGuidance(alert.guidance?.authority);

  /*
   * --------------------------------------------------------------------------
   * Recommended action
   * --------------------------------------------------------------------------
   */

  const getText = (value) => {
    if (!value) {
      return "";
    }

    if (typeof value === "string") {
      return value;
    }

    if (typeof value.en === "string") {
      return value.en;
    }

    return "";
  };

  const recommendedAction =
    getText(alert.recommendedAction) ||
    (Array.isArray(alert.recommendations) ? alert.recommendations[0] : "");

  /*
   * --------------------------------------------------------------------------
   * Contributing factors
   * --------------------------------------------------------------------------
   */

  const contributingFactors = Array.isArray(alert.contributingFactors)
    ? alert.contributingFactors
    : Array.isArray(alert.majorContributors)
    ? alert.majorContributors.map((factor) => ({
        factor: factor.label || factor.key || "Risk Factor",
        detail: factor.reason || factor.detail || "",
      }))
    : [];

  /*
   * --------------------------------------------------------------------------
   * Render
   * --------------------------------------------------------------------------
   */

  return (
    <div>
      {/* ------------------------------------------------------------------ */}
      {/* Alert Header */}
      {/* ------------------------------------------------------------------ */}

      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <div>
          <span className="eyebrow">
            {alert.state || alert.location?.state || "NER Sector"}
          </span>

          <h2
            style={{
              fontSize: "1.25rem",
              margin: "2px 0 4px",
            }}
          >
            {locationName}
          </h2>

          <div
            className="d-flex align-items-center gap-2"
            style={{
              fontSize: "0.78rem",
              color: "var(--text-muted)",
            }}
          >
            {latitude != null && longitude != null && (
              <span className="d-flex align-items-center gap-1">
                <Navigation size={12} />

                <span>
                  {Number(latitude).toFixed(4)}° N,{" "}
                  {Number(longitude).toFixed(4)}° E
                </span>
              </span>
            )}

            {affectedPopulation != null && (
              <>
                <span>•</span>

                <span className="d-flex align-items-center gap-1">
                  <Users size={12} />

                  <span>
                    {Number(affectedPopulation).toLocaleString()} affected
                    population
                  </span>
                </span>
              </>
            )}
          </div>
        </div>

        <div className="d-flex flex-column align-items-end gap-1">
          <RiskBadge level={riskLevel} />

          <span
            style={{
              fontSize: "1.4rem",
              fontWeight: "800",
              fontFamily: "monospace",
              color: "var(--text-primary)",
            }}
          >
            {riskScore}%
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* AI Assessment */}
      {/* ------------------------------------------------------------------ */}

      {alert.aiConfidence != null && (
        <div
          className="detail-section mb-3"
          style={{
            borderLeft: "4px solid var(--safe)",
          }}
        >
          <div className="detail-section-title">AI Risk Assessment</div>

          <div
            style={{
              backgroundColor: "var(--bg-secondary)",
              padding: "12px 14px",
              borderRadius: "4px",
            }}
          >
            <div
              style={{
                fontSize: "0.85rem",
                color: "var(--text-primary)",
              }}
            >
              AI confidence: <strong>{alert.aiConfidence}%</strong>
            </div>

            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                marginTop: "4px",
              }}
            >
              AI-assisted risk assessment. This is not an official emergency
              warning.
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Recommended Advisory */}
      {/* ------------------------------------------------------------------ */}

      {recommendedAction && (
        <div className="detail-section mb-3">
          <div className="detail-section-title">
            Recommended Operational Advisory
          </div>

          <div
            style={{
              backgroundColor: "var(--bg-secondary)",
              padding: "12px 14px",
              borderRadius: "4px",
              borderLeft: "4px solid var(--info)",
              fontSize: "0.85rem",
              color: "var(--text-primary)",
            }}
          >
            {recommendedAction}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Telemetry */}
      {/* ------------------------------------------------------------------ */}

      <div className="detail-section mb-3">
        <div className="detail-section-title">Risk & Telemetry Factors</div>

        <div className="row g-2 mb-2">
          {/* Rainfall */}
          <div className="col-6 col-md-3">
            <div
              className="telemetry-item p-2 rounded"
              style={{
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border)",
              }}
            >
              <span className="telemetry-label">
                <CloudRain size={12} />
                Rainfall
              </span>

              <span className="telemetry-val">
                {alert.rainfall72h ??
                  alert.weather?.rain ??
                  alert.weather?.precipitation ??
                  "--"}{" "}
                mm
              </span>
            </div>
          </div>

          {/* Soil Moisture */}
          <div className="col-6 col-md-3">
            <div
              className="telemetry-item p-2 rounded"
              style={{
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border)",
              }}
            >
              <span className="telemetry-label">
                <Droplets size={12} />
                Soil Saturation
              </span>

              <span className="telemetry-val">
                {alert.soilMoisture ?? alert.sensor?.soilMoisture ?? "--"}%
              </span>
            </div>
          </div>

          {/* Slope */}
          <div className="col-6 col-md-3">
            <div
              className="telemetry-item p-2 rounded"
              style={{
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border)",
              }}
            >
              <span className="telemetry-label">
                <TrendingUp size={12} />
                Slope Risk
              </span>

              <span className="telemetry-val">
                {alert.slopeAngle ?? alert.terrain?.slopeRisk ?? "--"}
              </span>
            </div>
          </div>

          {/* Road */}
          <div className="col-6 col-md-3">
            <div
              className="telemetry-item p-2 rounded"
              style={{
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border)",
              }}
            >
              <span className="telemetry-label">
                <Activity size={12} />
                Road Status
              </span>

              <span className="telemetry-val">
                {alert.roadStatus || alert.operations?.roadBlockage || "Normal"}
              </span>
            </div>
          </div>
        </div>

        {/* Contributing Factors */}
        {contributingFactors.length > 0 && (
          <div className="contributing-factors-list">
            {contributingFactors.map((factor, index) => (
              <div key={index} className="contributing-factor-tag">
                <span
                  style={{
                    color: "var(--info)",
                    fontWeight: "700",
                  }}
                >
                  •
                </span>

                <div>
                  <strong
                    style={{
                      color: "var(--text-primary)",
                    }}
                  >
                    {factor.factor || "Risk Factor"}:{" "}
                  </strong>

                  <span>{getText(factor.detail || factor.reason)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Role-Specific Guidance */}
      {/* ------------------------------------------------------------------ */}

      <div className="detail-section mb-3">
        <div className="detail-section-title">
          Operational Guidance — ({roleLabel})
        </div>

        {/* Citizen */}
        {isCitizen && (
          <div className="guidance-callout-box citizen">
            <h4
              style={{
                fontSize: "0.85rem",
                color: "var(--safe)",
                marginBottom: "8px",
              }}
            >
              Citizen Safety Guidance
            </h4>

            {citizenGuidance.length > 0 ? (
              <ul className="guidance-list">
                {citizenGuidance.map((guidance, index) => (
                  <li key={index}>
                    <span className="bullet">✓</span>

                    <span>{getText(guidance)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="guidance-list">
                <li>
                  <span className="bullet">✓</span>

                  <span>
                    Follow instructions from local disaster management
                    authorities.
                  </span>
                </li>

                <li>
                  <span className="bullet">✓</span>

                  <span>Avoid unstable slopes and affected roads.</span>
                </li>
              </ul>
            )}

            <div
              className="d-flex align-items-center gap-2 mt-3 pt-2"
              style={{
                borderTop: "1px solid var(--border)",
                color: "var(--safe)",
                fontSize: "0.8rem",
                fontWeight: "600",
              }}
            >
              <PhoneCall size={14} />

              <span>Emergency Helpline: 112</span>
            </div>
          </div>
        )}

        {/* Authority / Admin */}
        {isAuthority && (
          <div className="guidance-callout-box authority">
            <h4
              style={{
                fontSize: "0.85rem",
                color: "var(--critical)",
                marginBottom: "8px",
              }}
            >
              Authority Response Guidance
            </h4>

            {authorityGuidance.length > 0 ? (
              <ul className="guidance-list">
                {authorityGuidance.map((guidance, index) => (
                  <li key={index}>
                    <span
                      className="bullet"
                      style={{
                        color: "var(--critical)",
                      }}
                    >
                      !
                    </span>

                    <span>{getText(guidance)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="guidance-list">
                <li>
                  <span
                    className="bullet"
                    style={{
                      color: "var(--critical)",
                    }}
                  >
                    !
                  </span>

                  <span>Review the risk score and contributing factors.</span>
                </li>

                <li>
                  <span
                    className="bullet"
                    style={{
                      color: "var(--critical)",
                    }}
                  >
                    !
                  </span>

                  <span>
                    Coordinate appropriate emergency response resources.
                  </span>
                </li>
              </ul>
            )}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Relief Infrastructure */}
      {/* ------------------------------------------------------------------ */}

      {(alert.nearbyShelter || alert.nearestHospital) && (
        <div className="detail-section mb-3">
          <div className="detail-section-title">
            Critical Relief Infrastructure
          </div>

          <div className="row g-3">
            {/* Shelter */}
            {alert.nearbyShelter && (
              <div className="col-12 col-md-6">
                <div
                  className="h-100 p-2 rounded"
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    className="d-flex align-items-center gap-1 mb-1"
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--info)",
                    }}
                  >
                    <Home size={13} />

                    <strong>Nearest Shelter</strong>
                  </div>

                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--text-primary)",
                      fontWeight: "600",
                    }}
                  >
                    {alert.nearbyShelter.name}
                  </div>

                  <div
                    style={{
                      fontSize: "0.72rem",
                      color: "var(--text-muted)",
                      marginTop: "2px",
                    }}
                  >
                    {alert.nearbyShelter.distanceKm} km away •{" "}
                    {alert.nearbyShelter.occupied}/
                    {alert.nearbyShelter.capacity} capacity
                  </div>
                </div>
              </div>
            )}

            {/* Hospital */}
            {alert.nearestHospital && (
              <div className="col-12 col-md-6">
                <div
                  className="h-100 p-2 rounded"
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    className="d-flex align-items-center gap-1 mb-1"
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--info)",
                    }}
                  >
                    <Building size={13} />

                    <strong>Nearest Hospital</strong>
                  </div>

                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--text-primary)",
                      fontWeight: "600",
                    }}
                  >
                    {alert.nearestHospital.name}
                  </div>

                  <div
                    style={{
                      fontSize: "0.72rem",
                      color: "var(--text-muted)",
                      marginTop: "2px",
                    }}
                  >
                    {alert.nearestHospital.distanceKm} km away •{" "}
                    {alert.nearestHospital.beds} Beds (
                    {alert.nearestHospital.icuAvailable} ICU)
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Alert Actions */}
      {/* ------------------------------------------------------------------ */}

      <div
        className="d-flex align-items-center justify-content-end gap-2 mt-4 pt-3 flex-wrap"
        style={{
          borderTop: "1px solid var(--border)",
        }}
      >
        {/* Acknowledge */}
        {(alert.status === "Active" || alert.status === "ACTIVE") && (
          <button className="btn-ops" onClick={handleAcknowledge}>
            <CheckCircle size={14} />

            <span>Acknowledge Alert</span>
          </button>
        )}

        {/* Escalate */}
        {String(riskLevel).toUpperCase() !== "CRITICAL" && (
          <button className="btn-ops btn-ops-critical" onClick={handleEscalate}>
            <ShieldAlert size={14} />

            <span>Escalate Priority</span>
          </button>
        )}

        {/* Resolve */}
        <button className="btn-ops btn-ops-primary" onClick={handleResolve}>
          <span>Resolve Alert</span>
        </button>
      </div>
    </div>
  );
};

export default AlertDetails;
