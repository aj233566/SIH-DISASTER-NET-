import React, { memo, useState, useCallback } from 'react';

/**
 * CitizenPanel — the full citizen-facing experience (public, action-first).
 *
 * This is NOT a slimmed authority view: it carries its own citizen-only
 * features — SOS/call, report an incident, locate me, I'm-safe/share,
 * one-tap directions, emergency helplines and safety tips — on top of the
 * danger / safe-route / nearest-shelter / nearest-hospital summary.
 *
 * Presentational: all data comes from selectCitizenFocus(); actions are
 * handed up to GisCommandCenter (which owns the shared map + backend).
 */
const INCIDENT_TYPES = [
  { value: 'landslide', label: 'Landslide' },
  { value: 'flash_flood', label: 'Flash flood' },
  { value: 'road_blockage', label: 'Road blocked' },
  { value: 'slope_crack', label: 'Slope crack' },
  { value: 'infrastructure_damage', label: 'Building / infra damage' }
];

const SAFETY_TIPS = [
  'Move to higher, stable ground — away from steep slopes and rivers.',
  'Do not cross flooded roads or bridges marked as blocked.',
  'Follow the highlighted safe route; avoid the red danger zone.',
  'Keep your phone charged; share your location with family.',
  'Carry ID, water and essential medicines to the shelter.'
];

const dirUrl = (loc) =>
  loc && typeof loc.lat === 'number'
    ? `https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`
    : null;

function CitizenPanel({ focus, onFocusLocation, onLocateMe, onReport, located = false }) {
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

  const [locating, setLocating] = useState(false);
  const [locateMsg, setLocateMsg] = useState(null);
  const [isSafe, setIsSafe] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportType, setReportType] = useState('landslide');
  const [reportDesc, setReportDesc] = useState('');
  const [reportStatus, setReportStatus] = useState('idle'); // idle | sending | done
  const [reportMsg, setReportMsg] = useState(null);
  const [tipsOpen, setTipsOpen] = useState(false);

  const flyTo = (pt, zoom) => {
    if (pt && typeof pt.lat === 'number' && onFocusLocation) onFocusLocation(pt.lat, pt.lng, zoom);
  };

  const handleLocate = useCallback(async () => {
    if (!onLocateMe) return;
    setLocating(true);
    setLocateMsg(null);
    const r = await onLocateMe();
    setLocating(false);
    if (!r || !r.ok) setLocateMsg(r && r.reason === 'unsupported' ? 'Location not supported on this device.' : 'Could not get your location — allow location access and retry.');
  }, [onLocateMe]);

  const handleShare = useCallback(async () => {
    setIsSafe(true);
    const text = "I'm safe. Sharing my location via CASCADE-NET.";
    const url = dangerPoint ? `https://www.google.com/maps?q=${dangerPoint.lat},${dangerPoint.lng}` : window.location.href;
    try {
      if (navigator.share) { await navigator.share({ title: 'CASCADE-NET', text, url }); return; }
      if (navigator.clipboard) { await navigator.clipboard.writeText(`${text} ${url}`); }
    } catch { /* user dismissed share sheet — fine */ }
  }, [dangerPoint]);

  const submitReport = useCallback(async (e) => {
    e.preventDefault();
    if (!reportDesc.trim() || !onReport) return;
    setReportStatus('sending');
    const r = await onReport({ type: reportType, description: reportDesc.trim() });
    setReportStatus('done');
    setReportMsg(r && r.synced ? 'Report sent to the response team.' : 'Report saved — it will sync when online.');
    setReportDesc('');
  }, [reportType, reportDesc, onReport]);

  return (
    <section className="gis-citizen-panel" aria-label="Citizen safety information">
      {/* 1. DANGER status — the single most important thing on screen */}
      <div className={`gis-cz-status gis-cz-status-${levelClass}`} role="status">
        <span className="gis-cz-status-icon" aria-hidden="true">⚠</span>
        <div className="gis-cz-status-text">
          <span className="gis-cz-status-level">{level === 'LOW' ? 'NO ACTIVE ALERT' : `DANGER · ${level}`}</span>
          <span className="gis-cz-status-msg">{warning || 'Stay alert and follow local advisories.'}</span>
        </div>
        {dangerPoint ? (
          <button type="button" className="gis-cz-locate" onClick={() => flyTo(dangerPoint, 14)}>SHOW DANGER</button>
        ) : null}
      </div>

      {/* 2. Emergency actions — big thumb-friendly grid (Bootstrap row/cols) */}
      <div>
        <span className="gis-cz-section-label">EMERGENCY ACTIONS</span>
        <div className="row row-cols-2 g-2">
          <div className="col">
            <a className="gis-cz-action gis-cz-action-sos w-100" href="tel:112">
              <span className="gis-cz-action-ico" aria-hidden="true">🆘</span>
              <span>CALL 112</span>
            </a>
          </div>
          <div className="col">
            <button type="button" className={`gis-cz-action w-100 ${reportOpen ? 'active' : ''}`} onClick={() => setReportOpen((v) => !v)}>
              <span className="gis-cz-action-ico" aria-hidden="true">📢</span>
              <span>REPORT</span>
            </button>
          </div>
          <div className="col">
            <button type="button" className={`gis-cz-action w-100 ${located ? 'active' : ''}`} onClick={handleLocate} disabled={locating}>
              <span className="gis-cz-action-ico" aria-hidden="true">📍</span>
              <span>{locating ? 'LOCATING…' : located ? 'LOCATED' : 'LOCATE ME'}</span>
            </button>
          </div>
          <div className="col">
            <button type="button" className={`gis-cz-action ${isSafe ? 'gis-cz-action-safe active' : ''} w-100`} onClick={handleShare}>
              <span className="gis-cz-action-ico" aria-hidden="true">{isSafe ? '✓' : '🛡'}</span>
              <span>{isSafe ? "I'M SAFE ✓" : "I'M SAFE"}</span>
            </button>
          </div>
        </div>
        {locateMsg ? <p className="gis-cz-note">{locateMsg}</p> : null}
      </div>

      {/* 2b. Report form (revealed by REPORT) */}
      {reportOpen ? (
        <form className="gis-cz-report" onSubmit={submitReport}>
          <span className="gis-cz-section-label">REPORT AN INCIDENT</span>
          <select className="gis-cz-input" value={reportType} onChange={(e) => setReportType(e.target.value)}>
            {INCIDENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <textarea
            className="gis-cz-input"
            rows={2}
            placeholder="What did you see? (e.g. debris across the road near…)"
            value={reportDesc}
            onChange={(e) => setReportDesc(e.target.value)}
          />
          <div className="d-flex align-items-center gap-2">
            <button type="submit" className="gis-cz-report-submit" disabled={reportStatus === 'sending' || !reportDesc.trim()}>
              {reportStatus === 'sending' ? 'Sending…' : 'Submit report'}
            </button>
            {located ? <span className="gis-cz-note m-0">Using your location</span> : <span className="gis-cz-note m-0">Tip: tap Locate me first</span>}
          </div>
          {reportMsg ? <p className="gis-cz-note gis-cz-ok m-0">{reportMsg}</p> : null}
        </form>
      ) : null}

      {/* 3. Go to safety — route / shelter / hospital, each with directions */}
      <div>
        <span className="gis-cz-section-label">GET TO SAFETY</span>
        <button type="button" className="gis-cz-card gis-cz-route" onClick={() => flyTo(primaryRoute && (primaryRoute.from || primaryRoute.to), 13)} disabled={!primaryRoute}>
          <span className="gis-cz-card-ico" aria-hidden="true">🛣️</span>
          <span className="gis-cz-card-body">
            <span className="gis-cz-card-title">SAFE ROUTE</span>
            <span className="gis-cz-card-sub">{primaryRoute ? (primaryRoute.name || 'Recommended evacuation corridor') : 'No open route right now'}</span>
          </span>
          {primaryRoute && primaryRoute.travelTimeEtaMin ? <span className="gis-cz-card-tag">{primaryRoute.travelTimeEtaMin} min</span> : null}
        </button>

        <div className="gis-cz-card-wrap">
          <button type="button" className="gis-cz-card gis-cz-shelter" onClick={() => flyTo(nearestShelter && nearestShelter.location, 15)} disabled={!nearestShelter}>
            <span className="gis-cz-card-ico" aria-hidden="true">🏠</span>
            <span className="gis-cz-card-body">
              <span className="gis-cz-card-title">FIND SHELTER</span>
              <span className="gis-cz-card-sub">{nearestShelter ? nearestShelter.name : 'None nearby'}</span>
            </span>
            {nearestShelter ? <span className="gis-cz-card-tag">{nearestShelter.distanceKm} km</span> : null}
          </button>
          {nearestShelter ? (
            <a className="gis-cz-dir" href={dirUrl(nearestShelter.location)} target="_blank" rel="noopener noreferrer" title="Directions in Google Maps">Directions ›</a>
          ) : null}
        </div>

        <div className="gis-cz-card-wrap">
          <button type="button" className="gis-cz-card gis-cz-hospital" onClick={() => flyTo(nearestHospital && nearestHospital.location, 15)} disabled={!nearestHospital}>
            <span className="gis-cz-card-ico" aria-hidden="true">➕</span>
            <span className="gis-cz-card-body">
              <span className="gis-cz-card-title">FIND HOSPITAL</span>
              <span className="gis-cz-card-sub">{nearestHospital ? nearestHospital.name : 'None nearby'}</span>
            </span>
            {nearestHospital ? <span className="gis-cz-card-tag">{nearestHospital.distanceKm} km</span> : null}
          </button>
          {nearestHospital ? (
            <a className="gis-cz-dir" href={dirUrl(nearestHospital.location)} target="_blank" rel="noopener noreferrer" title="Directions in Google Maps">Directions ›</a>
          ) : null}
        </div>
      </div>

      {/* 4. Emergency helplines — one-tap dial */}
      <div>
        <span className="gis-cz-section-label">EMERGENCY HELPLINES</span>
        <div className="d-flex flex-column gap-1">
          <a className="gis-cz-help" href="tel:112"><span>Emergency (all services)</span><strong>112</strong></a>
          <a className="gis-cz-help" href="tel:1078"><span>NDMA disaster helpline</span><strong>1078</strong></a>
          <a className="gis-cz-help" href="tel:108"><span>Ambulance</span><strong>108</strong></a>
        </div>
      </div>

      {/* 5. Safety tips — collapsible */}
      <div>
        <button type="button" className="gis-cz-tips-toggle" onClick={() => setTipsOpen((v) => !v)} aria-expanded={tipsOpen}>
          <span>{tipsOpen ? '▾' : '▸'} SAFETY TIPS</span>
        </button>
        {tipsOpen ? (
          <ul className="gis-cz-tips">
            {SAFETY_TIPS.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        ) : null}
      </div>

      <p className="gis-cz-foot">Follow official instructions. In an emergency call <strong>112</strong>.</p>
    </section>
  );
}

export default memo(CitizenPanel);
