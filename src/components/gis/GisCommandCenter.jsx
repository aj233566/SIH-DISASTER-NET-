import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
// Bootstrap 5 supplies the real responsive grid/flex utilities used
// throughout this module's JSX (row/col-*, d-flex, g-*, d-{bp}-*). It must
// be resolvable as a dependency by whatever app mounts GisCommandCenter
// (see cascade-gis/package.json for the local preview harness). Imported
// before gis.css so our tactical theme (equal-specificity class selectors,
// later in source order) wins the cascade without needing !important.
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/gis.css';

/**
 * ============================================================================
 * CASCADE-NET GIS COMMAND CENTER — TURN-KEY INTEGRATION MODULE
 * ============================================================================
 *
 * LEAD & OWNERSHIP:
 * Sampad — GIS, Risk Heatmap & Road Connectivity Lead
 *
 * PERFORMANCE & ARCHITECTURAL CONTRACT:
 * 1. Strict Reference Stability: baselineState and activeMapState are fully
 *    memoized with useMemo to prevent unneeded re-render cascades.
 * 2. Asynchronous Route Evaluation: Evaluates candidate evacuation routes
 *    only when the underlying road network or scenario topology changes.
 * 3. Pure Spatial Layers: Child Leaflet overlay layers are React.memo memoized
 *    to prevent expensive DOM and Leaflet SVG recreation cycles.
 * 4. Ultra-Compact Tactical UI: High visual map dominance (>88% viewport surface)
 *    with compact, instrument-like HUD overlays.
 * 5. Real Bootstrap 5 Grid: All structural layout (panel grids, dock sections,
 *    responsive show/hide) uses Bootstrap utility classes, not hand-rolled
 *    CSS grid/flex. gis.css only supplies color/border/type-scale plus the
 *    floating-panel positioning Bootstrap's utility API has no equivalent for.
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

  // 1. Stable Baseline Map State (Preserves referential identity)
  const baselineState = useMemo(() => ({
    roads: DEMO_ROADS,
    villages: DEMO_VILLAGES,
    hospitals: DEMO_HOSPITALS,
    shelters: DEMO_SHELTERS,
    resources: DEMO_RESOURCES,
    riskZones: DEMO_RISK_ZONES,
    routes: DEMO_ROUTES
  }), []);

  // 2. Stable Active Map State computed through Simulator Adapter
  const activeMapState = useMemo(() => {
    if (simScenario !== 'BASELINE' && DEMO_SIMULATION_SCENARIOS[simScenario]) {
      return normalizeSimulatorDelta(DEMO_SIMULATION_SCENARIOS[simScenario], baselineState);
    }
    return baselineState;
  }, [simScenario, baselineState]);

  // 3. Asynchronously compute emergency routes ONLY when topology actually changes
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
          setRoutes((prevRoutes) => {
            // Guard against redundant state updates and infinite render loops
            const prevIds = prevRoutes.map(r => `${r.id}:${r.status}:${r.travelTimeEtaMin || 0}`).join('|');
            const newIds = evaluated.map(r => `${r.id}:${r.status}:${r.travelTimeEtaMin || 0}`).join('|');
            if (prevIds === newIds) return prevRoutes;
            return evaluated;
          });
          setIsLiveTraffic(routingService.isLiveTomTom());
        }
      } catch (err) {
        console.warn("[GisCommandCenter] Emergency routing calculation failed:", err);
      }
    }
    evaluateRoutes();
    return () => { isMounted = false; };
  }, [simScenario, activeMapState, incidents]);

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

  const handleToggleLayer = useCallback((layerKey) => {
    setLayerVisibility((prev) => ({
      ...prev,
      [layerKey]: !prev[layerKey]
    }));
  }, []);

  const handleSetSeverityFilter = useCallback((filter) => {
    setSeverityFilter(filter);
  }, []);

  const handleSetMapStyle = useCallback((style) => {
    setMapStyle(style);
  }, []);

  const handleResetView = useCallback(() => {
    setResetTrigger((prev) => prev + 1);
  }, []);

  // Memoized Filtered Incidents to prevent recreating arrays on every render
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      if (severityFilter === 'CRITICAL') return inc.severity === 'Critical';
      if (severityFilter === 'HIGH_PLUS') return inc.severity === 'Critical' || inc.severity === 'High';
      return true;
    });
  }, [incidents, severityFilter]);

  // Dynamic Multi-Factor Risk Heatmap Nodes (45% Risk Score + 30% Incident Density + 25% Rainfall Severity)
  const heatmapNodes = useMemo(() => {
    return calculateRiskHeatmapNodes(activeMapState.riskZones, filteredIncidents, { rainfall24hMm: 142 });
  }, [activeMapState.riskZones, filteredIncidents]);

  // Live HUD Telemetry & Derived Disaster Metrics
  const blockedRoadCount = useMemo(() => {
    return activeMapState.roads.filter((r) => r.status === 'Blocked').length;
  }, [activeMapState.roads]);

  const criticalIncidentCount = useMemo(() => {
    return filteredIncidents.filter((i) => i.severity === 'Critical').length;
  }, [filteredIncidents]);

  const hospitalAccessBlocked = useMemo(() => {
    return activeMapState.hospitals.some((h) => (h.roadAccess || '').toLowerCase() === 'blocked');
  }, [activeMapState.hospitals]);

  const recommendedRoute = useMemo(() => {
    return routes.find((r) => r.status === 'Recommended') || routes.find((r) => r.type === 'Primary') || routes[0];
  }, [routes]);

  // Dynamic Isolated Mountain Villages Count
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

  // Peak 24h Rainfall across active operational risk zones
  const maxRainfall24h = useMemo(() => {
    if (!activeMapState.riskZones || activeMapState.riskZones.length === 0) return 0;
    return Math.max(...activeMapState.riskZones.map((z) => z.rainfall24hMm || 0));
  }, [activeMapState.riskZones]);

  const handleSelect = useCallback((feature) => {
    setSelectedFeature(feature);
    if (onSelectFeature) onSelectFeature(feature);
  }, [onSelectFeature]);

  return (
    <div className="gis-app-wrapper d-flex flex-column vh-100">
      {/* 1. Institutional Top Operational Header */}
      <header className="gis-header d-flex align-items-center justify-content-between gap-2 px-2 px-md-3">
        <div className="gis-header-left d-flex align-items-center gap-2">
          <span className="gis-eoc-tag">EOC-GIS</span>
          <div className="gis-header-title d-flex align-items-center gap-2">
            <span className="gis-brand-name">CASCADE-NET</span>
            <span className="d-none d-sm-inline" style={{ color: 'var(--text-muted)' }}>/</span>
            <span className="d-none d-sm-inline" style={{ color: 'var(--text-secondary)' }}>SIKKIM THEATER</span>
          </div>
        </div>

        {/* Tactical Status Pill */}
        <div className="gis-header-ticker d-flex align-items-center gap-2 d-none d-md-flex">
          <span className="gis-ticker-dot live-pulse" />
          <span className="gis-ticker-text">
            {simScenario === 'BASELINE' ? 'NH-10 Km 32 BLOCKED • SIKKIM EOC DEPLOYED' :
             simScenario === 'TRAFFIC_SPIKE' ? 'EVACUATION CONVOY SURGE • NH-10 DELAY +42m' :
             'NH-10 RESTORED • BRO CLEARANCE COMPLETE'}
          </span>
        </div>

        <div className="gis-header-meta d-flex align-items-center gap-2">
          <span className="gis-header-meta-extra d-none d-lg-inline">LAT 27.285°N LON 88.565°E</span>
          <span className="gis-header-meta-extra d-none d-lg-inline">•</span>
          <span className="gis-header-meta-extra d-none d-lg-inline">DATUM WGS-84</span>
          <span className="gis-header-meta-extra d-none d-lg-inline">•</span>
          <span className={isLiveApiData ? 'gis-meta-live' : 'gis-meta-sim'}>
            {isLiveApiData ? 'LIVE API' : 'SIMULATED DATA'}
          </span>
          <span className="gis-header-meta-extra d-none d-sm-inline">•</span>
          <span className="d-none d-sm-inline" style={{ color: 'var(--color-info)' }}>{hudMode.toUpperCase()}</span>
        </div>
      </header>

      {/* 2. Map Operating Canvas */}
      <main className={`gis-workspace flex-grow-1 position-relative gis-style-${mapStyle}`}>
        <MapView className="gis-dark-tiles">
          {/* Spatial Reset Controller */}
          <MapResetController resetTrigger={resetTrigger} isSimActive={simScenario !== 'BASELINE'} />

          {/* Dynamic Spatial Heatmap Layer (Z-Index Lowest) */}
          <RiskHeatmapLayer
            nodes={heatmapNodes}
            visible={layerVisibility.heatmap}
            onSelectNode={handleSelect}
          />

          {/* Landslide Risk Zones Layer */}
          <RiskZoneLayer
            riskZones={activeMapState.riskZones}
            visible={layerVisibility.riskZones}
            selectedRiskZoneId={selectedFeature && selectedFeature.id}
            onSelectRiskZone={handleSelect}
            hudMode={hudMode}
          />

          {/* Road Network & Mountain Connectivity Corridor Layer */}
          <RoadStatusLayer
            roads={activeMapState.roads}
            visible={layerVisibility.roads}
            selectedRoadId={selectedFeature && selectedFeature.id}
            onSelectRoad={handleSelect}
            hudMode={hudMode}
          />

          {/* Emergency Evacuation & Relief Logistics Routes */}
          <RouteLayer
            routes={routes}
            visible={layerVisibility.routes}
            selectedRouteId={selectedFeature && selectedFeature.id}
            onSelectRoute={handleSelect}
            hudMode={hudMode}
          />

          {/* Mountain Villages & Isolated Communities Layer */}
          <VillageLayer
            villages={activeMapState.villages}
            roads={activeMapState.roads}
            visible={layerVisibility.villages}
            selectedVillageId={selectedFeature && selectedFeature.id}
            onSelectVillage={handleSelect}
            hudMode={hudMode}
          />

          {/* Medical Facilities & Relief Shelters Layer */}
          <FacilityLayer
            hospitals={activeMapState.hospitals}
            shelters={activeMapState.shelters}
            visibleHospitals={layerVisibility.hospitals}
            visibleShelters={layerVisibility.shelters}
            selectedFacilityId={selectedFeature && selectedFeature.id}
            onSelectFacility={handleSelect}
            hudMode={hudMode}
          />

          {/* BRO Heavy Earthmovers & NDRF Rescue Resources Layer */}
          <ResourceLayer
            resources={activeMapState.resources}
            visible={layerVisibility.resources}
            selectedResourceId={selectedFeature && selectedFeature.id}
            onSelectResource={handleSelect}
            hudMode={hudMode}
          />

          {/* Active Disaster Incidents Layer */}
          <IncidentLayer
            incidents={filteredIncidents}
            visible={layerVisibility.incidents}
            selectedIncidentId={selectedFeature && selectedFeature.id}
            onSelectIncident={handleSelect}
            hudMode={hudMode}
          />
        </MapView>

        {/* 3. Left Situation Telemetry HUD (Compact Tactical Instrumentation) */}
        <TacticalTelemetryHUD
          incidentCount={filteredIncidents.length}
          criticalCount={criticalIncidentCount}
          blockedRoadCount={blockedRoadCount}
          isolatedVillagesCount={isolatedVillagesCount}
          rainfall24h={`${maxRainfall24h} mm`}
          rainfallSeverity="EXTREME"
          maxRiskScore={maxRiskScore}
          heatmapSeverity={maxRiskScore >= 80 ? 'CRITICAL' : 'HIGH'}
          hospitalAccessCount={hospitalAccessBlocked ? '1/2 RESTRICTED' : '2/2 CLEAR'}
          activeResourcesCount={activeMapState.resources ? activeMapState.resources.length : 3}
          hudMode={hudMode}
          weatherSource="SIMULATED WEATHER"
        />

        {/* 4. Right Tactical Control Matrix */}
        <MapControls
          layerVisibility={layerVisibility}
          onToggleLayer={handleToggleLayer}
          severityFilter={severityFilter}
          onSetSeverityFilter={handleSetSeverityFilter}
          mapStyle={mapStyle}
          onSetMapStyle={handleSetMapStyle}
          onResetView={handleResetView}
          hudMode={hudMode}
        />

        {/* 5. Bottom-Left Map Legend */}
        <MapLegend hudMode={hudMode} isSimActive={simScenario !== 'BASELINE'} />

        {/* 6. Floating Command Dock (Single Compact Row Island) */}
        <FloatingCommandDock
          mapStyle={mapStyle}
          onSetMapStyle={handleSetMapStyle}
          simScenario={simScenario}
          onSetScenario={setSimScenario}
          hudMode={hudMode}
          onSetHudMode={setHudMode}
          onResetView={handleResetView}
          activeCorridorName={recommendedRoute ? recommendedRoute.name : 'Western Ridge Alternate'}
          activeCorridorEta={recommendedRoute ? `${recommendedRoute.travelTimeEtaMin || 26} mins` : '26 mins'}
          isLiveTraffic={isLiveTraffic}
        />
      </main>
    </div>
  );
}
