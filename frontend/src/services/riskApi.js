const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function analyzeRisk({
    latitude,
    longitude,
    name = "Sikkim",
    disasterType = "landslide"
}) {
    const response = await fetch(
        `${API_BASE_URL}/api/risk/analyze`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                disasterType,

                location: {
                    latitude,
                    longitude,
                    name
                },

                newsQuery: name,

                fieldReports: {
                    cracks: false,
                    slopeMovement: false,
                    flooding: false,
                    roadBlockage: false,
                    buildingDamage: false,
                    powerOutage: false,
                    fireSmoke: false,
                    medicalStress: false,
                    waterShortage: false
                },

                terrain: {
                    slopeRisk: "LOW"
                },

                operations: {
                    roadBlockage: "NONE",
                    infrastructureStatus: "NORMAL",
                    populationExposure: "MODERATE",
                    drainageCapacity: "FAIR",
                    riverLevel: "NORMAL"
                },

                sensor: {
                    soilMoisture: 0
                },

                historical: {
                    eventCount: 0
                }

            })
        }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(
            result.message || "Risk analysis failed"
        );
    }

    return result.data;
}