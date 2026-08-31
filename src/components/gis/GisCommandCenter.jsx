import React, { useState, useEffect, useMemo } from 'react';
import MapView from './MapView';
import IncidentLayer from './layers/IncidentLayer';
import FacilityLayer from './layers/FacilityLayer';
import ResourceLayer from './layers/ResourceLayer';
import RoadStatusLayer from './layers/RoadStatusLayer';
import VillageLayer from './layers/VillageLayer';
import RiskZoneLayer from './layers/RiskZoneLayer';
import RiskHeatmapLayer from './layers/RiskHeatmapLayer';
import RouteLayer from './layers/RouteLayer';
import MapControls from './MapControls';
import MapLegend from './MapLegend';
import MapResetController from './MapResetController';
import TacticalTelemetryHUD from './TacticalTelemetryHUD';
import FloatingCommandDock from './FloatingCommandDock';
import { normalizeSimulatorDelta } from '../../services/gis/simulatorAdapter';
import { routingService } from '../../services/gis/routingService';
import { calculateRiskHeatmapNodes } from '../../utils/gis/riskHeatmapCalculator';
import { normalizeBackendIncidents } from '../../utils/gis/incidentNormalizer';
import {
  DEMO_META,
  DEMO_INCIDENTS,
  DEMO_VILLAGES,
  DEMO_HOSPITALS,
  DEMO_SHELTERS,
  DEMO_RESOURCES,
  DEMO_ROADS,
  DEMO_RISK_ZONES,
  DEMO_ROUTES,
  DEMO_SIMULATION_SCENARIOS
} from '../../data/gis/demoGisData';
import '../../styles/gis.css';

/**
 * ============================================================================
 * CASCADE-NET GIS COMMAND CENTER — TURN-KEY INTEGRATION MODULE
 * ============================================================================
 * 
 * LEAD & OWNERSHIP:
 * Sampad — GIS, Risk Heatmap & Road Connectivity Lead
 * 
 * PURPOSE & USAGE:
 * Self-contained, production-grade GIS Command Center component designed to be
 * mounted directly into Jeewansh's React dashboard or dedicated route view.
 * 
 * EXAMPLE USAGE:
 * ```jsx
 * import GisCommandCenter from './components/gis/GisCommandCenter';
 * 
 * export default function OperationsDashboard() {
 *   return (
 *     <div style={{ width: '100vw', height: '100vh' }}>
 *       <GisCommandCenter hudMode="tactical" />
 *     </div>
 *   );
 * }
 * ```
 * 
 * API PROVENANCE & DATA PRECEDENCE:
 * 1. Live Incidents: If `liveIncidents` prop is passed or fetched from `/api/incidents`,
 *    live backend data takes strict precedence (`SOURCE: LIVE API`).
 * 2. Fallback / Offline: If backend data is empty or unreachable, falls back to
 *    hardened NER Landslide demo fixtures (`SOURCE: SIMULATED TELEMETRY`).
 * 3. Unverified Backend APIs (/api/roads, /api/villages, /api/risk, /api/hospitals):
 *    Currently consume validated domain fixtures awaiting future backend routes.
 * ============================================================================
 */
export default function GisCommandCenter({
  liveIncidents = null,
  initialHudMode = 'tactical',
  initialMapStyle = 'tactical',
  onSelectFeature = null
}) {
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [simScenario, setSimScenario] = useState('BASELINE');
  const [hudMode, setHudMode] = useState(initialHudMode);
  const [mapStyle, setMapStyle] = useState(initialMapStyle);
  const [routes, setRoutes] = useState(DEMO_ROUTES);
  const [isLiveTraffic, setIsLiveTraffic] = useState(false);

  // Active Incident Data Source Normalization & Precedence
  const incidents = useMemo(() => {
    if (Array.isArray(liveIncidents) && liveIncidents.length > 0) {
      const normalized = normalizeBackendIncidents(liveIncidents);
      if (normalized.length > 0) return normalized;
    }
    return DEMO_INCIDENTS;
  }, [liveIncidents]);

  const isLiveApiData = Array.isArray(liveIncidents) && liveIncidents.length > 0;

  // Keyboard Shortcuts ('S' style cycle, 'H' HUD mode cycle, 'R' reset reticle)
  useEffect(() => {
    const mapStyles = ['standard', 'tactical', 'night', 'risk', 'analysis'];
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'h' || e.key === 'H') {
        setHudMode((prev) => {
          if (prev === 'tactical') return 'operator';
          if (prev === 'operator') return 'minimal';
          return 'tactical';
        });
      } else if (e.key === 's' || e.key === 'S') {
        setMapStyle((prev) => {
          const idx = mapStyles.indexOf(prev);
          return mapStyles[(idx + 1) % mapStyles.length];
        });
      } else if (e.key === 'r' || e.key === 'R') {
        setResetTrigger((prev) => prev + 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Baseline Map State
  const baselineState = {
    roads: DEMO_ROADS,
    villages: DEMO_VILLAGES,
    hospitals: DEMO_HOSPITALS,
    shelters: DEMO_SHELTERS,
    resources: DEMO_RESOURCES,
    riskZones: DEMO_RISK_ZONES,
    routes: DEMO_ROUTES
  };

  // Compute active map state through Simulator Adapter based on active scenario
  const activeMapState = simScenario !== 'BASELINE' && DEMO_SIMULATION_SCENARIOS[simScenario]
    ? normalizeSimulatorDelta(DEMO_SIMULATION_SCENARIOS[simScenario], baselineState)
    : baselineState;

  // Asynchronously compute live or fallback emergency routes
  useEffect(() => {
    let isMounted = true;
    async function evaluateRoutes() {
      try {
        const scenarioConfig = DEMO_SIMULATION_SCENARIOS[simScenario];
        const scenarioRoutes = (scenarioConfig && scenarioConfig.routes) ||
          (scenarioConfig && scenarioConfig.deltas && scenarioConfig.deltas.routes) ||
          DEMO_ROUTES;

        const evaluated = await routingService.getRoutes({
          roads: activeMapState.roads,
          riskZones: activeMapState.riskZones,
          incidents: incidents,
          candidateRoutes: scenarioRoutes
        });

        if (isMounted) {
          setRoutes(evaluated);
          setIsLiveTraffic(routingService.isLiveTomTom());
        }
      } catch (err) {
        console.warn("[GisCommandCenter] Emergency routing calculation failed:", err);
      }
    }
    evaluateRoutes();
    return () => { isMounted = false; };
  }, [simScenario, activeMapState.roads, incidents]);

  // Layer Visibility State (9 Independent Subsystems)
  const [layerVisibility, setLayerVisibility] = useState({
    incidents: true,
    villages: true,
    hospitals: true,
    shelters: true,
    resources: true,
    roads: true,
    riskZones: true,
    heatmap: true,
    routes: true
  });

  // Severity Filter ('ALL' | 'CRITICAL' | 'HIGH_PLUS')
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const handleToggleLayer = (layerKey) => {
    setLayerVisibility((prev) => ({
      ...prev,
      [layerKey]: !prev[layerKey]
    }));
  };

  const filteredIncidents = incidents.filter((inc) => {
    if (severityFilter === 'CRITICAL') return inc.severity === 'Critical';
    if (severityFilter === 'HIGH_PLUS') return inc.severity === 'Critical' || inc.severity === 'High';
    return true;
  });

  // Dynamic Multi-Factor Risk Heatmap Nodes (45% Risk Score + 30% Incident Density + 25% Rainfall Severity)
  const heatmapNodes = useMemo(() => {
    return calculateRiskHeatmapNodes(activeMapState.riskZones, filteredIncidents, { rainfall24hMm: 142 });
  }, [activeMapState.riskZones, filteredIncidents]);

  // Live HUD Telemetry & Derived Disaster Metrics
  const blockedRoadCount = activeMapState.roads.filter((r) => r.status === 'Blocked').length;
  const criticalIncidentCount = filteredIncidents.filter((i) => i.severity === 'Critical').length;
  const hospitalAccessBlocked = activeMapState.hospitals.some((h) => (h.roadAccess || '').toLowerCase() === 'blocked');
  const recommendedRoute = routes.find((r) => r.status === 'Recommended') || routes.find((r) => r.type === 'Primary') || routes[0];

  // Dynamic Isolated Mountain Villages Count (Only isolated when physical access road is BLOCKED)
  const isolatedVillagesCount = useMemo(() => {
    return (activeMapState.villages || []).filter((v) => {
      const road = (activeMapState.roads || []).find((r) => r.id === v.primaryAccessRoadId);
      if (!road) return v.connectivityStatus === 'Isolated';
      return (road.status || '').toUpperCase() === 'BLOCKED';
    }).length;
  }, [activeMapState.villages, activeMapState.roads]);

  // Max AI Landslide Risk Score across active operational zones
  const maxRiskScore = useMemo(() => {
    if (!activeMapState.riskZones || activeMapState.riskZones.length === 0) return 0;
    return Math.max(...activeMapState.riskZones.map((z) => z.riskScore || 0));
  }, [activeMapState.riskZones]);

  const handleSelect = (feature) => {
    setSelectedFeature(feature);
    if (onSelectFeature) onSelectFeature(feature);
  };

  return (
    <div className="gis-app-wrapper">
      {/* 1. Institutional Top Operational Header */}
      <header className="gis-header">
        <div className="gis-header-left">
          <span className="gis-eoc-tag">EOC-GIS</span>
          <div className="gis-header-title">
            <span className="gis-brand-name">CASCADE-NET</span>
            <span style={{ color: 'var(--text-muted)' }}>/</span>
            <span className="gis-sub-title">GIS COMMAND CENTER</span>
          </div>
        </div>

        <div className="gis-header-center">
          <div className="gis-status-badge">
            <span className="gis-status-dot warning-pulse" />
            <span className="gis-status-text">
              {simScenario === 'BASELINE' && 'BASELINE: NH-10 KM 32 BLOCKED • WESTERN RIDGE DETOUR (26 mins)'}
              {simScenario === 'TRAFFIC_SPIKE' && 'ALERT: EVACUATION SURGE • WESTERN RIDGE CONVOY (54 mins)'}
              {simScenario === 'CLEAR_RING_ROAD_R17' && 'RESTORED: NH-10 CLEARED BY BRO • ARTERIAL CORRIDOR OPEN (14 mins)'}
            </span>
          </div>
        </div>

        <div className="gis-header-right">
          <span className="gis-header-meta">SECTOR: <strong>{DEMO_META.sector}</strong></span>
          <span className="gis-header-divider">|</span>
          <span className="gis-header-meta">ROUTING: <strong style={{ color: isLiveTraffic ? 'var(--color-operational)' : 'var(--color-warning)' }}>{isLiveTraffic ? 'LIVE TOMTOM' : 'SIMULATED TRAFFIC'}</strong></span>
          <span className="gis-header-divider">|</span>
          <span className="gis-header-meta">STYLE: <strong>{mapStyle.toUpperCase()}</strong></span>
          <span className="gis-header-divider">|</span>
          <span className="gis-header-meta">MODE: <strong>{hudMode.toUpperCase()}</strong></span>
          <span className="gis-header-divider">|</span>
          <span className="gis-badge-operational">OPERATIONAL</span>
        </div>
      </header>

      {/* 2. Full-Screen Spatial Leaflet Canvas & Tactical UI Overlay */}
      <div className="gis-main-content">
        {/* Situation Telemetry HUD (Top-Left) */}
        <TacticalTelemetryHUD
          incidentCount={filteredIncidents.length}
          criticalCount={criticalIncidentCount}
          blockedRoadCount={blockedRoadCount}
          isolatedVillagesCount={isolatedVillagesCount}
          rainfall24h="158 mm"
          rainfallSeverity="EXTREME"
          maxRiskScore={maxRiskScore}
          heatmapSeverity="CRITICAL"
          hospitalAccessCount={hospitalAccessBlocked ? '1/2 RESTRICTED' : '2/2 OPEN'}
          activeResourcesCount={activeMapState.resources.length}
          hudMode={hudMode}
          weatherSource={isLiveApiData ? 'LIVE API' : 'SIMULATED WEATHER'}
        />

        {/* Operational Control Matrix (Top-Right) */}
        <MapControls
          layerVisibility={layerVisibility}
          onToggleLayer={handleToggleLayer}
          severityFilter={severityFilter}
          onSetSeverityFilter={setSeverityFilter}
          mapStyle={mapStyle}
          onSetMapStyle={setMapStyle}
          onResetView={() => setResetTrigger((prev) => prev + 1)}
          hudMode={hudMode}
        />

        {/* Tactical Legend (Bottom-Left) */}
        <MapLegend hudMode={hudMode} />

        {/* Floating Command Dock (Bottom Floating) */}
        <FloatingCommandDock
          mapStyle={mapStyle}
          onSetMapStyle={setMapStyle}
          simScenario={simScenario}
          onSetScenario={setSimScenario}
          hudMode={hudMode}
          onSetHudMode={setHudMode}
          onResetView={() => setResetTrigger((prev) => prev + 1)}
          activeCorridorName={recommendedRoute ? recommendedRoute.name : 'Western Ridge Alternate'}
          activeCorridorEta={recommendedRoute ? `${recommendedRoute.etaMinutes} mins` : '26 mins'}
          isLiveTraffic={isLiveTraffic}
        />

        <MapView>
          {/* Camera Reset and Theater Controller */}
          <MapResetController resetTrigger={resetTrigger} isSimActive={simScenario === 'CLEAR_RING_ROAD_R17'} />

          {/* 0.5 Multi-Factor Dynamic Risk Heatmap Layer (Subordinate Ground Gradient) */}
          <RiskHeatmapLayer nodes={heatmapNodes} visible={layerVisibility.heatmap} />

          {/* 1. Risk Zone Layer */}
          {layerVisibility.riskZones && (
            <RiskZoneLayer
              riskZones={activeMapState.riskZones}
              selectedZoneId={selectedFeature ? selectedFeature.id : null}
              onSelectZone={handleSelect}
            />
          )}

          {/* 1.5 Mountain Settlement & Village Layer */}
          {layerVisibility.villages && (
            <VillageLayer
              villages={activeMapState.villages}
              roads={activeMapState.roads}
              selectedVillageId={selectedFeature ? selectedFeature.id : null}
              onSelectVillage={handleSelect}
              hudMode={hudMode}
            />
          )}

          {/* 2. Road Status Layer */}
          {layerVisibility.roads && (
            <RoadStatusLayer
              roads={activeMapState.roads}
              selectedRoadId={selectedFeature ? selectedFeature.id : null}
              onSelectRoad={handleSelect}
              hudMode={hudMode}
            />
          )}

          {/* 3. Facility Layer */}
          <FacilityLayer
            hospitals={activeMapState.hospitals}
            shelters={activeMapState.shelters}
            selectedFeatureId={selectedFeature ? selectedFeature.id : null}
            onSelectFeature={handleSelect}
            visibleHospitals={layerVisibility.hospitals}
            visibleShelters={layerVisibility.shelters}
          />

          {/* 4. Incident Layer */}
          {layerVisibility.incidents && (
            <IncidentLayer
              incidents={filteredIncidents}
              selectedIncidentId={selectedFeature ? selectedFeature.id : null}
              onSelectIncident={handleSelect}
            />
          )}

          {/* 5. Resource Layer */}
          {layerVisibility.resources && (
            <ResourceLayer
              resources={activeMapState.resources}
              selectedResourceId={selectedFeature ? selectedFeature.id : null}
              onSelectResource={handleSelect}
            />
          )}

          {/* 6. Emergency Route Layer */}
          {layerVisibility.routes && (
            <RouteLayer
              routes={routes}
              selectedRouteId={selectedFeature ? selectedFeature.id : null}
              onSelectRoute={handleSelect}
            />
          )}
        </MapView>
      </div>
    </div>
  );
}
