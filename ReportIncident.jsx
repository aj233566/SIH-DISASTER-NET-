import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveIncident } from '../services/db'

function ReportIncident() {
  const navigate = useNavigate()

  const [incidentType, setIncidentType] = useState('')
  const [description, setDescription] = useState('')
  const [severity, setSeverity] = useState('')
  const [dateTime, setDateTime] = useState('')
  const [evidence, setEvidence] = useState(null)
  const [location, setLocation] = useState(null)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getLocation = () => {
    if (!navigator.geolocation) {
      setMessage('Geolocation is not supported by this browser.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: new Date().toISOString(),
        })

        setMessage('Location captured successfully.')
      },
      () => {
        setMessage('Unable to get your location.')
      }
    )
  }

  const handleEvidenceChange = (event) => {
    const file = event.target.files?.[0] || null
    setEvidence(file)

    if (file) {
      setMessage(`Evidence selected: ${file.name}`)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!incidentType || !description || !severity || !dateTime) {
      setMessage('Please fill all required fields.')
      return
    }

    setIsSubmitting(true)

    const newIncident = {
      id: Date.now(),

      title: incidentType,
      description,
      severity,

      location: location
        ? `${location.latitude}, ${location.longitude}`
        : 'Location not provided',

      latitude: location?.latitude || null,
      longitude: location?.longitude || null,

      locationTimestamp: location?.timestamp || null,

      time: dateTime,

      status: 'Submitted',

      syncStatus: 'Pending Sync',

      evidence: evidence
        ? {
            name: evidence.name,
            type: evidence.type,
            size: evidence.size,
            file: evidence,
          }
        : null,
    }

    try {
      await saveIncident(newIncident)

      setMessage('Incident saved successfully.')

      setTimeout(() => {
        navigate('/incidents')
      }, 800)
    } catch (error) {
      console.error('Error saving incident:', error)
      setMessage('Unable to save incident. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container py-4">

      <div className="mb-4">
        <h1>Report Incident</h1>

        <p>
          Report a disaster or emergency situation with location and evidence.
        </p>
      </div>

      <div className="card p-4">

        <h3 className="mb-4">
          Incident Information
        </h3>

        <form onSubmit={handleSubmit}>

          {/* Incident Type */}
          <div className="mb-3">
            <label className="form-label">
              Incident Type
            </label>

            <select
              className="form-select"
              value={incidentType}
              onChange={(event) =>
                setIncidentType(event.target.value)
              }
              required
            >
              <option value="">
                Select incident type
              </option>

              <option value="Slope Crack">
                Slope Crack
              </option>

              <option value="Landslide">
                Landslide
              </option>

              <option value="Slope Movement">
                Slope Movement
              </option>

              <option value="Road Blockage">
                Road Blockage
              </option>

              <option value="Flash Flood">
                Flash Flood
              </option>

              <option value="Infrastructure Damage">
                Infrastructure Damage
              </option>
            </select>
          </div>

          {/* Description */}
          <div className="mb-3">
            <label className="form-label">
              Description
            </label>

            <textarea
              className="form-control"
              rows="4"
              placeholder="Describe what happened..."
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              required
            />
          </div>

          {/* Severity */}
          <div className="mb-3">
            <label className="form-label">
              Severity
            </label>

            <select
              className="form-select"
              value={severity}
              onChange={(event) =>
                setSeverity(event.target.value)
              }
              required
            >
              <option value="">
                Select severity
              </option>

              <option value="Low">Low</option>
              <option value="Moderate">Moderate</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          {/* Location */}
          <div className="mb-3">
            <label className="form-label">
              Location
            </label>

            <button
              type="button"
              className="btn btn-outline-secondary w-100"
              onClick={getLocation}
            >
              📍 Use Current Location
            </button>

            {location && (
              <small className="text-success d-block mt-2">
                Location captured successfully.
                <br />
                Latitude: {location.latitude}
                <br />
                Longitude: {location.longitude}
              </small>
            )}
          </div>

          {/* Evidence */}
          <div className="mb-3">
            <label className="form-label">
              Photo / Video Evidence
            </label>

            <input
              type="file"
              className="form-control"
              accept="image/*,video/*"
              onChange={handleEvidenceChange}
            />

            {evidence && (
              <small className="text-success d-block mt-2">
                Evidence selected: {evidence.name}
              </small>
            )}
          </div>

          {/* Date & Time */}
          <div className="mb-4">
            <label className="form-label">
              Date & Time
            </label>

            <input
              type="datetime-local"
              className="form-control"
              value={dateTime}
              onChange={(event) =>
                setDateTime(event.target.value)
              }
              required
            />
          </div>

          {/* Message */}
          {message && (
            <div className="alert alert-info">
              {message}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Saving Incident...'
              : 'Submit Incident'}
          </button>

        </form>

      </div>

    </div>
  )
}

export default ReportIncident