# Risk Intelligence Intervention Simulator

CASCADE-NET Rudra module for backend-first, explainable multi-disaster risk scoring and intervention simulation.

## What This Part Does

- Gets real weather and forecast data from Open-Meteo.
- Gets flood river-discharge forecast data from Open-Meteo Global Flood API.
- Gets recent nearby earthquake context from the USGS earthquake query API.
- Optionally gets wildfire hotspot data from NASA FIRMS when `FIRMS_MAP_KEY` is configured.
- Combines live data with operator inputs such as road status, drainage, infrastructure, exposure, field reports, and historical local event count.
- Calculates a 0-100 score, severity category, factor-by-factor explanation, recommendations, simulated improvement, confidence, and uncertainty range.

## Supported Disaster Types

- Flood / urban waterlogging
- Landslide
- Storm / cyclone
- Heatwave
- Wildfire
- Earthquake
- Drought

## Free APIs Used

- Open-Meteo Forecast API: free, no API key required.
- Open-Meteo Global Flood API: free, no API key required.
- USGS Earthquake Query API: free, no API key required.
- NASA FIRMS Area API: free, but requires a free `FIRMS_MAP_KEY`.

Only wildfire hotspot validation needs a key. The app still runs without it and reports the hotspot status as `not_configured`.

The backend does not use fake external data. If an external API is unavailable or not configured, that factor is marked `UNAVAILABLE` and contributes `0` instead of pretending the missing value is a real low-risk measurement.

## Run

```bash
npm start
```

Then open:

```text
http://localhost:3000
```

Coordinates can be entered in either format:

```text
28.6139, 77.2090
28.6139 N, 77.2090 E
40.7128 N, 74.0060 W
```

The backend converts `S` and `W` values to negative decimal degrees before calling APIs.

## Test

```bash
npm test
```

## Optional FIRMS Key

To enable real satellite fire hotspots, create a file named `.env` in the project root:

```text
C:\xampp\htdocs\Risk-Intelligence-Intervention-Simulator\.env
```

Put this inside it:

```env
FIRMS_MAP_KEY=your_free_firms_map_key
```

You can also set it for only the current PowerShell session:

```powershell
$env:FIRMS_MAP_KEY="your_free_firms_map_key"
npm start
```

Get the free key from NASA FIRMS:

```text
https://firms.modaps.eosdis.nasa.gov/api/map_key
```

## Main Endpoints

- `GET /api/health`
- `GET /api/risk/rules`
- `GET /api/weather?latitude=28.6139&longitude=77.209`
- `GET /api/hazards?latitude=28.6139&longitude=77.209&disasterType=earthquake`
- `POST /api/risk/analyze`
- `POST /api/risk/simulate`

These rules are prototype decision-support rules only. They are not official government disaster warning standards.
