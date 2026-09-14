import React, { useState } from "react";
import { AlertOctagon, Flame, AlertTriangle, ShieldCheck } from "lucide-react";

import { useAlerts } from "../../context/AlertContext";

import WarningBanner from "./WarningBanner";
import ThresholdSimulator from "./ThresholdSimulator";
import AlertList from "./AlertList";
import AlertDetails from "./AlertDetails";
import Modal from "../common/Modal";

export const AlertPanel = () => {
  const { alerts } = useAlerts();
  const [selectedAlert, setSelectedAlert] = useState(null);

  // Active alerts
  const activeAlerts = alerts.filter(
    (alert) => alert.status === "Active" || alert.status === "ACTIVE",
  );

  // Critical alerts
  const criticalCount = alerts.filter(
    (alert) => alert.riskLevel === "Critical" || alert.riskLevel === "CRITICAL",
  ).length;

  // High-risk alerts
  const highCount = alerts.filter(
    (alert) => alert.riskLevel === "High" || alert.riskLevel === "HIGH",
  ).length;

  // Calculate average AI confidence from backend alerts
  const alertsWithConfidence = alerts.filter(
    (alert) => typeof alert.aiConfidence === "number",
  );

  const averageAIConfidence =
    alertsWithConfidence.length > 0
      ? Math.round(
          alertsWithConfidence.reduce(
            (sum, alert) => sum + alert.aiConfidence,
            0,
          ) / alertsWithConfidence.length,
        )
      : null;

  return (
    <div className="container-fluid p-0 alert-panel-container">
      {/* Top High-Priority Warning Banner */}
      <WarningBanner onSelectAlert={(alert) => setSelectedAlert(alert)} />

      {/* KPI Metric Summary */}
      <div className="row g-3 mb-4">
        {/* Critical Alerts */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className="kpi-metric-card h-100"
            style={{
              borderLeft: "4px solid var(--critical)",
            }}
          >
            <div className="kpi-metric-header">
              <span>Critical Alerts</span>
              <Flame size={16} color="var(--critical)" />
            </div>

            <div
              className="kpi-metric-value"
              style={{
                color: "var(--critical)",
              }}
            >
              {criticalCount}
            </div>

            <div className="kpi-metric-sub">Immediate Evacuation Mandate</div>
          </div>
        </div>

        {/* High Risk Alerts */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className="kpi-metric-card h-100"
            style={{
              borderLeft: "4px solid var(--high-risk)",
            }}
          >
            <div className="kpi-metric-header">
              <span>High Risk Alerts</span>

              <AlertTriangle size={16} color="var(--high-risk)" />
            </div>

            <div
              className="kpi-metric-value"
              style={{
                color: "var(--high-risk)",
              }}
            >
              {highCount}
            </div>

            <div className="kpi-metric-sub">Precautionary Road Closure</div>
          </div>
        </div>

        {/* Active Alerts */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className="kpi-metric-card h-100"
            style={{
              borderLeft: "4px solid var(--warning)",
            }}
          >
            <div className="kpi-metric-header">
              <span>Active Alerts</span>

              <AlertOctagon size={16} color="var(--warning)" />
            </div>

            <div className="kpi-metric-value">{activeAlerts.length}</div>

            <div className="kpi-metric-sub">Across Monitored Regions</div>
          </div>
        </div>

        {/* AI Confidence */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className="kpi-metric-card h-100"
            style={{
              borderLeft: "4px solid var(--safe)",
            }}
          >
            <div className="kpi-metric-header">
              <span>AI Risk Confidence</span>

              <ShieldCheck size={16} color="var(--safe)" />
            </div>

            <div
              className="kpi-metric-value"
              style={{
                color: "var(--safe)",
              }}
            >
              {averageAIConfidence !== null ? `${averageAIConfidence}%` : "--"}
            </div>

            <div className="kpi-metric-sub">AI-assisted risk assessment</div>
          </div>
        </div>
      </div>

      {/* Threshold & Data Ingestion Simulator */}
      <ThresholdSimulator />

      {/* Alert List */}
      <div className="ops-panel mt-4">
        <div className="ops-panel-header">
          <h2 className="ops-panel-title">
            <AlertTriangle size={18} color="var(--info)" />

            <span>Risk Alerts</span>
          </h2>

          <span className="badge-ops info">
            {alerts.length} Total Monitored Zones
          </span>
        </div>

        <AlertList
          alerts={alerts}
          onSelectAlert={(alert) => setSelectedAlert(alert)}
        />
      </div>

      {/* Alert Details Modal */}
      <Modal
        isOpen={Boolean(selectedAlert)}
        onClose={() => setSelectedAlert(null)}
        title={
          selectedAlert
            ? `${selectedAlert.id || selectedAlert._id} - ${
                selectedAlert.location?.name ||
                selectedAlert.location ||
                "Unknown Location"
              }`
            : "Alert Details"
        }
        maxWidth="720px"
      >
        <AlertDetails
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
        />
      </Modal>
    </div>
  );
};

export default AlertPanel;
