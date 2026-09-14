import React from "react";

import { Route, Building, Home, Truck, Send } from "lucide-react";

import RiskBadge from "../alerts/RiskBadge";

export const PriorityCard = ({ area, onDispatch }) => {
  /*
   * Safety check
   */
  if (!area) {
    return null;
  }

  /*
   * Normalize road status
   */
  const normalizedRoadStatus = String(area.roadStatus || "Open").toLowerCase();

  /*
   * Road status CSS class
   */
  const getRoadClass = () => {
    if (normalizedRoadStatus.includes("blocked")) {
      return "blocked";
    }

    if (
      normalizedRoadStatus.includes("partial") ||
      normalizedRoadStatus.includes("obstructed")
    ) {
      return "partial";
    }

    return "open";
  };

  /*
   * Road status display label
   */
  const getRoadLabel = () => {
    if (normalizedRoadStatus.includes("blocked")) {
      return "Road Blocked";
    }

    if (
      normalizedRoadStatus.includes("partial") ||
      normalizedRoadStatus.includes("obstructed")
    ) {
      return "Partially Obstructed";
    }

    return "Road Open";
  };

  /*
   * Risk score
   *
   * Supports both:
   * area.riskScore
   * area.risk.score
   */
  const riskScore = Number(area.riskScore ?? area.risk?.score ?? 0);

  /*
   * Risk level
   */
  const riskLevel = area.riskLevel || area.risk?.level || "Low";

  /*
   * Population
   */
  const population = Number(area.affectedPopulation);

  /*
   * Assigned response teams
   */
  const assignedTeams =
    area.availableResources?.assignedTeams || area.assignedTeams || [];

  /*
   * Response status
   */
  const responseStatus = area.responseStatus || "Standby";

  /*
   * Response status indicator
   */
  const getResponseStatusColor = () => {
    const status = String(responseStatus).toLowerCase();

    if (status.includes("on scene") || status.includes("active")) {
      return "var(--safe)";
    }

    if (status.includes("transit") || status.includes("dispatch")) {
      return "var(--warning)";
    }

    return "var(--text-muted)";
  };

  /*
   * Risk score color
   */
  const getRiskScoreColor = () => {
    if (riskScore >= 80) {
      return "var(--critical)";
    }

    if (riskScore >= 65) {
      return "var(--high-risk)";
    }

    if (riskScore >= 25) {
      return "var(--warning)";
    }

    return "var(--safe)";
  };

  /*
   * Location name
   */
  const getLocationName = () => {
    if (!area.location) {
      return "Unknown Location";
    }

    if (typeof area.location === "string") {
      return area.location;
    }

    return area.location.name || area.location.district || "Unknown Location";
  };

  /*
   * District
   */
  const getDistrict = () => {
    if (area.district) {
      return area.district;
    }

    if (typeof area.location === "object") {
      return area.location.district || "";
    }

    return "";
  };

  /*
   * State
   */
  const getState = () => {
    if (area.state) {
      return area.state;
    }

    if (typeof area.location === "object") {
      return area.location.state || "";
    }

    return "";
  };

  /*
   * Format distance
   */
  const formatDistance = (distance) => {
    const value = Number(distance);

    if (!Number.isFinite(value)) {
      return "—";
    }

    return `${value} km`;
  };

  /*
   * Format population
   */
  const formatPopulation = () => {
    if (!Number.isFinite(population)) {
      return "—";
    }

    return population.toLocaleString();
  };

  return (
    <div className="priority-card">
      {/* ================================================================ */}
      {/* Main Card Content */}
      {/* ================================================================ */}

      <div>
        {/* ============================================================ */}
        {/* Header */}
        {/* ============================================================ */}

        <div className="priority-card-top">
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              minWidth: 0,
            }}
          >
            {/* Priority Rank */}
            <div className="priority-rank-chip">
              #{area.priorityRank || "—"}
            </div>

            {/* Location */}
            <div className="priority-loc-info">
              <h4>{getLocationName()}</h4>

              <span>
                {getDistrict()}

                {getDistrict() && getState() ? ", " : ""}

                {getState()}
              </span>
            </div>
          </div>

          {/* Risk Badge */}
          <RiskBadge level={riskLevel} />
        </div>

        {/* ============================================================ */}
        {/* Impact Statistics */}
        {/* ============================================================ */}

        <div className="impact-stats-row">
          {/* Risk Score */}
          <div className="impact-stat-item">
            <span className="lbl">Risk Score</span>

            <span
              className="val"
              style={{
                color: getRiskScoreColor(),
              }}
            >
              {riskScore}/100
            </span>
          </div>

          {/* Population */}
          <div className="impact-stat-item">
            <span className="lbl">Impacted Population</span>

            <span className="val">{formatPopulation()}</span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* Road Connectivity */}
        {/* ============================================================ */}

        <div className={`road-status-indicator ${getRoadClass()}`}>
          <Route size={14} />

          <span>{getRoadLabel()}</span>
        </div>

        {/* ============================================================ */}
        {/* Hospital & Shelter */}
        {/* ============================================================ */}

        <div className="shelter-hosp-info">
          {/* Hospital */}
          {area.nearestHospital && (
            <div className="shelter-hosp-item">
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  minWidth: 0,
                }}
              >
                <Building size={12} color="var(--info)" />

                <span>{area.nearestHospital.name || "Hospital"}</span>
              </span>

              <strong
                style={{
                  color: "var(--text-primary)",
                  whiteSpace: "nowrap",
                }}
              >
                {formatDistance(area.nearestHospital.distanceKm)}
              </strong>
            </div>
          )}

          {/* Shelter */}
          {area.nearestShelter && (
            <div className="shelter-hosp-item">
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  minWidth: 0,
                }}
              >
                <Home size={12} color="var(--safe)" />

                <span>{area.nearestShelter.name || "Relief Shelter"}</span>
              </span>

              <strong
                style={{
                  color: "var(--text-primary)",
                  whiteSpace: "nowrap",
                }}
              >
                {formatDistance(area.nearestShelter.distanceKm)}
              </strong>
            </div>
          )}

          {/* No infrastructure information */}
          {!area.nearestHospital && !area.nearestShelter && (
            <div
              style={{
                fontSize: "0.72rem",
                color: "var(--text-muted)",
              }}
            >
              No nearby relief infrastructure data available.
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* Assigned Response Units */}
        {/* ============================================================ */}

        <div
          style={{
            fontSize: "0.75rem",
            color: "var(--text-secondary)",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              color: "var(--text-muted)",
              marginBottom: "4px",
            }}
          >
            <Truck size={12} />

            <span>Assigned Response Units:</span>
          </div>

          {assignedTeams.length > 0 ? (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "4px",
              }}
            >
              {assignedTeams.map((team, index) => {
                const teamName =
                  typeof team === "string"
                    ? team
                    : team?.name || team?.type || "Response Unit";

                return (
                  <span
                    key={`${teamName}-${index}`}
                    className="badge-ops info"
                    style={{
                      fontSize: "0.68rem",
                    }}
                  >
                    {teamName}
                  </span>
                );
              })}
            </div>
          ) : (
            <span
              style={{
                color: "var(--critical)",
                fontSize: "0.72rem",
              }}
            >
              No Response Teams Assigned
            </span>
          )}
        </div>
      </div>

      {/* ================================================================ */}
      {/* Card Actions */}
      {/* ================================================================ */}

      <div className="priority-card-actions">
        {/* Response Status */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.72rem",
            color: "var(--text-muted)",
          }}
        >
          <span
            className="live-dot"
            style={{
              backgroundColor: getResponseStatusColor(),
            }}
          />

          <span>Status: {responseStatus}</span>
        </div>

        {/* Dispatch */}
        <button
          className="btn-ops btn-ops-sm btn-ops-primary"
          onClick={() => onDispatch?.(area)}
          disabled={!onDispatch}
        >
          <Send size={12} />

          <span>Dispatch Team</span>
        </button>
      </div>
    </div>
  );
};

export default PriorityCard;
