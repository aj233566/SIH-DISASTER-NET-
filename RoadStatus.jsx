import React from "react";

function RoadStatus({
  roads = [
    { name: "NH-44", status: "Open", connectivity: 95 },
    { name: "NH-48", status: "Partial", connectivity: 68 },
    { name: "SH-12", status: "Blocked", connectivity: 25 },
    { name: "City Roads", status: "Open", connectivity: 88 },
  ],
}) {
  const getStatusClass = (status) => {
    if (status === "Open") return "bg-success";
    if (status === "Partial") return "bg-warning text-dark";
    if (status === "Blocked") return "bg-danger";
    return "bg-secondary";
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="fw-bold mb-1">Road Connectivity</h5>
            <p className="text-muted mb-0">
              Current road network status
            </p>
          </div>

          <span className="badge bg-success">82% Stable</span>
        </div>

        <div className="d-flex flex-column gap-3">
          {roads.map((road) => (
            <div key={road.name}>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <strong>{road.name}</strong>

                <span className={`badge ${getStatusClass(road.status)}`}>
                  {road.status}
                </span>
              </div>

              <div
                className="progress"
                style={{ height: "8px" }}
                role="progressbar"
                aria-valuenow={road.connectivity}
                aria-valuemin="0"
                aria-valuemax="100"
              >
                <div
                  className={`progress-bar ${getStatusClass(road.status)}`}
                  style={{ width: `${road.connectivity}%` }}
                ></div>
              </div>

              <small className="text-muted">
                {road.connectivity}% connectivity
              </small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RoadStatus;