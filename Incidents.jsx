import React, { useState } from "react";

function Incidents() {
  const [filter, setFilter] = useState("All");

  const incidents = [
    {
      id: "INC-001",
      type: "Flood",
      location: "Zone A",
      severity: "Critical",
      status: "Response Active",
      reported: "10 min ago",
      team: "Rescue Team 01",
    },
    {
      id: "INC-002",
      type: "Road Blockage",
      location: "Zone C",
      severity: "High",
      status: "Under Investigation",
      reported: "25 min ago",
      team: "Response Team 03",
    },
    {
      id: "INC-003",
      type: "Heavy Rainfall",
      location: "Zone B",
      severity: "Moderate",
      status: "Monitoring",
      reported: "42 min ago",
      team: "Weather Unit",
    },
    {
      id: "INC-004",
      type: "Fire",
      location: "Zone D",
      severity: "High",
      status: "Response Active",
      reported: "1 hour ago",
      team: "Fire Unit 02",
    },
    {
      id: "INC-005",
      type: "Landslide",
      location: "Zone E",
      severity: "Critical",
      status: "Response Active",
      reported: "1 hour ago",
      team: "Rescue Team 04",
    },
    {
      id: "INC-006",
      type: "Waterlogging",
      location: "Zone F",
      severity: "Moderate",
      status: "Monitoring",
      reported: "2 hours ago",
      team: "Municipal Unit",
    },
  ];

  const filteredIncidents =
    filter === "All"
      ? incidents
      : incidents.filter(
          (incident) => incident.severity === filter
        );

  const getSeverityClass = (severity) => {
    switch (severity) {
      case "Critical":
        return "bg-danger";
      case "High":
        return "bg-warning text-dark";
      case "Moderate":
        return "bg-info text-dark";
      case "Low":
        return "bg-success";
      default:
        return "bg-secondary";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Response Active":
        return "text-danger";
      case "Under Investigation":
        return "text-warning";
      case "Monitoring":
        return "text-info";
      default:
        return "text-secondary";
    }
  };

  return (
    <div className="container-fluid p-4">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold mb-1">
            Incident Management
          </h2>

          <p className="text-muted mb-0">
            Monitor and manage active disaster incidents
          </p>
        </div>

        <button className="btn btn-danger">
          + Report Incident
        </button>

      </div>


      {/* Statistics */}
      <div className="row g-3 mb-4">

        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-3">
            <p className="text-muted mb-1">
              Total Incidents
            </p>

            <h3 className="fw-bold mb-0">
              {incidents.length}
            </h3>
          </div>
        </div>


        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-3">
            <p className="text-muted mb-1">
              Critical
            </p>

            <h3 className="fw-bold text-danger mb-0">
              {
                incidents.filter(
                  (item) => item.severity === "Critical"
                ).length
              }
            </h3>
          </div>
        </div>


        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-3">
            <p className="text-muted mb-1">
              High Risk
            </p>

            <h3 className="fw-bold text-warning mb-0">
              {
                incidents.filter(
                  (item) => item.severity === "High"
                ).length
              }
            </h3>
          </div>
        </div>


        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-3">
            <p className="text-muted mb-1">
              Response Active
            </p>

            <h3 className="fw-bold text-success mb-0">
              {
                incidents.filter(
                  (item) =>
                    item.status === "Response Active"
                ).length
              }
            </h3>
          </div>
        </div>

      </div>


      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">

        <div className="card-body">

          <div className="row align-items-center">

            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Search incidents..."
              />
            </div>


            <div className="col-md-8 mt-3 mt-md-0">

              <div className="d-flex gap-2 justify-content-md-end flex-wrap">

                {[
                  "All",
                  "Critical",
                  "High",
                  "Moderate",
                  "Low",
                ].map((level) => (

                  <button
                    key={level}
                    className={`btn ${
                      filter === level
                        ? "btn-dark"
                        : "btn-outline-secondary"
                    }`}
                    onClick={() => setFilter(level)}
                  >
                    {level}
                  </button>

                ))}

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* Incidents Table */}
      <div className="card border-0 shadow-sm">

        <div className="card-header bg-white py-3">

          <div className="d-flex justify-content-between align-items-center">

            <h5 className="fw-bold mb-0">
              Active Incidents
            </h5>

            <span className="text-muted">
              Showing {filteredIncidents.length} incidents
            </span>

          </div>

        </div>


        <div className="card-body p-0">

          <div className="table-responsive">

            <table className="table table-hover align-middle mb-0">

              <thead className="table-light">

                <tr>
                  <th className="ps-4">Incident ID</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Reported</th>
                  <th>Response Team</th>
                  <th>Action</th>
                </tr>

              </thead>


              <tbody>

                {filteredIncidents.map((incident) => (

                  <tr key={incident.id}>

                    <td className="ps-4 fw-semibold">
                      {incident.id}
                    </td>

                    <td>
                      {incident.type}
                    </td>

                    <td>
                      📍 {incident.location}
                    </td>

                    <td>
                      <span
                        className={`badge ${getSeverityClass(
                          incident.severity
                        )}`}
                      >
                        {incident.severity}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`fw-semibold ${getStatusClass(
                          incident.status
                        )}`}
                      >
                        ● {incident.status}
                      </span>
                    </td>

                    <td>
                      {incident.reported}
                    </td>

                    <td>
                      {incident.team}
                    </td>

                    <td>
                      <button className="btn btn-sm btn-outline-primary">
                        View
                      </button>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Incidents;