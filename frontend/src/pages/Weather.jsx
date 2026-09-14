import { useEffect, useState } from "react";
import { analyzeRisk } from "../services/riskApi";
import "../css/Weather.css";

function getWeatherCondition(weatherCode) {
  if (weatherCode == null) return "Unknown";

  if (weatherCode === 0) return "Clear sky";
  if ([1, 2, 3].includes(weatherCode)) return "Cloudy";
  if ([45, 48].includes(weatherCode)) return "Foggy";
  if ([51, 53, 55, 56, 57].includes(weatherCode)) return "Drizzle";
  if ([61, 63, 65, 66, 67].includes(weatherCode)) return "Rain";
  if ([71, 73, 75, 77].includes(weatherCode)) return "Snow";
  if ([80, 81, 82].includes(weatherCode)) return "Rain showers";
  if ([85, 86].includes(weatherCode)) return "Snow showers";
  if ([95, 96, 99].includes(weatherCode)) return "Thunderstorm";

  return "Unknown";
}

const NORTHEAST_STATES = [
  {
    name: "Arunachal Pradesh",
    latitude: 27.0844,
    longitude: 93.6053,
  },
  {
    name: "Assam",
    latitude: 26.1445,
    longitude: 91.7362,
  },
  {
    name: "Manipur",
    latitude: 24.817,
    longitude: 93.9368,
  },
  {
    name: "Meghalaya",
    latitude: 25.467,
    longitude: 91.3662,
  },
  {
    name: "Mizoram",
    latitude: 23.7271,
    longitude: 92.7176,
  },
  {
    name: "Nagaland",
    latitude: 25.6751,
    longitude: 94.1086,
  },
  {
    name: "Tripura",
    latitude: 23.8315,
    longitude: 91.2868,
  },
  {
    name: "Sikkim",
    latitude: 27.3389,
    longitude: 88.6065,
  },
];

function getWeatherIcon(weatherCode) {
  if (weatherCode == null) return "🌤️";

  if (weatherCode === 0) return "☀️";
  if ([1, 2, 3].includes(weatherCode)) return "☁️";
  if ([45, 48].includes(weatherCode)) return "🌫️";
  if ([51, 53, 55, 56, 57].includes(weatherCode)) return "🌦️";
  if ([61, 63, 65, 66, 67].includes(weatherCode)) return "🌧️";
  if ([71, 73, 75, 77].includes(weatherCode)) return "❄️";
  if ([80, 81, 82].includes(weatherCode)) return "🌦️";
  if ([85, 86].includes(weatherCode)) return "🌨️";
  if ([95, 96, 99].includes(weatherCode)) return "⛈️";

  return "🌤️";
}

function getRiskClass(level) {
  const value = String(level || "").toLowerCase();

  if (value === "critical") return "weather-impact-critical";
  if (value === "high") return "weather-impact-high";
  if (value === "moderate") return "weather-impact-moderate";

  return "weather-impact-low";
}

function getRiskPercentage(score) {
  if (typeof score !== "number") return 0;

  return Math.max(0, Math.min(100, score));
}

function formatDate(dateString) {
  if (!dateString) return "Unknown";

  return new Date(dateString).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function Weather() {
  const [regionalData, setRegionalData] = useState([]);
  const [selectedState, setSelectedState] = useState("Sikkim");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadRegionalWeather() {
      setLoading(true);
      setError("");

      const results = await Promise.all(
        NORTHEAST_STATES.map(async (state) => {
          try {
            const data = await analyzeRisk({
              latitude: state.latitude,
              longitude: state.longitude,
              name: state.name,
              disasterType: "landslide",
            });

            return {
              ...state,
              data,
              success: true,
            };
          } catch (err) {
            console.error(`Failed to load ${state.name}:`, err);

            return {
              ...state,
              data: null,
              success: false,
              error: err.message,
            };
          }
        }),
      );

      if (cancelled) return;

      setRegionalData(results);

      const successfulStates = results.filter(
        (state) => state.success && state.data,
      );

      if (successfulStates.length === 0) {
        setError("Unable to load weather data for the monitored states.");
      }

      setLoading(false);
    }

    loadRegionalWeather();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <main className="weather-page">
        <div className="weather-header">
          <div>
            <h2 className="weather-title">Weather & Early Warning</h2>

            <p className="weather-subtitle">
              Live environmental monitoring and landslide risk assessment
            </p>
          </div>

          <span className="weather-status">● Connecting</span>
        </div>

        <div className="weather-loading">
          <div className="weather-spinner"></div>
          <p>Fetching live weather and risk intelligence...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="weather-page">
        <div className="weather-header">
          <div>
            <h2 className="weather-title">Weather & Early Warning</h2>

            <p className="weather-subtitle">
              Live environmental monitoring and landslide risk assessment
            </p>
          </div>

          <span className="weather-status weather-status-error">● Offline</span>
        </div>

        <div className="weather-error">
          <h5>Unable to load live weather data</h5>

          <p>{error || "No risk intelligence data is available."}</p>

          <button
            type="button"
            className="weather-retry"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  const selectedStateData = regionalData.find(
    (item) => item.name === selectedState,
  );

  const riskData = selectedStateData?.data || null;

  if (!riskData) {
    return (
      <main className="weather-page">
        <div className="weather-header">
          <div>
            <h2 className="weather-title">Weather & Early Warning</h2>

            <p className="weather-subtitle">
              Live environmental monitoring across Northeast India
            </p>
          </div>

          <span className="weather-status">● Live Monitoring</span>
        </div>

        <div className="weather-error">
          <h5>No state weather data available</h5>
          <p>The regional weather service did not return usable data.</p>
        </div>
      </main>
    );
  }

  const weather = riskData.weather || {};
  const forecast = weather.forecast || {};
  const forecastDays = Array.isArray(forecast.days) ? forecast.days : [];

  const risk = riskData.risk || {};
  const aiAssessment = riskData.aiAssessment || {};
  const incidents = riskData.incidents || {};

  const riskScore =
    typeof aiAssessment.aiScore === "number"
      ? aiAssessment.aiScore
      : typeof risk.score === "number"
      ? risk.score
      : null;

  const riskLevel = aiAssessment.aiLevel || risk.level || "UNKNOWN";

  const confidence =
    typeof aiAssessment.confidence === "number"
      ? aiAssessment.confidence
      : null;

  const contributors = Array.isArray(risk.majorContributors)
    ? risk.majorContributors
    : [];

  const aiRecommendations = Array.isArray(aiAssessment.actionPlan)
    ? aiAssessment.actionPlan
    : [];
  const nearbyIncidentCount =
    typeof incidents.count === "number" ? incidents.count : 0;

  const weatherCondition = getWeatherCondition(weather.weatherCode);

  const weatherIcon = getWeatherIcon(weather.weatherCode);

  const latestUpdate = weather.updateTime || riskData.generatedAt;

  return (
    <main className="weather-page">
      {/* =====================================================
          HEADER
      ===================================================== */}

      {/* =====================================================
    NORTHEAST INDIA STATE OVERVIEW
===================================================== */}

      <div className="weather-section mb-4">
        <div className="weather-section-header">
          <h5 className="weather-section-title">
            Northeast India Weather Overview
          </h5>

          <p className="weather-section-subtitle">
            Live weather and landslide-risk assessment across monitored states
          </p>
        </div>

        <div className="weather-section-body">
          <div className="row g-3">
            {regionalData.map((state) => {
              const data = state.data;

              if (!data) return null;

              const stateWeather = data.weather || {};
              const stateRisk = data.risk || {};
              const stateAI = data.aiAssessment || {};

              const score =
                typeof stateAI.aiScore === "number"
                  ? stateAI.aiScore
                  : typeof stateRisk.score === "number"
                  ? stateRisk.score
                  : null;

              const level = stateAI.aiLevel || stateRisk.level || "UNKNOWN";

              const nearbyReports =
                typeof data.incidents?.count === "number"
                  ? data.incidents.count
                  : 0;

              const stateRiskClass = getRiskClass(level);

              return (
                <div
                  className="col-12 col-sm-6 col-lg-4 col-xl-3"
                  key={state.name}
                >
                  <button
                    type="button"
                    className={`w-100 text-start border rounded p-3 h-100 ${
                      selectedState === state.name ? "border-primary" : ""
                    }`}
                    onClick={() => setSelectedState(state.name)}
                    style={{
                      background: "var(--weather-card-bg, #1d2529)",
                      color: "inherit",
                      cursor: "pointer",
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
                      <strong>{state.name}</strong>

                      <span
                        className={`weather-impact-level ${stateRiskClass}`}
                      >
                        {level}
                      </span>
                    </div>

                    <div className="d-flex align-items-center gap-2 mb-3">
                      <span style={{ fontSize: "30px" }}>
                        {getWeatherIcon(stateWeather.weatherCode)}
                      </span>

                      <div>
                        <div className="fw-bold fs-4">
                          {stateWeather.temperature ?? "--"}°C
                        </div>

                        <small className="text-muted">
                          {getWeatherCondition(stateWeather.weatherCode)}
                        </small>
                      </div>
                    </div>

                    <div className="small">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted">Humidity</span>

                        <strong>{stateWeather.humidity ?? "--"}%</strong>
                      </div>

                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted">Rain</span>

                        <strong>
                          {stateWeather.rain ??
                            stateWeather.precipitation ??
                            "--"}{" "}
                          mm
                        </strong>
                      </div>

                      <div className="d-flex justify-content-between">
                        <span className="text-muted">AI Risk</span>

                        <strong>{score ?? "--"}/100</strong>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-top">
                      <small className="text-muted">
                        Nearby reports: {nearbyReports}
                      </small>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* =====================================================
          CURRENT WEATHER + AI RISK
      ===================================================== */}

      <div className="row g-4 mb-4">
        {/* CURRENT WEATHER */}

        <div className="col-lg-8">
          <div className="weather-main-card">
            <div className="weather-location">📍 {selectedState}</div>
            <div className="weather-temperature-row">
              <div className="weather-icon">{weatherIcon}</div>

              <div>
                <div className="weather-temperature">
                  {weather.temperature ?? "--"}°C
                </div>

                <div className="weather-condition">{weatherCondition}</div>

                <div className="weather-updated">
                  Updated{" "}
                  {latestUpdate
                    ? new Date(latestUpdate).toLocaleString("en-IN")
                    : "Unknown"}
                </div>
              </div>
            </div>

            <div className="weather-metrics">
              <div className="weather-metric">
                <span className="weather-metric-label">Humidity</span>

                <strong className="weather-metric-value">
                  {weather.humidity ?? "--"}%
                </strong>
              </div>

              <div className="weather-metric">
                <span className="weather-metric-label">Wind Speed</span>

                <strong className="weather-metric-value">
                  {weather.windSpeed ?? "--"} km/h
                </strong>
              </div>

              <div className="weather-metric">
                <span className="weather-metric-label">Current Rain</span>

                <strong className="weather-metric-value">
                  {weather.rain ?? weather.precipitation ?? "--"} mm
                </strong>
              </div>

              <div className="weather-metric">
                <span className="weather-metric-label">Forecast Rain</span>

                <strong className="weather-metric-value">
                  {forecast.dailyPrecipitation ?? "--"} mm
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* AI RISK */}

        <div className="col-lg-4">
          <div className="risk-card">
            <div className="risk-card-header">
              <h5>Landslide Risk</h5>

              <span className={`risk-level-badge ${getRiskClass(riskLevel)}`}>
                {riskLevel}
              </span>
            </div>
            <br />
            <div className="risk-score">{riskScore ?? "--"} / 100</div>

            <div className="weather-progress">
              <div
                className="weather-progress-bar"
                style={{
                  width: `${getRiskPercentage(riskScore)}%`,
                }}
              ></div>
            </div>

            <p className="risk-description">
              {aiAssessment.scoreRationale ||
                risk.explanation ||
                "Risk is assessed using weather, terrain, field reports and other available risk factors."}
            </p>

            {confidence !== null && (
              <div className="risk-confidence">
                AI confidence: <strong>{confidence}%</strong>
              </div>
            )}

            <div className="risk-footer">
              <span>Nearby Reports: </span>

              <strong>{nearbyIncidentCount}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          FORECAST
      ===================================================== */}

      <div className="weather-section mb-4">
        <div className="weather-section-header">
          <h5 className="weather-section-title">
            {selectedState} Precipitation Forecast
          </h5>

          <p className="weather-section-subtitle">
            Forecast rainfall at the selected monitoring location
          </p>
        </div>

        <div className="weather-section-body">
          <div className="weather-forecast">
            {forecastDays.length > 0 ? (
              forecastDays.slice(0, 5).map((day, index) => {
                const dayCondition = getWeatherCondition(day.weatherCode);

                const dayIcon = getWeatherIcon(day.weatherCode);

                return (
                  <div
                    className="weather-forecast-card"
                    key={`${day.date}-${index}`}
                  >
                    <div className="weather-forecast-day">
                      {formatDate(day.date)}
                    </div>

                    <div className="weather-forecast-icon">{dayIcon}</div>

                    <div className="weather-forecast-temp">
                      {day.maxTemperature ?? "--"}°C
                    </div>
                    <div className="forecast-condition">Forecast maximum</div>

                    <div className="weather-forecast-condition">
                      {dayCondition}
                    </div>

                    <div className="forecast-precipitation">
                      🌧️ {day.precipitation ?? 0} mm
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="weather-empty">
                Forecast data is currently unavailable.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* WEATHER IMPACT */}

        <div className="col-md-6">
          <div className="weather-section">
            <div className="weather-section-header">
              <h5 className="weather-section-title">
                {selectedState} Weather Impact
              </h5>

              <p className="weather-section-subtitle">
                Environmental conditions relevant to landslide monitoring
              </p>
            </div>

            <div className="weather-section-body">
              <div className="weather-impact-list">
                <div className="weather-impact-item">
                  <div>
                    <div className="weather-impact-name">Current Rainfall</div>

                    <div className="weather-impact-description">
                      Current precipitation at the monitored location
                    </div>
                  </div>

                  <strong>
                    {weather.rain ?? weather.precipitation ?? 0} mm
                  </strong>
                </div>

                <div className="weather-impact-item">
                  <div>
                    <div className="weather-impact-name">
                      Forecast Precipitation
                    </div>

                    <div className="weather-impact-description">
                      Expected rainfall contributing to future risk
                    </div>
                  </div>

                  <strong>{forecast.dailyPrecipitation ?? 0} mm</strong>
                </div>

                <div className="weather-impact-item">
                  <div>
                    <div className="weather-impact-name">Humidity</div>

                    <div className="weather-impact-description">
                      Atmospheric moisture condition
                    </div>
                  </div>

                  <strong>{weather.humidity ?? "--"}%</strong>
                </div>

                <div className="weather-impact-item">
                  <div>
                    <div className="weather-impact-name">
                      Nearby Field Reports
                    </div>

                    <div className="weather-impact-description">
                      Citizen/field incidents within the risk area
                    </div>
                  </div>

                  <strong>{nearbyIncidentCount}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RECOMMENDATIONS */}

        {/* AI RECOMMENDED ACTIONS */}

        <div className="col-md-6">
          <div className="weather-section">
            <div className="weather-section-header">
              <h5 className="weather-section-title">AI Recommended Actions</h5>

              <p className="weather-section-subtitle">
                Recommendations generated from the current weather, risk and
                environmental assessment
              </p>
            </div>

            <div className="weather-section-body">
              <div className="weather-actions">
                {aiRecommendations.length > 0 ? (
                  aiRecommendations.slice(0, 5).map((recommendation, index) => (
                    <div className="weather-action" key={index}>
                      <span className="weather-action-icon">✓</span>

                      <p className="weather-action-text">
                        {typeof recommendation === "string"
                          ? recommendation
                          : recommendation.action ||
                            recommendation.recommendation ||
                            recommendation.text ||
                            "AI recommendation available."}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="weather-action">
                    <span className="weather-action-icon">ℹ</span>

                    <p className="weather-action-text">
                      AI recommendations are currently unavailable for this
                      monitoring location.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Weather;
