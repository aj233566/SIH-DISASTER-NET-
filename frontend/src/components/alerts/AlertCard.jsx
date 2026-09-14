import React from "react";
import {
  MapPin,
  Clock,
  Users,
  CloudRain,
  Droplets,
  TrendingUp,
  AlertCircle,
  ShieldAlert,
  ArrowRight,
  Route,
} from "lucide-react";

import RiskBadge from "./RiskBadge";

export const AlertCard = ({ alert, onSelect }) => {
  const severityClass = String(alert.riskLevel || "Low").toLowerCase();

  const getLocationName = () => {
    if (typeof alert.location === "string") {
      return alert.location;
    }

    return alert.location?.name || "Unknown Location";
  };

  const getAlertId = () => {
    return alert.id || alert._id || "ALERT";
  };

  const getRiskScore = () => {
    return alert.riskScore ?? alert.risk?.score ?? 0;
  };

  const getContributingFactors = () => {
    if (Array.isArray(alert.contributingFactors)) {
      return alert.contributingFactors;
    }

    if (Array.isArray(alert.majorContributors)) {
      return alert.majorContributors.map((item) => ({
        factor: item.label || item.key || "Risk Factor",
        detail: item.reason || item.detail || "",
      }));
    }

    return [];
  };

  const factors = getContributingFactors();

  const roadStatus = alert.roadStatus || "Normal";

  const roadStatusColor =
    roadStatus === "Blocked"
      ? "var(--critical)"
      : roadStatus === "Partially Obstructed"
      ? "var(--warning)"
      : "var(--safe)";

  return (
    <div className={`alert-card ${severityClass}-level`}>
      {/* Alert Main Content */}
      <div>
        {/* Header */}
        <div className="alert-card-header">
          <div className="alert-card-location">
            <div className="state-tag">{alert.state || "NER Sector"}</div>

            <h3>{getLocationName()}</h3>
          </div>

          {/* Risk Score */}
          <div className="alert-card-score-box">
            <span className={`score-number ${severityClass}`}>
              {getRiskScore()}%
            </span>

            <span className="score-label">Risk Score</span>
          </div>
        </div>

        {/* Risk Level + Alert ID */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          <RiskBadge level={alert.riskLevel} />

          <span className="badge-ops neutral" style={{ fontSize: "0.7rem" }}>
            {getAlertId()}
          </span>
        </div>

        {/* Telemetry Mini Grid */}
        <div className="telemetry-mini-grid">
          {/* Rainfall */}
          <div className="telemetry-item">
            <span className="telemetry-label">
              <CloudRain size={12} />
              <span>Rainfall</span>
            </span>

            <span className="telemetry-val">
              {alert.rainfall72h ?? "--"} mm
            </span>
          </div>

          {/* Soil Moisture */}
          <div className="telemetry-item">
            <span className="telemetry-label">
              <Droplets size={12} />
              <span>Soil Saturation</span>
            </span>

            <span className="telemetry-val">{alert.soilMoisture ?? "--"}%</span>
          </div>

          {/* Slope Angle */}
          <div className="telemetry-item">
            <span className="telemetry-label">
              <TrendingUp size={12} />
              <span>Slope Angle</span>
            </span>

            <span className="telemetry-val">{alert.slopeAngle ?? "--"}°</span>
          </div>

          {/* Road Status */}
          <div className="telemetry-item">
            <span className="telemetry-label">
              <Route size={12} />
              <span>Road Status</span>
            </span>

            <span className="telemetry-val" style={{ color: roadStatusColor }}>
              {roadStatus}
            </span>
          </div>
        </div>

        {/* Contributing Factors */}
        {factors.length > 0 && (
          <div className="contributing-factors-list">
            {factors.slice(0, 2).map((item, idx) => (
              <div key={idx} className="contributing-factor-tag">
                <AlertCircle
                  size={12}
                  color="var(--text-muted)"
                  style={{
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                />

                <span>
                  <strong>{item.factor || "Risk Factor"}:</strong>{" "}
                  {item.detail || item.reason || ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="alert-card-footer">
        <div className="alert-timestamp">
          <Clock size={12} />

          <span>
            {alert.timestamp
              ? new Date(alert.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Time unavailable"}
          </span>

          <span style={{ margin: "0 4px" }}>•</span>

          <Users size={12} />

          <span>
            {alert.affectedPopulation != null
              ? `${alert.affectedPopulation.toLocaleString()} pop`
              : "Population unavailable"}
          </span>
        </div>

        {/* View Details */}
        <button
          className="btn-ops btn-ops-sm btn-ops-primary"
          onClick={() => onSelect(alert)}
        >
          <span>View Details</span>
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
};

export default AlertCard;
