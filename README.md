# CASCADE-NET

### AI-Enabled Early Warning, Landslide Risk Monitoring & Emergency Response Platform for North Eastern Region (NER)

> **SIH 2026 \| Problem Statement: SIH26001 \| Theme: Disaster
> Management \| Organization: Ministry of Development of North Eastern
> Region (MDoNER)**

CASCADE-NET is a disaster decision-support platform designed for the
North Eastern Region of India. It connects citizen observations, weather
and hazard information, explainable risk analysis, GIS visualization,
alerts, incident management, and emergency-response workflows into a
single system.

The platform is designed around the operational cycle:

**Detect → Enrich → Score → Assess → Act → Verify → Learn**

The goal is not simply to display disaster information, but to connect
**detection with the next responsible action**.

------------------------------------------------------------------------

## Table of Contents

-   [Problem](#problem)
-   [Solution](#solution)
-   [Key Features](#key-features)
-   [User Roles](#user-roles)
-   [End-to-End Workflow](#end-to-end-workflow)
-   [System Architecture](#system-architecture)
-   [Technology Stack](#technology-stack)
-   [GIS & Mapping](#gis--mapping)
-   [Risk Intelligence](#risk-intelligence)
-   [Incident Reporting](#incident-reporting)
-   [Weather Intelligence](#weather-intelligence)
-   [Alerts & Notifications](#alerts--notifications)
-   [Emergency Response](#emergency-response)
-   [Authentication & Authorization](#authentication--authorization)
-   [Database](#database)
-   [Project Structure](#project-structure)
-   [API Overview](#api-overview)
-   [Installation & Local Setup](#installation--local-setup)
-   [Environment Variables](#environment-variables)
-   [Running the Application](#running-the-application)
-   [Production Architecture](#production-architecture)
-   [Scalability](#scalability)
-   [Security](#security)
-   [Current Prototype Status](#current-prototype-status)
-   [Known Limitations](#known-limitations)
-   [Future Roadmap](#future-roadmap)
-   [Why CASCADE-NET](#why-cascade-net)
-   [Why Team Nirvana](#why-team-nirvana)
-   [Why This Approach](#why-this-approach)
-   [SIH Demo Flow](#sih-demo-flow)
-   [Team](#team)
-   [Contributing](#contributing)
-   [License](#license)

------------------------------------------------------------------------

## Problem

The North Eastern Region of India contains mountainous terrain, steep
slopes, heavy rainfall zones, landslide-prone corridors, vulnerable
roads, settlements and critical infrastructure.

During a disaster, useful information can exist in separate systems:

-   Weather and rainfall data
-   Terrain and slope information
-   Historical disaster information
-   Citizen observations
-   Field reports
-   Road conditions
-   Hospitals and shelters
-   Emergency resources
-   Authority alerts

A major challenge is turning these separate signals into an actionable
operational picture.

CASCADE-NET addresses this gap by creating a common workflow where:

1.  A hazard or incident is detected or reported.
2.  The location and surrounding context are enriched.
3.  Risk is calculated using explainable factors.
4.  Authorities receive an operational view.
5.  GIS shows the affected area and relevant infrastructure.
6.  Citizens receive localized information and warnings.
7.  Emergency response can be prioritized.
8.  Incidents can be verified and tracked through resolution.

------------------------------------------------------------------------

## Solution

CASCADE-NET combines a citizen-facing safety interface with an authority
command center and administrative governance.

### Citizen side

Citizens can:

-   Create an account and log in.
-   View localized risk information.
-   View weather conditions and forecast.
-   View nearby hazards and incidents.
-   View road-status information.
-   Report landslides and other disaster incidents.
-   Capture GPS coordinates.
-   Attach photo/video evidence.
-   Track submitted incidents.
-   Receive authority notifications.
-   Access emergency helplines.
-   Find nearby shelters and hospitals.
-   Use the live safety map.
-   Use location-aware emergency controls.

### Authority side

Authorities can:

-   Monitor incidents through GIS.
-   Review risk information.
-   Inspect incident severity and evidence.
-   Track incident status.
-   View alerts.
-   Broadcast notifications.
-   Review emergency priorities.
-   View response resources.
-   Analyze weather-linked risk.
-   Use operational map layers.
-   Support emergency response decisions.

### Admin side

Administrators provide governance by:

-   Reviewing authority applications.
-   Approving or rejecting authority accounts.
-   Controlling which users are allowed to operate as authorities.
-   Viewing authority-related statistics and verification state.

------------------------------------------------------------------------

# Key Features

## 1. Role-Based Disaster Platform

The application provides separate experiences for:

  Role        Primary Purpose
  ----------- ------------------------------------------
  Citizen     Awareness, reporting and personal safety
  Authority   Verification, monitoring and response
  Admin       Governance and authority verification

Different roles do not receive the same control surface.

**Citizen → Report & Stay Safe**

**Authority → Verify & Respond**

**Admin → Govern & Control Access**

------------------------------------------------------------------------

## 2. Live GIS Safety Map

The GIS interface is the geographical core of CASCADE-NET.

It can visualize:

-   Citizen incidents
-   Landslide hazards
-   Risk zones
-   Road conditions
-   Hospitals
-   Shelters
-   Emergency resources
-   Emergency routes
-   External hazard layers
-   Citizen location

The map is implemented using Leaflet/React Leaflet and
OpenStreetMap-based mapping.

The citizen map also supports location-aware behavior:

``` text
Citizen GPS
    ↓
Current position
    ↓
Nearby incidents
    ↓
Nearby facilities
    ↓
Safety guidance
```

------------------------------------------------------------------------

## 3. Citizen Incident Reporting

Citizens can report:

-   Landslide
-   Flash flood
-   Road blockage
-   Slope crack
-   Slope movement
-   Infrastructure damage

Reports can include:

-   Incident type
-   Description
-   Severity
-   Latitude
-   Longitude
-   Address when available
-   Photo/video evidence
-   Reporter information

The objective is to convert observations from the ground into structured
operational data.

------------------------------------------------------------------------

## 4. Incident Lifecycle

Incidents are intended to move through a controlled lifecycle:

``` text
Submitted
    ↓
Verified
    ↓
In Progress
    ↓
Resolved
```

This creates a distinction between:

**Citizen-reported information**

and

**Authority-verified operational information**

That distinction is important for disaster-management systems because an
unverified report should not automatically become an official warning.

------------------------------------------------------------------------

## 5. Weather Intelligence

CASCADE-NET integrates weather information into its risk workflow.

The weather module supports:

-   Current temperature
-   Weather condition
-   Rainfall
-   Humidity
-   Wind information
-   Daily forecast
-   Five-day forecast
-   Weather-linked risk interpretation

Weather data can be used as one of the risk contributors rather than
being treated as the only source of risk.

------------------------------------------------------------------------

## 6. Explainable Risk Engine

The prototype uses a weighted, explainable rule-based risk engine.

Example concept:

``` text
Weather / Rainfall
        +
Recent Incidents
        +
Terrain / Slope Context
        +
Infrastructure Conditions
        +
Hazard Context
        ↓
Risk Score
        ↓
Risk Level
```

Risk levels:

-   LOW
-   MODERATE
-   HIGH
-   CRITICAL

The system can expose the major contributors behind a score.

For example:

``` text
Risk Score: 72 / 100

Risk Level: HIGH

Major contributors:
• Heavy rainfall
• Recent slope movement
• High incident density
• Vulnerable terrain
```

This makes the result easier for an authority to understand and
challenge.

------------------------------------------------------------------------

## 7. Optional AI Assessment

The architecture supports an optional Gemini-based AI assessment layer.

The AI layer can provide:

-   Risk interpretation
-   Confidence
-   Explanation
-   Recommendations
-   Natural-language safety guidance

The rule-based baseline remains important.

If the AI provider is unavailable or not configured, the system can
retain the baseline assessment rather than requiring the entire risk
workflow to fail.

### Important design principle

AI output is **decision support**, not an autonomous official evacuation
order.

Official warnings and response decisions should remain under the
appropriate authority.

------------------------------------------------------------------------

## 8. Hazard Enrichment

The backend architecture supports external hazard/context sources such
as:

-   Open-Meteo weather information
-   USGS earthquake information
-   NASA FIRMS fire hotspots
-   GNews-based context
-   Routing services where configured

External feeds are treated as enrichment sources for the risk and
operational workflow.

------------------------------------------------------------------------

## 9. Authority Alerts

The authority side can work with risk alerts containing:

-   Severity
-   Risk score
-   Risk level
-   Contributors
-   Recommendations
-   AI confidence when available
-   Location
-   Alert status

This allows the operational team to distinguish important events from
normal background conditions.

------------------------------------------------------------------------

## 10. Notifications

CASCADE-NET supports notification delivery through:

-   In-app notifications
-   Browser notifications

Authority broadcasts can contain:

-   Title
-   Message
-   Type
-   Target audience
-   Delivery state

Citizens can receive relevant authority communication through the
platform.

------------------------------------------------------------------------

## 11. Emergency Response Prioritization

The emergency module is designed to help authorities answer:

> Which affected area should receive attention first?

Priority can consider factors such as:

-   Risk level
-   Incident severity
-   Affected area
-   Road accessibility
-   Available resources
-   Emergency response requirements

The intended workflow is:

``` text
Active Incidents
      ↓
Risk / Impact Assessment
      ↓
Priority Queue
      ↓
Response Unit Assignment
      ↓
Status Tracking
```

------------------------------------------------------------------------

## 12. Resources & Logistics

The operations layer is designed to provide visibility into:

-   Emergency resources
-   Resource availability
-   Deployed resources
-   Response units
-   Shelters
-   Hospitals
-   Other emergency facilities

This allows the command center to connect a detected problem with
available response capacity.

------------------------------------------------------------------------

## 13. Citizen Safety Controls

The citizen GIS provides action-first controls such as:

-   Call 112
-   Report an incident
-   Locate me
-   I'm safe
-   Show danger
-   Safe route
-   Find shelter
-   Find hospital
-   Directions
-   Safety tips

The purpose is to minimize the number of decisions a citizen needs to
make during a stressful situation.

------------------------------------------------------------------------

# User Roles

## Citizen

The citizen experience focuses on:

``` text
Awareness
   ↓
Report
   ↓
Receive Warning
   ↓
Understand Local Risk
   ↓
Reach Safety
```

## Authority

The authority experience focuses on:

``` text
Monitor
   ↓
Verify
   ↓
Prioritize
   ↓
Deploy
   ↓
Resolve
```

## Admin

The admin experience focuses on:

``` text
Verify Authority
   ↓
Control Access
   ↓
Maintain Governance
```

------------------------------------------------------------------------

# End-to-End Workflow

The complete CASCADE-NET operational loop is:

``` text
┌───────────────────────────────────────────┐
│ 1. SENSE / REPORT                         │
│ Weather + hazards + citizen reports       │
└────────────────────┬──────────────────────┘
                     ↓
┌───────────────────────────────────────────┐
│ 2. ENRICH                                  │
│ Coordinates + nearby hazards + context     │
└────────────────────┬──────────────────────┘
                     ↓
┌───────────────────────────────────────────┐
│ 3. SCORE                                   │
│ Explainable risk engine                    │
└────────────────────┬──────────────────────┘
                     ↓
┌───────────────────────────────────────────┐
│ 4. ASSESS                                  │
│ Optional AI explanation / confidence       │
└────────────────────┬──────────────────────┘
                     ↓
┌───────────────────────────────────────────┐
│ 5. ACT                                     │
│ Alert + GIS + notification + response      │
└────────────────────┬──────────────────────┘
                     ↓
┌───────────────────────────────────────────┐
│ 6. VERIFY / CLOSE                          │
│ Authority verification and resolution      │
└────────────────────┬──────────────────────┘
                     ↓
┌───────────────────────────────────────────┐
│ 7. LEARN                                   │
│ Store outcomes and improve the system      │
└───────────────────────────────────────────┘
```

------------------------------------------------------------------------

# System Architecture

``` text
                     ┌──────────────────────┐
                     │       Citizens       │
                     │  Report / Awareness  │
                     └──────────┬───────────┘
                                │
                     ┌──────────▼───────────┐
                     │    React + Vite      │
                     │ Citizen / Authority  │
                     │       / Admin        │
                     └──────────┬───────────┘
                                │
                           REST / JSON
                                │
                     ┌──────────▼───────────┐
                     │ Node.js + Express    │
                     │                      │
                     │ Auth                 │
                     │ Incidents            │
                     │ Risk                 │
                     │ Weather              │
                     │ Alerts               │
                     │ Notifications        │
                     │ Resources            │
                     │ Emergency Operations │
                     └──────┬───────┬───────┘
                            │       │
                  ┌─────────▼───┐   └──────────────────┐
                  │ MongoDB     │                      │
                  │ + Mongoose  │                      │
                  └─────────────┘                      │
                                                       │
              ┌────────────────────────────────────────┤
              │                                        │
       ┌──────▼──────┐ ┌──────────┐ ┌────────────┐ ┌──▼──────────┐
       │ Open-Meteo  │ │   USGS   │ │ NASA FIRMS │ │   Routing   │
       │ Weather     │ │ Hazards  │ │ Fire Data  │ │   Service   │
       └─────────────┘ └──────────┘ └────────────┘ └─────────────┘
                                │
                         ┌──────▼──────┐
                         │ Optional AI │
                         │ Assessment  │
                         └─────────────┘
```

------------------------------------------------------------------------

# Technology Stack

## Frontend

-   React.js
-   Vite
-   React Router
-   Bootstrap Grid
-   Vanilla CSS
-   React Leaflet
-   Leaflet
-   Axios
-   Recharts / Chart.js where used
-   Lucide React where used

Bootstrap is primarily used for responsive layout.

Custom Vanilla CSS provides the CASCADE-NET visual identity.

------------------------------------------------------------------------

## Backend

-   Node.js
-   Express.js
-   REST APIs
-   Axios
-   JWT
-   bcrypt / bcryptjs
-   dotenv
-   CORS
-   Multer where applicable

------------------------------------------------------------------------

## Database

-   MongoDB
-   MongoDB Atlas
-   Mongoose

Core domain entities include:

-   Users
-   Incidents
-   Alerts
-   Notifications
-   Resources
-   Facilities
-   Shelters
-   Hospitals
-   Simulations / operational data

------------------------------------------------------------------------

## GIS

-   Leaflet
-   React Leaflet
-   OpenStreetMap
-   GeoJSON where applicable
-   Browser Geolocation API

The GIS layer is designed to support incidents, risk areas, roads,
facilities, resources and emergency routes.

------------------------------------------------------------------------

# GIS & Mapping

The GIS system separates:

### Base map

The geographical background used for navigation.

### Operational layers

Examples include:

-   Incidents
-   Risk zones
-   Roads
-   Hospitals
-   Shelters
-   Resources
-   External hazard layers

### Citizen-specific map

Citizens receive a simplified action-oriented map.

``` text
Citizen Location
      +
Nearby Hazards
      +
Nearby Incidents
      +
Nearby Facilities
      +
Safe Route
      ↓
Citizen Safety View
```

When real GPS is available, the citizen location is used for local map
context. A controlled Sikkim scenario can also be used for demonstration
purposes.

------------------------------------------------------------------------

# Risk Intelligence

The prototype deliberately avoids requiring large local model training.

The architecture is:

``` text
Input Data
   ↓
Validation
   ↓
Normalization
   ↓
Feature / Hazard Enrichment
   ↓
Weighted Risk Calculation
   ↓
Risk Score
   ↓
Risk Level
   ↓
Top Contributors
   ↓
Optional AI Assessment
```

### Why explainable rules?

For an early-warning prototype, an authority should be able to
understand why the system produced a result.

Instead of:

``` text
AI says: HIGH
```

the system should communicate:

``` text
HIGH RISK

Score: 78

Contributors:
• Heavy rainfall
• Recent slope movement
• Multiple nearby reports
• Vulnerable terrain

Recommendation:
Increase monitoring and follow authority procedures.
```

------------------------------------------------------------------------

# Incident Reporting

Example request structure:

``` json
{
  "type": "landslide",
  "description": "Slope movement observed near the road.",
  "severity": "high",
  "location": {
    "latitude": 27.123456,
    "longitude": 88.123456,
    "address": ""
  },
  "status": "submitted",
  "reportedBy": "anonymous",
  "images": [],
  "videos": []
}
```

The backend stores the structured incident and exposes it to authorized
workflows and GIS visualization.

------------------------------------------------------------------------

# Weather Intelligence

The weather service provides current conditions and daily forecast
information.

The prototype uses a five-day forecast for the weather/risk interface.

Weather should be interpreted as a risk contributor rather than as a
direct landslide prediction by itself.

For example:

``` text
Rainfall ↑
     +
Slope vulnerability ↑
     +
Recent slope reports ↑
     ↓
Overall risk may increase
```

------------------------------------------------------------------------

# Alerts & Notifications

The notification model supports:

``` text
channel:
    in_app
    browser
    email
    sms
```

The current citizen-facing notification experience focuses on:

-   In-app notifications
-   Browser notifications

An authority can create a broadcast containing:

``` text
Type
Title
Message
Target Audience
```

------------------------------------------------------------------------

# Emergency Response

The emergency response architecture connects incidents to operational
decisions.

Example:

``` text
Incident
  ↓
Risk Score
  ↓
Priority
  ↓
Affected Area
  ↓
Available Resources
  ↓
Response Unit
  ↓
Dispatch
  ↓
Resolution
```

A future production implementation can extend this with:

-   Resource capacity
-   Travel time
-   Road accessibility
-   Shelter capacity
-   Hospital capacity
-   Multi-resource optimization
-   Evacuation optimization

------------------------------------------------------------------------

# Authentication & Authorization

CASCADE-NET uses JWT-based authentication with password hashing.

The intended flow is:

``` text
Signup
   ↓
User Record
   ↓
Login
   ↓
JWT
   ↓
Role Check
   ↓
Protected Route
```

Authority accounts additionally require verification/approval before
receiving authority-level access.

This prevents an ordinary user from simply selecting an authority role
and obtaining operational permissions.

------------------------------------------------------------------------

# Database

MongoDB is used because the application contains several types of
operational records with geographical and event-oriented data.

Important indexing areas for production include:

-   User email
-   Incident status
-   Incident severity
-   Incident timestamps
-   Incident coordinates
-   Authority verification state

For larger deployments, geospatial indexes such as MongoDB `2dsphere`
indexes can support efficient location queries.

------------------------------------------------------------------------

# Project Structure

The repository uses separate frontend and backend applications.

``` text
SIH-DISASTER-NET-
│
├── backend/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── auth_controller.js
│   │   ├── incident_controller.js
│   │   └── ...
│   │
│   ├── middleware/
│   │   └── auth_middleware.js
│   │
│   ├── models/
│   │   ├── user.js
│   │   ├── incident.js
│   │   └── ...
│   │
│   ├── routes/
│   │   ├── auth_routes.js
│   │   ├── incident_routes.js
│   │   └── ...
│   │
│   ├── services/
│   │   ├── weather_service.js
│   │   ├── alert_service.js
│   │   └── ...
│   │
│   ├── utils/
│   ├── .env.example
│   ├── index.js
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── public/
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── alerts/
│   │   │   ├── emergency/
│   │   │   ├── gis/
│   │   │   └── common/
│   │   │
│   │   ├── context/
│   │   ├── css/
│   │   ├── data/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
│
├── README.md
└── ...
```

Frontend and backend maintain separate `package.json` files because they
use different module/runtime requirements.

------------------------------------------------------------------------

# API Overview

The backend exposes REST-style endpoints including:

  -----------------------------------------------------------------------------------
  Area                    Endpoint                      Purpose
  ----------------------- ----------------------------- -----------------------------
  Health                  `GET /`                       API health message

  Auth                    `/api/auth/*`                 Signup/login/authentication

  Admin                   `/api/admin/*`                Authority governance

  Incidents               `/api/incidents`              Create/read/update incidents

  Alerts                  `/api/alerts/*`               Risk alert operations

  Notifications           `/api/notifications/*`        Notification
                                                        retrieval/broadcast

  Emergency               `/api/emergency-priority/*`   Emergency prioritization

  Resources               `/api/resources/*`            Resource operations

  Risk                    `POST /api/risk/analyze`      Risk analysis

  Simulation              `/api/risk/simulate`          Scenario/intervention
                                                        analysis

  Weather                 `/api/weather/*`              Weather data

  Hazard                  `/api/hazards/*`              External hazard context
  -----------------------------------------------------------------------------------

Exact available endpoints may evolve as the prototype is integrated.

------------------------------------------------------------------------

# Installation & Local Setup

## Requirements

Install:

-   Node.js
-   npm
-   MongoDB or MongoDB Atlas account
-   Git

Optional external services may require their own API keys.

------------------------------------------------------------------------

## Clone the repository

``` bash
git clone https://github.com/aj233566/SIH-DISASTER-NET-.git
cd SIH-DISASTER-NET-
```

------------------------------------------------------------------------

## Backend setup

``` bash
cd backend
npm install
```

Create the environment file:

``` bash
cp .env.example .env
```

On Windows PowerShell:

``` powershell
Copy-Item .env.example .env
```

Configure the values in `.env`.

------------------------------------------------------------------------

## Frontend setup

Open another terminal:

``` bash
cd frontend
npm install
```

Create the environment file:

``` bash
cp .env.example .env
```

On Windows PowerShell:

``` powershell
Copy-Item .env.example .env
```

------------------------------------------------------------------------

# Environment Variables

Never commit real secrets to GitHub.

Example backend configuration:

``` env
PORT=5000

MONGO_URI=mongodb://127.0.0.1:27017/cascade-net

JWT_SECRET=replace-with-a-long-random-secret

CORS_ORIGIN=http://localhost:5173

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace-with-a-strong-password
```

External API keys should be stored server-side and should not be exposed
through public frontend environment variables.

Example categories may include:

``` env
GEMINI_API_KEY=
TOMTOM_API_KEY=
GNEWS_API_KEY=
```

Only configure variables supported by the version of the project you are
running.

------------------------------------------------------------------------

# Running the Application

## Start backend

``` bash
cd backend
npm run dev
```

The backend is normally available at:

``` text
http://localhost:5000
```

Health check:

``` text
http://localhost:5000/
```

------------------------------------------------------------------------

## Start frontend

In another terminal:

``` bash
cd frontend
npm run dev
```

The Vite development server normally runs at:

``` text
http://localhost:5173
```

Open the displayed Vite URL in your browser.

------------------------------------------------------------------------

# Production Architecture

The prototype is designed to evolve toward:

``` text
GitHub
   │
   ├──────────────► Frontend Hosting
   │
   └──────────────► Backend Hosting
                          │
                          ▼
                    MongoDB Atlas
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
     Weather           Hazard             Routing
     APIs              APIs                APIs
```

A prototype deployment can use:

-   Frontend: Cloudflare Pages or equivalent static hosting
-   Backend: Render or equivalent Node.js hosting
-   Database: MongoDB Atlas
-   Source: GitHub
-   Media: Cloudinary or object storage

------------------------------------------------------------------------

# Scalability

CASCADE-NET is currently a prototype and is **not yet production-ready
at national scale**.

A production deployment would require several improvements.

## 1. API Scalability

### Problem

A single Node.js process can become a bottleneck as traffic increases.

### Solution

Use:

``` text
Load Balancer
      ↓
API Gateway
      ↓
Multiple Stateless Node.js Instances
```

The API should remain stateless where possible.

------------------------------------------------------------------------

## 2. Database Scalability

### Problem

A national disaster platform could generate large numbers of incidents,
coordinates, status updates and historical records.

### Solution

Use:

-   MongoDB replica sets
-   Proper indexes
-   `2dsphere` geospatial indexes
-   Query optimization
-   Archival policies
-   Geographic partitioning where justified
-   Sharding when scale requires it

------------------------------------------------------------------------

## 3. Real-Time Data

### Problem

Weather, incidents and alerts can change frequently.

### Solution

Use:

-   WebSockets or Server-Sent Events
-   Message queues
-   Event-driven processing
-   Background workers
-   Redis/distributed caching

This prevents every browser from repeatedly polling the entire backend.

------------------------------------------------------------------------

## 4. External API Failures

### Problem

Weather, routing or hazard providers can become unavailable or
rate-limited.

### Solution

Implement:

-   Timeouts
-   Retries with backoff
-   Circuit breakers
-   Cached last-known data
-   Provider fallbacks
-   Explicit `unavailable` states

The UI should never silently present unavailable data as real data.

------------------------------------------------------------------------

## 5. Evidence Storage

### Problem

Citizen photos and videos can consume large amounts of database/storage
capacity.

### Solution

Use:

``` text
Citizen
   ↓
Upload API
   ↓
Object Storage
   ↓
CDN
```

with:

-   Media validation
-   Virus/malware scanning
-   Compression
-   Size limits
-   Retention policies

------------------------------------------------------------------------

## 6. Risk Engine Scalability

### Problem

Different districts can have different terrain, rainfall and hazard
characteristics.

### Solution

Future versions can introduce:

-   Versioned risk models
-   Region-specific calibration
-   Feature stores
-   Historical training datasets
-   Model registry
-   MLOps
-   Continuous evaluation

The current explainable rule engine can remain as a baseline/fallback.

------------------------------------------------------------------------

## 7. Observability

Production deployment should add:

-   Structured logging
-   Metrics
-   Distributed tracing
-   Error tracking
-   API latency monitoring
-   External-provider health monitoring
-   Alerting

A disaster platform should be observable even when the underlying
infrastructure is under stress.

------------------------------------------------------------------------

# Security

Important production security measures include:

-   Password hashing with bcrypt
-   JWT validation
-   Role-based authorization
-   Authority approval workflow
-   HTTPS
-   Secure HTTP headers
-   Input validation
-   Rate limiting
-   CORS restrictions
-   File upload validation
-   Media size limits
-   API key protection
-   Secret management
-   Audit logs
-   Database access controls
-   Backup and recovery
-   Data retention policies

Location and evidence data can be sensitive, so production deployments
should define clear data-access and retention rules.

------------------------------------------------------------------------

# Current Prototype Status

CASCADE-NET is a working SIH prototype, but individual modules have
different maturity levels.

## Implemented

-   Role-based citizen/authority/admin experience
-   Authentication foundation
-   Citizen incident reporting
-   Geo-tagged incident data
-   GIS incident visualization
-   Current weather
-   Five-day weather forecast
-   Explainable rule-based risk engine
-   Optional AI risk assessment integration
-   Hazard enrichment architecture
-   Risk alerts
-   In-app notifications
-   Browser notification support
-   Citizen safety map
-   Location-aware citizen map behavior
-   Incident status lifecycle
-   Authority governance workflow

## Prototype / Partially Integrated

-   Emergency prioritization persistence
-   Resource management persistence
-   Some routing/response integrations
-   Some external hazard aggregations
-   Complete offline synchronization

## Future Production Work

-   National-scale infrastructure
-   Distributed event processing
-   Production-grade observability
-   Advanced geospatial indexing
-   Large-scale evidence storage
-   Robust offline synchronization
-   Region-specific model calibration
-   IoT/sensor ingestion
-   Satellite data pipelines
-   Advanced predictive modelling

The distinction between **implemented**, **prototype**, and **future**
functionality is intentional so the platform does not present simulated
capabilities as production infrastructure.

------------------------------------------------------------------------

# Known Limitations

## 1. Prototype Data

Some GIS scenarios can use controlled demonstration data.

This is useful for SIH demonstrations but must be clearly separated from
production/live data.

------------------------------------------------------------------------

## 2. AI Dependency

The optional AI layer depends on external provider availability and
configuration.

The baseline risk engine should remain available independently.

------------------------------------------------------------------------

## 3. Weather Provider Dependency

Weather information depends on external services.

Production deployments should implement caching, retry logic and
provider fallback.

------------------------------------------------------------------------

## 4. Emergency Resource Data

Hospitals, shelters and emergency resources require authoritative and
regularly maintained datasets for production use.

------------------------------------------------------------------------

## 5. Offline Synchronization

The prototype contains the foundation for low-network/offline support,
but complete offline incident synchronization requires additional work.

------------------------------------------------------------------------

## 6. Production Security Hardening

The SIH prototype requires additional infrastructure hardening before
deployment for large-scale government or public use.

------------------------------------------------------------------------

# Future Roadmap

## Phase 1 --- Prototype Stabilization

-   Complete API integration
-   Improve error states
-   Remove accidental demo fallbacks
-   Improve testing
-   Improve GIS reliability
-   Improve mobile responsiveness

------------------------------------------------------------------------

## Phase 2 --- Real-Time Operations

-   WebSocket/SSE updates
-   Real-time incident feeds
-   Live authority alerts
-   Live resource availability
-   Live road conditions
-   Real-time evacuation status

------------------------------------------------------------------------

## Phase 3 --- Advanced GIS

Add:

-   High-resolution terrain
-   Slope analysis
-   Satellite layers
-   Soil moisture
-   Historical landslide layers
-   Infrastructure dependency maps
-   Advanced hazard heatmaps

------------------------------------------------------------------------

## Phase 4 --- IoT Integration

Potential sensors:

-   Soil moisture
-   Rain gauges
-   Ground movement
-   Slope deformation
-   River/water level
-   Weather stations

Pipeline:

``` text
Sensor
   ↓
IoT Gateway
   ↓
Data Validation
   ↓
Time-Series Storage
   ↓
Risk Engine
   ↓
Alert
```

------------------------------------------------------------------------

## Phase 5 --- Predictive AI/ML

With sufficient historical data:

-   Landslide probability prediction
-   Time-to-event estimation
-   Image-based slope damage classification
-   Incident-description analysis
-   Regional model calibration
-   Anomaly detection
-   Risk trend forecasting

AI should be evaluated against real historical outcomes rather than
treated as automatically correct.

------------------------------------------------------------------------

## Phase 6 --- Advanced Emergency Optimization

Future versions can optimize:

-   Evacuation routes
-   Emergency vehicle routing
-   Resource allocation
-   Shelter selection
-   Hospital selection
-   Multi-team dispatch
-   Road blockage impact
-   Infrastructure dependencies

------------------------------------------------------------------------

## Phase 7 --- Offline & Low-Network Resilience

Future implementation:

``` text
Web / Mobile Client
       ↓
Local IndexedDB
       ↓
Offline Incident Queue
       ↓
Network Restored
       ↓
Synchronization Service
       ↓
Backend
```

Potential additions:

-   PWA
-   Service Worker
-   IndexedDB
-   Offline maps
-   Queued reports
-   Conflict resolution
-   Background synchronization

------------------------------------------------------------------------

# Why CASCADE-NET

CASCADE-NET is designed as an **operational decision-support system**,
not only a dashboard.

A typical information portal may answer:

> What is happening?

CASCADE-NET attempts to continue the workflow:

> What is happening → Why is the risk changing → Who needs to know →
> What should be checked → What response should be considered?

The platform therefore connects:

``` text
Data
 ↓
Intelligence
 ↓
Visualization
 ↓
Communication
 ↓
Response
```

This creates a more complete disaster-management workflow.

------------------------------------------------------------------------

# Why CASCADE-NET is Different

The differentiating concept is **integration of the operational chain**.

Instead of separate modules:

``` text
Weather App
    +
Map
    +
Complaint Form
    +
Alert System
```

CASCADE-NET connects them:

``` text
Weather
   +
Hazards
   +
Citizen Reports
   +
Historical Context
        ↓
Risk Intelligence
        ↓
GIS
        ↓
Alert
        ↓
Authority Verification
        ↓
Emergency Prioritization
        ↓
Response
        ↓
Resolution
```

The platform also keeps the citizen and authority experiences different.

Citizens need simple, actionable information.

Authorities need detailed operational information.

Administrators need governance controls.

------------------------------------------------------------------------

# Why Team Nirvana

Our team name is **Nirvana**.

For the project, the name represents the idea of reaching a safer and
more stable state after a period of uncertainty and disruption.

CASCADE-NET follows the same conceptual direction:

``` text
Hazard / Uncertainty
        ↓
Awareness
        ↓
Understanding
        ↓
Coordinated Action
        ↓
Safer Outcome
```

Therefore:

**Nirvana represents the desired outcome --- a safer, more resilient
state --- while CASCADE-NET represents the technology and operational
process used to move toward it.**

------------------------------------------------------------------------

# Why This Approach

## Why not train a large AI model locally?

A 10-day SIH prototype should prioritize:

-   Reliability
-   Explainability
-   Integration
-   Demonstrability
-   Real-world data flow

A large model would require:

-   Large datasets
-   Training infrastructure
-   GPU resources
-   Model validation
-   MLOps
-   Longer development time

Instead, CASCADE-NET uses an explainable baseline and allows external AI
assistance where useful.

------------------------------------------------------------------------

## Why GIS?

A disaster is inherently geographical.

A list such as:

``` text
Incident: Landslide
Risk: High
```

does not tell an authority enough.

A map can show:

``` text
Incident
   +
Road
   +
Hospital
   +
Shelter
   +
Population / settlement
   +
Risk Zone
   +
Route
```

This makes spatial relationships easier to understand.

------------------------------------------------------------------------

## Why citizen reporting?

Official sensors and datasets cannot observe every road, slope and
settlement continuously.

Citizens can provide ground-level observations such as:

-   New cracks
-   Slope movement
-   Flooding
-   Road blockage
-   Infrastructure damage

These reports become another signal in the decision-support pipeline.

------------------------------------------------------------------------

# SIH Demo Flow

A recommended demonstration sequence is:

## Step 1 --- Citizen

Login as a citizen.

Show:

-   Local risk
-   Weather
-   Live Safety Map
-   Nearby hazards
-   Emergency controls

------------------------------------------------------------------------

## Step 2 --- Citizen Reports Incident

Create:

``` text
Incident:
Slope movement

Severity:
High

Location:
GPS

Evidence:
Photo
```

Submit the report.

------------------------------------------------------------------------

## Step 3 --- Backend

Show that the incident is stored and available through the API.

``` text
POST /api/incidents
```

------------------------------------------------------------------------

## Step 4 --- GIS

Show the incident appearing on the map.

``` text
Citizen Report
       ↓
Backend
       ↓
GIS Marker
```

------------------------------------------------------------------------

## Step 5 --- Risk

Run the risk assessment.

Show:

``` text
Risk Score
Risk Level
Contributors
Recommendations
AI confidence when configured
```

------------------------------------------------------------------------

## Step 6 --- Authority

Log into the authority dashboard.

Show:

-   Incident
-   GIS
-   Risk
-   Alerts
-   Emergency priority
-   Resources

------------------------------------------------------------------------

## Step 7 --- Response

Demonstrate:

``` text
Incident
 ↓
Priority
 ↓
Resource
 ↓
Response Unit
```

------------------------------------------------------------------------

## Step 8 --- Notification

Authority broadcasts a warning.

Citizen receives:

``` text
Authority Notification
```

------------------------------------------------------------------------

## Step 9 --- Resolution

Move the incident through the status workflow:

``` text
Submitted
 ↓
Verified
 ↓
In Progress
 ↓
Resolved
```

------------------------------------------------------------------------

# Example Risk Decision

A simplified example:

``` text
Rainfall severity          → +20
Recent incidents           → +20
Slope / terrain risk       → +20
Road condition             → +10
Hazard context             → +10
                            ----
                             80
```

Result:

``` text
80 / 100
CRITICAL / HIGH
```

The actual production weighting should be calibrated against validated
regional datasets.

------------------------------------------------------------------------

# Design Principles

CASCADE-NET follows several design principles.

### 1. Explainability

Risk should have understandable contributors.

### 2. Role Separation

Citizens, authorities and administrators have different
responsibilities.

### 3. Location Awareness

Disaster information should be geographically relevant.

### 4. Human Verification

Citizen reports should not automatically become official warnings.

### 5. Graceful Failure

External service failure should result in an explicit unavailable state
rather than fabricated live data.

### 6. Scalability

The prototype architecture should have a path toward distributed
services.

### 7. Low-Network Resilience

The system should eventually remain useful when connectivity is
unreliable.

### 8. Action-Oriented Design

The platform should help users decide what to do next.

------------------------------------------------------------------------

# Testing

Before a demonstration, verify:

``` text
[ ] Backend starts successfully
[ ] MongoDB connection works
[ ] Frontend starts successfully
[ ] Signup works
[ ] Login works
[ ] Citizen dashboard works
[ ] Authority login works
[ ] Admin approval works
[ ] Incident submission works
[ ] GPS coordinates are captured
[ ] Incident appears on GIS
[ ] Weather loads
[ ] Risk analysis works
[ ] Alerts load
[ ] Notifications load
[ ] Emergency module loads
[ ] Resource module loads
[ ] Mobile layout works
[ ] No secrets are committed
```

------------------------------------------------------------------------

# GitHub Security

Never commit:

``` text
.env
API keys
JWT secrets
MongoDB credentials
Admin passwords
Cloud credentials
Private certificates
```

Use:

``` text
.env.example
```

for documenting required variables.

------------------------------------------------------------------------

# Team

**Team Nirvana**

CASCADE-NET is being developed by a six-member college team with
responsibilities covering:

-   Backend & system integration
-   Frontend & command center
-   GIS & mapping
-   Risk intelligence
-   Incident reporting & alerts
-   Resources / analytics / operations

The project follows a shared-integration approach so individual modules
become one end-to-end platform.

------------------------------------------------------------------------

# Contributing

1.  Create a feature branch.

``` bash
git checkout -b feature/your-feature
```

2.  Make focused changes.

3.  Test frontend and backend independently.

4.  Do not commit secrets.

5.  Keep API contracts consistent.

6.  Open a pull request.

7.  Resolve integration conflicts before merging.

------------------------------------------------------------------------

# License

This repository is currently an academic / Smart India Hackathon
project.

If the project is released publicly beyond the competition, add an
explicit open-source or proprietary license here.

------------------------------------------------------------------------

# Project Summary

**CASCADE-NET** is an AI-enabled disaster decision-support platform for
landslide risk monitoring and emergency response in the North Eastern
Region.

Its core idea is:

``` text
DETECT
  ↓
UNDERSTAND
  ↓
ASSESS
  ↓
WARN
  ↓
PRIORITIZE
  ↓
RESPOND
  ↓
VERIFY
```

The platform combines:

**Citizen Reporting + Weather + Hazard Data + Risk Intelligence + GIS +
Alerts + Emergency Operations**

into one connected workflow.

> **CASCADE-NET --- From early signals to coordinated action.**
