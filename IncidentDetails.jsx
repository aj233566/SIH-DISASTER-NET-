import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import StatusBadge from '../components/StatusBadge'

function IncidentDetails() {
  const location = useLocation()
  const incident = location.state?.incident

  const [status, setStatus] = useState(
    incident?.status || 'Submitted'
  )

  if (!incident) {
    return (
      <div className="container py-4">
        <Link to="/incidents" className="back-btn">
          ← Back to Incidents
        </Link>

        <h1 className="mt-4">Incident Not Found</h1>
        <p>No incident details are available.</p>
      </div>
    )
  }

  const statuses = [
    'Submitted',
    'Verified',
    'In Progress',
    'Resolved',
  ]

  const currentIndex = statuses.indexOf(status)

  const evidenceName =
    typeof incident.evidence === 'string'
      ? incident.evidence
      : incident.evidence?.name

  return (
    <div className="container py-4">

      <div className="details-header">
        <div>
          <Link to="/incidents" className="back-btn">
            ← Back to Incidents
          </Link>

          <h1 className="mt-3">{incident.title}</h1>
          <p>Incident Details</p>
        </div>

        <StatusBadge
          status={status}
          synced={incident.synced}
        />
      </div>

      {/* Incident Information */}

      <div className="incident-details-card">

        <div className="details-row">
          <strong>Incident Type</strong>
          <span>{incident.title}</span>
        </div>

        <div className="details-row">
          <strong>Severity</strong>
          <span>{incident.severity}</span>
        </div>

        <div className="details-row">
          <strong>Description</strong>
          <span>{incident.description}</span>
        </div>

        <div className="details-row">
          <strong>Location</strong>
          <span>
            📍 {incident.location || 'Location not provided'}
          </span>
        </div>

        {incident.latitude && incident.longitude && (
          <div className="details-row">
            <strong>Coordinates</strong>
            <span>
              {incident.latitude}, {incident.longitude}
            </span>
          </div>
        )}

        <div className="details-row">
          <strong>Reported</strong>
          <span>🕒 {incident.time}</span>
        </div>

        <div className="details-row">
          <strong>Evidence</strong>
          <span>
            {evidenceName || 'No evidence attached'}
          </span>
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
                index <= currentIndex ? 'completed' : ''
              }`}
            >
              <div className="lifecycle-circle">
                {index < currentIndex
                  ? '✓'
                  : index + 1}
              </div>

              <span>{item}</span>
            </div>
          ))}

        </div>

        <div className="status-controls">

          <label className="form-label">
            Update Incident Status
          </label>

          <select
            className="form-select"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
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
  )
}

export default IncidentDetails