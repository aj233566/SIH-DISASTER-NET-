/**
 * ============================================================================
 * ROUTING SERVICE ORCHESTRATOR — CASCADE-NET GIS
 * ============================================================================
 * 
 * ARCHITECTURAL DESIGN & PURPOSE:
 * 1. Provider Abstraction: Decouples the React GIS presentation layer (RouteLayer.jsx)
 *    from concrete routing engines (TomTom, OSRM, Demo Adapter).
 * 2. Adaptive Provider Selection:
 *    - Uses TomTomRoutingAdapter when VITE_TOMTOM_API_KEY is configured.
 *    - Seamlessly falls back to DemoRoutingAdapter if no key is provided, if network fails,
 *      or if API rate limits are encountered.
 * 3. In-Memory Route Cache: Implements 60-second TTL cache to prevent API quota exhaustion.
 * 4. Disaster Route Evaluation: Applies emergencyRouteScoring to rank candidate corridors.
 * 5. Visual Transparency Contract: Explicitly flags data source ("LIVE_TOMTOM" vs "SIMULATED").
 * 
 * NORMALIZED CASCADE-NET ROUTE CONTRACT:
 * {
 *   id: string,                 // Unique route ID (e.g. "ROUTE-01-PRIMARY")
 *   name: string,               // Human-readable corridor name
 *   type: "Primary" | "Alternative" | "Affected",
 *   status: "Recommended" | "Available" | "Blocked",
 *   riskLevel: "Operational" | "Warning" | "Critical",
 *   origin: { name, lat, lng },
 *   destination: { name, lat, lng },
 *   coordinates: [[lat, lng], ...],
 *   distanceKm: number,         // Numeric distance in km (e.g. 4.8)
 *   distance: string,           // Formatted distance (e.g. "4.8 km")
 *   freeFlowEtaMin: number,     // Baseline travel time with no traffic (e.g. 11)
 *   trafficAwareEtaMin: number, // Live traffic-aware travel time (e.g. 19)
 *   trafficDelayMin: number,    // Delay caused by traffic (e.g. 8)
 *   eta: string,                // Display ETA (e.g. "19 mins")
 *   trafficLevel: "NORMAL" | "MODERATE" | "HEAVY" | "SEVERE",
 *   roadStatus: "OPEN" | "RESTRICTED" | "FLOODED" | "BLOCKED",
 *   confidence: number,
 *   source: "LIVE_TOMTOM" | "SIMULATED",
 *   lastUpdated: ISO string
 * }
 * ============================================================================
 */

import { DEMO_ROUTES } from '../../data/gis/demoGisData';
import { TomTomRoutingAdapter } from './tomtomRoutingAdapter';
import { rankEmergencyRoutes } from '../../utils/gis/emergencyRouteScoring';

class DemoRoutingAdapter {
  constructor() {
    this.source = "SIMULATED";
  }

  /**
   * Returns pre-computed deterministic emergency routes scored against disaster context.
   */
  async getRoutes(context = {}) {
    return Promise.resolve(rankEmergencyRoutes(DEMO_ROUTES, context));
  }

  /**
   * Finds the best route between coordinates using deterministic demo models.
   */
  async calculateRoute({ origin, destination, context = {} }) {
    if (!origin || !destination) {
      throw new Error("Origin and Destination coordinates are required.");
    }
    const routes = rankEmergencyRoutes(DEMO_ROUTES, context);
    const primary = routes.find((r) => r.type === 'Primary') || routes[0];
    return Promise.resolve(primary);
  }
}

class RoutingService {
  constructor() {
    this.tomtomAdapter = new TomTomRoutingAdapter();
    this.demoAdapter = new DemoRoutingAdapter();
    this.cache = new Map();
    this.cacheTtlMs = 60 * 1000; // 60-second TTL
    this.activeSource = this.tomtomAdapter.isConfigured() ? "LIVE_TOMTOM" : "SIMULATED";
    this.lastError = null;
  }

  /**
   * Returns current active data provider source ("LIVE_TOMTOM" or "SIMULATED").
   */
  getActiveSource() {
    return this.activeSource;
  }

  /**
   * Boolean check for live TomTom traffic mode.
   */
  isLiveTomTom() {
    return this.activeSource === "LIVE_TOMTOM";
  }

  /**
   * Main routing orchestrator: Fetches live TomTom route or gracefully falls back to Demo adapter.
   * 
   * @param {Object} context - Disaster context { roads, riskZones, incidents, resources }
   * @returns {Promise<Array>} List of scored, ranked emergency routes
   */
  async getRoutes(context = {}) {
    // 1. Attempt Live TomTom Routing if API key is configured
    if (this.tomtomAdapter.isConfigured()) {
      try {
        const cacheKey = `routes-${JSON.stringify(context.roads?.map((r) => r.status)) || 'default'}`;
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.cacheTtlMs) {
          this.activeSource = "LIVE_TOMTOM";
          return cached.data;
        }

        const primaryDemo = DEMO_ROUTES.find((r) => r.type === 'Primary') || DEMO_ROUTES[0];
        const livePrimary = await this.tomtomAdapter.calculateRoute({
          origin: primaryDemo.origin,
          destination: primaryDemo.destination,
          routeId: primaryDemo.id,
          routeType: "Primary"
        });

        // Combine live dynamic primary route with candidate alternative corridors
        const candidateRoutes = [
          livePrimary,
          ...DEMO_ROUTES.filter((r) => r.id !== primaryDemo.id)
        ];

        const ranked = rankEmergencyRoutes(candidateRoutes, context);
        this.cache.set(cacheKey, { timestamp: Date.now(), data: ranked });
        this.activeSource = "LIVE_TOMTOM";
        this.lastError = null;
        return ranked;
      } catch (err) {
        console.warn("[RoutingService] TomTom live routing unavailable, falling back to Demo adapter:", err.message);
        this.lastError = err.message;
        this.activeSource = "SIMULATED";
      }
    }

    // 2. Deterministic Fallback: DemoRoutingAdapter
    this.activeSource = "SIMULATED";
    return this.demoAdapter.getRoutes(context);
  }

  /**
   * Clears the in-memory route cache on scenario transitions.
   */
  clearCache() {
    this.cache.clear();
  }
}

export const routingService = new RoutingService();
