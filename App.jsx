import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./assets/SIH/Dashboard";
import Incidents from "./assets/SIH/Incidents";
import Weather from "./assets/SIH/Weather";
import EmergencyResources from "./assets/SIH/EmergencyResources";

import Navbar from "./assets/SIH/Components/Navbar";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/incidents" element={<Incidents />} />
        <Route path="/weather" element={<Weather />} />
        <Route path="/resources" element={<EmergencyResources />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;