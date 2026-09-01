# CASCADE-NET — AI-Enabled Early Warning & Emergency Response Platform
> **North Eastern Region (NER) Disaster Risk Reduction & Mitigation Command Center**  
> *Smart India Hackathon (SIH) Project*

---

## 📌 Module Overview — Assigned to Divya (Frontend Specialist)

This repository contains the official frontend implementation of the **Early Warning, Multilingual Notifications, and Emergency Response Prioritisation** subsystem of **CASCADE-NET**, developed using **React.js, Vite, Bootstrap Grid, and Vanilla CSS** following the **Midnight Operations** design system.

### Key Responsibilities Implemented:
1. **Early Warning & Geotechnical Alert System**
   - Ingestion and threshold-based classification into **Low**, **Moderate**, **High**, and **Critical** risk levels.
   - Comprehensive telemetry displays: 72h cumulative rainfall (mm), soil moisture saturation (%), slope incline angle (°), and micro-seismic activity.
   - Dynamic role-based operational guidance:
     - **Citizen**: Evacuation advisories, safety checklists, emergency helplines (1070 / 112), and designated relief shelter locations.
     - **Field Officer**: Ground sensor checks, piezometer readings, wireless repeaters, and road barricades.
     - **Authority**: High-level command directives, air evacuation standby, and multi-district emergency funding.
   - Interactive `ThresholdSimulator` for calibrating trigger thresholds and simulating real-time rainfall spikes.

2. **Multilingual Notifications (English + Hindi)**
   - Context-driven dynamic language switching via `LanguageContext`.
   - Comprehensive translation dictionaries covering all UI labels, alert banners, risk descriptions, table headers, and role advisories.
   - Multi-channel notification hub: **In-App Alerts**, **Browser Push Notifications**, **SMS Gateway (TRAI DLT Template compliant architecture)**, and **Email Emergency Dispatch**.
   - Safe browser push permission handling with audio alert cues.

3. **Emergency Response Prioritisation**
   - Automated mathematical ranking matrix:
     $$\text{Priority Score} = (\text{Risk Score} \times 0.40) + (\text{Population Impact} \times 0.25) + (\text{Road Obstruction} \times 0.20) + (\text{Resource Deficit} \times 0.15)$$
   - Segmented into three operational response queues:
     - **Priority 1**: Immediate Evacuation & Rapid Dispatch (Life-Threatening / Cut-off).
     - **Priority 2**: High Risk / Active Evacuation.
     - **Priority 3**: Continuous Ground Monitoring & Preparedness.
   - Interactive Kanban boards, Tabular Incident Matrix, and React-Leaflet GIS spatial map.
   - Incident Commander Quick Response Unit Deployment workflow with real-time asset deduction.

---

## 🛠️ Official Frontend Technology Stack

- **Framework**: React.js (v18+)
- **Build Tool**: Vite
- **Layout & Responsiveness**: Bootstrap Grid (`bootstrap/dist/css/bootstrap-grid.min.css`)
- **Visual Design**: Vanilla CSS utilizing CSS Custom Properties (`var(--...)`)
- **Client Routing**: React Router DOM (v6+)
- **GIS Mapping**: Leaflet & React-Leaflet
- **Iconography**: Lucide React
- **API Client**: Axios (REST API ready with mock fallback)

---

## 🎨 Midnight Operations Color Palette

| Token | Hex Value | Semantic Usage |
| :--- | :--- | :--- |
| `--bg-primary` | `#101416` | Main application canvas background |
| `--bg-secondary` | `#171C1F` | Sidebar, top navigation bar, table headers |
| `--card` | `#1D2427` | Operational panels, alert cards, response cards |
| `--elevated` | `#242D31` | Hover states, active controls, simulation boxes |
| `--border` | `#303B40` | Subtle industrial dividers and card outlines |
| `--critical` | `#D64545` | Critical severity alerts, Priority 1 tags, road blockage |
| `--high-risk` | `#D97732` | High-risk alerts, Priority 2 tags |
| `--warning` | `#C9A227` | Moderate risk badges, Priority 3 tags, single-lane roads |
| `--safe` | `#3D8B63` | Operational status indicators, clear roads, safe shelters |
| `--info` | `#4F7C8A` | Secondary action buttons, telemetry gauges, icons |
| `--text-primary` | `#F2F4F5` | Primary headings, numerical telemetry values |
| `--text-secondary` | `#B6C0C4` | Descriptions, advisories, metadata |
| `--text-muted` | `#7F8A8F` | Eyebrows, timestamps, coordinates |

---

## 📂 Project Directory Structure

```
resources-module/
├── index.html                      # HTML entry point with Leaflet styling
├── package.json                    # Dependencies and npm scripts
├── vite.config.js                  # Vite configuration with React plugin
├── public/                         # Static assets and icons
└── src/
    ├── main.jsx                    # React root rendering
    ├── App.jsx                     # Layout shell, Router & Context providers
    ├── context/
    │   ├── LanguageContext.jsx     # Multilingual switching (EN & HI)
    │   ├── AlertContext.jsx        # Alert state, thresholds & simulation
    │   └── RoleContext.jsx         # Role perspectives (Citizen/Officer/Authority)
    ├── services/
    │   ├── api.js                  # Axios client & REST endpoints
    │   ├── notificationService.js  # Browser notification API & audio cue
    │   └── riskEngine.js           # Priority scoring algorithm
    ├── data/
    │   ├── alerts.js               # Geotechnical mock data across NER
    │   ├── notifications.js        # Multi-channel notification feeds
    │   ├── emergencyData.js        # Prioritised affected zones
    │   ├── resourcesData.js        # Emergency fleet & facility inventory
    │   └── locales/
    │       ├── en.js               # English translation dictionary
    │       └── hi.js               # Hindi translation dictionary
    ├── components/
    │   ├── common/                 # Sidebar, TopBar, LanguageSwitcher, RoleSwitcher, Modal
    │   ├── alerts/                 # AlertPanel, AlertCard, AlertList, AlertDetails, Badges
    │   ├── notifications/          # NotificationCenter, NotificationCard, Bell, ChannelConfig
    │   ├── emergency/              # EmergencyPriority, PriorityQueue, Table, ResourceStatus, GISMap
    │   ├── overview/               # OperationalOverview dashboard
    │   └── resources/              # ResourceManagement directory
    ├── pages/                      # Route views (/alerts, /emergency, /notifications, /resources)
    └── styles/                     # Midnight Operations modular stylesheets
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
```

---

## 🤝 Team Integration Points

- **Rudra (AI Risk Engine)**: Consumes composite risk scores, soil moisture %, and slope stability models into `src/data/alerts.js` & `AlertContext.jsx`.
- **Sampad (GIS Specialist)**: Supplies geographic coordinates, road obstruction vectors, and shelter pins into `src/components/emergency/GISMap.jsx`.
- **Abhijett (Backend Developer)**: Configured REST endpoints (`/api/alerts`, `/api/notifications`, `/api/emergency-priority`) in `src/services/api.js`.
- **Jeewansh (Command Dashboard)**: Reusable components can be directly embedded into the unified operations portal.

---

## 📜 License
Developed for the **Smart India Hackathon (SIH)** — Team CASCADE-NET.
