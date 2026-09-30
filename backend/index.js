const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const Incident = require("./models/incident");

// =====================================================
// ROUTES
// =====================================================

const authRoutes = require("./routes/auth_routes");
const adminRoutes = require("./routes/admin_routes");
const incidentRoutes = require("./routes/incident_routes");

const alertRoutes = require("./routes/alert_routes");
const notificationRoutes = require("./routes/notification_routes");
const {
    processRiskAlert
} = require("./services/alert_service");


const emergencyPriorityRoutes = require(
    "./routes/emergency_priority_routes"
);

const resourceRoutes = require(
    "./routes/resource_routes"
);
const habitationRoutes = require("./routes/habitation_routes");
const relocationSiteRoutes = require("./routes/relocation_site_routes");
const redZoneRoutes = require("./routes/red_zone_routes");
const relocationPriorityRoutes = require("./routes/relocation_priority_routes");

// =====================================================
// RISK INTELLIGENCE SERVICES
// =====================================================

const {
    analyzeRisk
} = require("./risk-intelligence/services/riskEngine");
const { analyzeMultiHazard } = require("./risk-intelligence/services/multiHazardEngine");

const {
    getAiRiskAssessment
} = require("./risk-intelligence/services/aiRiskService");

const {
    generateRecommendations
} = require("./risk-intelligence/services/recommendationEngine");

const {
    simulateIntervention,
    INTERVENTIONS
} = require("./risk-intelligence/services/interventionSimulator");

const {
    getHazardContext
} = require("./risk-intelligence/services/hazardDataService");

const {
    getNewsContext
} = require("./risk-intelligence/services/newsService");

const {
    getWeatherByCoordinates
} = require("./risk-intelligence/services/weatherService");

const {
    normalizeRiskInput,
    validateCoordinates
} = require("./risk-intelligence/utils/validation");



// =====================================================
// APP
// =====================================================

const app = express();


// =====================================================
// DATABASE CONNECTION
// =====================================================

connectDB();


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());

app.use(express.json());


// =====================================================
// HOME ROUTE
// =====================================================

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "SENTRY · SIH26191 API is running"
    });
});

// initializeGridFS();
// =====================================================
// AUTH ROUTES
// =====================================================

app.use(
    "/api/auth",
    authRoutes
);


// =====================================================
// ADMIN ROUTES
// =====================================================

app.use(
    "/api/admin",
    adminRoutes
);


// =====================================================
// INCIDENT ROUTES
// =====================================================

app.use(
    "/api/incidents",
    incidentRoutes
);

function buildFieldReportsFromIncidents(incidents = []) {

    const fieldReports = {

        cracks: false,

        slopeMovement: false,

        flooding: false,

        roadBlockage: false,

        buildingDamage: false,

        powerOutage: false,

        fireSmoke: false,

        medicalStress: false,

        waterShortage: false

    };


    for (const incident of incidents) {

        const type = String(
            incident.hazardSubtype || incident.type || ""
        ).toLowerCase();


        switch (type) {

            case "slope_crack":

                fieldReports.cracks = true;

                break;


            case "slope_movement":
            case "erosion":

                fieldReports.slopeMovement = true;

                break;


            case "flash_flood":
            case "flood":
            case "cloudburst":

                fieldReports.flooding = true;

                break;


            case "road_blockage":

                fieldReports.roadBlockage = true;

                break;


            case "infrastructure_damage":
            case "earthquake":

                fieldReports.buildingDamage = true;

                break;


            case "landslide":


                break;


            default:

                break;

        }

    }


    return fieldReports;

}

function calculateDistanceKm(
    lat1,
    lon1,
    lat2,
    lon2
) {
    const earthRadiusKm = 6371;

    const dLat =
        (lat2 - lat1) * Math.PI / 180;

    const dLon =
        (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return earthRadiusKm * c;
}

app.use(
    "/api/alerts",
    alertRoutes
);

app.use(
    "/api/notifications",
    notificationRoutes
);

app.use(
    "/api/emergency-priority",
    emergencyPriorityRoutes
);

app.use(
    "/api/resources",
    resourceRoutes
);

app.use("/api/habitations", habitationRoutes);
app.use("/api/relocation-sites", relocationSiteRoutes);
app.use("/api/red-zones", redZoneRoutes);
app.use("/api/relocation-priority", relocationPriorityRoutes);

app.get("/api/weather/current", async (req, res, next) => {
    try {
        const validation = validateCoordinates(req.query.latitude, req.query.longitude);
        if (!validation.valid) {
            return res.status(400).json({ success: false, message: validation.message });
        }
        const data = await getWeatherByCoordinates(validation.latitude, validation.longitude);
        return res.json({ success: true, data });
    } catch (error) {
        return next(error);
    }
});

// =====================================================
// RISK ANALYSIS
// POST /api/risk/analyze
// =====================================================

app.post("/api/risk/analyze", async (req, res, next) => {

    try {

        // =================================================
        // NORMALIZE INPUT
        // =================================================

        const input = normalizeRiskInput(req.body);

        let weather = input.weather;
        let hazardContext = input.hazardContext;


        // =================================================
        // GET WEATHER + HAZARD DATA FROM LOCATION
        // =================================================

        if (input.location) {

            const validation = validateCoordinates(
                input.location.latitude,
                input.location.longitude
            );


            if (!validation.valid) {

                return res.status(400).json({
                    success: false,
                    message: validation.message
                });

            }


            if (!weather) {
                weather = await getWeatherByCoordinates(
                    validation.latitude,
                    validation.longitude
                );
            }
            if (!hazardContext) {
                hazardContext = await getHazardContext(
                    validation.latitude,
                    validation.longitude,
                    input.disasterType
                );
            }

        }


        // =================================================
        // WEATHER REQUIRED
        // =================================================

        if (!weather) {

            return res.status(400).json({
                success: false,
                message:
                    "Provide either weather data or valid location coordinates."
            });

        }


        // =================================================
        // GET INCIDENTS FROM MONGODB
        // =================================================

        let incidents = [];
        let incidentDataAvailable = Boolean(input.location);
        let incidentDataError = null;

        try {
            const allIncidents = await Incident.find({ status: "verified" })
                .sort({
                    createdAt: -1
                })
                .lean();

            const RISK_RADIUS_KM = 100;

            incidents = input.location ? allIncidents.filter((incident) => {

                const incidentLat =
                    incident.location?.latitude;

                const incidentLon =
                    incident.location?.longitude;

                if (
                    typeof incidentLat !== "number" ||
                    typeof incidentLon !== "number"
                ) {
                    return false;
                }

                const distance = calculateDistanceKm(
                    input.location.latitude,
                    input.location.longitude,
                    incidentLat,
                    incidentLon
                );

                return distance <= RISK_RADIUS_KM;
            }) : [];
            incidentDataAvailable = Boolean(input.location);

        }

        catch (incidentError) {

            console.error(
                "Failed to retrieve incidents:",
                incidentError
            );

            incidents = [];
            incidentDataAvailable = false;
            incidentDataError = "Verified incident records could not be loaded.";

        }


        // =================================================
        // CONVERT INCIDENTS → FIELD REPORTS
        // =================================================

        const fieldReports =
            buildFieldReportsFromIncidents(
                incidents
            );


        // =================================================
        // NORMALIZED INPUT
        // =================================================

        const normalizedInput = {

            ...input,

            weather,

            hazardContext,

            fieldReports,
            dataAvailability: {
                ...input.dataAvailability,
                fieldReports: incidentDataAvailable
            },

            historical: {

                ...(input.historical || {}),

                eventCount: input.historical.eventCount

            }

        };



        // =================================================
        // RISK ENGINE
        // =================================================

        const risk = analyzeRisk({
            ...normalizedInput,
            disasterType: input.disasterType === "multi_hazard" ? "flood" : input.disasterType
        });
        const multiHazard = analyzeMultiHazard({
            weather,
            hazardContext,
            incidents,
            incidentsAvailable: incidentDataAvailable
        });


        // =================================================
        // RECOMMENDATIONS
        // =================================================

        const recommendations =
            generateRecommendations(
                risk
            );


        // =================================================
        // NEWS CONTEXT
        // =================================================

        const newsContext = input.location

            ? await getNewsContext({

                latitude:
                    input.location.latitude,

                longitude:
                    input.location.longitude,

                disasterType:
                    input.disasterType,

                locationName:
                    input.newsQuery

            })

            : await getNewsContext({

                disasterType:
                    input.disasterType,

                locationName:
                    input.newsQuery

            });


        // =================================================
        // AI RISK ASSESSMENT
        // =================================================

        const aiAssessment =
            await getAiRiskAssessment({

                input:
                    normalizedInput,

                weather,

                hazardContext,

                risk,

                multiHazard,

                recommendations,

                newsContext

            });

        // =================================================
        // EARLY WARNING ALERT GENERATION
        // =================================================

        let generatedAlert = null;
        let generatedAlertError = null;

        try {

            generatedAlert =
                await processRiskAlert({
                    location: input.location,
                    multiHazard
                });

        } catch (alertError) {

            console.error(
                "Alert generation failed:",
                alertError
            );
            generatedAlertError = alertError.message || "Alert generation failed.";
        }
        // =================================================
        // RESPONSE
        // =================================================

        res.json({

            success: true,

            data: {

                location:
                    input.location,

                weather,

                hazardContext,

                newsContext,


                // =========================================
                // MONGODB INCIDENT DATA
                // =========================================

                incidents: {
                    count: incidents.length,
                    dataAvailable: incidentDataAvailable,
                    error: incidentDataError,
                    fieldReports: buildFieldReportsFromIncidents(incidents),
                    nearby: incidents
                },
                multiHazard,

                // =========================================
                // RISK
                // =========================================

                risk,


                // =========================================
                // RECOMMENDATIONS
                // =========================================

                recommendations,


                // =========================================
                // AI ASSESSMENT
                // =========================================

                aiAssessment,

                generatedAlert,
                generatedAlertError,

                generatedAt:
                    new Date().toISOString()

            }

        });

    }

    catch (error) {

        console.error(
            "Risk analysis failed:",
            error
        );

        next(error);

    }

});

// =====================================================
// RISK SIMULATION
// POST /api/risk/simulate
// =====================================================

function simulateRiskScenario(req, res) {

    const risk =
        req.body &&
        req.body.risk;

    const scenario =
        req.body &&
        req.body.scenario;


    if (
        !risk ||
        !Array.isArray(risk.factors) ||
        typeof risk.score !== "number"
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Provide a valid risk object from /api/risk/analyze."

        });
        return;
    }

    res.json({

        success: true,

        data: simulateIntervention(
            risk,
            scenario
        )

    });
}

app.post("/api/risk/simulate", simulateRiskScenario);
app.post("/api/risk/scenario", simulateRiskScenario);




// =====================================================
// ERROR HANDLER
// =====================================================

app.use((error, req, res, next) => {

    console.error("API Error:", error);

    const status = error.statusCode
        || (error.name === "ValidationError" || error.name === "CastError" ? 400 : 500);
    res.status(status).json({

        success: false,

        message:
            error.message ||
            "Internal server error"

    });

});


// =====================================================
// INVALID ROUTE
// MUST BE LAST
// =====================================================
app.get("/api/risk/debug-incidents", async (req, res) => {
    try {
        const incidents = await Incident.find({})
            .sort({ createdAt: -1 })
            .lean();

        console.log("RISK ANALYSIS INCIDENT COUNT:", incidents.length);
        console.log(
            "RISK ANALYSIS INCIDENT TYPES:",
            incidents.map((incident) => incident.type)
        );

        console.log("=================================");
        console.log("RISK DEBUG - INCIDENTS");
        console.log("Incident count:", incidents.length);
        console.log("Incidents:", incidents);
        console.log("=================================");

        res.json({
            success: true,
            count: incidents.length,
            incidents,
        });
    } catch (error) {
        console.error("DEBUG INCIDENT ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

app.use((req, res) => {

    res.status(404).json({

        success: false,

        message: "Route not found"

    });

});


// =====================================================
// SERVER
// =====================================================

const PORT =
    process.env.PORT || 5000;


app.listen(PORT, () => {

    console.log(
        `SENTRY · SIH26191 server running on port ${PORT}`
    );

});