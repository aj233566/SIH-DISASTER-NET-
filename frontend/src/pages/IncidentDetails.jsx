import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import StatusBadge from "../components/StatusBadge";
import "../css/IncidentDetails.css";
import { getEvidenceUrl } from "../services/api";
import { getIncidentById } from "../services/api";

function IncidentDetails() {
  const location = useLocation();
  const incident = location.state?.incident;

  const [status, setStatus] = useState(incident?.status || "Submitted");

  if (!incident) {
    return (
      <div className="container incident-details-page py-4">
        <Link to="/incidents" className="back-btn">
          ← Back to Incidents
        </Link>

        <h1 className="mt-4">Incident Not Found</h1>
        <p>No incident details are available.</p>
      </div>
    );
  }

  const statuses = ["Submitted", "Verified", "In Progress", "Resolved"];

  const currentIndex = statuses.indexOf(status);

  const images = Array.isArray(incident.images) ? incident.images : [];

  const videos = Array.isArray(incident.videos) ? incident.videos : [];

  const localEvidence =
    incident.evidence && typeof incident.evidence === "object"
      ? incident.evidence
      : null;

  return (
    <div className="container incident-details-page py-4">
      <div className="details-header">
        <div>
          <Link to="/incidents" className="back-btn">
            ← Back to Incidents
          </Link>

          <h1 className="mt-3">{incident.title}</h1>
          <p>Incident Details</p>
        </div>

        <StatusBadge status={status} synced={incident.synced} />
      </div>

      {/* Incident Information */}

      <div className="incident-details-card">
        <div className="details-row">
          <strong>Incident Type</strong>
          <span>
            {incident.type
              ? incident.type
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (char) => char.toUpperCase())
              : "Not provided"}
          </span>
        </div>

        <div className="details-row">
          <strong>Severity</strong>
          <span>{incident.severity}</span>
        </div>

        <div className="details-row">
          <strong>Description</strong>
          <span>{incident.description}</span>
        </div>

        {incident.location?.latitude != null &&
          incident.location?.longitude != null && (
            <div className="details-row">
              <strong>Coordinates</strong>
              <span>
                {incident.location.latitude}, {incident.location.longitude}
              </span>
            </div>
          )}

        <div className="details-row">
          <strong>Reported On</strong>

          <span>
            {incident.reportedAt
              ? new Date(incident.reportedAt).toLocaleString()
              : incident.createdAt
              ? new Date(incident.createdAt).toLocaleString()
              : incident.time || "Not available"}
          </span>
        </div>

        {/* <div className="details-row"> */}
        <div className="incident-details-card mt-4">
          <h3>Evidence</h3>

          {/* MongoDB / GridFS Images */}

          {images.length > 0 && (
            <div className="mt-3">
              <h5>Photos</h5>

              <div className="row g-3">
                {images.map((fileId, index) => (
                  <div className="col-12 col-md-6" key={fileId || index}>
                    <div className="evidence-item">
                      <img
                        src={getEvidenceUrl(fileId)}
                        alt={`Incident evidence ${index + 1}`}
                        className="img-fluid rounded"
                        style={{
                          width: "100%",
                          maxHeight: "500px",
                          objectFit: "contain",
                        }}
                      />

                      <small className="d-block mt-2">Photo {index + 1}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MongoDB / GridFS Videos */}

          {videos.length > 0 && (
            <div className="mt-4">
              <h5>Videos</h5>

              <div className="row g-3">
                {videos.map((fileId, index) => (
                  <div className="col-12" key={fileId || index}>
                    <div className="evidence-item">
                      <video
                        controls
                        preload="metadata"
                        className="w-100 rounded"
                        style={{
                          maxHeight: "600px",
                        }}
                      >
                        <source src={getEvidenceUrl(fileId)} />
                        Your browser does not support video playback.
                      </video>

                      <small className="d-block mt-2">Video {index + 1}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Existing local IndexedDB evidence */}

          {images.length === 0 && videos.length === 0 && localEvidence && (
            <div className="mt-3">
              <p>
                <strong>File:</strong> {localEvidence.name || "Local evidence"}
              </p>

              {localEvidence.file && localEvidence.type?.startsWith("image/") && (
                <img
                  src={URL.createObjectURL(localEvidence.file)}
                  alt="Incident evidence"
                  className="img-fluid rounded"
                  style={{
                    maxHeight: "500px",
                  }}
                />
              )}

              {localEvidence.file && localEvidence.type?.startsWith("video/") && (
                <video
                  controls
                  className="w-100 rounded"
                  style={{
                    maxHeight: "600px",
                  }}
                >
                  <source
                    src={URL.createObjectURL(localEvidence.file)}
                    type={localEvidence.type}
                  />
                  Your browser does not support video playback.
                </video>
              )}
            </div>
          )}

          {/* No evidence */}

          {images.length === 0 && videos.length === 0 && !localEvidence && (
            <p className="text-muted mt-3">No evidence attached.</p>
          )}
        </div>
      </div>

      {/* Incident Lifecycle */}

      <div className="incident-details-card mt-4">
        <h3>Incident Lifecycle</h3>

        <div className="lifecycle">
          {statuses.map((item, index) => (
            <div
              key={item}
              className={`lifecycle-step ${
                index <= currentIndex ? "completed" : ""
              }`}
            >
              <div className="lifecycle-circle">
                {index < currentIndex ? "✓" : index + 1}
              </div>

              <span>{item}</span>
            </div>
          ))}
        </div>

        <div className="status-controls">
          <label className="form-label">Update Incident Status</label>

          <select
            className="form-select"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            {statuses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

{
  /* </div> */
}

export default IncidentDetails;
