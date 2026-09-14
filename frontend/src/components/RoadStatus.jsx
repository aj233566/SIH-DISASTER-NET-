import React from "react";

function RoadStatus({ roads = [] }) {
  const normalizeStatus = (status) => {
    const value = String(status || "").toLowerCase();

    if (value === "blocked" || value === "closed") {
      return "Blocked";
    }

    if (
      value === "restricted" ||
      value === "partial" ||
      value === "one-lane" ||
      value === "one lane"
    ) {
      return "Restricted";
    }

    return "Open";
  };

  const getConnectivity = (road) => {
    if (typeof road.connectivity === "number") {
      return Math.max(0, Math.min(100, road.connectivity));
    }

    switch (normalizeStatus(road.status)) {
      case "Blocked":
        return 0;

      case "Restricted":
        return 60;

      case "Open":
      default:
        return 100;
    }
  };

  const getStatusClass = (status) => {
    switch (normalizeStatus(status)) {
      case "Blocked":
        return "bg-danger";

      case "Restricted":
        return "bg-warning text-dark";

      case "Open":
      default:
        return "bg-success";
    }
  };

  const getOverallStatus = (connectivity) => {
    if (connectivity >= 80) return "Stable";
    if (connectivity >= 50) return "Degraded";
    return "Critical";
  };

  // Only use valid road records
  const validRoads = Array.isArray(roads)
    ? roads.filter((road) => road && road.name)
    : [];

  const roadData = validRoads.map((road) => ({
    ...road,
    normalizedStatus: normalizeStatus(road.status),
    calculatedConnectivity: getConnectivity(road),
  }));

  // Calculate overall road connectivity
  const totalConnectivity =
    roadData.length > 0
      ? Math.round(
          roadData.reduce((sum, road) => sum + road.calculatedConnectivity, 0) /
            roadData.length,
        )
      : 0;

  const openCount = roadData.filter((road) => road.normalizedStatus === "Open")
    .length;

  const restrictedCount = roadData.filter(
    (road) => road.normalizedStatus === "Restricted",
  ).length;

  const blockedCount = roadData.filter(
    (road) => road.normalizedStatus === "Blocked",
  ).length;

  const overallStatus = getOverallStatus(totalConnectivity);

  const overallBadgeClass =
    overallStatus === "Stable"
      ? "bg-success"
      : overallStatus === "Degraded"
      ? "bg-warning text-dark"
      : "bg-danger";

  return (
    <div className="card shadow-sm border-0 h-100">
      <div className="card-body">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <h5 className="fw-bold mb-1">Road Connectivity</h5>

            <p className="text-muted mb-0">
              Current monitored road network status
            </p>
          </div>

          <span className={`badge ${overallBadgeClass}`}>
            {totalConnectivity}% {overallStatus}
          </span>
        </div>

        {/* Overall connectivity */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-end mb-2">
            <div>
              <div className="display-6 fw-bold">{totalConnectivity}%</div>

              <small className="text-muted">Overall connectivity</small>
            </div>

            <div className="text-end">
              <small className="text-muted d-block">
                {roadData.length} monitored roads
              </small>

              <small className="text-muted">
                {openCount} open · {restrictedCount} restricted · {blockedCount}{" "}
                blocked
              </small>
            </div>
          </div>

          <div
            className="progress"
            style={{ height: "10px" }}
            role="progressbar"
            aria-valuenow={totalConnectivity}
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div
              className={`progress-bar ${overallBadgeClass}`}
              style={{
                width: `${totalConnectivity}%`,
              }}
            />
          </div>
        </div>

        {/* Individual roads */}
        {roadData.length === 0 ? (
          <div className="text-muted text-center py-4">
            No road status data available.
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {roadData.map((road, index) => (
              <div
                key={road.id || road.name || index}
                className="border rounded p-3"
              >
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <strong>{road.name}</strong>

                  <span
                    className={`badge ${getStatusClass(road.normalizedStatus)}`}
                  >
                    {road.normalizedStatus}
                  </span>
                </div>

                {/* Road connectivity */}
                <div
                  className="progress mb-1"
                  style={{ height: "8px" }}
                  role="progressbar"
                  aria-valuenow={road.calculatedConnectivity}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  <div
                    className={`progress-bar ${getStatusClass(
                      road.normalizedStatus,
                    )}`}
                    style={{
                      width: `${road.calculatedConnectivity}%`,
                    }}
                  />
                </div>

                <div className="d-flex justify-content-between">
                  <small className="text-muted">
                    {road.calculatedConnectivity}% connectivity
                  </small>

                  {road.estimatedClearance && (
                    <small className="text-muted">
                      Clearance: {road.estimatedClearance}
                    </small>
                  )}
                </div>

                {/* Blockage information */}
                {road.normalizedStatus === "Blocked" && (
                  <div className="mt-2 small text-danger">
                    <strong>Blocked:</strong>{" "}
                    {road.condition ||
                      road.blockageReason ||
                      "Road obstruction reported"}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Data source */}
        <div className="mt-3 pt-2 border-top">
          <small className="text-muted">Source: GIS road-status dataset</small>
        </div>
      </div>
    </div>
  );
}

export default RoadStatus;
