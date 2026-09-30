import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import RoadStatus from "../components/RoadStatus";
import GisCommandCenter from "../components/gis/GisCommandCenter";
import { sentryApi } from "../services/sentryApi";
import "../css/command_center.css";

function CommandCenter() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [roads, setRoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const storedUser = localStorage.getItem("user");
  let user;
  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    user = null;
  }

  const load = useCallback(async () => {
    try {
      const [habitations, zones, priorities, incidents] = await Promise.all([
        sentryApi.getHabitations({ active: true }),
        sentryApi.getRedZones(),
        sentryApi.getRelocationPriorities(),
        sentryApi.getActiveIncidents(),
      ]);
      setData({
        habitations: habitations.data,
        zones: zones.data,
        priorities: priorities.data,
        incidents: incidents.data,
      });
    } catch (loadError) {
      setError(loadError.message || "Unable to load current SENTRY operational data.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { void load(); }, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const priorityById = useMemo(() => new Map(
    (data?.priorities || []).map((item) => [item.habitationId, item])
  ), [data]);
  const immediatePriorities = (data?.priorities || [])
    .filter((item) => item.priority === "IMMEDIATE");
  const capacityGap = immediatePriorities.length === 0
    ? 0
    : immediatePriorities.length === 1 && Number.isFinite(immediatePriorities[0].capacityGap)
      ? immediatePriorities[0].capacityGap
      : null;
  const activeHazards = [...new Set((data?.incidents || [])
    .map((incident) => incident.hazardSubtype || incident.type)
    .filter(Boolean))];
  const latestAssessment = (data?.habitations || [])
    .map((item) => item.risk?.assessedAt)
    .filter(Boolean)
    .sort((a, b) => new Date(b) - new Date(a))[0];
  const latestAssessmentText = latestAssessment
    ? new Date(latestAssessment).toLocaleString()
    : "No assessments recorded";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <div className="command-center-wrapper">
      <Navbar />
      <div className="d-flex">
        <Sidebar />
        <main className="command-center-main flex-grow-1">
          <div className="container-fluid px-3 px-md-4 py-4">
            <header className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
              <div>
                <p className="text-uppercase small fw-semibold mb-1">SENTRY · SIH26191</p>
                <h1 className="fw-bold mb-1">Decision Center</h1>
                <p className="text-muted mb-0">Explainable multi-hazard risk, habitation exposure, and relocation capacity.</p>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="text-end"><strong>{user?.name || "Authority"}</strong><div className="small text-muted">{user?.designation || "Verified Authority"}</div></div>
                <button type="button" className="btn btn-outline-danger" onClick={handleLogout}>Logout</button>
              </div>
            </header>

            {error ? <div className="alert alert-danger" role="alert">{error}<button type="button" className="btn btn-link" onClick={() => { setLoading(true); setError(""); load(); }}>Retry</button></div> : null}
            {loading ? <div className="alert alert-secondary" role="status">Loading operational data…</div> : null}

            <div className="row g-3 mb-4">
              <MetricCard label="Active incidents" value={data?.incidents.length} loading={loading} empty="No active incidents" />
              <MetricCard label="Red zones" value={data?.zones.filter((item) => item.risk?.level === "RED").length} loading={loading} empty="No red zones assessed" />
              <MetricCard label="Vulnerable habitations" value={data?.zones.length} loading={loading} empty="No current exposure assessments" />
              <MetricCard label="Immediate relocation" value={data?.priorities.filter((item) => item.priority === "IMMEDIATE").length} loading={loading} empty="No immediate cases" />
              <MetricCard label="Immediate capacity gap" value={data && capacityGap !== null ? capacityGap.toLocaleString() : undefined} loading={loading} empty="No immediate relocation demand" />
              <MetricCard label="Active hazards" value={data ? activeHazards.length : undefined} loading={loading} empty="No active hazard incidents" />
            </div>
            {!loading && immediatePriorities.length > 1 && capacityGap === null ? (
              <p className="small text-muted mb-4">
                A combined capacity gap is not calculated across multiple immediate habitations because candidate sites may be shared. Review each habitation's safe-site options before assigning capacity.
              </p>
            ) : null}

            <section className="card shadow-sm border-0 mb-4">
              <div className="card-body d-flex flex-column flex-md-row justify-content-between gap-3">
                <div>
                  <h2 className="h5">What changed</h2>
                  <p className="mb-1">{data ? `Latest habitation assessment: ${latestAssessmentText}.` : "Assessment data unavailable."}</p>
                  <p className="text-muted mb-0">{data && activeHazards.length ? `Hazard types represented in active incidents: ${activeHazards.join(", ")}.` : "No hazard types are currently reported in active incidents."}</p>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Link className="btn btn-outline-primary" to="/habitations">Habitations</Link>
                  <Link className="btn btn-outline-primary" to="/relocation-sites">Relocation sites</Link>
                </div>
              </div>
            </section>

            <section className="mb-4">
              <h2 className="h4 mb-3">SENTRY decision map</h2>
              <GisCommandCenter role="authority" onRoadsChange={setRoads} />
            </section>

            <section className="row g-4">
              <div className="col-12 col-xl-7">
                <div className="card shadow-sm border-0 h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h2 className="h5 mb-0">Priority habitations</h2>
                      <Link to="/habitations">View all</Link>
                    </div>
                    {loading ? <p role="status">Loading habitation priorities…</p> : null}
                    {!loading && !error && !data?.zones.length ? <p className="text-muted mb-0">No assessed habitations require red-zone review.</p> : null}
                    {!loading && data?.zones.slice(0, 6).map((habitation) => (
                      <div className="d-flex justify-content-between align-items-center border-bottom py-2" key={habitation._id}>
                        <div><Link to={`/habitations/${habitation._id}`}><strong>{habitation.name}</strong></Link><div className="small text-muted">{habitation.primaryHazard || "Hazard unavailable"} · {priorityById.get(habitation._id)?.priority || "Priority unavailable"}</div></div>
                        <span className="badge text-bg-danger">{habitation.risk?.level || "UNKNOWN"}{Number.isFinite(habitation.risk?.score) ? ` · ${habitation.risk.score}` : ""}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-12 col-xl-5">
                <RoadStatus roads={roads} />
              </div>
            </section>
            <p className="text-muted text-center small mt-4">Risk indices are deterministic decision-support outputs, not probabilities or official warnings.</p>
          </div>
        </main>
      </div>
    </div>
  );
}

function MetricCard({ label, value, loading, empty }) {
  return (
    <div className="col-12 col-sm-6 col-xl-4">
      <article className="card shadow-sm border-0 h-100">
        <div className="card-body">
          <p className="text-muted mb-1">{label}</p>
          <h2 className="fw-bold mb-1">{loading ? "…" : value ?? "Unavailable"}</h2>
          {!loading && value === 0 ? <span className="small text-muted">{empty}</span> : null}
        </div>
      </article>
    </div>
  );
}

export default CommandCenter;
