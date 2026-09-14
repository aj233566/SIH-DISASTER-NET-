import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import IncidentCard from "../components/IncidentCard";
import { getIncidents } from "../services/db";

import "../css/CitizenIncidents.css";

function CitizenIncidents() {
  const navigate = useNavigate();

  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    try {
      const savedIncidents = await getIncidents();

      const sortedIncidents = [...savedIncidents].sort((a, b) => {
        const dateA = new Date(a.createdAt || a.time || 0);
        const dateB = new Date(b.createdAt || b.time || 0);

        return dateB - dateA;
      });

      setIncidents(sortedIncidents);
    } catch (error) {
      console.error("Error loading citizen incidents:", error);
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = incidents.filter(
    (incident) =>
      incident.synced === false || incident.syncStatus === "Pending Sync",
  ).length;

  const syncedCount = incidents.filter(
    (incident) => incident.synced === true || incident.syncStatus === "Synced",
  ).length;

  const handleReportIncident = () => {
    navigate("/report-incident");
  };

  return (
    <main className="incidents-page">
      <div className="container py-4">
        {/* ==============================
            HEADER
        ============================== */}
        <div className="incidents-header row align-items-center">
          <div className="col-12 col-md-8">
            <button
              type="button"
              className="btn btn-outline-light mb-3"
              onClick={() => navigate("/dashboard")}
            >
              ← Back
            </button>
            <h1 className="incidents-title">My Reported Incidents</h1>

            <p className="incidents-subtitle">
              View the disaster incidents you have reported.
            </p>
          </div>

          <div className="col-12 col-md-4">
            <div className="incidents-header-action">
              <button
                type="button"
                className="incident-report-button"
                onClick={handleReportIncident}
              >
                + Report Incident
              </button>
            </div>
          </div>
        </div>

        {/* ==============================
            SUMMARY
        ============================== */}
        {!loading && (
          <div className="incidents-statistics row g-3">
            <div className="col-12 col-sm-6 col-lg-4">
              <div className="incident-stat-card">
                <p className="incident-stat-label">Total Reports</p>

                <p className="incident-stat-value">{incidents.length}</p>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-4">
              <div className="incident-stat-card">
                <p className="incident-stat-label">Pending Sync</p>

                <p className="incident-stat-value incident-stat-high">
                  {pendingCount}
                </p>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-4">
              <div className="incident-stat-card">
                <p className="incident-stat-label">Synced Reports</p>

                <p className="incident-stat-value incident-stat-response">
                  {syncedCount}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==============================
            LOADING
        ============================== */}
        {loading && (
          <div className="incidents-loading">
            <div className="incidents-spinner"></div>

            <p>Loading your incidents...</p>
          </div>
        )}

        {/* ==============================
            EMPTY STATE
        ============================== */}
        {!loading && incidents.length === 0 && (
          <div className="incident-table-card">
            <div className="incident-empty-state">
              <h2>No incidents reported</h2>

              <p>You have not reported any disaster incidents yet.</p>

              <button
                type="button"
                className="incident-report-button"
                onClick={handleReportIncident}
              >
                Report Your First Incident
              </button>
            </div>
          </div>
        )}

        {/* ==============================
            INCIDENT LIST
        ============================== */}
        {!loading && incidents.length > 0 && (
          <section className="citizen-incident-list">
            <div className="incident-table-header">
              <div>
                <h2 className="incident-table-title">Your Incidents</h2>

                <p className="incident-count">
                  {incidents.length} report
                  {incidents.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="row g-4">
              {incidents.map((incident) => (
                <div
                  className="col-12 col-md-6"
                  key={incident.id || incident._id}
                >
                  <IncidentCard incident={incident} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default CitizenIncidents;
