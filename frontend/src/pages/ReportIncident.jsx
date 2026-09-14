import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveIncident, markIncidentAsSynced } from "../services/db";

import { submitIncident } from "../services/api";
import "../css/CitizenIncidents.css";

function ReportIncident() {
  const navigate = useNavigate();

  const [incidentType, setIncidentType] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [evidence, setEvidence] = useState(null);
  const [location, setLocation] = useState(null);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setMessage("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: new Date().toISOString(),
        });

        setMessage("Location captured successfully.");
      },
      () => {
        setMessage("Unable to get your location.");
      },
    );
  };

  const handleEvidenceChange = (event) => {
    const file = event.target.files?.[0] || null;

    setEvidence(file);

    if (file) {
      setMessage(`Evidence selected: ${file.name}`);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!incidentType || !description || !severity || !dateTime) {
      setMessage("Please fill all required fields.");
      return;
    }

    if (!evidence) {
      setMessage("Photo or video evidence is required before submitting.");
      return;
    }

    if (!location) {
      setMessage("Please capture your current location before submitting.");
      return;
    }

    setIsSubmitting(true);

    // ---------------------------------------
    // 1. Save incident locally
    // ---------------------------------------

    const newIncident = {
      id: Date.now(),

      title: incidentType,
      description,
      severity,

      location: `${location.latitude}, ${location.longitude}`,

      latitude: location.latitude,
      longitude: location.longitude,

      locationTimestamp: location.timestamp,

      time: dateTime,

      status: "Submitted",

      syncStatus: "Pending Sync",

      evidence: {
        name: evidence.name,
        type: evidence.type,
        size: evidence.size,
        file: evidence,
      },
    };

    try {
      // Always save locally first
      await saveIncident(newIncident);

      // ---------------------------------------
      // 2. Send to backend if online
      // ---------------------------------------

      if (navigator.onLine) {
        try {
          /*
           * IMPORTANT:
           * Use FormData because we are sending
           * both normal fields AND a file.
           */

          const formData = new FormData();

          // Incident information
          formData.append(
            "type",
            incidentType.toLowerCase().replace(/\s+/g, "_"),
          );

          formData.append("description", description.trim());

          formData.append("severity", severity.toLowerCase());

          // Location
          formData.append("latitude", String(location.latitude));

          formData.append("longitude", String(location.longitude));

          formData.append("address", "");

          // Incident status
          formData.append("status", "submitted");

          // Reporter
          const storedUser = localStorage.getItem("user");

          let currentUser = null;

          try {
            currentUser = storedUser ? JSON.parse(storedUser) : null;
          } catch {
            currentUser = null;
          }

          const reporterId =
            currentUser?._id ||
            currentUser?.id ||
            currentUser?.email ||
            "anonymous";

          formData.append("reportedBy", String(reporterId));

          /*
           * Date/time selected by citizen.
           *
           * This will only be stored if your backend
           * Incident schema/controller supports it.
           */
          formData.append("reportedAt", dateTime);

          // ---------------------------------------
          // 3. Add evidence file
          // ---------------------------------------

          if (evidence.type.startsWith("image/")) {
            formData.append("images", evidence);
          } else if (evidence.type.startsWith("video/")) {
            formData.append("videos", evidence);
          } else {
            throw new Error("Only image and video evidence is allowed.");
          }

          console.log("Sending incident with evidence...");

          const response = await submitIncident(formData);

          console.log("Incident submitted to backend:", response);

          // ---------------------------------------
          // 4. Mark local incident as synced
          // ---------------------------------------

          await markIncidentAsSynced(newIncident.id);

          setMessage("Incident and evidence submitted successfully.");
        } catch (apiError) {
          console.error("Backend sync failed:", apiError);

          setMessage(
            "Incident saved locally. It will sync when connection is available.",
          );
        }
      } else {
        setMessage(
          "Incident saved locally. It will sync when connection is available.",
        );
      }

      // ---------------------------------------
      // 5. Go to incident list
      // ---------------------------------------

      setTimeout(() => {
        navigate("/citizen/incidents");
      }, 1000);
    } catch (error) {
      console.error("Error saving incident:", error);

      setMessage("Unable to save incident. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="mb-4">
        <button
          type="button"
          className="btn btn-outline-light mb-3"
          onClick={() => navigate("/dashboard")}
        >
          ← Back
        </button>

        <h1>Report Incident</h1>

        <p>
          Report a disaster or emergency situation with location and evidence.
        </p>
      </div>
      <div className="card p-4">
        <h3 className="mb-4">Incident Information</h3>

        <form onSubmit={handleSubmit}>
          {/* Incident Type */}
          <div className="mb-3">
            <label className="form-label">Incident Type</label>

            <select
              className="form-select"
              value={incidentType}
              onChange={(event) => setIncidentType(event.target.value)}
              required
            >
              <option value="">Select incident type</option>

              <option value="Slope Crack">Slope Crack</option>

              <option value="Landslide">Landslide</option>

              <option value="Slope Movement">Slope Movement</option>

              <option value="Road Blockage">Road Blockage</option>

              <option value="Flash Flood">Flash Flood</option>

              <option value="Infrastructure Damage">
                Infrastructure Damage
              </option>
            </select>
          </div>

          {/* Description */}
          <div className="mb-3">
            <label className="form-label">Description</label>

            <textarea
              className="form-control"
              rows="4"
              placeholder="Describe what happened..."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
            />
          </div>

          {/* Severity */}
          <div className="mb-3">
            <label className="form-label">Severity</label>

            <select
              className="form-select"
              value={severity}
              onChange={(event) => setSeverity(event.target.value)}
              required
            >
              <option value="">Select severity</option>

              <option value="Low">Low</option>
              <option value="Moderate">Moderate</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          {/* Location */}
          <div className="mb-3">
            <label className="form-label">Location</label>

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
            <label className="form-label">Photo / Video Evidence</label>

            <input
              type="file"
              className="form-control"
              accept="image/*,video/*"
              onChange={handleEvidenceChange}
              required
            />

            {evidence && (
              <small className="text-success d-block mt-2">
                Evidence selected: {evidence.name}
                <br />
                Type: {evidence.type}
                <br />
                Size: {(evidence.size / 1024 / 1024).toFixed(2)} MB
              </small>
            )}
          </div>

          {/* Date & Time */}
          <div className="mb-4">
            <label className="form-label">Date & Time</label>

            <input
              type="datetime-local"
              className="form-control"
              value={dateTime}
              onChange={(event) => setDateTime(event.target.value)}
              required
            />
          </div>

          {/* Message */}
          {message && <div className="alert alert-info">{message}</div>}

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving Incident..." : "Submit Incident"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ReportIncident;
