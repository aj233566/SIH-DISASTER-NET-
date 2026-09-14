import React from "react";
import { AlertCircle, AlertTriangle, ShieldCheck, Flame } from "lucide-react";

export const RiskBadge = ({
  level = "Low",
  className = "",
  showIcon = true,
}) => {
  const normalized = String(level || "Low").toLowerCase();

  const getIcon = () => {
    switch (normalized) {
      case "critical":
        return <Flame size={12} />;

      case "high":
        return <AlertTriangle size={12} />;

      case "moderate":
      case "warning":
        return <AlertCircle size={12} />;

      case "low":
      default:
        return <ShieldCheck size={12} />;
    }
  };

  const getLabel = () => {
    switch (normalized) {
      case "critical":
        return "Critical";

      case "high":
        return "High";

      case "moderate":
      case "warning":
        return "Moderate";

      case "low":
      default:
        return "Low";
    }
  };

  return (
    <span className={`badge-ops ${normalized} ${className}`}>
      {showIcon && getIcon()}
      <span>{getLabel()}</span>
    </span>
  );
};

export default RiskBadge;
