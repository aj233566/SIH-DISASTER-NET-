import React from "react";

import {
  Send,
} from "lucide-react";

import RiskBadge from "../alerts/RiskBadge";

export const ResponseTable = ({
  areas = [],
  onDispatch,
}) => {

  return (
    <div className="ops-panel">

      {/* Header */}
      <div className="ops-panel-header">

        <h3 className="ops-panel-title">
          <span>
            Emergency Response Criteria
            Matrix
          </span>
        </h3>

        <span className="badge-ops neutral">
          {areas.length} Recorded Impact Zones
        </span>

      </div>

      {/* Table */}
      {areas.length === 0 ? (

        <div className="p-4 text-center text-muted-custom">
          No affected areas available.
        </div>

      ) : (

        <div className="ops-table-responsive">

          <table className="ops-table">

            <thead>
              <tr>
                <th>
                  Rank / Queue
                </th>

                <th>
                  Location & Sector
                </th>

                <th>
                  Risk Score
                </th>

                <th>
                  Road Status
                </th>

                <th>
                  Impacted Pop.
                </th>

                <th>
                  Relief Infrastructure
                </th>

                <th>
                  Assigned Response Units
                </th>

                <th>
                  Action
                </th>
              </tr>
            </thead>

            <tbody>

              {areas.map((area) => {

                const riskScore =
                  Number(
                    area.riskScore ??
                      area.risk?.score ??
                      0
                  );

                const priority =
                  area.priorityQueue ||
                  "Priority 3";

                const priorityColor =
                  priority === "Priority 1"
                    ? "var(--critical)"
                    : priority ===
                      "Priority 2"
                    ? "var(--high-risk)"
                    : "var(--warning)";

                const roadStatus =
                  area.roadStatus ||
                  area.operations
                    ?.roadBlockage ||
                  "Open";

                const roadClass =
                  roadStatus === "Blocked"
                    ? "critical"
                    : roadStatus ===
                      "Partially Obstructed"
                    ? "warning"
                    : "safe";

                return (
                  <tr
                    key={
                      area.id ||
                      area._id
                    }
                  >

                    {/* Rank */}
                    <td>

                      <div
                        style={{
                          display: "flex",
                          alignItems:
                            "center",
                          gap: "6px",
                        }}
                      >

                        <span
                          className="badge-ops"
                          style={{
                            backgroundColor:
                              priorityColor,
                            color:
                              priority ===
                              "Priority 3"
                                ? "#101416"
                                : "#ffffff",
                          }}
                        >
                          #{area.priorityRank ??
                            "--"}{" "}
                          {priority}
                        </span>

                      </div>

                    </td>

                    {/* Location */}
                    <td>

                      <strong
                        style={{
                          color:
                            "var(--text-primary)",
                        }}
                      >
                        {typeof area.location ===
                        "string"
                          ? area.location
                          : area.location
                              ?.name ||
                            "Unknown Location"}
                      </strong>

                      <div
                        style={{
                          fontSize:
                            "0.72rem",
                          color:
                            "var(--text-muted)",
                        }}
                      >
                        {area.district ||
                          "Unknown District"}
                        ,{" "}
                        {area.state ||
                          "Unknown State"}
                      </div>

                    </td>

                    {/* Risk */}
                    <td>

                      <div
                        style={{
                          display: "flex",
                          alignItems:
                            "center",
                          gap: "6px",
                        }}
                      >

                        <span
                          style={{
                            fontFamily:
                              "monospace",
                            fontWeight: "700",
                            color:
                              riskScore >=
                              80
                                ? "var(--critical)"
                                : riskScore >=
                                  65
                                ? "var(--high-risk)"
                                : "var(--warning)",
                          }}
                        >
                          {riskScore}%
                        </span>

                        <RiskBadge
                          level={
                            area.riskLevel ||
                            area.risk?.level ||
                            "LOW"
                          }
                          showIcon={false}
                        />

                      </div>

                    </td>

                    {/* Road */}
                    <td>

                      <span
                        className={`badge-ops ${roadClass}`}
                      >
                        {roadStatus}
                      </span>

                    </td>

                    {/* Population */}
                    <td
                      style={{
                        fontFamily:
                          "monospace",
                      }}
                    >
                      {area.affectedPopulation !=
                      null
                        ? Number(
                            area.affectedPopulation
                          ).toLocaleString()
                        : "--"}
                    </td>

                    {/* Infrastructure */}
                    <td
                      style={{
                        fontSize:
                          "0.75rem",
                      }}
                    >

                      <div>
                        🏠{" "}
                        {area.nearestShelter
                          ?.name ||
                          "Local Camp"}

                        {" ("}

                        {area.nearestShelter
                          ?.distanceKm ??
                          "--"}

                        {" km)"}
                      </div>

                      <div
                        style={{
                          color:
                            "var(--text-muted)",
                        }}
                      >
                        🏥{" "}
                        {area.nearestHospital
                          ?.name ||
                          "Hospital"}

                        {" ("}

                        {area.nearestHospital
                          ?.distanceKm ??
                          "--"}

                        {" km)"}
                      </div>

                    </td>

                    {/* Assigned Units */}
                    <td>

                      {area
                        .availableResources
                        ?.assignedTeams
                        ?.length > 0 ? (

                        <div
                          style={{
                            display:
                              "flex",
                            flexWrap:
                              "wrap",
                            gap: "3px",
                          }}
                        >

                          {area.availableResources.assignedTeams.map(
                            (
                              team,
                              index
                            ) => (
                              <span
                                key={
                                  index
                                }
                                className="badge-ops info"
                                style={{
                                  fontSize:
                                    "0.65rem",
                                }}
                              >
                                {team}
                              </span>
                            )
                          )}

                        </div>

                      ) : (

                        <span
                          style={{
                            color:
                              "var(--critical)",
                            fontSize:
                              "0.72rem",
                          }}
                        >
                          Awaiting Assignment
                        </span>

                      )}

                    </td>

                    {/* Dispatch */}
                    <td>

                      <button
                        className="btn-ops btn-ops-sm btn-ops-primary"
                        onClick={() =>
                          onDispatch(
                            area
                          )
                        }
                      >
                        <Send size={11} />

                        <span>
                          Dispatch
                        </span>
                      </button>

                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>

        </div>
      )}

    </div>
  );
};

export default ResponseTable;