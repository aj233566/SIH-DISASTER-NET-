import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge'

function IncidentCard({ incident }) {
  return (
    <div className="incident-card">

      <div className="incident-card-header">
        <h2>{incident.title}</h2>

        <StatusBadge
          status={incident.status}
          synced={incident.synced}
        />
      </div>

      <div className="severity">
        {incident.severity}
      </div>

      <p className="incident-description">
        {incident.description}
      </p>

      <div className="incident-info">
        <span>📍 {incident.location}</span>
        <span>🕒 {incident.time}</span>
      </div>

      <Link
        to={`/incidents/${incident.id}`}
        state={{ incident }}
        className="view-details-btn"
      >
        View Details
      </Link>

    </div>
  )
}

export default IncidentCard