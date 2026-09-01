export const initialAlerts = [
  {
    id: "ALT-NER-8901",
    location: "Mangan District, North Sikkim",
    state: "Sikkim",
    coordinates: [27.5029, 88.5284],
    riskLevel: "Critical",
    riskScore: 94,
    rainfall72h: 218.4, // mm
    soilMoisture: 96.2, // %
    slopeAngle: 47.5, // degrees
    seismicActivity: "2.4 Richter micro-tremor detected",
    contributingFactors: [
      {
        factor: "Extreme Rainfall",
        detail: "218mm precipitation exceeding 99th percentile threshold",
        detailHi: "218 मिमी अत्यधिक वर्षा जो 99वें प्रतिशतक सीमा को पार कर चुकी है"
      },
      {
        factor: "Soil Liquefaction Risk",
        detail: "Pore water pressure exceeds critical shear resistance",
        detailHi: "मृदा जल दबाव सुरक्षित सीमा से अधिक"
      },
      {
        factor: "Steep Unconsolidated Slope",
        detail: "47.5° slope incline with fractured phyllite geology",
        detailHi: "47.5° तीव्र ढलान और कमजोर चट्टानी संरचना"
      },
      {
        factor: "Active Highway Severance",
        detail: "NH-10 corridor blocked by 400m debris flow",
        detailHi: "राष्ट्रीय राजमार्ग 10 पर 400 मीटर मलबा गिरने से मार्ग अवरुद्ध"
      }
    ],
    timestamp: "2026-09-01T11:45:00Z",
    status: "Active",
    affectedPopulation: 14200,
    roadStatus: "Blocked",
    assignedPriority: "Priority 1",
    recommendedAction: {
      en: "Immediate mandatory evacuation of Low-lying Chungthang & Dikchu belts; NDRF 12th Bn deployed with earthmovers.",
      hi: "चुंगथांग और डिकचू के निचले इलाकों को तुरंत खाली करने का आदेश; एनडीआरएफ की 12वीं बटालियन जेसीबी के साथ तैनात।"
    },
    guidance: {
      citizen: {
        en: [
          "Move immediately to designated relief shelters at Mangan Senior Secondary School.",
          "Avoid NH-10 road travel between Gangtok and Singtam.",
          "Stay clear of active stream beds and debris fans.",
          "Keep battery-powered radios tuned to All India Radio 102.4 FM."
        ],
        hi: [
          "तुरंत मंगन सीनियर सेकेंडरी स्कूल में बनाए गए राहत शिविर में जाएं।",
          "गंगटोक और सिंगतम के बीच एनएच-10 पर यात्रा करने से पूरी तरह बचें।",
          "नदी-नालों और मलबे के बहाव वाले क्षेत्रों से दूर रहें।",
          "आपातकालीन जानकारी के लिए आकाशवाणी 102.4 एफएम सुनें।"
        ]
      },
      fieldOfficer: {
        en: [
          "Establish secondary wireless mesh node at Dikchu bridgehead.",
          "Verify piezometer telemetry at slope sensor SIK-MN-04.",
          "Erect physical barricades at km marker 42 on NH-10.",
          "Liaison with BRO (Project Swastik) for heavy dozer transit."
        ],
        hi: [
          "डिकचू ब्रिजहेड पर बैकअप वायरलेस मेश नोड स्थापित करें।",
          "ढलान सेंसर SIK-MN-04 पर पीजोमीटर रीडिंग की पुष्टि करें।",
          "एनएच-10 के किमी 42 पर बैरिकेडिंग सुनिश्चित करें।",
          "भारी मशीनों के लिए बीआरओ (प्रोजेक्ट स्वास्तिक) से समन्वय करें।"
        ]
      },
      authority: {
        en: [
          "Requisition Indian Air Force MI-17 helicopter on standby at Bagdogra for air evacuation.",
          "Release district SDRF emergency relief reserve fund.",
          "Coordinate medical emergency bed surge at STNM Hospital Gangtok."
        ],
        hi: [
          "हवाई निकासी के लिए बागडोगरा में वायुसेना के एमआई-17 को स्टैंडबाय पर रखें।",
          "जिला आपदा राहत कोष से तत्काल आपातकालीन राशि जारी करें।",
          "एसटीएनएम अस्पताल गंगटोक में अतिरिक्त आपातकालीन बिस्तरों का समन्वय करें।"
        ]
      }
    },
    nearbyShelter: {
      name: "Mangan Government Secondary Relief Camp",
      capacity: 1200,
      occupied: 680,
      distanceKm: 3.2
    },
    nearestHospital: {
      name: "District Hospital Mangan",
      beds: 65,
      icuAvailable: 8,
      distanceKm: 4.1
    }
  },
  {
    id: "ALT-NER-8902",
    location: "Haflong Hill Sector, Dima Hasao",
    state: "Assam",
    coordinates: [25.1764, 93.0248],
    riskLevel: "Critical",
    riskScore: 91,
    rainfall72h: 194.2,
    soilMoisture: 93.8,
    slopeAngle: 41.2,
    seismicActivity: "None detected",
    contributingFactors: [
      {
        factor: "Heavy Torrential Rainfall",
        detail: "194mm continuous downpour over Barail mountain range",
        detailHi: "बराइल पर्वत श्रृंखला पर 194 मिमी निरंतर मूसलाधार बारिश"
      },
      {
        factor: "Railway Formation Settlement",
        detail: "Lumding-Badarpur hill track ballast washed out",
        detailHi: "लम्बडिंग-बदरपुर रेलवे ट्रैक का तटबंध क्षतिग्रस्त"
      },
      {
        factor: "High Colluvial Soil Thickness",
        detail: "Shallow slip surfaces detected on eastern embankment",
        detailHi: "पूर्वी तटबंध पर भूस्खलन की दरारें दर्ज"
      }
    ],
    timestamp: "2026-09-01T10:15:00Z",
    status: "Active",
    affectedPopulation: 9800,
    roadStatus: "Blocked",
    assignedPriority: "Priority 1",
    recommendedAction: {
      en: "Suspension of all Lumding-Badarpur train services; evacuation of Lower Haflong railway colony.",
      hi: "लम्बडिंग-बदरपुर रेल सेवाएं स्थगित; लोअर हाफलोंग रेलवे कॉलोनी को खाली करने के निर्देश।"
    },
    guidance: {
      citizen: {
        en: [
          "Evacuate hillside dwellings near Old Haflong road.",
          "Report any visible ground fissures or wall cracks to ward warden.",
          "Do not cross overflowing mountain culverts."
        ],
        hi: [
          "ओल्ड हाफलोंग रोड के पास पहाड़ी बस्तियों को तुरंत खाली करें।",
          "जमीन में दरार दिखने पर तुरंत वार्ड अधिकारी को सूचित करें।",
          "उफनते नालों या पुलियों को पार न करें।"
        ]
      },
      fieldOfficer: {
        en: [
          "Monitor track displacement laser sensors at Jatinga Lumpur.",
          "Deploy emergency sat-phone link to Dima Hasao DDMA.",
          "Clear drainage channels above Haflong circuit house."
        ],
        hi: [
          "जातिंगा लंपुर पर ट्रैक विस्थापन लेजर सेंसर की निगरानी करें।",
          "दीमा हसाओ डीडीएमए के साथ सैटेलाइट फोन संपर्क चालू करें।",
          "सर्किट हाउस के ऊपर बने जल निकासी नालों को साफ रखें।"
        ]
      },
      authority: {
        en: [
          "Order Indian Army 57 Mountain Division logistics aid.",
          "Open 4 additional community kitchen relief nodes in Haflong town."
        ],
        hi: [
          "सेना की 57 माउंटेन डिवीजन से रसद सहायता का अनुरोध करें।",
          "हाफलोंग शहर में 4 सामुदायिक राहत रसोई केंद्र शुरू करें।"
        ]
      }
    },
    nearbyShelter: {
      name: "Haflong Government College Relief Center",
      capacity: 1500,
      occupied: 420,
      distanceKm: 2.1
    },
    nearestHospital: {
      name: "Haflong Civil Hospital",
      beds: 120,
      icuAvailable: 12,
      distanceKm: 2.8
    }
  },
  {
    id: "ALT-NER-8903",
    location: "Hunthar Veng Ridge, Aizawl",
    state: "Mizoram",
    coordinates: [23.7271, 92.7176],
    riskLevel: "High",
    riskScore: 79,
    rainfall72h: 142.0,
    soilMoisture: 84.5,
    slopeAngle: 38.0,
    seismicActivity: "Normal baseline",
    contributingFactors: [
      {
        factor: "Continuous Moderate Rainfall",
        detail: "142mm rain causing slope water saturation",
        detailHi: "142 मिमी वर्षा के कारण ढलान पर अत्यधिक जल संचय"
      },
      {
        factor: "Urban Hill Surcharge",
        detail: "High-density multi-storey RC structures on steep slope",
        detailHi: "खड़ी ढलानों पर भारी बहुमंजिला इमारतों का दबाव"
      },
      {
        factor: "Drainage Backflow",
        detail: "Choked storm water culvert along Lengpui Airport corridor",
        detailHi: "लेंगपुई हवाई अड्डा मार्ग पर नाले का अवरुद्ध होना"
      }
    ],
    timestamp: "2026-09-01T09:30:00Z",
    status: "Active",
    affectedPopulation: 6500,
    roadStatus: "Partially Obstructed",
    assignedPriority: "Priority 2",
    recommendedAction: {
      en: "Restricted single-lane vehicular traffic on Lengpui road; night curfew on heavy multi-axle freight trucks.",
      hi: "लेंगपुई मार्ग पर एकतरफा यातायात; भारी मालवाहक ट्रकों पर रात्रि प्रतिबंध लागू।"
    },
    guidance: {
      citizen: {
        en: [
          "Inspect retaining walls for tilting or newly emerging seepage water.",
          "Store drinking water for 72 hours and secure essential documents."
        ],
        hi: [
          "घरों की सुरक्षा दीवारों (रिटेनिंग वॉल) में दरार या पानी रिसाव की जांच करें।",
          "72 घंटे के लिए पेयजल सुरक्षित रखें और आवश्यक दस्तावेज संभालें।"
        ]
      },
      fieldOfficer: {
        en: [
          "Install tilt-meter gauges on 6 identified high-risk residential blocks.",
          "Maintain clear drainage exits along NH-54 bypass."
        ],
        hi: [
          "पहचाने गए 6 संवेदनशील आवासीय ब्लॉकों पर टिल्ट-मीटर सेंसर लगाएं।",
          "एनएच-54 बाईपास पर पानी की निकासी सुचारू रखें।"
        ]
      },
      authority: {
        en: [
          "Keep SDRF Quick Reaction Team 3 on 15-minute standby.",
          "Prepare Aizawl Indoor Stadium for secondary shelter intake."
        ],
        hi: [
          "एसडीआरएफ क्विक रिएक्शन टीम 3 को 15 मिनट के स्टैंडबाय पर रखें।",
          "आइजोल इंडोर स्टेडियम को आश्रय स्थल के रूप में तैयार रखें।"
        ]
      }
    },
    nearbyShelter: {
      name: "Aizawl West Community Hall",
      capacity: 800,
      occupied: 110,
      distanceKm: 1.5
    },
    nearestHospital: {
      name: "Aizawl Civil Hospital",
      beds: 200,
      icuAvailable: 18,
      distanceKm: 3.5
    }
  },
  {
    id: "ALT-NER-8904",
    location: "Dzükou Valley Approach, Kohima",
    state: "Nagaland",
    coordinates: [25.6751, 94.1086],
    riskLevel: "High",
    riskScore: 74,
    rainfall72h: 128.6,
    soilMoisture: 79.1,
    slopeAngle: 36.4,
    seismicActivity: "Minor micro-seismic",
    contributingFactors: [
      {
        factor: "Monsoon Downpours",
        detail: "128mm rainfall saturated mountain topsoil",
        detailHi: "128 मिमी बारिश से ऊपरी मिट्टी पूरी तरह भीग चुकी है"
      },
      {
        factor: "NH-29 Bypass Landslide Zone",
        detail: "Active rockfall history at Pagala Pahar sector",
        detailHi: "पगला पहाड़ क्षेत्र में सक्रिय पत्थर गिरने का इतिहास"
      }
    ],
    timestamp: "2026-09-01T08:45:00Z",
    status: "Active",
    affectedPopulation: 4200,
    roadStatus: "Partially Obstructed",
    assignedPriority: "Priority 2",
    recommendedAction: {
      en: "Deploy JCB clearing units at Pagala Pahar stretch; enforce speed limits under 20 km/h.",
      hi: "पगला पहाड़ पर जेसीबी मशीनें तैनात; 20 किमी/घंटा से कम गति सीमा लागू।"
    },
    guidance: {
      citizen: {
        en: [
          "Avoid non-essential travel between Dimapur and Kohima after sunset.",
          "Keep vehicle headlights on low beam during dense fog & rain."
        ],
        hi: [
          "सूर्यास्त के बाद दीमापुर और कोहिमा के बीच अनावश्यक यात्रा से बचें।",
          "घने कोहरे और बारिश में वाहनों की लो-बीम लाइट का उपयोग करें।"
        ]
      },
      fieldOfficer: {
        en: [
          "Deploy drone reconnaissance over Dzükou canyon slopes.",
          "Verify communication repeaters on Mount Japfü."
        ],
        hi: [
          "द्ज़ुकोउ घाटी की ढलानों पर ड्रोन सर्वेक्षण करें।",
          "माउंट जपफू पर संचार रिपीटर की जांच करें।"
        ]
      },
      authority: {
        en: [
          "Pre-position BRO clearing equipment at Jotsoma check-post."
        ],
        hi: [
          "जोत्सोमा चेक-पोस्ट पर बीआरओ की मशीनें पहले से तैनात रखें।"
        ]
      }
    },
    nearbyShelter: {
      name: "Kohima Indoor Sports Complex Relief Shelter",
      capacity: 950,
      occupied: 85,
      distanceKm: 4.8
    },
    nearestHospital: {
      name: "Naga Hospital Authority Kohima (NHAK)",
      beds: 180,
      icuAvailable: 14,
      distanceKm: 5.2
    }
  },
  {
    id: "ALT-NER-8905",
    location: "Noney - Tupul Sector, Noney District",
    state: "Manipur",
    coordinates: [24.8197, 93.6372],
    riskLevel: "Moderate",
    riskScore: 58,
    rainfall72h: 88.5,
    soilMoisture: 68.2,
    slopeAngle: 32.8,
    seismicActivity: "None",
    contributingFactors: [
      {
        factor: "Moderate Rainfall",
        detail: "Intermittent rain showers across Ijei river basin",
        detailHi: "इजेई नदी घाटी में रुक-रुक कर मध्यम वर्षा"
      },
      {
        factor: "Cut-slope excavation works",
        detail: "Ongoing road widening slopes stabilized by wire-mesh only",
        detailHi: "सड़क चौड़ीकरण कार्य के कारण अस्थायी रूप से खुली ढलानें"
      }
    ],
    timestamp: "2026-09-01T07:15:00Z",
    status: "Monitoring",
    affectedPopulation: 3100,
    roadStatus: "Open",
    assignedPriority: "Priority 3",
    recommendedAction: {
      en: "Regular 3-hourly visual patrols by PWD engineers along NH-37.",
      hi: "एनएच-37 पर पीडब्ल्यूडी इंजीनियरों द्वारा हर 3 घंटे में नियमित गश्त।"
    },
    guidance: {
      citizen: {
        en: ["Stay updated via local disaster management WhatsApp broadcast."],
        hi: ["स्थानीय आपदा प्रबंधन समूह के माध्यम से जानकारी प्राप्त करते रहें।"]
      },
      fieldOfficer: {
        en: ["Check wire-mesh rockfall barriers near Tupul bridge."],
        hi: ["टुपुल पुल के पास रॉकफॉल वायर-मेश की स्थिति की जांच करें।"]
      },
      authority: {
        en: ["Maintain log of earthmoving equipment in Noney division."],
        hi: ["नोनी डिवीजन में जेसीबी और अर्थमूवर मशीनों की उपलब्धता दर्ज रखें।"]
      }
    },
    nearbyShelter: {
      name: "Noney Community Multi-Purpose Hall",
      capacity: 600,
      occupied: 0,
      distanceKm: 3.0
    },
    nearestHospital: {
      name: "Noney Primary Health Center",
      beds: 30,
      icuAvailable: 2,
      distanceKm: 3.5
    }
  },
  {
    id: "ALT-NER-8906",
    location: "Kurung Kumey Hills, Koloriang",
    state: "Arunachal Pradesh",
    coordinates: [27.9048, 93.3482],
    riskLevel: "Low",
    riskScore: 32,
    rainfall72h: 42.0,
    soilMoisture: 48.0,
    slopeAngle: 28.5,
    seismicActivity: "None",
    contributingFactors: [
      {
        factor: "Light Rainfall",
        detail: "Standard seasonal showers well below saturation thresholds",
        detailHi: "सामान्य मौसमी वर्षा जो खतरे के स्तर से काफी नीचे है"
      }
    ],
    timestamp: "2026-09-01T06:00:00Z",
    status: "Monitoring",
    affectedPopulation: 1800,
    roadStatus: "Open",
    assignedPriority: "Priority 3",
    recommendedAction: {
      en: "Standard monitoring; sensors functioning normally in green operational band.",
      hi: "सामान्य निगरानी; सभी सेंसर सामान्य परिचालन स्थिति में हैं।"
    },
    guidance: {
      citizen: {
        en: ["Normal agricultural and commercial activities permitted."],
        hi: ["सामान्य कृषि एवं व्यावसायिक गतिविधियां जारी रखी जा सकती हैं।"]
      },
      fieldOfficer: {
        en: ["Perform scheduled solar battery maintenance on telemetry station."],
        hi: ["टेलीमेट्री स्टेशन की सौर बैटरियों का नियमित रखरखाव पूरा करें।"]
      },
      authority: {
        en: ["Routine telemetry data sync with central NER cloud node."],
        hi: ["केंद्रीय एनईआर क्लाउड नोड के साथ नियमित डेटा सिंक बनाए रखें।"]
      }
    },
    nearbyShelter: {
      name: "Koloriang Town Relief Shed",
      capacity: 400,
      occupied: 0,
      distanceKm: 1.8
    },
    nearestHospital: {
      name: "Koloriang Community Health Center",
      beds: 25,
      icuAvailable: 1,
      distanceKm: 2.0
    }
  }
];
