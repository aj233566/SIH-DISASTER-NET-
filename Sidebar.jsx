import React from "react";
import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="bg-dark text-white p-3" style={{ minHeight: "100vh", width: "250px" }}>
      <h5 className="fw-bold mb-4">Command Center</h5>

      <ul className="nav nav-pills flex-column gap-2">
        <li className="nav-item">
          <NavLink className="nav-link text-white" to="/">
            🏠 Dashboard
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink className="nav-link text-white" to="/incidents">
            🚨 Incidents
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink className="nav-link text-white" to="/weather">
            🌦️ Weather
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink className="nav-link text-white" to="/resources">
            🚑 Emergency Resources
          </NavLink>
        </li>
      </ul>
    </aside>
  );
}

export default Sidebar;