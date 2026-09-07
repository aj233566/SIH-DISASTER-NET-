import React from "react";
import "./Weather.css";

function Weather() {
  const forecast = [
    {
      day: "Today",
      icon: "🌧️",
      temp: "28°C",
      condition: "Heavy Rain",
      risk: "High",
    },
    {
      day: "Tomorrow",
      icon: "⛈️",
      temp: "27°C",
      condition: "Thunderstorms",
      risk: "Critical",
    },
    {
      day: "Monday",
      icon: "🌦️",
      temp: "29°C",
      condition: "Scattered Rain",
      risk: "Moderate",
    },
    {
      day: "Tuesday",
      icon: "☁️",
      temp: "30°C",
      condition: "Cloudy",
      risk: "Low",
    },
    {
      day: "Wednesday",
      icon: "☀️",
      temp: "31°C",
      condition: "Clear",
      risk: "Low",
    },
  ];

  return (
    <div className="weather-page">

      {/* Header */}
      <div className="weather-header">
        <div>
          <h2 className="weather-title">
            Weather Monitoring
          </h2>

          <p className="weather-subtitle">
            Real-time weather conditions and disaster risk analysis
          </p>
        </div>

        <span className="weather-live">
          ● Live Monitoring
        </span>
      </div>


      {/* Current Weather */}
      <div className="row g-4 mb-4">

        <div className="col-lg-8">

          <div className="weather-main-card">

            <div className="weather-location">
              📍 Disaster Monitoring Region
            </div>

            <div className="current-weather">

              <div className="big-weather-icon">
                🌧️
              </div>

              <div>
                <div className="current-temperature">
                  28°C
                </div>

                <div className="current-condition">
                  Heavy Rainfall
                </div>

                <div className="weather-updated">
                  Updated 5 minutes ago
                </div>
              </div>

            </div>

            <div className="weather-details">

              <div className="weather-detail">
                <span>💧 Humidity</span>
                <strong>84%</strong>
              </div>

              <div className="weather-detail">
                <span>💨 Wind</span>
                <strong>18 km/h</strong>
              </div>

              <div className="weather-detail">
                <span>🌧️ Rainfall</span>
                <strong>42 mm</strong>
              </div>

              <div className="weather-detail">
                <span>👁️ Visibility</span>
                <strong>6 km</strong>
              </div>

            </div>

          </div>

        </div>


        {/* Risk Card */}
        <div className="col-lg-4">

          <div className="risk-card">

            <div className="risk-card-header">
              <h5>Weather Risk</h5>

              <span className="risk-critical">
                HIGH
              </span>
            </div>

            <div className="risk-score">
              78
            </div>

            <p className="risk-description">
              Current weather conditions may increase
              the possibility of flooding and road blockage.
            </p>

            <div className="risk-progress">
              <div className="risk-progress-bar"></div>
            </div>

            <div className="risk-footer">
              <span>Risk Level</span>
              <strong>High</strong>
            </div>

          </div>

        </div>

      </div>


      {/* Weather Alerts */}
      <div className="weather-alert mb-4">

        <div className="alert-icon">
          ⚠️
        </div>

        <div>
          <h6>Severe Weather Alert</h6>

          <p>
            Heavy rainfall is expected in vulnerable zones.
            Authorities are advised to monitor flood-prone
            areas and road connectivity.
          </p>
        </div>

      </div>


      {/* Forecast */}
      <div className="weather-section">

        <div className="weather-section-header">
          <h5>Weather Forecast</h5>

          <span>Next 5 Days</span>
        </div>

        <div className="row g-3 p-3">

          {forecast.map((item, index) => (

            <div className="col-md" key={index}>

              <div className="forecast-card">

                <h6>{item.day}</h6>

                <div className="forecast-icon">
                  {item.icon}
                </div>

                <div className="forecast-temp">
                  {item.temp}
                </div>

                <p>
                  {item.condition}
                </p>

                <span
                  className={
                    item.risk === "Critical"
                      ? "forecast-risk critical"
                      : item.risk === "High"
                      ? "forecast-risk high"
                      : item.risk === "Moderate"
                      ? "forecast-risk moderate"
                      : "forecast-risk low"
                  }
                >
                  {item.risk} Risk
                </span>

              </div>

            </div>

          ))}

        </div>

      </div>


      {/* Weather Impact */}
      <div className="row g-4 mt-1">

        <div className="col-md-6">

          <div className="weather-section">

            <div className="weather-section-header">
              <h5>Weather Impact</h5>
            </div>

            <div className="impact-list">

              <div className="impact-item">
                <span>🌊 Flood Risk</span>
                <strong className="text-danger">
                  High
                </strong>
              </div>

              <div className="impact-item">
                <span>🛣️ Road Disruption</span>
                <strong className="text-warning">
                  Moderate
                </strong>
              </div>

              <div className="impact-item">
                <span>⛰️ Landslide Risk</span>
                <strong className="text-danger">
                  High
                </strong>
              </div>

              <div className="impact-item">
                <span>⚡ Lightning Risk</span>
                <strong className="text-warning">
                  Moderate
                </strong>
              </div>

            </div>

          </div>

        </div>


        <div className="col-md-6">

          <div className="weather-section">

            <div className="weather-section-header">
              <h5>Recommended Actions</h5>
            </div>

            <div className="action-list">

              <div className="action-item">
                <span>✓</span>
                Monitor flood-prone areas
              </div>

              <div className="action-item">
                <span>✓</span>
                Check road connectivity
              </div>

              <div className="action-item">
                <span>✓</span>
                Keep rescue teams ready
              </div>

              <div className="action-item">
                <span>✓</span>
                Issue public weather alerts
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Weather;