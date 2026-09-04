/**
 * ============================================================================
 * NER LANDSLIDE & MOUNTAIN EMERGENCY RESPONSE DATASET — CASCADE-NET GIS
 * ============================================================================
 * 
 * DOMAIN SPECIFICATION:
 * Target Operational Geography: Gangtok / Singtam / Rangpo / NH-10 Teesta Valley, Sikkim (NER)
 * Strategic Problem Domain: Landslide Risk Monitoring, Road Severance & Emergency Evacuation
 * 
 * DATA PROVENANCE & INTEGRATION CONTRACTS:
 * 1. AI Risk Engine (Rudra):
 *    - In production, landslide risk scores (0-100), slope angles, and slip window predictions
 *      will be supplied via Rudra's AI/ML pipeline (/api/v1/risk/landslide-zones).
 * 2. Backend & Ground Reports (Abhijett & Heemanshi):
 *    - Geo-tagged citizen reports, road connectivity telemetry, and hospital bed capacities
 *      will stream from Abhijett's REST and WebSocket services (/api/v1/*).
 * 3. Traffic Aware Evacuation (TomTom Routing):
 *    - Live dynamic travel times and evacuation delays along mountain highway corridors.
 * 
 * NOTE: All coordinates, risk metrics, and population numbers in this file represent
 * realistic SIMULATED DEMO FIXTURES for local testing and architectural validation.
 * ============================================================================
 */

export const DEMO_MAP_CONFIG = {
  initialCenter: [27.2850, 88.5650], // Midpoint of Singtam-Martam-Gangtok NH-10 Corridor
  initialZoom: 12.8,
  // minZoom:3 lets the operator zoom all the way out to the whole of India /
  // the subcontinent / the world (was locked at 9, which trapped the view on
  // the Sikkim corridor and made it look like the map only covered one area).
  // maxZoom:19 keeps street-level detail. Pan is unrestricted, so any part of
  // the country can be explored in full detail.
  minZoom: 3,
  maxZoom: 19
};

export const DEMO_META = {
  incidentCount: 4,
  criticalAlerts: 2,
  shelterCount: 2,
  hospitalCount: 2,
  deployedResources: 3,
  blockedRoadCount: 1,
  isolatedVillages: 1,
  sector: "NER-SIKKIM-01",
  region: "East Sikkim / NH-10 Teesta Valley Corridor",
  rainfallSeverity: "VERY HEAVY (142 mm / 24h)",
  timestamp: "2026-08-31T18:00:00Z"
};

/**
 * 1. Geo-Tagged Field Incidents & Citizen Reports
 * Represents verified ground-truth landslides, rockfalls, and mudflow hazards.
 */
export const DEMO_INCIDENTS = [
  {
    id: "INC-LS-101",
    title: "Major Rockfall & Highway Severance at Km 32",
    type: "Landslide",
    severity: "Critical",
    location: {
      lat: 27.2530,
      lng: 88.5380,
      address: "NH-10 Teesta Valley Highway, Near Milepost 32"
    },
    status: "Active",
    impactScore: 96,
    reportedAt: "2026-08-31T17:10:00Z",
    affectedPopulation: 3800,
    requiredAssets: ["Heavy Earthmovers", "BRO Dozer Crew", "NDRF SAR"],
    description: "Massive rockfall and debris avalanche severed NH-10. Over 4,000 cu.m of debris blocks arterial access to Gangtok.",
    source: "NDRF Ground Recon Patrol #04",
    verificationStatus: "Verified"
  },
  {
    id: "INC-LS-102",
    title: "Slope Fissures & Slump Threat — Singtam Ridge",
    type: "Ground Fissure",
    severity: "High",
    location: {
      lat: 27.2410,
      lng: 88.5100,
      address: "Upper Singtam Terrace Slopes, Above Ward 3"
    },
    status: "Active",
    impactScore: 82,
    reportedAt: "2026-08-31T17:25:00Z",
    affectedPopulation: 1640,
    requiredAssets: ["Geotechnical Inclinometers", "SDRF Evacuation Squad"],
    description: "15cm wide ground tension cracks observed across tea garden hillside. High probability of secondary debris slide.",
    source: "Citizen Report #92 (Gram Panchayat Verified)",
    verificationStatus: "Verified"
  },
  {
    id: "INC-LS-103",
    title: "Culvert Silt Inundation & Debris Flow",
    type: "Mudflow",
    severity: "Warning",
    location: {
      lat: 27.3450,
      lng: 88.5900,
      address: "Ranipool-Gangtok Lower Approach Road"
    },
    status: "Active",
    impactScore: 61,
    reportedAt: "2026-08-31T17:40:00Z",
    affectedPopulation: 900,
    requiredAssets: ["JCB Ditching Unit", "Traffic Police Convoy"],
    description: "Torrential mud and loose gravel overflowing mountain drainage. Single-lane restricted transit in place.",
    source: "SDRF Highway Patroller",
    verificationStatus: "Verified"
  },
  {
    id: "INC-LS-104",
    title: "Downed High-Voltage Mountain Power Cables",
    type: "Infrastructure",
    severity: "Operational",
    location: {
      lat: 27.2050,
      lng: 88.5200,
      address: "Rangpo Power Feeder Line Sector 2"
    },
    status: "Resolved",
    impactScore: 35,
    reportedAt: "2026-08-31T16:15:00Z",
    affectedPopulation: 450,
    requiredAssets: ["State Power Clearance Squad"],
    description: "Tree fall cleared from 33kV transmission corridor. Substation power restored.",
    source: "Power Grid Telemetry",
    verificationStatus: "Resolved"
  }
];

/**
 * 2. Mountain Villages & Habitations
 * Settlements with physical road connectivity and vulnerability rating.
 */
export const DEMO_VILLAGES = [
  {
    id: "VILL-001",
    name: "Singtam Upper Basti",
    location: { lat: 27.2350, lng: 88.4980 },
    population: 1640,
    connectivityStatus: "Isolated", // Access blocked by NH-10 rockfall
    riskLevel: "Critical",
    riskScore: 88,
    primaryAccessRoadId: "ROAD-NH10-S1",
    shelterCapacityNearby: 500,
    lastContact: "2026-08-31T17:45:00Z"
  },
  {
    id: "VILL-002",
    name: "Martam Foothill Settlement",
    location: { lat: 27.2620, lng: 88.5600 },
    population: 980,
    connectivityStatus: "Restricted", // Accessible via single-lane Ridge Bypass
    riskLevel: "High",
    riskScore: 74,
    primaryAccessRoadId: "ROAD-BYPASS-01",
    shelterCapacityNearby: 300,
    lastContact: "2026-08-31T17:50:00Z"
  },
  {
    id: "VILL-003",
    name: "Rongli Valley Hamlet",
    location: { lat: 27.2100, lng: 88.6800 },
    population: 620,
    connectivityStatus: "Connected",
    riskLevel: "Warning",
    riskScore: 52,
    primaryAccessRoadId: "ROAD-RONGLI-01",
    shelterCapacityNearby: 800,
    lastContact: "2026-08-31T17:30:00Z"
  },
  {
    id: "VILL-004",
    name: "Dikchu Riverside Village",
    location: { lat: 27.3800, lng: 88.5350 },
    population: 1250,
    connectivityStatus: "Connected",
    riskLevel: "Warning",
    riskScore: 58,
    primaryAccessRoadId: "ROAD-DIKCHU-01",
    shelterCapacityNearby: 400,
    lastContact: "2026-08-31T17:15:00Z"
  }
];

/**
 * 3. Emergency Medical Facilities & CHCs
 */
export const DEMO_HOSPITALS = [
  {
    id: "HOSP-001",
    name: "STNM Multi-Speciality Hospital Gangtok",
    type: "Apex Disaster Referral Hospital",
    status: "Operational",
    severity: "Critical",
    location: {
      lat: 27.3250,
      lng: 88.6080,
      address: "Sochagang Enclave, Gangtok East"
    },
    totalBeds: 550,
    availableBeds: 84,
    icuBedsTotal: 60,
    icuBedsAvailable: 11,
    oxygenCapacityPct: 94,
    roadAccess: "Connected",
    helipadStatus: "Operational (LZ-01 Active)",
    contact: "+91-3592-202944 (Emergency Trauma Line)"
  },
  {
    id: "HOSP-002",
    name: "Singtam District Community Hospital",
    type: "Community Health Center (CHC)",
    status: "Operational",
    severity: "High",
    location: {
      lat: 27.2380,
      lng: 88.4950,
      address: "Hospital Road, Singtam Bazaar"
    },
    totalBeds: 120,
    availableBeds: 18,
    icuBedsTotal: 10,
    icuBedsAvailable: 2,
    oxygenCapacityPct: 82,
    roadAccess: "Blocked", // Direct arterial NH-10 blocked by rockfall
    helipadStatus: "No Helipad",
    contact: "+91-3592-234212"
  }
];

/**
 * 4. Mountain Relief Shelters & Staging Camps
 */
export const DEMO_SHELTERS = [
  {
    id: "SHEL-001",
    name: "Rangpo Indoor Sports Complex Relief Center",
    type: "Primary Mountain Relief Hub",
    status: "Operational",
    location: {
      lat: 27.1780,
      lng: 88.5280,
      address: "NH-10 Highway Complex, Rangpo Gateway"
    },
    totalCapacity: 800,
    currentOccupancy: 460,
    foodStatus: "Adequate (5 Days Supply)",
    waterStatus: "Potable Tankers On-Site",
    powerStatus: "Grid Active + Backup Generator",
    medicalStaffCount: 12,
    contact: "Relief Officer: +91-94340-88122"
  },
  {
    id: "SHEL-002",
    name: "Singtam Community Hall Emergency Camp",
    type: "Temporary Evacuation Shelter",
    status: "Operational",
    location: {
      lat: 27.2340,
      lng: 88.5020,
      address: "Singtam Upper Ward, Near Bridge"
    },
    totalCapacity: 500,
    currentOccupancy: 385,
    foodStatus: "Replenishing via SDRF Convoys",
    waterStatus: "Filtration Unit Active",
    powerStatus: "Generator Only",
    medicalStaffCount: 6,
    contact: "Camp Coordinator: +91-98002-11450"
  }
];

/**
 * 5. Mountain Search, Rescue & Heavy Earthmover Assets
 */
export const DEMO_RESOURCES = [
  {
    id: "RES-BRO-01",
    name: "BRO Project Swastik Heavy Dozer Crew #04",
    type: "Generator", // Machinery
    status: "Deployed",
    location: {
      lat: 27.2510,
      lng: 88.5350,
      address: "NH-10 Km 32 Rockfall Clearance Zone"
    },
    personnelCount: 18,
    equipment: "2x Komatsu D155 Dozers, 1x CAT 320D Excavator, Rock Breakers",
    assignedIncidentId: "INC-LS-101",
    contactRadio: "VHF Ch 16 (BRO Ops)"
  },
  {
    id: "RES-NDRF-01",
    name: "NDRF 2nd Bn Mountain Rescue Team Alpha",
    type: "Rescue Team",
    status: "Deployed",
    location: {
      lat: 27.2320,
      lng: 88.4920,
      address: "Singtam Disaster Response Base"
    },
    personnelCount: 24,
    equipment: "High-Angle Rope Rescue Kits, Drone Recon, Life Detectors",
    assignedIncidentId: "INC-LS-102",
    contactRadio: "VHF Ch 08 (NDRF Comms)"
  },
  {
    id: "RES-AMB-01",
    name: "SDRF 4x4 High-Altitude ALS Ambulance #02",
    type: "Ambulance",
    status: "Active",
    location: {
      lat: 27.2390,
      lng: 88.4970,
      address: "Singtam Hospital Staging Zone"
    },
    personnelCount: 4,
    equipment: "Portable Ventilator, Defibrillator, Cold-Weather Trauma Kit",
    assignedIncidentId: null,
    contactRadio: "VHF Ch 12 (Emergency Medical)"
  }
];

/**
 * 6. Mountain Road Corridors & Highways (Official Tri-State Connectivity)
 */
export const DEMO_ROADS = [
  {
    id: "ROAD-NH10-S1",
    name: "NH-10 Teesta Valley Highway (Km 32 Section)",
    status: "Blocked", // CONNECTED | RESTRICTED | BLOCKED
    trafficCondition: "NORMAL",
    blockageReason: "Severe Landslide & Rock Avalanche (4,000 cu.m debris)",
    estimatedClearance: "4.5 hrs (BRO Excavators Active)",
    coordinates: [
      [27.2350, 88.5000],
      [27.2450, 88.5200],
      [27.2530, 88.5380], // Slide centroid
      [27.2620, 88.5550],
      [27.2750, 88.5720]
    ]
  },
  {
    id: "ROAD-BYPASS-01",
    name: "Western Ridge Alternate Mountain Bypass",
    status: "Restricted", // Single-lane controlled passage for light emergency vehicles
    trafficCondition: "NORMAL",
    restrictionReason: "Narrow hillside hairpin alignment; single-lane convoy control",
    estimatedClearance: "Monitored / Active Convoy Escort",
    coordinates: [
      [27.2350, 88.5000],
      [27.2480, 88.4920],
      [27.2650, 88.5120],
      [27.2820, 88.5400],
      [27.2950, 88.5680],
      [27.3080, 88.5880]
    ]
  },
  {
    id: "ROAD-GANGTOK-01",
    name: "Ranipool to STNM Hospital Gangtok Expressway Approach",
    status: "Connected", // Full two-way access
    trafficCondition: "NORMAL",
    restrictionReason: null,
    estimatedClearance: "Fully Open & Operational",
    coordinates: [
      [27.3080, 88.5880],
      [27.3180, 88.5980],
      [27.3250, 88.6080]
    ]
  },
  {
    id: "ROAD-RONGLI-01",
    name: "Rongli Valley Arterial Link Road",
    status: "Connected",
    trafficCondition: "NORMAL",
    coordinates: [
      [27.2100, 88.6800],
      [27.2350, 88.6200],
      [27.2750, 88.5720]
    ]
  }
];

/**
 * 7. Landslide-Prone Spatial Hazard Zones (Rudra AI Integration)
 */
export const DEMO_RISK_ZONES = [
  {
    id: "RISK-LS-01",
    name: "Rangpo-Melli High-Slope Landslide Hazard Corridor",
    geometryType: "Polygon",
    riskScore: 92,
    riskLevel: "Critical",
    slopeAngleDeg: 44.5,
    rainfall24hMm: 158,
    soilSaturationPct: 92,
    primaryFactor: "Steep Slope (>40°) + Saturated Soil + Monsoon Torrent",
    threatenedVillages: ["Singtam Upper Basti", "Rongli Valley Hamlet"],
    estimatedPopulation: 2260,
    coordinates: [
      [27.2280, 88.4850],
      [27.2580, 88.5100],
      [27.2680, 88.5650],
      [27.2420, 88.5780],
      [27.2150, 88.5150]
    ]
  },
  {
    id: "RISK-LS-02",
    name: "NH-10 Km 32 Active Chute & Rockfall Susceptibility Zone",
    geometryType: "Polygon",
    riskScore: 86,
    riskLevel: "Critical",
    slopeAngleDeg: 38.0,
    rainfall24hMm: 135,
    soilSaturationPct: 84,
    primaryFactor: "Fractured Gneiss Rockface + Roadcut Undercutting",
    threatenedVillages: ["Martam Foothill Settlement"],
    estimatedPopulation: 980,
    coordinates: [
      [27.2480, 88.5250],
      [27.2680, 88.5450],
      [27.2600, 88.5700],
      [27.2380, 88.5480]
    ]
  },
  {
    id: "RISK-LS-03",
    name: "Dikchu Riverbank Slump & Mudflow Buffer",
    geometryType: "Circle",
    center: [27.3750, 88.5320],
    radius: 1100, // 1.1 km radius
    riskScore: 68,
    riskLevel: "High",
    slopeAngleDeg: 28.5,
    rainfall24hMm: 110,
    soilSaturationPct: 76,
    primaryFactor: "Debris Inflow from Upper Mountain Stream",
    threatenedVillages: ["Dikchu Riverside Village"],
    estimatedPopulation: 1250
  }
];

/**
 * 8. Emergency Evacuation Corridors & Candidate Routes
 */
export const DEMO_ROUTES = [
  {
    id: "ROUTE-01-PRIMARY",
    name: "Western Ridge Alternate Evacuation Corridor (Singtam -> STNM Hospital)",
    type: "Primary",
    status: "Recommended",
    riskLevel: "Operational",
    origin: {
      name: "Singtam Disaster Response Base",
      lat: 27.2350,
      lng: 88.4980
    },
    destination: {
      name: "STNM Multi-Speciality Hospital Gangtok",
      lat: 27.3250,
      lng: 88.6080
    },
    coordinates: [
      [27.2350, 88.4980],
      [27.2480, 88.4920],
      [27.2650, 88.5120],
      [27.2820, 88.5400],
      [27.2950, 88.5680],
      [27.3080, 88.5880],
      [27.3180, 88.5980],
      [27.3250, 88.6080]
    ],
    distanceKm: 14.2,
    distance: "14.2 km",
    freeFlowEtaMin: 26,
    trafficAwareEtaMin: 26,
    trafficDelayMin: 0,
    eta: "26 mins",
    trafficLevel: "NORMAL",
    roadStatus: "OPEN",
    confidence: 0.94,
    source: "SIMULATED",
    lastUpdated: "2026-08-31T18:00:00Z",
    hazardsAvoided: "Bypasses NH-10 Km 32 Active Landslide Debris Zone"
  },
  {
    id: "ROUTE-02-AFFECTED",
    name: "Direct NH-10 Teesta Valley Highway (Impassable Debris Zone)",
    type: "Affected",
    status: "Blocked",
    riskLevel: "Critical",
    traversesR17: true, // Internal flag for primary severance corridor
    origin: {
      name: "Singtam Disaster Response Base",
      lat: 27.2350,
      lng: 88.4980
    },
    destination: {
      name: "STNM Multi-Speciality Hospital Gangtok",
      lat: 27.3250,
      lng: 88.6080
    },
    coordinates: [
      [27.2350, 88.4980],
      [27.2450, 88.5200],
      [27.2530, 88.5380], // Intersects landslide centroid
      [27.2620, 88.5550],
      [27.2750, 88.5720],
      [27.3080, 88.5880],
      [27.3180, 88.5980],
      [27.3250, 88.6080]
    ],
    distanceKm: 9.4,
    distance: "9.4 km",
    freeFlowEtaMin: 14,
    trafficAwareEtaMin: 14,
    trafficDelayMin: 0,
    eta: "14 mins (IMPASSABLE)",
    trafficLevel: "NORMAL",
    roadStatus: "BLOCKED",
    confidence: 0.98,
    source: "SIMULATED",
    lastUpdated: "2026-08-31T18:00:00Z",
    blockageReason: "Direct Corridor Severed by NH-10 Km 32 Landslide Avalanche"
  },
  {
    id: "ROUTE-03-ALT-WEST",
    name: "Rongli-Pakyong High-Altitude Alternate Corridor",
    type: "Alternative",
    status: "Available",
    riskLevel: "Warning",
    origin: {
      name: "Singtam Disaster Response Base",
      lat: 27.2350,
      lng: 88.4980
    },
    destination: {
      name: "STNM Multi-Speciality Hospital Gangtok",
      lat: 27.3250,
      lng: 88.6080
    },
    coordinates: [
      [27.2350, 88.4980],
      [27.2100, 88.6800],
      [27.2500, 88.6500],
      [27.2900, 88.6200],
      [27.3250, 88.6080]
    ],
    distanceKm: 22.5,
    distance: "22.5 km",
    freeFlowEtaMin: 42,
    trafficAwareEtaMin: 42,
    trafficDelayMin: 0,
    eta: "42 mins",
    trafficLevel: "NORMAL",
    roadStatus: "OPEN",
    confidence: 0.88,
    source: "SIMULATED",
    lastUpdated: "2026-08-31T18:00:00Z",
    hazardsAvoided: "Completely avoids Teesta Gorge geological fault zone"
  }
];

/**
 * 9. Multi-Scenario Landslide Simulation Deltas
 */
export const DEMO_SIMULATION_SCENARIOS = {
  BASELINE: {
    id: "BASELINE",
    name: "Baseline Landslide Crisis State",
    description: "NH-10 Km 32 Severed by Landslide; Singtam Hospital road access blocked; Western Ridge Bypass active (26 mins).",
    roads: DEMO_ROADS,
    hospitals: DEMO_HOSPITALS,
    routes: DEMO_ROUTES
  },
  TRAFFIC_SPIKE: {
    id: "TRAFFIC_SPIKE",
    name: "Evacuation Traffic Surge on Western Ridge Bypass",
    description: "Civilian evacuation creates heavy bottleneck on narrow Ridge Bypass (+18m delay -> 44m). Alternative Rongli-Pakyong corridor recommended.",
    deltas: {
      routes: [
        {
          id: "ROUTE-01-PRIMARY",
          name: "Western Ridge Alternate Corridor (Congested)",
          type: "Alternative",
          status: "Available",
          riskLevel: "Warning",
          origin: { name: "Singtam Base", lat: 27.2350, lng: 88.4980 },
          destination: { name: "STNM Hospital", lat: 27.3250, lng: 88.6080 },
          coordinates: DEMO_ROUTES[0].coordinates,
          distanceKm: 14.2,
          distance: "14.2 km",
          freeFlowEtaMin: 26,
          trafficAwareEtaMin: 44,
          trafficDelayMin: 18,
          eta: "44 mins",
          trafficLevel: "HEAVY",
          roadStatus: "OPEN",
          confidence: 0.92,
          source: "SIMULATED",
          hazardsAvoided: "Heavy civilian evacuation congestion"
        },
        {
          ...DEMO_ROUTES[1]
        },
        {
          id: "ROUTE-03-ALT-WEST",
          name: "Rongli-Pakyong High-Altitude Corridor (Free-Flow)",
          type: "Primary",
          status: "Recommended",
          riskLevel: "Operational",
          origin: { name: "Singtam Base", lat: 27.2350, lng: 88.4980 },
          destination: { name: "STNM Hospital", lat: 27.3250, lng: 88.6080 },
          coordinates: DEMO_ROUTES[2].coordinates,
          distanceKm: 22.5,
          distance: "22.5 km",
          freeFlowEtaMin: 42,
          trafficAwareEtaMin: 42,
          trafficDelayMin: 0,
          eta: "42 mins",
          trafficLevel: "NORMAL",
          roadStatus: "OPEN",
          confidence: 0.91,
          source: "SIMULATED",
          hazardsAvoided: "Bypasses congested mountain bottleneck"
        }
      ]
    }
  },
  CLEAR_RING_ROAD_R17: {
    id: "CLEAR_RING_ROAD_R17",
    name: "BRO Heavy Clearance Completed — NH-10 Restored",
    description: "BRO Dozers clear Km 32 debris. Direct NH-10 corridor restored (14 mins); Singtam Hospital access open (2/2).",
    deltas: {
      roads: [
        {
          id: "ROAD-NH10-S1",
          status: "Connected",
          reason: "BRO Clearance Complete — 2-Way Flow Restored",
          estimatedClearance: "Fully Clear & Monitored"
        }
      ],
      hospitals: [
        {
          id: "HOSP-002",
          roadAccess: "Open",
          status: "Operational"
        }
      ],
      routes: [
        {
          id: "ROUTE-02-AFFECTED",
          name: "Direct NH-10 Teesta Valley Highway (Restored)",
          type: "Primary",
          status: "Recommended",
          riskLevel: "Operational",
          traversesR17: false,
          origin: { name: "Singtam Base", lat: 27.2350, lng: 88.4980 },
          destination: { name: "STNM Hospital", lat: 27.3250, lng: 88.6080 },
          coordinates: DEMO_ROUTES[1].coordinates,
          distanceKm: 9.4,
          distance: "9.4 km",
          freeFlowEtaMin: 14,
          trafficAwareEtaMin: 14,
          trafficDelayMin: 0,
          eta: "14 mins",
          trafficLevel: "NORMAL",
          roadStatus: "OPEN",
          confidence: 0.98,
          source: "SIMULATED",
          hazardsAvoided: "Direct high-speed arterial corridor active"
        },
        {
          ...DEMO_ROUTES[0],
          type: "Alternative",
          status: "Available"
        },
        {
          ...DEMO_ROUTES[2],
          type: "Alternative",
          status: "Available"
        }
      ],
      highlightedResourceId: "RES-BRO-01"
    }
  }
};
