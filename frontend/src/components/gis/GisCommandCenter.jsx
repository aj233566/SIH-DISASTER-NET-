import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useTransition,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";

import MapView from "./MapView";
import { sentryApi } from "../../services/sentryApi";
import DisasterZonesLayer from "./layers/DisasterZonesLayer";
import OpenFreeMapLayer from "./layers/OpenFreeMapLayer";
import IncidentLayer from "./layers/IncidentLayer";
import FacilityLayer from "./layers/FacilityLayer";
import IncidentResponseLayer from "./layers/IncidentResponseLayer";
import ResourceLayer from "./layers/ResourceLayer";
import RoadStatusLayer from "./layers/RoadStatusLayer";
import VillageLayer from "./layers/VillageLayer";
import RedZoneLayer from "./layers/RedZoneLayer";
import HabitationLayer from "./layers/HabitationLayer";
import RelocationSiteLayer from "./layers/RelocationSiteLayer";
import TargetedAlertLayer from "./layers/TargetedAlertLayer";
import RiskZoneLayer from "./layers/RiskZoneLayer";
import RiskHeatmapLayer from "./layers/RiskHeatmapLayer";
import RouteLayer from "./layers/RouteLayer";
import MapControls from "./MapControls";
import MapLegend from "./MapLegend";
import MapResetController from "./MapResetController";
import MapCoordinateTracker from "./MapCoordinateTracker";
import UserPointsLayer from "./UserPointsLayer";
import LiveQuakeLayer from "./layers/LiveQuakeLayer";
import LiveHospitalLayer from "./layers/LiveHospitalLayer";
import GibsFireLayer from "./layers/GibsFireLayer";
import BhuvanHazardLayer from "./layers/BhuvanHazardLayer";
import CitizenPanel from "./CitizenPanel";
import MyLocationMarker from "./MyLocationMarker";
import { fetchIndiaEarthquakes } from "../../services/gis/liveFeeds";
import { formatLatLon } from "../../utils/gis/formatCoords";
import {
  selectCitizenFocus,
} from "../../utils/gis/citizenView";

const USER_POINTS_STORAGE_KEY = "cascade-net.userPoints.v1";

const distanceKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
import TacticalTelemetryHUD from "./TacticalTelemetryHUD";
import { normalizeSimulatorDelta } from "../../services/gis/simulatorAdapter";
import { routingService } from "../../services/gis/routingService";
import { calculateRiskHeatmapNodes } from "../../utils/gis/riskHeatmapCalculator";
import { normalizeBackendIncidents } from "../../utils/gis/incidentNormalizer";
import {
  DEMO_INCIDENTS,
  DEMO_VILLAGES,
  DEMO_HOSPITALS,
  DEMO_SHELTERS,
  DEMO_RESOURCES,
  DEMO_ROADS,
  DEMO_RISK_ZONES,
  DEMO_ROUTES,
  DEMO_SIMULATION_SCENARIOS,
} from "../../data/gis/demoGisData";

import "bootstrap/dist/css/bootstrap.min.css";
import "../../css/gis.css";

export default function GisCommandCenter({
  liveIncidents = null,
  initialHudMode = "tactical",
  initialMapStyle = "map",
  onSelectFeature = null,
  onRoadsChange = null,
  role = "authority",
  citizenLocation = null,
}) {
  const navigate = useNavigate();
  const demoMode = import.meta.env.VITE_DEMO_MODE === "true";
  // Role-based composition: 'authority' is the full tactical command center
  // (unchanged); 'citizen' reuses the SAME map + layer components but shows
  // only high-value, actionable features with a simple action panel.
  const isCitizen = role === "citizen";
  const [selectedFeature, setSelectedFeature] = useState(null);
  const lastLatestIncidentId = useRef(null);
  const [resetTrigger, setResetTrigger] = useState(0);
  const simScenario = "BASELINE";
  const [hudMode, setHudMode] = useState(initialHudMode);
  const [mapStyle, setMapStyle] = useState(initialMapStyle);
  const [mapInstance, setMapInstance] = useState(null);
  const [backendIncidents, setBackendIncidents] = useState(null);
  const [habitations, setHabitations] = useState([]);
  const [redZones, setRedZones] = useState([]);
  const [relocationSites, setRelocationSites] = useState([]);
  const [targetedAlerts, setTargetedAlerts] = useState([]);
  const [targetedAlertsError, setTargetedAlertsError] = useState("");
  const [targetedAlertsLoading, setTargetedAlertsLoading] = useState(true);
  const [domainError, setDomainError] = useState("");
  const [domainLoading, setDomainLoading] = useState(true);
  const [liveWeather, setLiveWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState("");
  // Citizen "Locate me" — the citizen's own GPS position, once granted.
  const [userLocation, setUserLocation] = useState(citizenLocation);

  const [routes, setRoutes] = useState(demoMode ? DEMO_ROUTES : []);

  // Live map center telemetry (fed by MapCoordinateTracker).
  const [viewInfo, setViewInfo] = useState(null);

  const handleViewChange = useCallback((lat, lng, zoom) => {
    setViewInfo({ lat, lng, zoom });
  }, []);

  // 5-decimal display (~1 m precision) so the readouts are pasteable into
  // Google Maps / any WGS-84 tool. The href carries 6 decimals for an exact
  // pin. Same datum as Google Maps, so these are true real-world coordinates.
  const centerReadout = viewInfo
    ? formatLatLon(viewInfo.lat, viewInfo.lng, 5)
    : "—";
  const centerMapsHref = viewInfo
    ? `https://www.google.com/maps?q=${viewInfo.lat.toFixed(
        6,
      )},${viewInfo.lng.toFixed(6)}`
    : null;

  // ---- Operator annotation points (drop-a-pin) -------------------------
  // Persisted to localStorage so a controller's marked-up locations survive
  // a reload. Guarded so a private-mode / disabled-storage browser degrades
  // to in-memory rather than throwing.
  const [userPoints, setUserPoints] = useState(() => {
    try {
      const raw = localStorage.getItem(USER_POINTS_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [addPointMode, setAddPointMode] = useState(false);
  const [justAddedPointId, setJustAddedPointId] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(USER_POINTS_STORAGE_KEY, JSON.stringify(userPoints));
    } catch {
      /* storage unavailable — keep points in memory for this session */
    }
  }, [userPoints]);

  useEffect(() => {
    if (
      citizenLocation &&
      typeof citizenLocation.lat === "number" &&
      typeof citizenLocation.lng === "number"
    ) {
      const loc = {
        lat: citizenLocation.lat,
        lng: citizenLocation.lng,
      };

      const timer = setTimeout(() => {
        setUserLocation(loc);
        if (mapInstance) mapInstance.setView([loc.lat, loc.lng], 14, { animate: false });
      }, 0);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [citizenLocation, mapInstance]);
  const handleAddPoint = useCallback((lat, lng) => {
    const id = `up-${Date.now()}`;
    setUserPoints((prev) => [...prev, { id, lat, lng, name: "", notes: "" }]);
    setJustAddedPointId(id);
    setAddPointMode(false); // drop one, then edit; toggle again for the next
  }, []);

  const handleUpdatePoint = useCallback((id, data) => {
    setUserPoints((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data } : p)),
    );
  }, []);

  const handleDeletePoint = useCallback((id) => {
    setUserPoints((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const toggleAddPointMode = useCallback(() => setAddPointMode((m) => !m), []);

  // ============================================================
  // LIVE BACKEND INCIDENT FEED
  // Shared by Authority and Citizen GIS views.
  // ============================================================
  useEffect(() => {
    // If the parent explicitly supplies live incidents,
    // do not make another API request.
    if (Array.isArray(liveIncidents)) {
      return;
    }

    let cancelled = false;

    const loadIncidents = async () => {
      try {
        setDomainLoading(true);
        const [incidentResponse, habitationResponse, zoneResponse, siteResponse] = await Promise.all([
          sentryApi.getActiveIncidents(),
          sentryApi.getHabitations({ active: true }),
          sentryApi.getRedZones(),
          sentryApi.getRelocationSites(),
        ]);

        if (cancelled) return;

        setBackendIncidents(incidentResponse.data);
        setHabitations(habitationResponse.data);
        setRedZones(zoneResponse.data);
        setRelocationSites(siteResponse.data);
        setDomainError("");
      } catch (error) {
        if (!cancelled) {
          console.error("[GisCommandCenter] Failed to load live operational data:", error);
          setBackendIncidents([]);
          setHabitations([]);
          setRedZones([]);
          setRelocationSites([]);
          setDomainError(error.message || "Live map data is unavailable.");
        }
      } finally {
        if (!cancelled) setDomainLoading(false);
      }
    };

    loadIncidents();

    // Refresh operational layers every minute.
    const interval = setInterval(loadIncidents, 60 * 1000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [liveIncidents]);

  useEffect(() => {
    let cancelled = false;
    const loadAlerts = async () => {
      setTargetedAlertsLoading(true);
      try {
        const response = await sentryApi.getAlerts();
        if (!cancelled) {
          setTargetedAlerts(response.data);
          setTargetedAlertsError("");
        }
      } catch (error) {
        if (!cancelled) {
          setTargetedAlerts([]);
          setTargetedAlertsError(error.message || "Geo-targeted alerts are unavailable.");
        }
      } finally {
        if (!cancelled) setTargetedAlertsLoading(false);
      }
    };
    loadAlerts();
    const interval = setInterval(loadAlerts, 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!viewInfo || demoMode) return undefined;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setWeatherLoading(true);
      setLiveWeather(null);
      setWeatherError("");
      try {
        const result = await sentryApi.getCurrentWeather(viewInfo.lat, viewInfo.lng);
        if (!cancelled) {
          setLiveWeather(result.data);
          setWeatherError("");
        }
      } catch (error) {
        if (!cancelled) {
          setLiveWeather(null);
          setWeatherError(error.message || "Weather data is unavailable.");
        }
      } finally {
        if (!cancelled) setWeatherLoading(false);
      }
    }, 500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [demoMode, viewInfo]);

  // ---- Live nationwide data feed: USGS earthquakes (real, not demo) --------
  // This is an AUTHORITY-only overlay (citizen never shows quakes), so skip the
  // fetch entirely in citizen mode. And DEFER the first fetch by a couple of
  // seconds so it never competes for the connection with the initial map tiles
  // loading — that competition was part of the "map loads slow" feeling.
  const [liveQuakes, setLiveQuakes] = useState([]);
  useEffect(() => {
    if (isCitizen) return undefined;
    let alive = true;
    const load = async () => {
      const q = await fetchIndiaEarthquakes();
      if (alive) setLiveQuakes(q);
    };
    const first = setTimeout(load, 2500);
    const id = setInterval(load, 120000); // refresh every 2 min
    return () => {
      alive = false;
      clearTimeout(first);
      clearInterval(id);
    };
  }, [isCitizen]);

  // Clicking a saved point in the CONTROLS rail flies the map to it and opens
  // its popup. A monotonic nonce lets the same point be re-focused repeatedly.
  const [focusPoint, setFocusPoint] = useState({ id: null, nonce: 0 });
  const handleFocusPoint = useCallback((id) => {
    setJustAddedPointId(null);
    setFocusPoint((prev) => ({ id, nonce: prev.nonce + 1 }));
  }, []);

  // Active Incident Data Source Normalization & Precedence
  // ============================================================
  // INCIDENT DATA SOURCE
  // Priority:
  // 1. Explicit liveIncidents prop
  // 2. Backend GET /api/incidents
  // 3. Demo data only while backend data is still loading
  // ============================================================
  const incidentSource = Array.isArray(liveIncidents)
    ? liveIncidents
    : backendIncidents;

  const incidents = useMemo(() => {
    // Backend/parent data has been loaded.
    if (Array.isArray(incidentSource)) {
      return normalizeBackendIncidents(incidentSource);
    }

    // Only use demo incidents while the real API is loading.
    return demoMode ? DEMO_INCIDENTS : [];
  }, [demoMode, incidentSource]);

  const isLiveApiData = Array.isArray(incidentSource);

  // Keyboard Shortcuts ('S' style cycle, 'H' HUD mode cycle, 'R' reset reticle)
  useEffect(() => {
    const mapStyles = ["map", "satellite", "terrain", "dark"];
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
        return;
      if (e.key === "h" || e.key === "H") {
        setHudMode((prev) => {
          if (prev === "tactical") return "operator";
          if (prev === "operator") return "minimal";
          return "tactical";
        });
      } else if (e.key === "s" || e.key === "S") {
        setMapStyle((prev) => {
          const idx = mapStyles.indexOf(prev);
          return mapStyles[(idx + 1) % mapStyles.length];
        });
      } else if (e.key === "r" || e.key === "R") {
        setResetTrigger((prev) => prev + 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 1. Stable Baseline Map State (Preserves referential identity)
  const baselineState = useMemo(
    () => ({
      roads: demoMode ? DEMO_ROADS : [],
      villages: demoMode ? DEMO_VILLAGES : [],
      hospitals: demoMode ? DEMO_HOSPITALS : [],
      shelters: demoMode ? DEMO_SHELTERS : [],
      resources: demoMode ? DEMO_RESOURCES : [],
      riskZones: demoMode ? DEMO_RISK_ZONES : [],
      routes: demoMode ? DEMO_ROUTES : [],
    }),
    [demoMode],
  );

  // 2. Stable Active Map State computed through Simulator Adapter
  const activeMapState = useMemo(() => {
    if (demoMode && simScenario !== "BASELINE" && DEMO_SIMULATION_SCENARIOS[simScenario]) {
      return normalizeSimulatorDelta(
        DEMO_SIMULATION_SCENARIOS[simScenario],
        baselineState,
      );
    }
    return baselineState;
  }, [demoMode, simScenario, baselineState]);

  useEffect(() => {
    if (typeof onRoadsChange === "function") {
      onRoadsChange(activeMapState.roads || []);
    }
  }, [activeMapState.roads, onRoadsChange]);

  // 3. Asynchronously compute emergency routes ONLY when topology actually changes
  useEffect(() => {
    let isMounted = true;
    async function evaluateRoutes() {
      try {
        const scenarioConfig = DEMO_SIMULATION_SCENARIOS[simScenario];
        const scenarioRoutes =
          demoMode
            ? (scenarioConfig && scenarioConfig.routes) ||
              (scenarioConfig &&
                scenarioConfig.deltas &&
                scenarioConfig.deltas.routes) ||
              DEMO_ROUTES
            : [];

        const routeIncidents = isCitizen
          ? incidents.filter(
              (incident) =>
                !userLocation ||
                (typeof incident?.location?.lat === "number" &&
                  typeof incident?.location?.lng === "number" &&
                  distanceKm(
                    userLocation.lat,
                    userLocation.lng,
                    incident.location.lat,
                    incident.location.lng,
                  ) <= 100),
            )
          : incidents;

        const evaluated = demoMode
          ? await routingService.getRoutes({
              roads: activeMapState.roads,
              riskZones: activeMapState.riskZones,
              incidents: routeIncidents,
              candidateRoutes: scenarioRoutes,
            })
          : [];

        if (isMounted) {
          setRoutes((prevRoutes) => {
            // Guard against redundant state updates and infinite render loops
            const prevIds = prevRoutes
              .map((r) => `${r.id}:${r.status}:${r.travelTimeEtaMin || 0}`)
              .join("|");
            const newIds = evaluated
              .map((r) => `${r.id}:${r.status}:${r.travelTimeEtaMin || 0}`)
              .join("|");
            if (prevIds === newIds) return prevRoutes;
            return evaluated;
          });
        }
      } catch (err) {
        console.warn(
          "[GisCommandCenter] Emergency routing calculation failed:",
          err,
        );
      }
    }
    evaluateRoutes();
    return () => {
      isMounted = false;
    };
  }, [demoMode, simScenario, activeMapState, incidents, isCitizen, userLocation]);

  useEffect(() => {
    if (!Array.isArray(incidents) || incidents.length === 0) {
      return;
    }

    const latestIncident = incidents[0];

    if (!latestIncident?.id) {
      return;
    }
    let timer = null;

    // First load: automatically select the newest live incident.
    if (lastLatestIncidentId.current === null) {
      lastLatestIncidentId.current = latestIncident.id;

      if (isLiveApiData) {
        timer = setTimeout(() => setSelectedFeature(latestIncident), 0);
      }
    } else if (isLiveApiData && latestIncident.id !== lastLatestIncidentId.current) {
      // A new incident has appeared since the previous refresh.
      lastLatestIncidentId.current = latestIncident.id;
      timer = setTimeout(() => setSelectedFeature(latestIncident), 0);
    }
    return () => { if (timer) clearTimeout(timer); };
  }, [incidents, isLiveApiData]);
  // Layer Visibility State (role-dependent defaults). Authority shows the full
  // operational stack; citizen starts with only the actionable subset
  // (danger zones, critical incidents, safe route, shelters, hospitals) and
  // hides everything else so the view is never overwhelming.
  const [layerVisibility, setLayerVisibility] = useState(() =>
    isCitizen
      ? {
          incidents: true,
          villages: demoMode,
          hospitals: demoMode,
          shelters: demoMode,
          resources: false,
          roads: demoMode,
          riskZones: demoMode,
          redZones: true,
          alerts: true,
          habitations: true,
          relocationSites: true,
          heatmap: false,
          routes: true,
          quakes: false,
          zones: false, // hide nationwide disaster rings
          liveMed: false,
          fires: false,
          bhuvan: false,
          ofm: false,
        }
      : {
          incidents: true,
          villages: demoMode,
          hospitals: demoMode,
          shelters: demoMode,
          resources: demoMode,
          roads: demoMode,
          riskZones: demoMode,
          redZones: true,
          alerts: true,
          habitations: true,
          relocationSites: true,
          heatmap: demoMode,
          routes: demoMode,
          quakes: true,
          liveMed: false, // OSM Overpass real hospitals — off by default (extra network)
          fires: false, // NASA GIBS active-fire / thermal-anomaly overlay
          bhuvan: false, // ISRO Bhuvan WMS overlay
          ofm: false, // OpenFreeMap streamed detailed vector basemap (free, keyless)
        },
  );

  // Severity Filter ('ALL' | 'CRITICAL' | 'HIGH_PLUS')
  const [severityFilter, setSeverityFilter] = useState("ALL");

  /* Layer toggles, severity filter, map style and scenario switches each
     drive a full re-evaluation of every visible GIS layer (filtered
     incidents, heatmap nodes, road/route rendering all recompute off
     these). Individually that's fine — isolated stress tests measured
     0 long tasks for layer-toggle-only, style-switch-only, and
     scenario-switch-only. It's only the REALISTIC case this feedback
     describes — rapid pan/zoom while also toggling layers, switching
     styles and scenarios in quick succession — where those renders can
     stack up inside one long task (measured up to ~545ms combined).
     startTransition marks these as non-urgent: React keeps the map's
     own pan/zoom interaction responsive and lets these catch up after,
     instead of forcing every layer to re-render synchronously inside
     whatever event happened to trigger it. */
  const [, startTransition] = useTransition();

  const handleToggleLayer = useCallback((layerKey) => {
    startTransition(() => {
      setLayerVisibility((prev) => ({
        ...prev,
        [layerKey]: !prev[layerKey],
      }));
    });
  }, []);

  const handleSetSeverityFilter = useCallback((filter) => {
    startTransition(() => {
      setSeverityFilter(filter);
    });
  }, []);

  const handleSetMapStyle = useCallback((style) => {
    startTransition(() => {
      setMapStyle(style);
    });
  }, []);

  const handleResetView = useCallback(() => {
    setResetTrigger((prev) => prev + 1);
  }, []);

  // Citizen action panel → fly the SHARED map to a shelter/hospital/danger.
  const handleCitizenFocusLocation = useCallback(
    (lat, lng, zoom = 14) => {
      if (mapInstance && typeof lat === "number" && typeof lng === "number") {
        mapInstance.setView([lat, lng], zoom, { animate: true });
      }
    },
    [mapInstance],
  );

  // Citizen "Locate me" — browser geolocation.
  // A valid GPS fix is always accepted. The Sikkim demo location is used only
  // when the citizen has not shared a location or geolocation is unavailable.
  const handleLocateMe = useCallback(
    () =>
      new Promise((resolve) => {
        if (!("geolocation" in navigator)) {
          resolve({ ok: false, reason: "unsupported" });
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const loc = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            };

            setUserLocation(loc);

            if (mapInstance) {
              mapInstance.setView([loc.lat, loc.lng], 14, { animate: true });
            }

            resolve({
              ok: true,
              mode: "local",
              loc,
            });
          },
          (err) =>
            resolve({
              ok: false,
              reason: err.message || "denied",
            }),
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000,
          },
        );
      }),
    [mapInstance],
  );

  // The full incident workflow requires evidence, so route quick reports into
  // the existing evidence-backed form instead of claiming a false API success.
  const handleCitizenReport = useCallback(
    async ({ type, hazardSubtype, description } = {}) => {
      navigate("/report-incident", {
        state: {
          location: userLocation
            ? { latitude: userLocation.lat, longitude: userLocation.lng }
            : null,
          incidentType: type || "",
          hazardSubtype: hazardSubtype || "",
          description: description || "",
        },
      });
      return { ok: true, navigating: true };
    },
    [navigate, userLocation],
  );

  // Memoized Filtered Incidents to prevent recreating arrays on every render
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      if (severityFilter === "CRITICAL") return inc.severity === "Critical";
      if (severityFilter === "HIGH_PLUS")
        return inc.severity === "Critical" || inc.severity === "High";
      return true;
    });
  }, [incidents, severityFilter]);

  // ---- Citizen-mode curated subsets & focus (computed from the SAME data) ----
  // Only the high-value, actionable features reach the citizen map.
  // All active incidents reach the citizen map now (not just Critical/High) so
  // every nearby disaster type is visible — including weak-infrastructure and
  // slope-crack hazards. Severity colouring keeps the hierarchy (landslide /
  // critical loud; operational muted = the "secondary visual treatment").
  // ---- Citizen-mode curated subsets & focus ----
  // Citizens see active incidents only. When a real GPS location is available,
  // restrict live incidents to 100 km around the citizen so the map does not
  // show unrelated incidents from other parts of India.
  const citizenIncidents = useMemo(() => {
    const active = filteredIncidents.filter(
      (incident) => String(incident.status || "").toLowerCase() !== "resolved",
    );

    if (!userLocation) {
      // Demo mode: keep the complete Sikkim scenario.
      return active;
    }

    return active.filter((incident) => {
      const lat = incident?.location?.lat;
      const lng = incident?.location?.lng;

      if (typeof lat !== "number" || typeof lng !== "number") {
        return false;
      }

      return distanceKm(userLocation.lat, userLocation.lng, lat, lng) <= 100;
    });
  }, [filteredIncidents, userLocation]);

  const citizenRiskZones = useMemo(
    () =>
      (activeMapState.riskZones || []).filter(
        (z) => z.riskLevel === "Critical" || z.riskLevel === "High",
      ),
    [activeMapState.riskZones],
  );
  // Curated road status for the citizen map — only the blocked / restricted
  // corridors they must avoid or approach with caution (never the full network).
  const citizenRoads = useMemo(
    () =>
      (activeMapState.roads || []).filter((r) => {
        const s = String(r.status || "").toLowerCase();
        return s === "blocked" || s === "restricted" || s === "one-lane";
      }),
    [activeMapState.roads],
  );
  // Curated villages for the citizen map — only the vulnerable / affected ones
  // (at-risk or cut-off), so citizens see threatened settlements without the
  // full operational settlement layer.
  const citizenVillages = useMemo(
    () =>
      (activeMapState.villages || []).filter((v) => {
        const lvl = String(v.riskLevel || "").toLowerCase();
        const conn = String(v.connectivityStatus || "").toLowerCase();
        return (
          lvl === "critical" ||
          lvl === "high" ||
          conn === "isolated" ||
          conn === "restricted"
        );
      }),
    [activeMapState.villages],
  );
  // Nearest-to-danger selection powering the CitizenPanel (see citizenView.js).
  // When the citizen has shared their location, nearest facilities are measured
  // from THERE instead of from the danger point.
  const citizenFocus = useMemo(
    () => {
      const liveRiskZones = redZones.map((habitation) => {
        const [longitude, latitude] = habitation.location?.coordinates || [];
        const level = habitation.risk?.level;
        return {
          id: habitation._id,
          name: habitation.name,
          riskScore: habitation.risk?.score,
          riskLevel: {
            RED: "CRITICAL",
            ORANGE: "HIGH",
            YELLOW: "WARNING",
          }[level] || "UNKNOWN",
          center: Number.isFinite(latitude) && Number.isFinite(longitude)
            ? [latitude, longitude]
            : null,
          primaryFactor: habitation.primaryHazard
            ? `Recorded primary hazard: ${habitation.primaryHazard}`
            : null,
        };
      });
      const focus = selectCitizenFocus({
        incidents: filteredIncidents,
        riskZones: demoMode ? activeMapState.riskZones : liveRiskZones,
        shelters: activeMapState.shelters,
        hospitals: activeMapState.hospitals,
        routes,
        roads: activeMapState.roads,
        reference: userLocation,
        demoMode,
      });
      if (!demoMode && (domainLoading || domainError)) {
        return {
          ...focus,
          dangerLevel: "UNKNOWN",
          warning: domainLoading
            ? "Current hazard data is loading."
            : "Current hazard data is unavailable.",
          riskReason: domainError || focus.riskReason,
        };
      }
      return focus;
    },
    [filteredIncidents, activeMapState, redZones, routes, userLocation, demoMode, domainLoading, domainError],
  );
  // Citizen sees only the single recommended safe route, not every corridor.
  const citizenRoutes = useMemo(
    () => (citizenFocus.primaryRoute ? [citizenFocus.primaryRoute] : []),
    [citizenFocus],
  );

  // Dynamic Multi-Factor Risk Heatmap Nodes (45% Risk Score + 30% Incident Density + 25% Rainfall Severity)
  const heatmapNodes = useMemo(() => demoMode
    ? calculateRiskHeatmapNodes(activeMapState.riskZones, filteredIncidents)
    : [], [demoMode, activeMapState.riskZones, filteredIncidents]);

  // Live HUD Telemetry & Derived Disaster Metrics
  const blockedRoadCount = useMemo(() => {
    return activeMapState.roads.length > 0
      ? activeMapState.roads.filter((r) => r.status === "Blocked").length
      : null;
  }, [activeMapState.roads]);

  const criticalIncidentCount = useMemo(() => {
    return domainError || domainLoading
      ? null
      : filteredIncidents.filter((i) => i.severity === "Critical").length;
  }, [domainError, domainLoading, filteredIncidents]);

  const hospitalAccessBlocked = useMemo(() => {
    return activeMapState.hospitals.some(
      (h) => (h.roadAccess || "").toLowerCase() === "blocked",
    );
  }, [activeMapState.hospitals]);

  // Dynamic Isolated Mountain Villages Count
  const isolatedVillagesCount = useMemo(() => {
    if ((activeMapState.villages || []).length === 0) return null;
    return (activeMapState.villages || []).filter((v) => {
      const road = (activeMapState.roads || []).find(
        (r) => r.id === v.primaryAccessRoadId,
      );
      if (!road) return v.connectivityStatus === "Isolated";
      return (road.status || "").toUpperCase() === "BLOCKED";
    }).length;
  }, [activeMapState.villages, activeMapState.roads]);

  // SENTRY red-zone assessments are loaded from the backend below.
  const maxRiskScore = useMemo(() => {
    const assessedScores = habitations.map((habitation) => habitation.risk?.score).filter(Number.isFinite);
    if (assessedScores.length > 0) return Math.max(...assessedScores);
    if (!activeMapState.riskZones || activeMapState.riskZones.length === 0)
      return null;
    const demoScores = activeMapState.riskZones
      .map((zone) => zone.riskScore)
      .filter(Number.isFinite);
    return demoScores.length ? Math.max(...demoScores) : null;
  }, [activeMapState.riskZones, habitations]);

  const precipitationValue = liveWeather?.precipitation;
  const currentPrecipitation = precipitationValue !== null && precipitationValue !== undefined && precipitationValue !== ""
    && Number.isFinite(Number(precipitationValue))
    ? `${Number(precipitationValue)} mm`
    : "Data unavailable";
  const operationalMapPoints = useMemo(() => [
    ...habitations.map((item) => item.location?.coordinates)
      .filter((item) => Array.isArray(item) && item.length === 2)
      .map(([lng, lat]) => [lat, lng]),
    ...relocationSites.map((item) => item.location?.coordinates)
      .filter((item) => Array.isArray(item) && item.length === 2)
      .map(([lng, lat]) => [lat, lng]),
    ...redZones.map((item) => item.location?.coordinates)
      .filter((item) => Array.isArray(item) && item.length === 2)
      .map(([lng, lat]) => [lat, lng]),
    ...incidents.map((item) => typeof item.location?.lat === "number"
      ? [item.location.lat, item.location.lng]
      : null).filter(Boolean),
  ], [habitations, relocationSites, redZones, incidents]);

  const handleSelect = useCallback(
    (feature) => {
      setSelectedFeature(feature);
      if (onSelectFeature) onSelectFeature(feature);
    },
    [onSelectFeature],
  );

  const selectedIncident = useMemo(() => {
    if (!selectedFeature) return null;

    const incidentId = selectedFeature.id;

    return incidents.find((incident) => incident.id === incidentId) || null;
  }, [selectedFeature, incidents]);
  // The shared map engine — one Leaflet map + all reusable layer components.
  // Rendered into whichever role layout wins below; never duplicated.
  const mapElement = (
    <MapView
      className="gis-dark-tiles"
      basemap={mapStyle}
      onMapReady={setMapInstance}
    >
      {/* Spatial Reset Controller */}
      <MapResetController
        resetTrigger={resetTrigger}
        isSimActive={demoMode && simScenario !== "BASELINE"}
        demoMode={demoMode}
        points={operationalMapPoints}
      />

      {/* Live cursor + view-center coordinate telemetry */}
      <MapCoordinateTracker
        onViewChange={handleViewChange}
      />

      {/* Operator annotation points (click-to-drop pins with notes) */}
      <UserPointsLayer
        points={userPoints}
        addMode={addPointMode}
        openPointId={focusPoint.id || justAddedPointId}
        flyTo={focusPoint}
        onAddPoint={handleAddPoint}
        onUpdatePoint={handleUpdatePoint}
        onDeletePoint={handleDeletePoint}
      />

      {/* Dynamic Spatial Heatmap Layer (Z-Index Lowest) */}
      <RiskHeatmapLayer
        nodes={heatmapNodes}
        visible={layerVisibility.heatmap}
        onSelectNode={handleSelect}
      />

      <RedZoneLayer
        habitations={redZones}
        visible={layerVisibility.redZones}
        onSelect={(item) => navigate(`/habitations/${item._id}`)}
      />
      <HabitationLayer
        habitations={habitations}
        visible={layerVisibility.habitations}
        onSelect={(item) => navigate(`/habitations/${item._id}`)}
      />
      <RelocationSiteLayer
        sites={relocationSites}
        visible={layerVisibility.relocationSites}
        onSelect={(item) => navigate(`/relocation-sites/${item._id}`)}
      />
      <TargetedAlertLayer
        alerts={targetedAlerts}
        visible={layerVisibility.alerts}
        onSelect={handleSelect}
      />

      {/* Legacy spatial zones remain available only in explicitly enabled demo mode. */}
      <RiskZoneLayer
        riskZones={isCitizen ? citizenRiskZones : activeMapState.riskZones}
        visible={layerVisibility.riskZones}
        selectedRiskZoneId={selectedFeature && selectedFeature.id}
        onSelectRiskZone={handleSelect}
        hudMode={hudMode}
      />

      {/* Road Network & Mountain Connectivity Corridor Layer */}
      <RoadStatusLayer
        roads={isCitizen ? citizenRoads : activeMapState.roads}
        visible={layerVisibility.roads}
        selectedRoadId={selectedFeature && selectedFeature.id}
        onSelectRoad={handleSelect}
        hudMode={hudMode}
      />

      {/* Emergency Evacuation & Relief Logistics Routes */}
      <RouteLayer
        routes={isCitizen ? citizenRoutes : routes}
        visible={layerVisibility.routes}
        selectedRouteId={selectedFeature && selectedFeature.id}
        onSelectRoute={handleSelect}
        hudMode={hudMode}
      />

      {/* Mountain Villages & Isolated Communities Layer */}
      <VillageLayer
        villages={isCitizen ? citizenVillages : activeMapState.villages}
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
        incidents={isCitizen ? citizenIncidents : filteredIncidents}
        visible={layerVisibility.incidents}
        selectedIncidentId={selectedFeature && selectedFeature.id}
        onSelectIncident={handleSelect}
        hudMode={hudMode}
      />
      {/* ---------------------------------------------------------
    INCIDENT RESPONSE CONTEXT

    When an incident is selected, calculate and highlight
    nearby roads, hospitals, shelters, villages and
    emergency response resources.
--------------------------------------------------------- */}
      <IncidentResponseLayer
        incident={selectedIncident}
        roads={activeMapState.roads}
        hospitals={activeMapState.hospitals}
        shelters={activeMapState.shelters}
        villages={activeMapState.villages}
        resources={activeMapState.resources}
        visible={layerVisibility.incidents}
      />

      {/* LIVE USGS earthquakes over India (real nationwide feed) */}
      <LiveQuakeLayer
        quakes={liveQuakes}
        visible={layerVisibility.quakes !== false}
      />

      {/* LIVE real hospitals/clinics from OpenStreetMap for the current view */}
      <LiveHospitalLayer visible={layerVisibility.liveMed === true} />

      {/* LIVE NASA active-fire / thermal-anomaly overlay (keyless GIBS WMS) */}
      <GibsFireLayer visible={layerVisibility.fires === true} />

      {/* ISRO Bhuvan authoritative WMS overlay */}
      <BhuvanHazardLayer visible={layerVisibility.bhuvan === true} />

      {/* Active disaster theatres across India (labelled hazard rings) */}
      <DisasterZonesLayer visible={demoMode && layerVisibility.zones !== false} />

      {/* OpenFreeMap detailed vector basemap — streamed free, no download */}

      <OpenFreeMapLayer visible={layerVisibility.ofm === true} />

      {/* Citizen "you are here" pin — real GPS when available; otherwise
              the clearly-labelled Sikkim demo position. */}
      {isCitizen ? (
        <MyLocationMarker
          location={
            userLocation ||
            (demoMode && citizenFocus.locationMode === "demo" ? citizenFocus.myPoint : null)
          }
            simulated={!userLocation && demoMode}
        />
      ) : null}
    </MapView>
  );

  // ============================================================
  // CITIZEN — desktop-first, Bootstrap-grid responsive page.
  // Real Bootstrap layout: container-fluid > row > map column + info column.
  // Desktop (lg+): map dominant beside a docked info column.
  // Tablet/phone (<lg): the same columns stack (map on top, actions below).
  // Custom CSS only handles colour/type/heights, never the layout itself.
  // ============================================================
  if (isCitizen) {
    return (
      <div className="gis-app-wrapper gis-role-citizen d-flex flex-column vh-100">
        <header className="gis-header gis-header-citizen d-flex align-items-center justify-content-between gap-3 px-3">
          <div className="d-flex align-items-center gap-2">
            <span className="gis-brand-name">SENTRY · SIH26191</span>
            <span className="gis-cz-header-sub d-none d-sm-inline">
              Live Safety Map
            </span>
          </div>
          <span
            className={`gis-cz-header-pill gis-cz-status-${
              String(citizenFocus.dangerLevel).toUpperCase() === "CRITICAL"
                ? "danger"
                : String(citizenFocus.dangerLevel).toUpperCase() === "HIGH"
                ? "high"
                : String(citizenFocus.dangerLevel).toUpperCase() === "LOW"
                ? "safe"
                : "warning"
            }`}
          >
            {domainLoading
              ? "LOADING HAZARD DATA"
              : domainError
                ? "HAZARD DATA UNAVAILABLE"
                : String(citizenFocus.dangerLevel).toUpperCase() === "LOW"
                  ? "NO REPORTED HAZARDS"
                  : `DANGER · ${String(citizenFocus.dangerLevel).toUpperCase()}`}
          </span>
        </header>

        <main className="gis-citizen-main flex-grow-1">
          <div className="container-fluid h-100 p-0">
            <div className="row g-0 h-100 gis-citizen-row">
              <div className="col-12 col-lg-7 col-xl-8 gis-citizen-mapcol position-relative">
                {mapElement}
              </div>
              <aside className="col-12 col-lg-5 col-xl-4 gis-citizen-sidecol">
                <CitizenPanel
                  focus={citizenFocus}
                  onFocusLocation={handleCitizenFocusLocation}
                  onLocateMe={handleLocateMe}
                  onReport={handleCitizenReport}
                  located={!!userLocation}
                />
              </aside>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ============================================================
  // AUTHORITY — full tactical command center (map full-bleed + overlays).
  // ============================================================
  return (
    <div className="gis-app-wrapper gis-role-authority d-flex flex-column vh-100">
      <header className="gis-header d-flex align-items-center justify-content-between gap-2 px-2 px-md-3">
        <div className="gis-header-left d-flex align-items-center gap-2">
          <span className="gis-eoc-tag">EOC-GIS</span>
          <div className="gis-header-title d-flex align-items-center gap-2">
            <span className="gis-brand-name">SENTRY · SIH26191</span>
            <span
              className="d-none d-sm-inline"
              style={{ color: "var(--text-muted)" }}
            >
              /
            </span>
            <span
              className="d-none d-sm-inline"
              style={{ color: "var(--text-secondary)" }}
            >
              {demoMode ? "DEMO THEATER" : "OPERATIONAL AREA"}
            </span>
          </div>
        </div>

        <div className="gis-header-meta d-flex align-items-center gap-2">
          <span className="gis-header-meta-extra gis-coord-readout d-none d-lg-inline">
            CTR{" "}
            {centerMapsHref ? (
              <a
                className="gis-coord-link"
                href={centerMapsHref}
                target="_blank"
                rel="noopener noreferrer"
                title="Open view center in Google Maps (WGS-84)"
              >
                {centerReadout}
              </a>
            ) : (
              centerReadout
            )}
            {viewInfo ? (
              <span className="gis-coord-zoom">
                {" "}
                · Z{viewInfo.zoom.toFixed(1)}
              </span>
            ) : null}
          </span>
          <span className="gis-header-meta-extra d-none d-lg-inline">•</span>
          <span className="gis-header-meta-extra d-none d-lg-inline">
            DATUM WGS-84
          </span>
          <span className="gis-header-meta-extra d-none d-lg-inline">•</span>
          <span className={demoMode ? "gis-meta-sim" : domainError ? "gis-meta-sim" : "gis-meta-live"}>
            {demoMode ? "DEMO DATA" : domainError ? "DATA UNAVAILABLE" : domainLoading ? "LOADING DATA" : "LIVE API"}
          </span>
          <span className="gis-header-meta-extra d-none d-sm-inline">•</span>
          <span
            className="d-none d-sm-inline"
            style={{ color: "var(--color-info)" }}
          >
            {hudMode.toUpperCase()}
          </span>
        </div>
      </header>

      <main
        className={`gis-workspace flex-grow-1 position-relative gis-style-${mapStyle} ${
          addPointMode ? "gis-add-mode" : ""
        }`}
      >
        {mapElement}

        {domainError && !demoMode ? (
          <div className="alert alert-danger position-absolute top-0 start-50 translate-middle-x m-2" style={{ zIndex: 1200 }} role="alert">
            {domainError} <button className="btn btn-sm btn-link" onClick={() => window.location.reload()}>Retry</button>
          </div>
        ) : null}
        {targetedAlertsError && !demoMode ? (
          <div className="alert alert-warning position-absolute top-0 end-0 m-2" style={{ zIndex: 1100 }} role="status">
            {targetedAlertsError}
          </div>
        ) : null}
        {domainLoading && !demoMode ? (
          <div className="position-absolute top-0 start-0 m-2 badge text-bg-secondary" style={{ zIndex: 1100 }} role="status">Loading live operational layers…</div>
        ) : null}
        {targetedAlertsLoading && !demoMode ? (
          <div className="position-absolute bottom-0 start-0 m-2 badge text-bg-secondary" style={{ zIndex: 1100 }} role="status">Loading targeted alerts…</div>
        ) : null}
        {!domainLoading && !domainError && !demoMode && operationalMapPoints.length === 0 ? (
          <div className="position-absolute top-0 start-0 m-2 badge text-bg-secondary" style={{ zIndex: 1100 }}>No registered SENTRY map data in this area.</div>
        ) : null}

        {!isCitizen && (
          <>
            <div className="gis-left-rail">
              <TacticalTelemetryHUD
                incidentCount={domainError || domainLoading ? null : filteredIncidents.length}
                criticalCount={criticalIncidentCount}
                blockedRoadCount={blockedRoadCount}
                isolatedVillagesCount={isolatedVillagesCount}
                currentPrecipitation={demoMode ? "Demo fixture" : weatherLoading ? "Loading…" : weatherError ? "Data unavailable" : currentPrecipitation}
                precipitationStatus={demoMode ? "DEMO" : weatherLoading ? "LOADING" : weatherError || !liveWeather ? "UNAVAILABLE" : "LIVE"}
                maxRiskScore={maxRiskScore}
                hospitalAccessCount={demoMode ? (hospitalAccessBlocked ? "1/2" : "2/2") : "Data unavailable"}
                activeResourcesCount={
                  demoMode ? activeMapState.resources.length : null
                }
                hudMode={hudMode}
                weatherSource={demoMode ? "DEMO FIXTURES" : weatherLoading ? "WEATHER LOADING" : weatherError || !liveWeather ? "WEATHER UNAVAILABLE" : liveWeather?.source || "NO WEATHER SOURCE"}
              />

              <MapLegend
                hudMode={hudMode}
                demoMode={demoMode}
                isSimActive={simScenario !== "BASELINE"}
              />
            </div>

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
              addPointMode={addPointMode}
              onToggleAddPoint={toggleAddPointMode}
              userPoints={userPoints}
              onFocusPoint={handleFocusPoint}
              onDeletePoint={handleDeletePoint}
            />

            {/* Floating Command Dock (tactical scenario / basemap / HUD island)
            removed from Authority per Abhijeet's review ("ye bhi hata de").
            Basemap + reset remain available in the right CONTROLS panel. */}

            {/* 7. Active add-mode banner (the toggle now lives in the CONTROLS
             rail; this only appears while placing a point). */}
            {addPointMode ? (
              <div className="gis-addpoint-banner" role="status">
                CLICK ANYWHERE ON THE MAP TO DROP A POINT
              </div>
            ) : null}
          </>
        )}

        {/* Citizen action panel — the entire citizen-mode chrome */}
        {isCitizen && (
          <CitizenPanel
            focus={citizenFocus}
            onFocusLocation={handleCitizenFocusLocation}
          />
        )}
      </main>
    </div>
  );
}
