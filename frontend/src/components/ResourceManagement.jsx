/**
 * ==============================================================================
 * CASCADE-NET | ResourceManagement.jsx
 * ==============================================================================
 * Emergency Resource Inventory & Deployment Tracker.
 * Uses Bootstrap Grid for responsive layout.
 * No RoleContext / AlertContext / LanguageContext dependency.
 * ==============================================================================
 */

import React, { useEffect, useMemo, useState } from "react";
import { Truck, Search, Phone, Building, ShieldCheck } from "lucide-react";

import { resourcesApi } from "../services/api";
import "../css/resources.css";

const ResourceManagement = () => {
  const [resources, setResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  // ---------------------------------------------------------------------------
  // Load resources from API
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let mounted = true;

    const loadResources = async () => {
      try {
        setLoading(true);

        const response = await resourcesApi.getResources();

        if (!mounted) return;

        const resourceList = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
          ? response.data
          : [];

        setResources(resourceList);
      } catch (error) {
        console.error("Failed to load resources:", error);

        if (mounted) {
          setResources([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadResources();

    return () => {
      mounted = false;
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Filter resources
  // ---------------------------------------------------------------------------
  const filteredResources = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return resources.filter((res) => {
      const name = String(res?.name || "").toLowerCase();
      const location = String(res?.location || "").toLowerCase();
      const type = String(res?.type || "").toLowerCase();
      const category = String(res?.category || "").toUpperCase();

      const matchSearch =
        !search ||
        name.includes(search) ||
        location.includes(search) ||
        type.includes(search) ||
        category.toLowerCase().includes(search);

      if (!matchSearch) return false;

      if (categoryFilter === "ALL") {
        return true;
      }

      return category === categoryFilter;
    });
  }, [resources, searchTerm, categoryFilter]);

  return (
    <div className="container-fluid p-0 resources-management-container">
      {/* =====================================================================
          KPI CARDS
      ====================================================================== */}

      <div className="row g-3 mb-4">
        {/* Rescue Units */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className="kpi-metric-card h-100"
            style={{ borderLeft: "4px solid var(--info)" }}
          >
            <div className="kpi-metric-header">
              <span>Rescue Units</span>
              <ShieldCheck size={16} className="metric-icon info" />
            </div>

            <div className="kpi-metric-value">20</div>

            <div className="kpi-metric-sub">NDRF &amp; SDRF Combined</div>
          </div>
        </div>

        {/* ALS Ambulances */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className="kpi-metric-card h-100"
            style={{ borderLeft: "4px solid var(--safe)" }}
          >
            <div className="kpi-metric-header">
              <span>ALS Ambulances</span>
              <Truck size={16} className="metric-icon safe" />
            </div>

            <div className="kpi-metric-value">38</div>

            <div className="kpi-metric-sub">
              26 Ready for Immediate Dispatch
            </div>
          </div>
        </div>

        {/* Heavy Earthmovers */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className="kpi-metric-card h-100"
            style={{ borderLeft: "4px solid var(--warning)" }}
          >
            <div className="kpi-metric-header">
              <span>Heavy Earthmovers</span>
              <Building size={16} className="metric-icon warning" />
            </div>

            <div className="kpi-metric-value">22</div>

            <div className="kpi-metric-sub">BRO &amp; PWD Corridors</div>
          </div>
        </div>

        {/* Medical Squads */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className="kpi-metric-card h-100"
            style={{ borderLeft: "4px solid var(--critical)" }}
          >
            <div className="kpi-metric-header">
              <span>Field Medical Squads</span>
              <Phone size={16} className="metric-icon critical" />
            </div>

            <div className="kpi-metric-value">16</div>

            <div className="kpi-metric-sub">
              6 Active at Landslide Ground Sites
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          RESOURCE DIRECTORY
      ====================================================================== */}

      <div className="ops-panel">
        <div className="ops-panel-header">
          <h2 className="ops-panel-title">
            <Truck size={18} className="panel-icon-info" />

            <span>Resources &amp; Facilities</span>
          </h2>

          <span className="badge-ops info">
            {resources.length} Asset Categories Tracked
          </span>
        </div>

        {/* =================================================================
            FILTER BAR
        ================================================================== */}

        <div className="alert-filter-bar">
          <div className="filter-left-group">
            <button
              type="button"
              className={`filter-chip-btn ${
                categoryFilter === "ALL" ? "active" : ""
              }`}
              onClick={() => setCategoryFilter("ALL")}
            >
              All Assets ({resources.length})
            </button>

            <button
              type="button"
              className={`filter-chip-btn ${
                categoryFilter === "NDRF" ? "active" : ""
              }`}
              onClick={() => setCategoryFilter("NDRF")}
            >
              NDRF Units
            </button>

            <button
              type="button"
              className={`filter-chip-btn ${
                categoryFilter === "SDRF" ? "active" : ""
              }`}
              onClick={() => setCategoryFilter("SDRF")}
            >
              SDRF Units
            </button>

            <button
              type="button"
              className={`filter-chip-btn ${
                categoryFilter === "MEDICAL TRANSPORT" ? "active" : ""
              }`}
              onClick={() => setCategoryFilter("MEDICAL TRANSPORT")}
            >
              Ambulances
            </button>

            <button
              type="button"
              className={`filter-chip-btn ${
                categoryFilter === "ROAD CLEARING" ? "active" : ""
              }`}
              onClick={() => setCategoryFilter("ROAD CLEARING")}
            >
              Earthmovers &amp; BRO
            </button>
          </div>

          {/* Search */}

          <div className="resource-search-wrapper">
            <Search size={14} className="resource-search-icon" />

            <input
              type="text"
              className="ops-input"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* =================================================================
            RESOURCE TABLE
        ================================================================== */}

        <div className="table-responsive resource-table-wrapper">
          {loading && (
            <div className="resource-loading">
              Loading resource inventory...
            </div>
          )}

          {!loading && (
            <table className="ops-table">
              <thead>
                <tr>
                  <th>Resource Name</th>
                  <th>Category</th>
                  <th>Total Units</th>
                  <th>Available</th>
                  <th>Deployed</th>
                  <th>Location / Station</th>
                  <th>Contact Point</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredResources.map((res, index) => {
                  const resourceId = res?.id || res?._id || `RES-${index + 1}`;

                  const status = String(res?.status || "Available");

                  const isActive = status.toLowerCase().includes("active");

                  return (
                    <tr key={resourceId}>
                      {/* Resource */}

                      <td>
                        <strong className="resource-name">
                          {res?.name || "Unnamed Resource"}
                        </strong>

                        <div className="resource-id">{resourceId}</div>
                      </td>

                      {/* Category */}

                      <td>
                        <span className="badge-ops neutral">
                          {res?.category || "General"}
                        </span>
                      </td>

                      {/* Total */}

                      <td className="resource-number">
                        {res?.totalUnits ?? 0}
                      </td>

                      {/* Available */}

                      <td className="resource-number available">
                        {res?.availableUnits ?? 0}
                      </td>

                      {/* Deployed */}

                      <td className="resource-number deployed">
                        {res?.deployedUnits ?? 0}
                      </td>

                      {/* Location */}

                      <td className="resource-location">
                        {res?.location || "—"}
                      </td>

                      {/* Contact */}

                      <td className="resource-contact">
                        <div>{res?.contactPerson || "—"}</div>

                        {res?.phone && <small>{res.phone}</small>}
                      </td>

                      {/* Status */}

                      <td>
                        <span
                          className={`badge-ops ${
                            isActive ? "warning" : "safe"
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {/* Empty */}

                {filteredResources.length === 0 && (
                  <tr>
                    <td colSpan="8" className="resource-empty">
                      No resources match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceManagement;
