/**
 * ==============================================================================
 * CASCADE-NET | ResourceStatus.jsx
 * ==============================================================================
 * Regional Emergency Resource Readiness Status.
 * Uses Bootstrap Grid for responsive asset meters.
 * ==============================================================================
 */

import React from "react";

import { Truck } from "lucide-react";

import { useAlerts } from "../../context/AlertContext";

export const ResourceStatus = () => {

  const {
    resources = [],
  } = useAlerts();

  return (
    <div className="resource-summary-panel mt-4">

      {/* Header */}
      <div className="ops-panel-header">

        <h3 className="ops-panel-title">

          <Truck
            size={18}
            color="var(--info)"
          />

          <span>
            Regional Emergency Resource
            Readiness
          </span>

        </h3>

        <span className="badge-ops safe">
          Active Operational Reserves
        </span>

      </div>

      {/* Resources */}
      {resources.length === 0 ? (

        <div className="ops-card p-4 text-center text-muted-custom">
          No resource data available.
        </div>

      ) : (

        <div className="row g-3">

          {resources.map((resource) => {

            const totalUnits =
              Number(resource.totalUnits) || 0;

            const availableUnits =
              Number(
                resource.availableUnits
              ) || 0;

            const percentAvailable =
              totalUnits > 0
                ? Math.min(
                    100,
                    Math.round(
                      (availableUnits /
                        totalUnits) *
                        100
                    )
                  )
                : 0;

            const statusColor =
              percentAvailable < 40
                ? "var(--critical)"
                : percentAvailable < 70
                ? "var(--warning)"
                : "var(--safe)";

            return (
              <div
                key={
                  resource.id ||
                  resource._id
                }
                className="col-12 col-md-6 col-xl-4"
              >

                <div className="resource-meter-box h-100">

                  {/* Resource Header */}
                  <div
                    className="resource-meter-header d-flex align-items-center justify-content-between mb-2"
                  >

                    <div>

                      <strong
                        style={{
                          color:
                            "var(--text-primary)",
                          display: "block",
                        }}
                      >
                        {resource.name ||
                          "Emergency Resource"}
                      </strong>

                      <small
                        style={{
                          color:
                            "var(--text-muted)",
                        }}
                      >
                        {resource.type ||
                          "Resource"}{" "}
                        •{" "}
                        {resource.category ||
                          "General"}
                      </small>

                    </div>

                    <div className="text-end">

                      <span
                        style={{
                          fontSize:
                            "0.9rem",
                          fontWeight: "700",
                          fontFamily:
                            "monospace",
                          color:
                            "var(--text-primary)",
                        }}
                      >
                        {availableUnits}/
                        {totalUnits}
                      </span>

                      <div
                        style={{
                          fontSize:
                            "0.68rem",
                          color:
                            statusColor,
                        }}
                      >
                        {percentAvailable}%
                        {" "}Available
                      </div>

                    </div>

                  </div>

                  {/* Resource Bar */}
                  <div className="resource-bar-track">

                    <div
                      className="resource-bar-fill"
                      style={{
                        width: `${percentAvailable}%`,
                        backgroundColor:
                          statusColor,
                      }}
                    />

                  </div>

                </div>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
};

export default ResourceStatus;