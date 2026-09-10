import React, { memo } from 'react';

/**
 * CitizenPanel — the entire chrome for Citizen GIS mode.
 *
 * Deliberately simple and action-first. A normal person should read it in
 * seconds: where is the danger, the safe route, the nearest shelter and
 * hospital, and what to do. It renders NONE of the authority command-center
 * instrumentation (no telemetry HUD, no layer matrix, no scenario controls).
 *
 * It is purely presentational — every value comes from selectCitizenFocus()
 * (computed once by GisCommandCenter off the same shared GIS data), and every
 * button just asks the parent to fly the shared Leaflet map to a location.
 */
function CitizenPanel({ focus, onFocusLocation }) {
  const {
    dangerPoint = null,
    dangerLevel = 'LOW',
    nearestShelter = null,
    nearestHospital = null,
    primaryRoute = null,
    warning = null
  } = focus || {};

  const level = String(dangerLevel || 'LOW').toUpperCase();
  const levelClass =
    level === 'CRITICAL' ? 'danger' :
    level === 'HIGH' ? 'high' :
    level === 'WARNING' || level === 'MODERATE' ? 'warning' : 'safe';

  const flyTo = (pt, zoom) => {
    if (pt && typeof pt.lat === 'number' && onFocusLocation) onFocusLocation(pt.lat, pt.lng, zoom);
  };

  return (
    <section className="gis-citizen-panel" aria-label="Citizen safety information">
      {/* 1. DANGER status — the single most important thing on screen */}
      <div className={`gis-cz-status gis-cz-status-${levelClass}`} role="status">
        <span className="gis-cz-status-icon" aria-hidden="true">⚠</span>
        <div className="gis-cz-status-text">
          <span className="gis-cz-status-level">{level === 'LOW' ? 'NO ACTIVE ALERT' : `DANGER · ${level}`}</span>
          <span className="gis-cz-status-msg">
            {warning || 'Stay alert and follow local advisories.'}
          </span>
        </div>
        {dangerPoint ? (
          <button type="button" className="gis-cz-locate" onClick={() => flyTo(dangerPoint, 14)}>
            SHOW DANGER
          </button>
        ) : null}
      </div>

      {/* 2. SAFE ROUTE */}
      <button
        type="button"
        className="gis-cz-card gis-cz-route"
        onClick={() => flyTo(primaryRoute && (primaryRoute.from || primaryRoute.to), 13)}
        disabled={!primaryRoute}
      >
        <span className="gis-cz-card-ico" aria-hidden="true">🛣️</span>
        <span className="gis-cz-card-body">
          <span className="gis-cz-card-title">SAFE ROUTE</span>
          <span className="gis-cz-card-sub">
            {primaryRoute ? (primaryRoute.name || 'Recommended evacuation corridor') : 'No open route right now'}
          </span>
        </span>
        {primaryRoute && primaryRoute.travelTimeEtaMin ? (
          <span className="gis-cz-card-tag">{primaryRoute.travelTimeEtaMin} min</span>
        ) : null}
      </button>

      {/* 3. NEAREST SHELTER */}
      <button
        type="button"
        className="gis-cz-card gis-cz-shelter"
        onClick={() => flyTo(nearestShelter && nearestShelter.location, 15)}
        disabled={!nearestShelter}
      >
        <span className="gis-cz-card-ico" aria-hidden="true">🏠</span>
        <span className="gis-cz-card-body">
          <span className="gis-cz-card-title">NEAREST SHELTER</span>
          <span className="gis-cz-card-sub">{nearestShelter ? nearestShelter.name : 'None nearby'}</span>
        </span>
        {nearestShelter ? <span className="gis-cz-card-tag">{nearestShelter.distanceKm} km</span> : null}
      </button>

      {/* 4. NEAREST HOSPITAL */}
      <button
        type="button"
        className="gis-cz-card gis-cz-hospital"
        onClick={() => flyTo(nearestHospital && nearestHospital.location, 15)}
        disabled={!nearestHospital}
      >
        <span className="gis-cz-card-ico" aria-hidden="true">➕</span>
        <span className="gis-cz-card-body">
          <span className="gis-cz-card-title">NEAREST HOSPITAL</span>
          <span className="gis-cz-card-sub">{nearestHospital ? nearestHospital.name : 'None nearby'}</span>
        </span>
        {nearestHospital ? <span className="gis-cz-card-tag">{nearestHospital.distanceKm} km</span> : null}
      </button>

      {/* 5. Standing advice */}
      <p className="gis-cz-foot">
        Follow official instructions. In an emergency call <strong>112</strong>.
      </p>
    </section>
  );
}

export default memo(CitizenPanel);
