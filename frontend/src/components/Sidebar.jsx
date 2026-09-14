import React from "react";
import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <div className="cc-sidebar">
      <div className="cc-sidebar-title">CASCADE NET</div>

      <div className="cc-sidebar-menu">
        <NavLink
          to="/command-center"
          className={({ isActive }) =>
            isActive ? "cc-sidebar-link active" : "cc-sidebar-link"
          }
        >
          <span></span>
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/incidents"
          className={({ isActive }) =>
            isActive ? "cc-sidebar-link active" : "cc-sidebar-link"
          }
        >
          <span></span>
          <span>Incidents</span>
        </NavLink>

        <NavLink
          to="/weather"
          className={({ isActive }) =>
            isActive ? "cc-sidebar-link active" : "cc-sidebar-link"
          }
        >
          <span></span>
          <span>Weather</span>
        </NavLink>

        <NavLink
          to="/resources"
          className={({ isActive }) =>
            isActive ? "cc-sidebar-link active" : "cc-sidebar-link"
          }
        >
          <span></span>
          <span> Resources & Notifications</span>
        </NavLink>
      </div>
    </div>
  );
}

export default Sidebar;
