const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const incidentRoutes = require("./routes/incident_routes");


const app = express();


// DATABASE CONNECTION
connectDB();


// MIDDLEWARE
app.use(cors());
app.use(express.json());


// HOME ROUTE
app.get("/", (req, res) => {

    res.status(200).json({
        success: true,
        message: "CASCADE-NET API is running"
    });

});


// API ROUTES
app.use(
    "/api/incidents",
    incidentRoutes
);


// INVALID ROUTE
app.use((req, res) => {

    res.status(404).json({
        success: false,
        message: "Route not found"
    });

});


// SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(
        `CASCADE-NET server running on port ${PORT}`
    );

});