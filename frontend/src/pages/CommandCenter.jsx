import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { analyzeRisk } from "../services/riskApi";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import IncidentTable from "../components/IncidentTable";
import WeatherCard from "../components/WeatherCard";
import EmergencyPanel from "../components/EmergencyPanel";
import RoadStatus from "../components/RoadStatus";

import GisCommandCenter from "../components/gis/GisCommandCenter";
import "../css/command_center.css";
function CommandCenter() {
  const navigate = useNavigate();
  const [roadData, setRoadData] = useState([]);
  const [riskData, setRiskData] = useState(null);
  const [riskLoading, setRiskLoading] = useState(true);
  const [riskError, setRiskError] = useState("");

  const storedUser = localStorage.getItem("user");
  useEffect(() => {
    let cancelled = false;

    async function loadRisk() {
      try {
        setRiskLoading(true);
        setRiskError("");

        const data = await analyzeRisk({
          latitude: 27.3389,
          longitude: 88.6065,
          name: "Sikkim",
          disasterType: "landslide",
        });

        if (!cancelled) {
          setRiskData(data);
        }
      } catch (error) {
        console.error("Risk analysis failed:", error);

        if (!cancelled) {
          setRiskError(error.message || "Unable to load risk intelligence");
        }
      } finally {
        if (!cancelled) {
          setRiskLoading(false);
        }
      }
    }

    loadRisk();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleRoadsChange = useCallback((roads) => {
    setRoadData(roads);
  }, []);

  const riskScore = riskData?.risk?.score ?? "--";

  const riskLevel = riskData?.risk?.level ?? "LOADING";

  const riskFactors = riskData?.risk?.factors ?? [];

  const incidentCount = riskData?.incidents?.count ?? 0;

  const fieldReports = riskData?.incidents?.fieldReports ?? {};

  const aiScore = riskData?.aiAssessment?.aiScore ?? null;

  const aiLevel = riskData?.aiAssessment?.aiLevel ?? null;

  const confidence = riskData?.aiAssessment?.confidence ?? null;

  const majorContributors = riskData?.risk?.majorContributors ?? [];

  const recommendations = riskData?.recommendations ?? [];
  let user = null;

  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    user = null;
  }

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", {
      replace: true,
    });
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="command-center-wrapper">
      {/* =================================================
          NAVBAR
      ================================================= */}

      <Navbar />

      {/* =================================================
          DASHBOARD BODY
      ================================================= */}

      <div className="d-flex">
        {/* =================================================
            SIDEBAR
        ================================================= */}

        <Sidebar />

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <main className="command-center-main flex-grow-1">
          <div className="container-fluid px-3 px-md-4 py-4">
            {/* =================================================
                HEADER
            ================================================= */}

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
              {/* Title */}

              <div>
                <p className="text-uppercase small fw-semibold mb-1">
                  CASCADE-NET
                </p>

                <h1 className="fw-bold mb-1">Authority Command Center</h1>

                <p className="text-muted mb-0">
                  Disaster monitoring and emergency response dashboard
                </p>
              </div>

              {/* User + Logout */}

              <div className="d-flex align-items-center gap-3">
                <div className="text-end">
                  <strong>{user?.name || "Authority"}</strong>

                  <div className="small text-muted">
                    {user?.designation || "Verified Authority"}
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>

            {/* =================================================
                RISK SUMMARY CARDS
            ================================================= */}

            <div className="row g-3 mb-4">
              {/* Current Risk Score */}
              <div className="col-12 col-sm-6 col-xl-3">
                <div className="card shadow-sm border-0 h-100">
                  <div className="card-body">
                    <p className="text-muted mb-1">Current Risk Score</p>

                    <h2 className="fw-bold mb-2">
                      {riskLoading ? "..." : `${riskScore}/100`}
                    </h2>

                    {riskError ? (
                      <span className="badge bg-secondary">UNAVAILABLE</span>
                    ) : (
                      <span
                        className={`badge ${
                          riskLevel === "CRITICAL"
                            ? "bg-danger"
                            : riskLevel === "HIGH"
                            ? "bg-warning text-dark"
                            : riskLevel === "MODERATE"
                            ? "bg-warning text-dark"
                            : "bg-success"
                        }`}
                      >
                        {riskLevel}
                      </span>
                    )}
                    <p className="text-muted mb-1">Rule-based assessment</p>
                  </div>
                </div>
              </div>

              {/* Vulnerable Zones */}

              <div className="col-12 col-sm-6 col-xl-3">
                <div className="card shadow-sm border-0 h-100">
                  <div className="card-body">
                    <p className="text-muted mb-1">Vulnerable Zones</p>

                    <h2 className="fw-bold mb-2">12</h2>

                    <span className="badge bg-warning text-dark">Moderate</span>
                  </div>
                </div>
              </div>

              {/* Active Incidents */}

              <div className="col-12 col-sm-6 col-xl-3">
                <div className="card shadow-sm border-0 h-100">
                  <div className="card-body">
                    <p className="text-muted mb-1">Active Incidents</p>
                    <h2 className="fw-bold mb-2">
                      {riskLoading
                        ? "..."
                        : String(incidentCount).padStart(1, "0")}
                    </h2>

                    <span
                      className={`badge ${
                        incidentCount > 0 ? "bg-danger" : "bg-success"
                      }`}
                    >
                      {incidentCount > 0
                        ? "Reports Detected"
                        : "No Nearby Reports"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-xl-3">
                <div className="card shadow-sm border-0 h-100">
                  <div className="card-body">
                    <p className="text-muted mb-1">AI Risk Assessment</p>

                    <h2 className="fw-bold mb-2">
                      {riskLoading
                        ? "..."
                        : aiScore !== null
                        ? `${aiScore}/100`
                        : "--"}
                    </h2>

                    <div className="d-flex gap-2 align-items-center">
                      <span
                        className={`badge ${
                          aiLevel === "CRITICAL"
                            ? "bg-danger"
                            : aiLevel === "HIGH"
                            ? "bg-warning text-dark"
                            : aiLevel === "MODERATE"
                            ? "bg-warning text-dark"
                            : "bg-success"
                        }`}
                      >
                        {aiLevel || "UNAVAILABLE"}
                      </span>

                      {confidence !== null && (
                        <span className="small text-muted">
                          {confidence}% confidence
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Road Connectivity */}

              <div className="col-12 col-xl-6">
                <RoadStatus roads={roadData} />
              </div>
            </div>

            {/* =================================================
    GIS COMMAND CENTER
================================================= */}

            <div className="mb-4">
              <GisCommandCenter
                role="authority"
                onRoadsChange={handleRoadsChange}
              />
            </div>
            {/* =================================================
                MAIN DASHBOARD
            ================================================= */}

            <div className="row g-4">
              {/* =================================================
                  INCIDENTS
              ================================================= */}

              {/* =================================================
                  WEATHER + EMERGENCY
              ================================================= */}

              <div className="col-12 col-xl-4">
                <div className="mb-4">
                  <WeatherCard />
                </div>
              </div>
            </div>

            {/* =================================================
                ROAD CONNECTIVITY
            ================================================= */}

            <div className="mt-4">
              <RoadStatus roads={roadData} />
            </div>

            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="text-center text-muted small mt-4 pt-3">
              <p className="mb-0">CASCADE-NET • Authority Command Center</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default CommandCenter;
