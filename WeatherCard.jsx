import React from "react";

function WeatherCard({
  city = "Current Location",
  temperature = 28,
  condition = "Heavy Rainfall",
  humidity = 84,
  wind = 18,
  rainfall = 42,
  risk = "HIGH",
}) {
  return (
    <div className="card shadow-sm border-0 h-100">
      <div className="card-body">

        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h5 className="fw-bold mb-1">{city}</h5>
            <p className="text-muted mb-0">{condition}</p>
          </div>

          <span
            className={`badge ${
              risk === "HIGH"
                ? "bg-danger"
                : risk === "MODERATE"
                ? "bg-warning text-dark"
                : "bg-success"
            }`}
          >
            {risk} RISK
          </span>
        </div>

        <div className="d-flex align-items-center gap-3 mb-4">
          <span style={{ fontSize: "42px" }}>🌧️</span>

          <div>
            <h2 className="fw-bold mb-0">{temperature}°C</h2>
            <small className="text-muted">{condition}</small>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-6">
            <div className="bg-light rounded p-3">
              <small className="text-muted d-block">Humidity</small>
              <strong>{humidity}%</strong>
            </div>
          </div>

          <div className="col-6">
            <div className="bg-light rounded p-3">
              <small className="text-muted d-block">Wind</small>
              <strong>{wind} km/h</strong>
            </div>
          </div>

          <div className="col-6">
            <div className="bg-light rounded p-3">
              <small className="text-muted d-block">Rainfall</small>
              <strong>{rainfall} mm</strong>
            </div>
          </div>

          <div className="col-6">
            <div className="bg-light rounded p-3">
              <small className="text-muted d-block">Risk Score</small>
              <strong>{risk}</strong>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default WeatherCard;