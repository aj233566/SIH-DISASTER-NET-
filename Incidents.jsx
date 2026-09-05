import { useEffect, useState } from 'react'
import IncidentCard from '../components/IncidentCard'
import { getIncidents } from '../services/db'

function Incidents() {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadIncidents()
  }, [])

  const loadIncidents = async () => {
    try {
      const savedIncidents = await getIncidents()
      setIncidents(savedIncidents.reverse())
    } catch (error) {
      console.error('Error loading incidents:', error)
    } finally {
      setLoading(false)
    }
  }

  const pendingCount = incidents.filter(
    (incident) => incident.synced === false
  ).length

  const syncedCount = incidents.filter(
    (incident) => incident.synced === true
  ).length

  return (
    <div className="container py-4">

      <div className="mb-4">
        <h1>Incident Management</h1>

        <p>
          View and manage reported disaster incidents.
        </p>
      </div>

      {!loading && incidents.length > 0 && (
        <div className="incident-summary">

          <div className="summary-item">
            <strong>{incidents.length}</strong>
            <span>Total Reports</span>
          </div>

          <div className="summary-item">
            <strong>{pendingCount}</strong>
            <span>Pending Sync</span>
          </div>

          <div className="summary-item">
            <strong>{syncedCount}</strong>
            <span>Synced</span>
          </div>

        </div>
      )}

      {loading ? (
        <p>Loading incidents...</p>
      ) : incidents.length === 0 ? (
        <div className="alert alert-info">
          No incidents have been reported yet.
        </div>
      ) : (
        <div className="row g-4">
          {incidents.map((incident) => (
            <div
              className="col-12 col-md-6"
              key={incident.id}
            >
              <IncidentCard incident={incident} />
            </div>
          ))}
        </div>
      )}

    </div>
  )
}

export default Incidents