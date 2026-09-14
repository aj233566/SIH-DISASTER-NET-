import { useEffect, useState } from "react";
import { analyzeRisk } from "../services/riskApi";

function CitizenRiskCard({
  latitude = 27.3389,
  longitude = 88.6065,
  locationName = "Sikkim",
  disasterType = "landslide",
}) {
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadRisk() {
      try {
        setLoading(true);
        setError("");

        const data = await analyzeRisk({
          latitude,
          longitude,
          name: locationName,
          disasterType,
        });

        if (!cancelled) {
          setRiskData(data);
        }
      } catch (err) {
        console.error("Citizen risk loading failed:", err);

        if (!cancelled) {
          setError(
            err.message || "Unable to load risk information"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadRisk();

    return () => {
      cancelled = true;
    };
  }, [
    latitude,
    longitude,
    locationName,
    disasterType,
  ]);

  const baselineScore =
    riskData?.risk?.score ?? null;

  const baselineLevel =
    riskData?.risk?.level ?? null;

  const aiScore =
    riskData?.aiAssessment?.aiScore ?? null;

  const aiLevel =
    riskData?.aiAssessment?.aiLevel ?? null;

  const confidence =
    riskData?.aiAssessment?.confidence ?? null;

  const incidentCount =
    riskData?.incidents?.count ?? 0;

  const majorContributors =
    riskData?.risk?.majorContributors ?? [];

  const recommendations =
    riskData?.recommendations ?? [];


  const getLevelClass = (level) => {
    switch (level) {
      case "CRITICAL":
        return "bg-danger";

      case "HIGH":
        return "bg-warning text-dark";

      case "MODERATE":
        return "bg-warning text-dark";

      case "LOW":
        return "bg-success";

      default:
        return "bg-secondary";
    }
  };


  if (loading) {
    return (
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h5 className="fw-bold">
            Local Disaster Risk
          </h5>

          <p className="text-muted mb-0">
            Loading current risk information...
          </p>
        </div>
      </div>
    );
  }


  if (error) {
    return (
      <div className="card shadow-sm border-0">
        <div className="card-body">

          <h5 className="fw-bold">
            Local Disaster Risk
          </h5>

          <div className="alert alert-secondary mb-0">
            {error}
          </div>

        </div>
      </div>
    );
  }


  return (
    <>
      {/* ============================================
          MAIN RISK CARD
      ============================================ */}

      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body">

          <div className="d-flex justify-content-between align-items-start">

            <div>
              <p className="text-muted small mb-1">
                LOCAL DISASTER RISK
              </p>

              <h3 className="fw-bold mb-1">
                {locationName}
              </h3>

              <p className="text-muted mb-0">
                {disasterType.charAt(0).toUpperCase() +
                  disasterType.slice(1)}{" "}
                risk assessment
              </p>
            </div>


            <span
              className={`badge ${getLevelClass(
                aiLevel || baselineLevel
              )}`}
            >
              {aiLevel || baselineLevel || "UNKNOWN"}
            </span>

          </div>


          <div className="row align-items-center mt-4">

            <div className="col-12 col-md-6">

              <div className="display-5 fw-bold">
                {aiScore ?? baselineScore ?? "--"}
                <span className="fs-5 text-muted">
                  /100
                </span>
              </div>

              <p className="text-muted mb-0">
                Current risk score
              </p>

            </div>


            <div className="col-12 col-md-6 mt-3 mt-md-0">

              {confidence !== null && (
                <div>

                  <div className="d-flex justify-content-between">

                    <span className="small text-muted">
                      AI confidence
                    </span>

                    <strong className="small">
                      {confidence}%
                    </strong>

                  </div>

                  <div
                    className="progress mt-2"
                    style={{ height: "8px" }}
                  >

                    <div
                      className="progress-bar"
                      style={{
                        width: `${confidence}%`,
                      }}
                    />

                  </div>

                </div>
              )}

            </div>

          </div>

        </div>

      </div>


      {/* ============================================
          QUICK STATS
      ============================================ */}

      <div className="row g-3 mb-4">

        <div className="col-12 col-sm-6">

          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <p className="text-muted small mb-1">
                Nearby Reports
              </p>

              <h3 className="fw-bold mb-1">
                {incidentCount}
              </h3>

              <span className="small text-muted">
                Citizen and authority reports
              </span>

            </div>

          </div>

        </div>


        <div className="col-12 col-sm-6">

          <div className="card shadow-sm border-0 h-100">

            <div className="card-body">

              <p className="text-muted small mb-1">
                Baseline Risk
              </p>

              <h3 className="fw-bold mb-1">
                {baselineScore ?? "--"}
                <span className="fs-6 text-muted">
                  /100
                </span>
              </h3>

              <span
                className={`badge ${getLevelClass(
                  baselineLevel
                )}`}
              >
                {baselineLevel || "UNKNOWN"}
              </span>

            </div>

          </div>

        </div>

      </div>


      {/* ============================================
          WHY THE RISK EXISTS
      ============================================ */}

      {majorContributors.length > 0 && (

        <div className="card shadow-sm border-0 mb-4">

          <div className="card-body">

            <h5 className="fw-bold mb-1">
              Why is my area at risk?
            </h5>

            <p className="text-muted small mb-3">
              Main factors affecting the current assessment
            </p>


            <div className="row g-3">

              {majorContributors
                .slice(0, 3)
                .map((factor) => (

                  <div
                    className="col-12"
                    key={factor.key}
                  >

                    <div className="border rounded p-3">

                      <div className="fw-semibold">
                        {factor.label}
                      </div>

                      <div className="small text-muted mt-1">
                        {factor.reason}
                      </div>

                    </div>

                  </div>

                ))}

            </div>

          </div>

        </div>

      )}


      {/* ============================================
          SAFETY RECOMMENDATIONS
      ============================================ */}

      {recommendations.length > 0 && (

        <div className="card shadow-sm border-0 mb-4">

          <div className="card-body">

            <h5 className="fw-bold mb-3">
              Safety Recommendations
            </h5>

            <ul className="mb-0">

              {recommendations
                .slice(0, 5)
                .map((recommendation, index) => (

                  <li
                    key={index}
                    className="mb-2"
                  >
                    {recommendation}
                  </li>

                ))}

            </ul>

          </div>

        </div>

      )}

    </>
  );
}

export default CitizenRiskCard;