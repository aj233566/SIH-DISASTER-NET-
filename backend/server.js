const path = require("path");
const express = require("express");

const { loadProjectEnv } = require("./utils/env");
const { DISASTER_PROFILES, FACTOR_RULES } = require("./config/riskRules");
const { generateRecommendations } = require("./services/recommendationEngine");
const { analyzeRisk } = require("./services/riskEngine");
const { simulateIntervention, INTERVENTIONS } = require("./services/interventionSimulator");
const { getHazardContext } = require("./services/hazardDataService");
const { getWeatherByCoordinates } = require("./services/weatherService");
const { normalizeRiskInput, validateCoordinates } = require("./utils/validation");

loadProjectEnv();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));
app.use(addCorsHeaders);
app.use(express.static(path.join(__dirname, "..", "frontend")));

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        service: "CASCADE-NET Risk Intelligence Backend",
        owner: "Rudra",
        status: "running",
        timestamp: new Date().toISOString()
    });
});

app.get("/api/risk/rules", (req, res) => {
    res.json({
        success: true,
        data: {
            ruleVersion: "CASCADE-NET-RUDRA-PROTOTYPE-v2",
            disasterProfiles: DISASTER_PROFILES,
            factorRules: FACTOR_RULES,
            interventions: INTERVENTIONS
        }
    });
});

app.get("/api/weather", async (req, res, next) => {
    try {
        const validation = validateCoordinates(req.query.latitude, req.query.longitude);

        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: validation.message
            });
        }

        const weather = await getWeatherByCoordinates(validation.latitude, validation.longitude);

        res.json({
            success: true,
            data: {
                location: {
                    latitude: validation.latitude,
                    longitude: validation.longitude
                },
                weather
            }
        });
    } catch (error) {
        next(error);
    }
});

app.get("/api/hazards", async (req, res, next) => {
    try {
        const validation = validateCoordinates(req.query.latitude, req.query.longitude);

        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: validation.message
            });
        }

        const disasterType = String(req.query.disasterType || "flood").toLowerCase();
        const hazardContext = await getHazardContext(validation.latitude, validation.longitude, disasterType);

        res.json({
            success: true,
            data: {
                location: {
                    latitude: validation.latitude,
                    longitude: validation.longitude
                },
                hazardContext
            }
        });
    } catch (error) {
        next(error);
    }
});

app.post("/api/risk/analyze", async (req, res, next) => {
    try {
        const input = normalizeRiskInput(req.body);
        let weather = input.weather;
        let hazardContext = input.hazardContext;

        if (!weather && input.location) {
            const validation = validateCoordinates(input.location.latitude, input.location.longitude);

            if (!validation.valid) {
                return res.status(400).json({
                    success: false,
                    message: validation.message
                });
            }

            weather = await getWeatherByCoordinates(validation.latitude, validation.longitude);
            hazardContext = await getHazardContext(validation.latitude, validation.longitude, input.disasterType);
        }

        if (!weather) {
            return res.status(400).json({
                success: false,
                message: "Provide either weather data or valid location coordinates."
            });
        }

        const normalizedInput = {
            ...input,
            weather,
            hazardContext
        };
        const risk = analyzeRisk(normalizedInput);
        const recommendations = generateRecommendations(risk);

        res.json({
            success: true,
            data: {
                location: input.location,
                weather,
                hazardContext,
                inputFactors: {
                    disasterType: normalizedInput.disasterType,
                    fieldReports: normalizedInput.fieldReports,
                    terrain: normalizedInput.terrain,
                    operations: normalizedInput.operations,
                    sensor: normalizedInput.sensor,
                    historical: normalizedInput.historical
                },
                risk,
                recommendations,
                generatedAt: new Date().toISOString()
            }
        });
    } catch (error) {
        next(error);
    }
});

app.post("/api/risk/simulate", (req, res) => {
    const risk = req.body && req.body.risk;
    const scenario = req.body && req.body.scenario;

    if (!risk || !Array.isArray(risk.factors) || typeof risk.score !== "number") {
        return res.status(400).json({
            success: false,
            message: "Provide a valid risk object from /api/risk/analyze."
        });
    }

    res.json({
        success: true,
        data: simulateIntervention(risk, scenario)
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Endpoint not found."
    });
});

app.use((error, req, res, next) => {
    const statusCode = error.statusCode || 500;

    res.status(statusCode).json({
        success: false,
        message: error.message || "Internal server error."
    });
});

app.listen(PORT, () => {
    console.log(`CASCADE-NET Risk Intelligence backend running at http://localhost:${PORT}`);
});

function addCorsHeaders(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
}
