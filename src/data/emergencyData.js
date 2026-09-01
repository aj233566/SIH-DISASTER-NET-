export const initialEmergencyAreas = [
  {
    id: "EMP-001",
    location: "Mangan Sub-division & Chungthang Corridor",
    district: "Mangan",
    state: "Sikkim",
    coordinates: [27.5029, 88.5284],
    priorityQueue: "Priority 1", // Priority 1 | Priority 2 | Priority 3
    priorityRank: 1,
    riskScore: 94,
    riskLevel: "Critical",
    affectedPopulation: 14200,
    vulnerablePopulation: 3400, // elderly, children, patients
    roadStatus: "Blocked", // Blocked | Partially Obstructed | Open
    roadDetails: {
      en: "NH-10 blocked at 3 key landslide locations between km 38 and 44",
      hi: "किमी 38 से 44 के बीच 3 स्थानों पर एनएच-10 मार्ग पूरी तरह अवरुद्ध"
    },
    nearestHospital: {
      name: "District Hospital Mangan",
      distanceKm: 4.1,
      totalBeds: 65,
      availableBeds: 18,
      icuAvailable: 4
    },
    nearestShelter: {
      name: "Mangan Senior Secondary Relief Camp",
      distanceKm: 3.2,
      capacity: 1200,
      occupied: 680,
      foodSupplyDays: 5
    },
    availableResources: {
      assignedTeams: ["NDRF Team Alpha (12 Bn)", "SDRF Sikkim Quick Response Unit 1"],
      ambulances: 4,
      earthmovers: 3,
      medicalOfficers: 6
    },
    responseStatus: "In Transit", // Standby | In Transit | On Scene | Completed
    lastActionTimestamp: "2026-09-01T11:50:00Z"
  },
  {
    id: "EMP-002",
    location: "Haflong Hill Section & Railway Settlement",
    district: "Dima Hasao",
    state: "Assam",
    coordinates: [25.1764, 93.0248],
    priorityQueue: "Priority 1",
    priorityRank: 2,
    riskScore: 91,
    riskLevel: "Critical",
    affectedPopulation: 9800,
    vulnerablePopulation: 2100,
    roadStatus: "Blocked",
    roadDetails: {
      en: "Haflong-Mahur road severed by debris flow; rail link severed",
      hi: "मलबे के बहाव से हाफलोंग-माहूर मार्ग और रेलवे लाइन बाधित"
    },
    nearestHospital: {
      name: "Haflong Civil Hospital",
      distanceKm: 2.8,
      totalBeds: 120,
      availableBeds: 34,
      icuAvailable: 8
    },
    nearestShelter: {
      name: "Haflong Government College Relief Center",
      distanceKm: 2.1,
      capacity: 1500,
      occupied: 420,
      foodSupplyDays: 7
    },
    availableResources: {
      assignedTeams: ["NDRF Team Charlie (1st Bn)", "Assam Rifles Support Group"],
      ambulances: 6,
      earthmovers: 4,
      medicalOfficers: 8
    },
    responseStatus: "On Scene",
    lastActionTimestamp: "2026-09-01T11:10:00Z"
  },
  {
    id: "EMP-003",
    location: "Hunthar Veng Ridge, Aizawl North",
    district: "Aizawl",
    state: "Mizoram",
    coordinates: [23.7271, 92.7176],
    priorityQueue: "Priority 2",
    priorityRank: 3,
    riskScore: 79,
    riskLevel: "High",
    affectedPopulation: 6500,
    vulnerablePopulation: 1200,
    roadStatus: "Partially Obstructed",
    roadDetails: {
      en: "Lengpui road single-lane transit only; heavy vehicles diverted",
      hi: "लेंगपुई मार्ग पर एकतरफा आवागमन; भारी वाहनों का मार्ग परिवर्तित"
    },
    nearestHospital: {
      name: "Aizawl Civil Hospital",
      distanceKm: 3.5,
      totalBeds: 200,
      availableBeds: 62,
      icuAvailable: 12
    },
    nearestShelter: {
      name: "Aizawl West Community Hall",
      distanceKm: 1.5,
      capacity: 800,
      occupied: 110,
      foodSupplyDays: 4
    },
    availableResources: {
      assignedTeams: ["Mizoram SDRF Team 2"],
      ambulances: 3,
      earthmovers: 2,
      medicalOfficers: 4
    },
    responseStatus: "On Scene",
    lastActionTimestamp: "2026-09-01T10:00:00Z"
  },
  {
    id: "EMP-004",
    location: "Pagala Pahar NH-29 Corridor",
    district: "Kohima",
    state: "Nagaland",
    coordinates: [25.6751, 94.1086],
    priorityQueue: "Priority 2",
    priorityRank: 4,
    riskScore: 74,
    riskLevel: "High",
    affectedPopulation: 4200,
    vulnerablePopulation: 650,
    roadStatus: "Partially Obstructed",
    roadDetails: {
      en: "Intermittent rockfall debris on single lane; BRO clearance active",
      hi: "सड़क पर रुक-रुक कर पत्थर गिरने की घटना; बीआरओ द्वारा मलबा हटाना जारी"
    },
    nearestHospital: {
      name: "Naga Hospital Authority Kohima",
      distanceKm: 5.2,
      totalBeds: 180,
      availableBeds: 45,
      icuAvailable: 10
    },
    nearestShelter: {
      name: "Kohima Indoor Sports Complex Relief Shelter",
      distanceKm: 4.8,
      capacity: 950,
      occupied: 85,
      foodSupplyDays: 6
    },
    availableResources: {
      assignedTeams: ["BRO Project Sewak Taskforce", "Nagaland Police QRT"],
      ambulances: 2,
      earthmovers: 3,
      medicalOfficers: 3
    },
    responseStatus: "On Scene",
    lastActionTimestamp: "2026-09-01T09:15:00Z"
  },
  {
    id: "EMP-005",
    location: "Tupul River Bank & Railway Subgrade",
    district: "Noney",
    state: "Manipur",
    coordinates: [24.8197, 93.6372],
    priorityQueue: "Priority 3",
    priorityRank: 5,
    riskScore: 58,
    riskLevel: "Moderate",
    affectedPopulation: 3100,
    vulnerablePopulation: 400,
    roadStatus: "Open",
    roadDetails: {
      en: "NH-37 open with continuous safety escorts and warning signs",
      hi: "एनएच-37 खुला है; सुरक्षा निगरानी और चेतावनी बोर्ड लगाए गए हैं"
    },
    nearestHospital: {
      name: "Noney Primary Health Center",
      distanceKm: 3.5,
      totalBeds: 30,
      availableBeds: 14,
      icuAvailable: 2
    },
    nearestShelter: {
      name: "Noney Community Multi-Purpose Hall",
      distanceKm: 3.0,
      capacity: 600,
      occupied: 0,
      foodSupplyDays: 3
    },
    availableResources: {
      assignedTeams: ["Local PWD Road Inspection Unit"],
      ambulances: 1,
      earthmovers: 1,
      medicalOfficers: 2
    },
    responseStatus: "Standby",
    lastActionTimestamp: "2026-09-01T08:00:00Z"
  },
  {
    id: "EMP-006",
    location: "Koloriang Valley Highway Stretch",
    district: "Kurung Kumey",
    state: "Arunachal Pradesh",
    coordinates: [27.9048, 93.3482],
    priorityQueue: "Priority 3",
    priorityRank: 6,
    riskScore: 32,
    riskLevel: "Low",
    affectedPopulation: 1800,
    vulnerablePopulation: 180,
    roadStatus: "Open",
    roadDetails: {
      en: "Normal transit conditions; no slope shifts observed",
      hi: "सामान्य यातायात स्थिति; कोई भूस्खलन नहीं देखा गया"
    },
    nearestHospital: {
      name: "Koloriang Community Health Center",
      distanceKm: 2.0,
      totalBeds: 25,
      availableBeds: 16,
      icuAvailable: 1
    },
    nearestShelter: {
      name: "Koloriang Town Relief Shed",
      distanceKm: 1.8,
      capacity: 400,
      occupied: 0,
      foodSupplyDays: 5
    },
    availableResources: {
      assignedTeams: ["Arunachal Emergency Patrol 4"],
      ambulances: 1,
      earthmovers: 0,
      medicalOfficers: 2
    },
    responseStatus: "Standby",
    lastActionTimestamp: "2026-09-01T06:30:00Z"
  }
];
