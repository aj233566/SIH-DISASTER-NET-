import React, { useState, useEffect, useRef } from 'react';
import { fetchSachetAlerts } from '../../services/gis/liveFeeds';

/**
 * SachetAlertTicker — LIVE national disaster alerts from NDMA Sachet (the
 * official CAP portal: IMD / CWC / INCOIS / state agencies). Real feed, polled
 * every 3 minutes. Because the RSS carries no coordinates, alerts are shown as
 * a docked ticker (agency + hazard category + relative time) rather than on the
 * map. Collapses to a compact pill on small screens / non-tactical HUD modes.
 */
const CATEGORY_COLOR = {
  Met: 'var(--color-warning, #F59E0B)',
  Flood: 'var(--color-info, #22D3EE)',
  Geo: 'var(--color-critical, #EF4444)',
  Seismic: 'var(--color-critical, #EF4444)'
};

function relTime(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export default function SachetAlertTicker({ hudMode = 'tactical' }) {
  const isMobileInitial =
    typeof window !== 'undefined' ? window.innerWidth < 768 || window.innerHeight < 480 : false;
  const [isCollapsed, setIsCollapsed] = useState(hudMode !== 'tactical' || isMobileInitial);
  const [alerts, setAlerts] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ok | empty | error
  const timer = useRef(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const a = await fetchSachetAlerts();
      if (!alive) return;
      if (a.length) {
        setAlerts(a.slice(0, 40));
        setStatus('ok');
      } else {
        setStatus((s) => (s === 'ok' ? 'ok' : 'empty'));
      }
    };
    load();
    timer.current = setInterval(load, 180000); // every 3 min
    return () => {
      alive = false;
      clearInterval(timer.current);
    };
  }, []);

  useEffect(() => {
    if (hudMode === 'minimal' || hudMode === 'operator' || isMobileInitial) setIsCollapsed(true);
    if (hudMode === 'tactical' && !isMobileInitial) setIsCollapsed(false);
  }, [hudMode, isMobileInitial]);

  const count = alerts.length;

  return (
    <div className={`gis-sachet-overlay ${isCollapsed ? 'collapsed' : ''}`}>
      <div
        className="gis-panel-header d-flex align-items-center justify-content-between gap-2"
        onClick={() => setIsCollapsed(!isCollapsed)}
        role="button"
        tabIndex={0}
        aria-expanded={!isCollapsed}
      >
        <div className="gis-panel-title d-flex align-items-center gap-1">
          <span className="gis-sachet-live-dot" />
          <span>NDMA SACHET</span>
          {count > 0 && <span className="gis-sachet-count">{count}</span>}
        </div>
        <button
          className="gis-collapse-btn"
          aria-label={isCollapsed ? 'Expand alerts' : 'Collapse alerts'}
          onClick={(e) => {
            e.stopPropagation();
            setIsCollapsed(!isCollapsed);
          }}
        >
          {isCollapsed ? '+' : '−'}
        </button>
      </div>

      {!isCollapsed && (
        <div className="gis-sachet-body">
          <div className="gis-sachet-sub">LIVE NATIONAL ALERTS · CAP</div>
          {status === 'loading' && <div className="gis-sachet-msg">Fetching live feed…</div>}
          {status === 'empty' && (
            <div className="gis-sachet-msg">No active national alerts right now.</div>
          )}
          {status === 'error' && (
            <div className="gis-sachet-msg">Feed unavailable (needs backend proxy in prod).</div>
          )}
          <ul className="gis-sachet-list">
            {alerts.map((a) => (
              <li key={a.id} className="gis-sachet-item">
                <div className="gis-sachet-item-meta">
                  <span
                    className="gis-sachet-cat"
                    style={{ color: CATEGORY_COLOR[a.category] || 'var(--color-info, #22D3EE)' }}
                  >
                    {a.category}
                  </span>
                  <span className="gis-sachet-agency">{a.agency}</span>
                  <span className="gis-sachet-time">{relTime(a.time)}</span>
                </div>
                <div className="gis-sachet-text">{a.title}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
